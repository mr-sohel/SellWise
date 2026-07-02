import { BaseRepository } from './base.repository';
import { PoolClient } from 'pg';

export interface InventoryAlert {
  id: string;
  store_id: string;
  product_id: string;
  alert_type: string;
  severity: string;
  message: string;
  is_read: boolean;
  created_at: Date;
}

export class AlertRepository extends BaseRepository<InventoryAlert> {
  constructor() {
    super('inventory_alerts');
  }

  async findLowStockProducts(storeId: string): Promise<Array<{ id: string; name: string; stock_quantity: number; low_stock_threshold: number }>> {
    const { rows } = await this.query(
      `SELECT id, name, stock_quantity, low_stock_threshold
       FROM products
       WHERE store_id = $1 AND is_active = true
         AND stock_quantity <= low_stock_threshold`,
      [storeId]
    );
    return rows;
  }

  async findOutOfStockProducts(storeId: string): Promise<Array<{ id: string; name: string }>> {
    const { rows } = await this.query(
      `SELECT id, name
       FROM products
       WHERE store_id = $1 AND is_active = true AND stock_quantity = 0`,
      [storeId]
    );
    return rows;
  }

  async findDeadStock(storeId: string, daysSinceLastSale: number = 90): Promise<Array<{ id: string; name: string; stock_quantity: number; last_sold: Date | null }>> {
    const { rows } = await this.query(
      `SELECT p.id, p.name, p.stock_quantity,
              MAX(o.order_date) as last_sold
       FROM products p
       LEFT JOIN order_items oi ON p.id = oi.product_id
       LEFT JOIN orders o ON oi.order_id = o.id AND o.status NOT IN ('cancelled', 'returned')
       WHERE p.store_id = $1 AND p.is_active = true AND p.stock_quantity > 0
       GROUP BY p.id, p.name, p.stock_quantity
       HAVING MAX(o.order_date) IS NULL OR MAX(o.order_date) < NOW() - INTERVAL '1 day' * $2`,
      [storeId, daysSinceLastSale]
    );
    return rows;
  }

  async createAlert(storeId: string, productId: string, alertType: string, severity: string, message: string, client?: PoolClient): Promise<InventoryAlert> {
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName} (store_id, product_id, alert_type, severity, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [storeId, productId, alertType, severity, message],
      client
    );
    return rows[0];
  }

  async findByStore(storeId: string, unreadOnly: boolean = false): Promise<InventoryAlert[]> {
    let queryText = `SELECT a.*, p.name as product_name
                     FROM ${this.tableName} a
                     JOIN products p ON a.product_id = p.id
                     WHERE a.store_id = $1`;
    if (unreadOnly) {
      queryText += ` AND a.is_read = false`;
    }
    queryText += ` ORDER BY a.created_at DESC`;

    const { rows } = await this.query(queryText, [storeId]);
    return rows;
  }

  async markAsRead(id: string, storeId: string): Promise<void> {
    await this.query(
      `UPDATE ${this.tableName} SET is_read = true WHERE id = $1 AND store_id = $2`,
      [id, storeId]
    );
  }

  async markAllAsRead(storeId: string): Promise<void> {
    await this.query(
      `UPDATE ${this.tableName} SET is_read = true WHERE store_id = $1 AND is_read = false`,
      [storeId]
    );
  }
}

export const alertRepository = new AlertRepository();
