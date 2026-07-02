import { Pool, PoolClient } from 'pg';
import { db } from '../config/db';

export abstract class BaseRepository<T> {
  protected constructor(protected readonly tableName: string) {}

  /**
   * Helper to execute a query, optionally using a specific client (for transactions)
   */
  protected async query(text: string, params?: any[], client?: PoolClient) {
    const executor = client || db;
    return executor.query(text, params);
  }

  async findById(id: string, client?: PoolClient): Promise<T | null> {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id],
      client
    );
    return rows[0] || null;
  }

  async delete(id: string, client?: PoolClient): Promise<boolean> {
    const { rowCount } = await this.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id],
      client
    );
    return (rowCount ?? 0) > 0;
  }
}