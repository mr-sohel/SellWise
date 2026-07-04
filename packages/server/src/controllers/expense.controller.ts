import { Request, Response, NextFunction } from 'express';
import { expenseService } from '../services/expense.service';
import { ApiResponse } from '../utils/ApiResponse';

export class ExpenseController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const filters = req.query as any;
      const result = await expenseService.getExpenses(storeId, filters);
      res.status(200).json(ApiResponse.success(result.data, result.meta));
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const id = req.params.id as string;
      const expense = await expenseService.getExpense(id, storeId);
      res.status(200).json(ApiResponse.success(expense));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const expense = await expenseService.createExpense(storeId, req.body);
      res.status(201).json(ApiResponse.success(expense));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const id = req.params.id as string;
      await expenseService.deleteExpense(id, storeId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const expenseController = new ExpenseController();