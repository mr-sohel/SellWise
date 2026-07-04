import { BaseRepository } from './base.repository';
import { Order, OrderItem, CreateOrderDTO, OrderFiltersDTO, PaginatedResult } from '@sellwise/shared';
import { PoolClient } from 'pg';

export class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super('orders');
  }

  async createHeader(
    storeId: string,
    customerId: string,
    orderNumber: string,
    data: CreateOrderDTO,
    total: number,
    client: PoolClient
  ): Promise<Order> {
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName}
       (store_id, customer_id, order_number, status, source, total, delivery_charge, discount, notes, external_reference_id)
       VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        storeId, customerId, orderNumber, data.source || 'manual', total,
        data.delivery_charge, data.discount, data.notes || null, data.external_reference_id || null
      ],
      client
    );
    return rows[0];
  }

  async createItem(
    orderId: string,
    productId: string,
    productName: string,
    unitPrice: number,
    costPrice: number,
    quantity: number,
    client: PoolClient
  ): Promise<OrderItem> {
    const { rows } = await this.query(
      `INSERT INTO order_items (order_id, product_id, product_name, unit_price, cost_price, quantity)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [orderId, productId, productName, unitPrice, costPrice, quantity],
      client
    );
    return rows[0];
  }

  async updateStatus(id: string, storeId: string, status: string, client?: PoolClient): Promise<Order | null> {
    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET status = $1, updated_at = current_timestamp
       WHERE id = $2 AND store_id = $3
       RETURNING *`,
      [status, id, storeId],
      client
    );
    return rows[0] || null;
  }

  async findItemsByOrderId(orderId: string, client?: PoolClient): Promise<OrderItem[]> {
    const { rows } = await this.query(
      `SELECT oi.* FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.order_id = $1`,
      [orderId],
      client
    );
    return rows;
  }

  async findByStore(
    storeId: string,
    filters: OrderFiltersDTO,
    client?: PoolClient
  ): Promise<PaginatedResult<Order>> {
    const { page, limit, status, search } = filters;
    const offset = (page - 1) * limit;

    let queryText = `SELECT o.*, c.name as customer_name, c.phone as customer_phone
                     FROM ${this.tableName} o
                     JOIN customers c ON o.customer_id = c.id
                     WHERE o.store_id = $1`;
    let countQueryText = `SELECT COUNT(*)
                          FROM ${this.tableName} o
                          JOIN customers c ON o.customer_id = c.id
                          WHERE o.store_id = $1`;

    const params: any[] = [storeId];
    let paramIndex = 2;

    if (status) {
      queryText += ` AND o.status = $${paramIndex}`;
      countQueryText += ` AND o.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      const searchPattern = `%${search}%`;
      queryText += ` AND (o.order_number ILIKE $${paramIndex} OR c.phone ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`;
      countQueryText += ` AND (o.order_number ILIKE $${paramIndex} OR c.phone ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`;
      params.push(searchPattern);
      paramIndex++;
    }

    queryText += ` ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const queryParams = [...params, limit, offset];

    const [dataResult, countResult] = await Promise.all([
      this.query(queryText, queryParams, client),
      this.query(countQueryText, params, client)
    ]);

    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: dataResult.rows,
      meta: { page, limit, totalCount, totalPages }
    };
  }
}

export const orderRepository = new OrderRepository();