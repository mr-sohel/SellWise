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
}

export const userRepository = new UserRepository();