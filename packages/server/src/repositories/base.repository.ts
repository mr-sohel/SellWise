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

  async findById(id: string, client?: PoolClient): Promise<T | null>;
  async findById(id: string, storeId?: string, client?: PoolClient): Promise<T | null>;
  async findById(id: string, storeIdOrClient?: string | PoolClient, client?: PoolClient): Promise<T | null> {
    let queryText = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const params: any[] = [id];
    
    if (typeof storeIdOrClient === 'string') {
      queryText += ` AND store_id = $2`;
      params.push(storeIdOrClient);
    }
    
    const executor = (typeof storeIdOrClient === 'object' ? storeIdOrClient : client) || undefined;
    const { rows } = await this.query(queryText, params, executor);
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