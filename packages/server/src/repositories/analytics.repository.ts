import { PoolClient } from 'pg';
import { db } from '../config/db';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export class AnalyticsRepository {
  /**
   * Helper for running queries
   */
  private async query(text: string, params?: any[], client?: PoolClient) {
    const executor = client || db;
    return executor.query(text, params);
  }

  async getRevenueMetrics(storeId: string, range: DateRange, client?: PoolClient) {
    const { rows } = await this.query(
      `SELECT
         COALESCE(SUM(total), 0) as total_revenue,
         COUNT(id) as total_orders
       FROM orders
       WHERE store_id = $1
         AND order_date >= $2
         AND order_date <= $3
         AND status NOT IN ('cancelled', 'returned')`,
      [storeId, range.startDate, range.endDate],
      client
    );
    return {
      revenue: parseFloat(rows[0].total_revenue),
      orders: parseInt(rows[0].total_orders, 10)
    };
  }

  async getRevenueTrend(storeId: string, range: DateRange, client?: PoolClient) {
    const { rows } = await this.query(
      `SELECT
         DATE_TRUNC('day', order_date) as date,
         COALESCE(SUM(total), 0) as revenue
       FROM orders
       WHERE store_id = $1
         AND order_date >= $2
         AND order_date <= $3
         AND status NOT IN ('cancelled', 'returned')
       GROUP BY DATE_TRUNC('day', order_date)
       ORDER BY date ASC`,
      [storeId, range.startDate, range.endDate],
      client
    );
    return rows.map(r => ({
      date: r.date,
      revenue: parseFloat(r.revenue)
    }));
  }

  async getTopProducts(storeId: string, range: DateRange, limit: number = 5, client?: PoolClient) {
    const { rows } = await this.query(
      `SELECT
         product_id,
         product_name,
         SUM(quantity) as units_sold,
         SUM(quantity * unit_price) as revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.store_id = $1
         AND o.order_date >= $2
         AND o.order_date <= $3
         AND o.status NOT IN ('cancelled', 'returned')
       GROUP BY product_id, product_name
       ORDER BY units_sold DESC
       LIMIT $4`,
      [storeId, range.startDate, range.endDate, limit],
      client
    );
    return rows.map(r => ({
      productId: r.product_id,
      productName: r.product_name,
      unitsSold: parseInt(r.units_sold, 10),
      revenue: parseFloat(r.revenue)
    }));
  }

  async getCategoryBreakdown(storeId: string, range: DateRange, client?: PoolClient) {
    const { rows } = await this.query(
      `SELECT
         COALESCE(p.category, 'Uncategorized') as category,
         SUM(oi.quantity * oi.unit_price) as revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.store_id = $1
         AND o.order_date >= $2
         AND o.order_date <= $3
         AND o.status NOT IN ('cancelled', 'returned')
       GROUP BY p.category
       ORDER BY revenue DESC`,
      [storeId, range.startDate, range.endDate],
      client
    );
    return rows.map(r => ({
      category: r.category,
      revenue: parseFloat(r.revenue)
    }));
  }

  async getInventoryValue(storeId: string, client?: PoolClient) {
    const { rows } = await this.query(
      `SELECT COALESCE(SUM(stock_quantity * cost_price), 0) as total_value
       FROM products
       WHERE store_id = $1 AND is_active = true`,
      [storeId],
      client
    );
    return parseFloat(rows[0].total_value);
  }

  async getCOGS(storeId: string, range: DateRange, client?: PoolClient) {
    const { rows } = await this.query(
      `SELECT COALESCE(SUM(oi.quantity * oi.cost_price), 0) as cogs
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.store_id = $1
         AND o.order_date >= $2
         AND o.order_date <= $3
         AND o.status NOT IN ('cancelled', 'returned')`,
      [storeId, range.startDate, range.endDate],
      client
    );
    return parseFloat(rows[0].cogs);
  }

  async getFulfillmentMetrics(storeId: string, range: DateRange, client?: PoolClient) {
    const { rows } = await this.query(
      `SELECT
         COUNT(*) as total_orders,
         SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
         SUM(CASE WHEN status = 'cancelled' OR status = 'returned' THEN 1 ELSE 0 END) as failed_orders
       FROM orders
       WHERE store_id = $1
         AND order_date >= $2
         AND order_date <= $3`,
      [storeId, range.startDate, range.endDate],
      client
    );

    const total = parseInt(rows[0].total_orders, 10);
    const delivered = parseInt(rows[0].delivered_orders, 10);
    const failed = parseInt(rows[0].failed_orders, 10);
    const nonFailed = total - failed;

    return {
      total,
      delivered,
      failed,
      nonFailed
    };
  }
}

export const analyticsRepository = new AnalyticsRepository();