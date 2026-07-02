import { BaseRepository } from './base.repository';
import { PoolClient } from 'pg';

export interface ApiKey {
  id: string;
  store_id: string;
  key_hash: string;
  name: string;
}

export class ApiKeyRepository extends BaseRepository<ApiKey> {
  constructor() {
    super('api_keys');
  }

  async findByHash(keyHash: string, client?: PoolClient): Promise<ApiKey | null> {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} WHERE key_hash = $1`,
      [keyHash],
      client
    );
    return rows[0] || null;
  }
}

export const apiKeyRepository = new ApiKeyRepository();