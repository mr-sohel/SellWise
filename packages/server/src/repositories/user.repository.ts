import { BaseRepository } from './base.repository';
import { User, SignupDTO } from '@sellwise/shared';
import { PoolClient } from 'pg';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  async findByEmail(email: string, client?: PoolClient): Promise<User | null> {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} WHERE email = $1`,
      [email],
      client
    );
    return rows[0] || null;
  }

  async findById(id: string, storeIdOrClient?: string | PoolClient, client?: PoolClient): Promise<User | null> {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id],
      typeof storeIdOrClient === 'object' ? storeIdOrClient : client
    );
    return rows[0] || null;
  }

  async create(data: Omit<SignupDTO, 'password'> & { password_hash: string }, client?: PoolClient): Promise<User> {
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName} (email, password_hash, preferred_lang)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.email, data.password_hash, data.preferred_lang || 'en'],
      client
    );
    return rows[0];
  }

  async update(id: string, data: Partial<User>, client?: PoolClient): Promise<User> {
    const ALLOWED_COLUMNS = new Set([
      'email', 'password_hash', 'preferred_lang'
    ]);

    const fields = [];
    const values = [];
    let queryIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && ALLOWED_COLUMNS.has(key)) {
        fields.push(`${key} = $${queryIndex}`);
        values.push(value);
        queryIndex++;
      }
    }

    if (fields.length === 0) {
      return this.findById(id, client) as Promise<User>;
    }

    values.push(id);
    const { rows } = await this.query(
      `UPDATE ${this.tableName} SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${queryIndex} RETURNING *`,
      values,
      client
    );

    return rows[0];
  }
}

export const userRepository = new UserRepository();