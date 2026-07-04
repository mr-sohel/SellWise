import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';
import { ApiResponse } from '../utils/ApiResponse';

export class CategoryController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const categories = await categoryService.listByStore(storeId);
      res.status(200).json(ApiResponse.success(categories));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const category = await categoryService.createCategory(storeId, req.body);
      res.status(201).json(ApiResponse.success(category));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const categoryId = req.params.categoryId as string;
      const category = await categoryService.updateCategory(categoryId, storeId, req.body);
      res.status(200).json(ApiResponse.success(category));
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const categoryId = req.params.categoryId as string;
      await categoryService.deleteCategory(categoryId, storeId);
      res.status(200).json(ApiResponse.success({ message: 'Category deleted' }));
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
