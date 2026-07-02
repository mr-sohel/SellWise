import { BaseRepository } from './base.repository';
import { Expense, CreateExpenseDTO, ExpenseFiltersDTO, PaginatedResult } from '@sellwise/shared';
import { PoolClient } from 'pg';

export class ExpenseRepository extends BaseRepository<Expense> {
  constructor() {
    super('expenses');
  }

  async create(storeId: string, data: CreateExpenseDTO, client?: PoolClient): Promise<Expense> {
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName} (store_id, category, amount, expense_date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [storeId, data.category, data.amount, data.expense_date, data.notes || null],
      client
    );
    return rows[0];
  }

  async findByStore(
    storeId: string,
    filters: ExpenseFiltersDTO,
    client?: PoolClient
  ): Promise<PaginatedResult<Expense>> {
    const { page, limit, category, start_date, end_date } = filters;
    const offset = (page - 1) * limit;

    let queryText = `SELECT * FROM ${this.tableName} WHERE store_id = $1`;
    let countQueryText = `SELECT COUNT(*) FROM ${this.tableName} WHERE store_id = $1`;

    const params: any[] = [storeId];
    let paramIndex = 2;

    if (category) {
      queryText += ` AND category = $${paramIndex}`;
      countQueryText += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (start_date) {
      queryText += ` AND expense_date >= $${paramIndex}`;
      countQueryText += ` AND expense_date >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      queryText += ` AND expense_date <= $${paramIndex}`;
      countQueryText += ` AND expense_date <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    queryText += ` ORDER BY expense_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const queryParams = [...params, limit, offset];

    const [dataResult, countResult] = await Promise.all([
      this.query(queryText, queryParams, client),
      this.query(countQueryText, params, client)
    ]);

    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: dataResult.rows,
      meta: { page, limit, totalCount, totalPages }
    };
  }
}

export const expenseRepository = new ExpenseRepository();