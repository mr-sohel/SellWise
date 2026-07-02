import { BaseRepository } from './base.repository';
import { Product, CreateProductDTO, UpdateProductDTO, ProductFiltersDTO, PaginatedResult } from '@sellwise/shared';
import { PoolClient } from 'pg';

export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super('products');
  }

  async findByStore(
    storeId: string,
    filters: ProductFiltersDTO,
    client?: PoolClient
  ): Promise<PaginatedResult<Product>> {
    const { page, limit, search, category } = filters;
    const offset = (page - 1) * limit;

    let queryText = `SELECT * FROM ${this.tableName} WHERE store_id = $1 AND is_active = true`;
    let countQueryText = `SELECT COUNT(*) FROM ${this.tableName} WHERE store_id = $1 AND is_active = true`;

    const params: any[] = [storeId];
    let paramIndex = 2;

    if (search) {
      const searchPattern = `%${search}%`;
      queryText += ` AND (name ILIKE $${paramIndex} OR sku ILIKE $${paramIndex})`;
      countQueryText += ` AND (name ILIKE $${paramIndex} OR sku ILIKE $${paramIndex})`;
      params.push(searchPattern);
      paramIndex++;
    }

    if (category) {
      queryText += ` AND category = $${paramIndex}`;
      countQueryText += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const queryParams = [...params, limit, offset];

    const [dataResult, countResult] = await Promise.all([
      this.query(queryText, queryParams, client),
      this.query(countQueryText, params, client)
    ]);

    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: dataResult.rows,
      meta: {
        page,
        limit,
        totalCount,
        totalPages
      }
    };
  }

  async create(storeId: string, data: CreateProductDTO, client?: PoolClient): Promise<Product> {
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName}
       (store_id, name, name_bn, sku, category, cost_price, selling_price, stock_quantity, low_stock_threshold, unit)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        storeId, data.name, data.name_bn, data.sku, data.category,
        data.cost_price, data.selling_price, data.stock_quantity,
        data.low_stock_threshold, data.unit
      ],
      client
    );
    return rows[0];
  }

  async update(id: string, storeId: string, data: UpdateProductDTO, client?: PoolClient): Promise<Product | null> {
    // Generate dynamic SET clause based on provided fields
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

    if (updates.length === 0) {
      return this.findById(id, client);
    }

    updates.push(`updated_at = current_timestamp`);

    const { rows } = await this.query(
      `UPDATE ${this.tableName}
       SET ${updates.join(', ')}
       WHERE id = $1 AND store_id = $2 AND is_active = true
       RETURNING *`,
      params,
      client
    );

    return rows[0] || null;
  }

  async softDelete(id: string, storeId: string, client?: PoolClient): Promise<boolean> {
    const { rowCount } = await this.query(
      `UPDATE ${this.tableName} SET is_active = false WHERE id = $1 AND store_id = $2`,
      [id, storeId],
      client
    );
    return (rowCount ?? 0) > 0;
  }

  async findByIdForUpdate(id: string, storeId: string, client: PoolClient): Promise<Product | null> {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1 AND store_id = $2 AND is_active = true FOR UPDATE`,
      [id, storeId],
      client
    );
    return rows[0] || null;
  }

  async decrementStock(id: string, quantity: number, client: PoolClient): Promise<void> {
    await this.query(
      `UPDATE ${this.tableName} SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
      [quantity, id],
      client
    );
  }

  async bulkInsert(storeId: string, products: CreateProductDTO[], client?: PoolClient): Promise<Product[]> {
    if (!products.length) return [];

    // Using basic parameterization for bulk inserts, though for large sets unnesting might be better
    const values: any[] = [];
    const placeholders: string[] = [];
    let i = 1;

    for (const product of products) {
      placeholders.push(`($${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++})`);
      values.push(
        storeId, product.name, product.name_bn || null, product.sku || null, product.category || null,
        product.cost_price || 0, product.selling_price, product.stock_quantity || 0,
        product.low_stock_threshold || 10, product.unit || 'pcs'
      );
    }

    const { rows } = await this.query(
      `INSERT INTO ${this.tableName}
       (store_id, name, name_bn, sku, category, cost_price, selling_price, stock_quantity, low_stock_threshold, unit)
       VALUES ${placeholders.join(', ')}
       RETURNING *`,
      values,
      client
    );

    return rows;
  }
}

export const productRepository = new ProductRepository();