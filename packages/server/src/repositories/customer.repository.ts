import { BaseRepository } from './base.repository';
import { Customer, CreateCustomerDTO } from '@sellwise/shared';
import { PoolClient } from 'pg';

export class CustomerRepository extends BaseRepository<Customer> {
  constructor() {
    super('customers');
  }

  async upsertByPhone(storeId: string, data: CreateCustomerDTO, client: PoolClient): Promise<Customer> {
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName} (store_id, name, phone, email, address)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (store_id, phone)
       DO UPDATE SET
         name = EXCLUDED.name,
         email = COALESCE(EXCLUDED.email, customers.email),
         address = COALESCE(EXCLUDED.address, customers.address),
         updated_at = current_timestamp
       RETURNING *`,
      [storeId, data.name, data.phone, data.email || null, data.address || null],
      client
    );
    return rows[0];
  }

  async incrementOrderStats(customerId: string, storeId: string, amount: number, client: PoolClient): Promise<void> {
    // Lock the row first to prevent race conditions under concurrent orders
    await this.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1 AND store_id = $2 FOR UPDATE`,
      [customerId, storeId],
      client
    );
    await this.query(
      `UPDATE ${this.tableName}
       SET total_orders = total_orders + 1,
           total_spent = total_spent + $1,
           updated_at = current_timestamp
       WHERE id = $2 AND store_id = $3`,
      [amount, customerId, storeId],
      client
    );
  }
}

export const customerRepository = new CustomerRepository();