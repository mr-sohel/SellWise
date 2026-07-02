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
}

export const storeRepository = new StoreRepository();