import { db } from '../config/db';
import { env } from '../config/env';
import logger from '../utils/logger';

const TARGET_EMAIL = 'sohel@gmail.com';

async function trainMLChurnModel(storeId: string) {
  const { rows: historicalCustomers } = await db.query(
    `WITH historical_orders AS (
       SELECT
         customer_id,
         order_date,
         total,
         EXTRACT(DAY FROM order_date - LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date))::int as days_gap
       FROM orders
       WHERE store_id = $1 
         AND status NOT IN ('cancelled', 'returned')
         AND order_date < NOW() - INTERVAL '180 days'
     ),
     recent_orders AS (
       SELECT DISTINCT customer_id
       FROM orders
       WHERE store_id = $1 
         AND status NOT IN ('cancelled', 'returned')
         AND order_date >= NOW() - INTERVAL '180 days'
     )
     SELECT c.id,
            EXTRACT(DAY FROM (NOW() - INTERVAL '180 days') - MAX(ho.order_date))::int as recency,
            COUNT(ho.order_date) as frequency,
            COALESCE(SUM(ho.total), 0) as monetary,
            COALESCE(AVG(ho.days_gap), 0) as avg_gap_between_orders,
            CASE WHEN ro.customer_id IS NULL THEN 1 ELSE 0 END as churned
     FROM customers c
     JOIN historical_orders ho ON c.id = ho.customer_id
     LEFT JOIN recent_orders ro ON c.id = ro.customer_id
     WHERE c.store_id = $1
     GROUP BY c.id, ro.customer_id`,
    [storeId]
  );

  if (historicalCustomers.length < 10) {
    console.log(`  Skipped churn model training (only ${historicalCustomers.length} historical customers, need 10+)`);
    return;
  }

  try {
    const response = await fetch(`${env.ML_SERVICE_URL}/churn/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: storeId,
        customers: historicalCustomers.map((c: any) => ({
          customer_id: c.id,
          recency_days: Number(c.recency ?? 9999),
          frequency_count: Number(c.frequency ?? 0),
          monetary_value: Number(c.monetary ?? 0),
          avg_gap_between_orders: Number(c.avg_gap_between_orders ?? 0),
          churned: Number(c.churned ?? 0)
        })),
      }),
    });
    if (response.ok) {
      console.log('  Churn model trained successfully');
    } else {
      console.log(`  Churn model training returned status ${response.status}`);
    }
  } catch (error) {
    console.log('  ML service unavailable for churn model training (skipped)');
  }
}

function assignSegment(r: number, f: number, m: number): string {
  if (r >= 4 && f >= 4 && m >= 4) return 'champion';
  if (r >= 4 && f >= 4) return 'loyal';
  if (r >= 4 && f <= 2 && m <= 2) return 'new';
  if (r >= 3 && f >= 3 && m >= 3) return 'potential';
  if (r <= 2 && f <= 2) return 'lost';
  if (r <= 3 && f >= 1 && f <= 3 && m <= 3) return 'at_risk';
  return 'potential';
}

async function calculateRFM(storeId: string) {
  const { rows: customers } = await db.query(
    `WITH customer_orders AS (
       SELECT
         customer_id,
         order_date,
         total,
         EXTRACT(DAY FROM order_date - LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date))::int as days_gap
       FROM orders
       WHERE store_id = $1 AND status NOT IN ('cancelled', 'returned')
     )
     SELECT c.id,
            EXTRACT(DAY FROM NOW() - MAX(co.order_date))::int as recency,
            COUNT(co.order_date) as frequency,
            COALESCE(SUM(co.total), 0) as monetary,
            COALESCE(AVG(co.days_gap), 0) as avg_gap_between_orders
     FROM customers c
     LEFT JOIN customer_orders co ON c.id = co.customer_id
     WHERE c.store_id = $1
     GROUP BY c.id`,
    [storeId]
  );

  if (customers.length === 0) {
    console.log('  No customers found');
    return;
  }

  const scored = customers.map((c: any) => ({
    ...c,
    r_score: 0,
    f_score: 0,
    m_score: 0,
  }));

  scored.sort((a: any, b: any) => Number(a.recency ?? 9999) - Number(b.recency ?? 9999));
  const rQuintile = Math.ceil(scored.length / 5) || 1;
  for (let i = 0; i < scored.length; i++) {
    scored[i].r_score = Math.min(5, Math.floor(i / rQuintile) + 1);
  }
  scored.forEach((s: any) => { s.r_score = 6 - s.r_score; });

  scored.sort((a: any, b: any) => Number(b.frequency ?? 0) - Number(a.frequency ?? 0));
  const fQuintile = Math.ceil(scored.length / 5) || 1;
  for (let i = 0; i < scored.length; i++) {
    scored[i].f_score = Math.min(5, Math.floor(i / fQuintile) + 1);
  }
  scored.forEach((s: any) => { s.f_score = 6 - s.f_score; });

  scored.sort((a: any, b: any) => Number(b.monetary ?? 0) - Number(a.monetary ?? 0));
  const mQuintile = Math.ceil(scored.length / 5) || 1;
  for (let i = 0; i < scored.length; i++) {
    scored[i].m_score = Math.min(5, Math.floor(i / mQuintile) + 1);
  }
  scored.forEach((s: any) => { s.m_score = 6 - s.m_score; });

  for (const c of scored) {
    c.segment = assignSegment(c.r_score, c.f_score, c.m_score);
  }

  let churnPredictions: Record<string, number> = {};
  try {
    const response = await fetch(`${env.ML_SERVICE_URL}/churn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: storeId,
        customers: scored.map((c: any) => ({
          customer_id: c.id,
          recency_days: Number(c.recency ?? 9999),
          frequency_count: Number(c.frequency ?? 0),
          monetary_value: Number(c.monetary ?? 0),
          avg_gap_between_orders: Number(c.avg_gap_between_orders ?? 0),
        })),
      }),
    });

    if (response.ok) {
      const result = await response.json() as { predictions: Array<{ customer_id: string; churn_probability: number }> };
      for (const r of result.predictions) {
        churnPredictions[r.customer_id] = r.churn_probability;
      }
      console.log(`  Churn predictions received for ${result.predictions.length} customers`);
    }
  } catch (error) {
    console.log('  ML service unavailable for churn prediction (skipped)');
  }

  const batchSize = 100;
  for (let i = 0; i < scored.length; i += batchSize) {
    const batch = scored.slice(i, i + batchSize);
    const values: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    for (const c of batch) {
      values.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6})`);
      params.push(c.id, storeId, c.r_score, c.f_score, c.m_score, c.segment, churnPredictions[c.id] || null);
      paramIndex += 7;
    }

    await db.query(
      `INSERT INTO customer_rfm (customer_id, store_id, recency_score, frequency_score, monetary_score, segment, churn_probability)
       VALUES ${values.join(', ')}
       ON CONFLICT (customer_id)
       DO UPDATE SET store_id = EXCLUDED.store_id,
                     recency_score = EXCLUDED.recency_score, frequency_score = EXCLUDED.frequency_score,
                     monetary_score = EXCLUDED.monetary_score, segment = EXCLUDED.segment,
                     churn_probability = EXCLUDED.churn_probability, updated_at = CURRENT_TIMESTAMP`,
      params
    );
  }

  const segmentCounts: Record<string, number> = {};
  for (const c of scored) {
    segmentCounts[c.segment] = (segmentCounts[c.segment] || 0) + 1;
  }
  console.log('  Segment distribution:', segmentCounts);
}

async function runRFM() {
  console.log('Calculating RFM segments...\n');

  try {
    const { rows: stores } = await db.query(
      `SELECT s.id, s.name FROM stores s
       JOIN store_members sm ON s.id = sm.store_id
       JOIN users u ON sm.user_id = u.id
       WHERE u.email = $1`,
      [TARGET_EMAIL]
    );

    if (stores.length === 0) {
      console.log('No store found for', TARGET_EMAIL);
      return;
    }

    for (const store of stores) {
      console.log(`Store: ${store.name} (${store.id})`);

      console.log('  Training churn model...');
      await trainMLChurnModel(store.id);

      console.log('  Calculating RFM scores...');
      await calculateRFM(store.id);

      console.log('  Done.\n');
    }

    console.log('RFM calculation complete!');
  } catch (err) {
    console.error('RFM calculation failed:', err);
    process.exit(1);
  } finally {
    await db.end();
  }
}

runRFM();
