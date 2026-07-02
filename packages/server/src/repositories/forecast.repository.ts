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
    for (const f of forecasts) {
      await this.query(
        `INSERT INTO ${this.tableName} (store_id, product_id, forecast_date, predicted_qty, lower_bound, upper_bound, model_used)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (store_id, product_id, forecast_date)
         DO UPDATE SET predicted_qty = EXCLUDED.predicted_qty, lower_bound = EXCLUDED.lower_bound,
                       upper_bound = EXCLUDED.upper_bound, model_used = EXCLUDED.model_used`,
        [storeId, productId, f.forecast_date, f.predicted_qty, f.lower_bound, f.upper_bound, f.model_used],
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
    return rows;
  }
}

export const forecastRepository = new ForecastRepository();
