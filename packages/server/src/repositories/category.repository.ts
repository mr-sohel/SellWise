import { BaseRepository } from './base.repository';
import type { Category } from '@sellwise/shared';
import { PoolClient } from 'pg';

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super('categories');
  }

  async findByStore(storeId: string, client?: PoolClient): Promise<Category[]> {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName}
       WHERE store_id = $1
       ORDER BY sort_order ASC, name ASC`,
      [storeId],
      client
    );
    return rows;
  }

  async findByName(storeId: string, name: string, client?: PoolClient): Promise<Category | null> {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName}
       WHERE store_id = $1 AND LOWER(name) = LOWER($2)`,
      [storeId, name],
      client
    );
    return rows[0] || null;
  }

  async createCategory(storeId: string, data: { name: string; name_bn?: string | null; is_default?: boolean; sort_order?: number }, client?: PoolClient): Promise<Category> {
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName} (store_id, name, name_bn, is_default, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [storeId, data.name, data.name_bn ?? null, data.is_default ?? false, data.sort_order ?? 0],
      client
    );
    return rows[0];
  }

  async bulkCreate(storeId: string, categories: { name: string; name_bn?: string | null; is_default?: boolean }[], client?: PoolClient): Promise<Category[]> {
    const results: Category[] = [];
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const existing = await this.findByName(storeId, cat.name, client);
      if (!existing) {
        const created = await this.createCategory(storeId, { ...cat, is_default: cat.is_default ?? true, sort_order: i }, client);
        results.push(created);
      }
    }
    return results;
  }

  async updateCategory(id: string, storeId: string, data: { name?: string; name_bn?: string | null }, client?: PoolClient): Promise<Category | null> {
    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      params.push(data.name);
    }
    if (data.name_bn !== undefined) {
      fields.push(`name_bn = $${paramIndex++}`);
      params.push(data.name_bn);
    }

    if (fields.length === 0) return this.findById(id, storeId, client);

    params.push(id, storeId);
    const { rows } = await this.query(
      `UPDATE ${this.tableName} SET ${fields.join(', ')}
       WHERE id = $${paramIndex++} AND store_id = $${paramIndex}
       RETURNING *`,
      params,
      client
    );
    return rows[0] || null;
  }

  async deleteCategory(id: string, storeId: string, client?: PoolClient): Promise<boolean> {
    const { rowCount } = await this.query(
      `DELETE FROM ${this.tableName} WHERE id = $1 AND store_id = $2 AND is_default = false`,
      [id, storeId],
      client
    );
    return (rowCount ?? 0) > 0;
  }
}

export const categoryRepository = new CategoryRepository();
