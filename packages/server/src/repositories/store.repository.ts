import { BaseRepository } from './base.repository';
import { Store, StoreMember, CreateStoreDTO } from '@sellwise/shared';
import { PoolClient } from 'pg';

export class StoreRepository extends BaseRepository<Store> {
  constructor() {
    super('stores');
  }

  async createStoreTransaction(userId: string, data: CreateStoreDTO, client: PoolClient): Promise<Store> {
    // Insert store
    const { rows: storeRows } = await this.query(
      `INSERT INTO ${this.tableName} (name, currency, timezone)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.name, data.currency || 'BDT', data.timezone || 'Asia/Dhaka'],
      client
    );

    const store = storeRows[0] as Store;

    // Insert store member (owner)
    await this.query(
      `INSERT INTO store_members (store_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [store.id, userId, 'owner'],
      client
    );

    return store;
  }

  async updateStoreProfile(storeId: string, data: { business_type?: string; sales_channels?: string[] }, client?: PoolClient): Promise<Store> {
    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.business_type !== undefined) {
      fields.push(`business_type = $${paramIndex++}`);
      params.push(data.business_type);
    }
    if (data.sales_channels !== undefined) {
      fields.push(`sales_channels = $${paramIndex++}`);
      params.push(data.sales_channels);
    }

    fields.push(`updated_at = NOW()`);
    params.push(storeId);

    const { rows } = await this.query(
      `UPDATE ${this.tableName} SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      params,
      client
    );
    return rows[0];
  }

  async findStoresByUser(userId: string, client?: PoolClient): Promise<Store[]> {
    const { rows } = await this.query(
      `SELECT s.*, sm.role
       FROM ${this.tableName} s
       JOIN store_members sm ON s.id = sm.store_id
       WHERE sm.user_id = $1`,
      [userId],
      client
    );
    return rows;
  }

  async getMemberRole(storeId: string, userId: string, client?: PoolClient): Promise<string | null> {
    const { rows } = await this.query(
      `SELECT role FROM store_members WHERE store_id = $1 AND user_id = $2`,
      [storeId, userId],
      client
    );
    return rows[0]?.role || null;
  }

  async addMember(storeId: string, userId: string, role: 'owner' | 'manager', client?: PoolClient): Promise<void> {
    await this.query(
      `INSERT INTO store_members (store_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [storeId, userId, role],
      client
    );
  }

  async listMembers(storeId: string, client?: PoolClient): Promise<any[]> {
    const { rows } = await this.query(
      `SELECT u.id, u.email, u.preferred_lang, sm.role, sm.created_at
       FROM store_members sm
       JOIN users u ON sm.user_id = u.id
       WHERE sm.store_id = $1
       ORDER BY sm.created_at ASC`,
      [storeId],
      client
    );
    return rows;
  }

  async removeMember(storeId: string, userId: string, client?: PoolClient): Promise<void> {
    await this.query(
      `DELETE FROM store_members WHERE store_id = $1 AND user_id = $2`,
      [storeId, userId],
      client
    );
  }
}

export const storeRepository = new StoreRepository();