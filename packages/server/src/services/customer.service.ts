import { customerRepository } from '../repositories/customer.repository';
import { Customer, CreateCustomerDTO, UpdateCustomerDTO, CustomerFiltersDTO, PaginatedResult } from '@sellwise/shared';
import { NotFoundError } from '../errors/AppError';

export class CustomerService {
  async getCustomers(storeId: string, filters: CustomerFiltersDTO): Promise<PaginatedResult<Customer>> {
    const { page, limit, search } = filters;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT c.*, r.segment, r.churn_probability, r.recency_score, r.frequency_score, r.monetary_score
      FROM customers c
      LEFT JOIN customer_rfm r ON c.id = r.customer_id AND c.store_id = r.store_id
      WHERE c.store_id = $1`;
    let countQueryText = `SELECT COUNT(*) FROM customers c WHERE c.store_id = $1`;

    const params: any[] = [storeId];
    let paramIndex = 2;

    if (search) {
      const searchPattern = `%${search}%`;
      queryText += ` AND (c.name ILIKE $${paramIndex} OR c.phone ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex})`;
      countQueryText += ` AND (c.name ILIKE $${paramIndex} OR c.phone ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex})`;
      params.push(searchPattern);
      paramIndex++;
    }

    queryText += ` ORDER BY c.total_spent DESC, c.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const queryParams = [...params, limit, offset];

    // Using any type for client to bypass protected query method directly if we added public method in repo,
    // but better to just use db directly or add a findByStore to the repository.
    // For now, I'll use the raw db import to run the query.
    return this.findWithFilters(queryText, countQueryText, queryParams, params, page, limit);
  }

  private async findWithFilters(queryText: string, countText: string, queryParams: any[], countParams: any[], page: number, limit: number) {
    const { db } = await import('../config/db');
    const [dataResult, countResult] = await Promise.all([
      db.query(queryText, queryParams),
      db.query(countText, countParams)
    ]);

    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: dataResult.rows,
      meta: { page, limit, totalCount, totalPages }
    };
  }

  async getCustomer(id: string, storeId: string): Promise<Customer> {
    const customer = await customerRepository.findById(id);
    if (!customer || customer.store_id !== storeId) {
      throw new NotFoundError('Customer');
    }
    return customer;
  }

  async createCustomer(storeId: string, data: CreateCustomerDTO): Promise<Customer> {
    const { db } = await import('../config/db');
    return customerRepository.upsertByPhone(storeId, data, await db.connect());
  }

  async updateCustomer(id: string, storeId: string, data: UpdateCustomerDTO): Promise<Customer> {
    const customer = await this.getCustomer(id, storeId);

    // Build update query
    const updates: string[] = [];
    const params: any[] = [id, storeId];
    let paramIndex = 3;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (updates.length === 0) return customer;

    updates.push(`updated_at = current_timestamp`);

    const { db } = await import('../config/db');
    const { rows } = await db.query(
      `UPDATE customers SET ${updates.join(', ')} WHERE id = $1 AND store_id = $2 RETURNING *`,
      params
    );

    return rows[0];
  }
}

export const customerService = new CustomerService();