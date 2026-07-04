import { Worker, Job } from 'bullmq';
import { bullMqConnection } from '../config/redis';
import { db } from '../config/db';
import { env } from '../config/env';
import logger from '../utils/logger';

export const rfmWorker = new Worker('rfm', async (job: Job) => {
  logger.info(`[Worker: RFM/Churn] Processing job ${job.id}`);

  if (job.name === 'rfm:calculate') {
    const { rows: stores } = await db.query('SELECT id FROM stores');

    for (const store of stores) {
      logger.info(`[Worker: RFM/Churn] Calculating RFM for store ${store.id}`);
      await calculateRFM(store.id);
    }
  }
}, {
  connection: bullMqConnection,
  concurrency: 2
});

async function calculateRFM(storeId: string) {
  // 1. Calculate raw R, F, M values for each customer
  const { rows: customers } = await db.query(
    `SELECT c.id,
            EXTRACT(DAY FROM NOW() - MAX(o.order_date))::int as recency,
            COUNT(o.id) as frequency,
            COALESCE(SUM(o.total), 0) as monetary
     FROM customers c
     LEFT JOIN orders o ON c.id = o.customer_id AND o.status NOT IN ('cancelled', 'returned')
     WHERE c.store_id = $1
     GROUP BY c.id`,
    [storeId]
  );

  if (customers.length === 0) return;

  // 2. Score into quintiles (1-5)
  const scored = customers.map((c: any) => ({
    ...c,
    r_score: 0,
    f_score: 0,
    m_score: 0,
  }));

  // Score Recency (lower days = better = higher score)
  scored.sort((a: any, b: any) => (a.recency ?? 9999) - (b.recency ?? 9999));
  const rQuintile = Math.ceil(scored.length / 5) || 1;
  for (let i = 0; i < scored.length; i++) {
    scored[i].r_score = Math.min(5, Math.floor(i / rQuintile) + 1);
  }
  // Invert: most recent gets 5
  scored.forEach((s: any) => { s.r_score = 6 - s.r_score; });

  // Score Frequency (higher = better)
  scored.sort((a: any, b: any) => (b.frequency ?? 0) - (a.frequency ?? 0));
  const fQuintile = Math.ceil(scored.length / 5) || 1;
  for (let i = 0; i < scored.length; i++) {
    scored[i].f_score = Math.min(5, Math.floor(i / fQuintile) + 1);
  }
  scored.forEach((s: any) => { s.f_score = 6 - s.f_score; });

  // Score Monetary (higher = better)
  scored.sort((a: any, b: any) => (b.monetary ?? 0) - (a.monetary ?? 0));
  const mQuintile = Math.ceil(scored.length / 5) || 1;
  for (let i = 0; i < scored.length; i++) {
    scored[i].m_score = Math.min(5, Math.floor(i / mQuintile) + 1);
  }
  scored.forEach((s: any) => { s.m_score = 6 - s.m_score; });

  // 3. Assign segments
  for (const c of scored) {
    c.segment = assignSegment(c.r_score, c.f_score, c.m_score);
  }

  // 4. Call ML service for churn prediction
  let churnPredictions: Record<string, number> = {};
  try {
    const response = await fetch(`${env.ML_SERVICE_URL}/churn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: storeId,
        customers: scored.map((c: any) => ({
          customer_id: c.id,
          recency: c.recency ?? 9999,
          frequency: c.frequency ?? 0,
          monetary: c.monetary ?? 0,
        })),
      }),
    });

    if (response.ok) {
      const result = await response.json() as { customers: Array<{ customer_id: string; churn_probability: number }> };
      for (const r of result.customers) {
        churnPredictions[r.customer_id] = r.churn_probability;
      }
    }
  } catch (error) {
    logger.error(`[Worker: RFM] ML service unavailable for churn prediction:`, error);
  }

  // 5. Upsert into customer_rfm (batched)
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
       DO UPDATE SET recency_score = EXCLUDED.recency_score, frequency_score = EXCLUDED.frequency_score,
                     monetary_score = EXCLUDED.monetary_score, segment = EXCLUDED.segment,
                     churn_probability = EXCLUDED.churn_probability, updated_at = CURRENT_TIMESTAMP`,
      params
    );
  }

  logger.info(`[Worker: RFM] Processed ${scored.length} customers for store ${storeId}`);
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

rfmWorker.on('completed', (job) => {
  logger.info(`[Worker: RFM/Churn] Job ${job.id} completed successfully`);
});

rfmWorker.on('failed', (job, err) => {
  logger.error(`[Worker: RFM/Churn] Job ${job?.id} failed:`, err);
});