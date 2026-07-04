import { BaseRepository } from './base.repository';
import { db } from '../config/db';
import { PoolClient } from 'pg';

export interface Forecast {
  id: string;
  store_id: string;
  product_id: string;
  forecast_date: string;
  predicted_qty: number;
  lower_bound: number;
  upper_bound: number;
  model_used: string;
  created_at: Date;
}

export interface SalesHistory {
  date: string;
  total_qty: number;
}

export class ForecastRepository extends BaseRepository<Forecast> {
  constructor() {
    super('forecasts');
  }

  async getSalesHistory(storeId: string, productId: string, days: number = 90): Promise<SalesHistory[]> {
    const { rows } = await this.query(
      `SELECT DATE(o.order_date) as date, SUM(oi.quantity) as total_qty
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN products p ON oi.product_id = p.id
       WHERE o.store_id = $1 AND oi.product_id = $2
         AND o.status NOT IN ('cancelled', 'returned')
         AND o.order_date >= NOW() - INTERVAL '1 day' * $3
       GROUP BY DATE(o.order_date)
       ORDER BY date ASC`,
      [storeId, productId, days]
    );
    return rows;
  }

  async getActiveProductIds(storeId: string): Promise<string[]> {
    const { rows } = await this.query(
      `SELECT id FROM products WHERE store_id = $1 AND is_active = true`,
      [storeId]
    );
    return rows.map((r: any) => r.id);
  }

  async upsertForecasts(storeId: string, productId: string, forecasts: Omit<Forecast, 'id' | 'store_id' | 'product_id' | 'created_at'>[], client?: PoolClient): Promise<void> {
    // Batch upsert in chunks of 100 to avoid N+1 queries
    const batchSize = 100;
    for (let i = 0; i < forecasts.length; i += batchSize) {
      const batch = forecasts.slice(i, i + batchSize);
      const values: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      for (const f of batch) {
        values.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6})`);
        params.push(storeId, productId, f.forecast_date, f.predicted_qty, f.lower_bound, f.upper_bound, f.model_used);
        paramIndex += 7;
      }

      await this.query(
        `INSERT INTO ${this.tableName} (store_id, product_id, forecast_date, predicted_qty, lower_bound, upper_bound, model_used)
         VALUES ${values.join(', ')}
         ON CONFLICT (store_id, product_id, forecast_date)
         DO UPDATE SET predicted_qty = EXCLUDED.predicted_qty, lower_bound = EXCLUDED.lower_bound,
                       upper_bound = EXCLUDED.upper_bound, model_used = EXCLUDED.model_used`,
        params,
        client
      );
    }
  }

  async findByProduct(storeId: string, productId: string): Promise<Forecast[]> {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName}
       WHERE store_id = $1 AND product_id = $2
       ORDER BY forecast_date ASC`,
      [storeId, productId]
    );
    return rows.map(f => ({
      ...f,
      predicted_qty: Number(f.predicted_qty),
      lower_bound: Number(f.lower_bound),
      upper_bound: Number(f.upper_bound)
    }));
  }

  async findTopProductsForecasts(storeId: string, limit: number = 5, days: number = 30): Promise<Array<{ product_id: string; product_name: string; category: string; current_stock: number; forecasts: Forecast[] }>> {
    // Get top products by order count in last 90 days
    const { rows: topProducts } = await this.query(
      `SELECT p.id, p.name as product_name, p.category, p.stock_quantity as current_stock,
              COUNT(oi.id) as order_count
       FROM products p
       LEFT JOIN order_items oi ON oi.product_id = p.id
       LEFT JOIN orders o ON oi.order_id = o.id AND o.status NOT IN ('cancelled','returned')
         AND o.order_date >= NOW() - INTERVAL '90 days'
       WHERE p.store_id = $1 AND p.is_active = true
       GROUP BY p.id, p.name, p.category, p.stock_quantity
       ORDER BY order_count DESC
       LIMIT $2`,
      [storeId, limit]
    );

    if (topProducts.length === 0) return [];

    // Get forecasts for these products within the requested days
    const productIds = topProducts.map((p: any) => p.id);
    const { rows: forecasts } = await this.query(
      `SELECT * FROM ${this.tableName}
       WHERE store_id = $1 AND product_id = ANY($2)
         AND forecast_date >= CURRENT_DATE
         AND forecast_date < CURRENT_DATE + INTERVAL '1 day' * $3
       ORDER BY forecast_date ASC`,
      [storeId, productIds, days]
    );

    // Group forecasts by product
    const forecastMap = new Map<string, Forecast[]>();
    for (const f of forecasts) {
      const parsedForecast = {
        ...f,
        predicted_qty: Number(f.predicted_qty),
        lower_bound: Number(f.lower_bound),
        upper_bound: Number(f.upper_bound)
      };
      const existing = forecastMap.get(f.product_id) || [];
      existing.push(parsedForecast);
      forecastMap.set(f.product_id, existing);
    }

    return topProducts.map((p: any) => ({
      product_id: p.id,
      product_name: p.product_name,
      category: p.category,
      current_stock: p.current_stock,
      forecasts: forecastMap.get(p.id) || [],
    }));
  }
}

export const forecastRepository = new ForecastRepository();
