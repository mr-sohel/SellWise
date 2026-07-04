import { expenseRepository } from '../repositories/expense.repository';
import { CreateExpenseDTO, ExpenseFiltersDTO, PaginatedResult, Expense } from '@sellwise/shared';
import { NotFoundError } from '../errors/AppError';

export class ExpenseService {
  async getExpenses(storeId: string, filters: ExpenseFiltersDTO): Promise<PaginatedResult<Expense>> {
    return expenseRepository.findByStore(storeId, filters);
  }

  async getExpense(id: string, storeId: string): Promise<Expense> {
    const expense = await expenseRepository.findById(id);
    if (!expense || expense.store_id !== storeId) {
      throw new NotFoundError('Expense');
    }
    return expense;
  }

  async createExpense(storeId: string, data: CreateExpenseDTO): Promise<Expense> {
    return expenseRepository.create(storeId, data);
  }

  async deleteExpense(id: string, storeId: string): Promise<void> {
    const expense = await this.getExpense(id, storeId);
    await expenseRepository.delete(expense.id, storeId);
  }
}

export const expenseService = new ExpenseService();