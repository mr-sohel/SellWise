import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { forecastService } from '../services/forecast.service';
import { ApiResponse } from '../utils/ApiResponse';

export class ProductController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const filters = req.query as any; // Validation middleware handles typing
      const result = await productService.getProducts(storeId, filters);
      res.status(200).json(ApiResponse.success(result.data, result.meta));
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const id = req.params.id as string;
      const product = await productService.getProduct(id, storeId);
      res.status(200).json(ApiResponse.success(product));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const product = await productService.createProduct(storeId, req.body);
      res.status(201).json(ApiResponse.success(product));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const id = req.params.id as string;
      const product = await productService.updateProduct(id, storeId, req.body);
      res.status(200).json(ApiResponse.success(product));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const id = req.params.id as string;
      await productService.deleteProduct(id, storeId);
      res.status(200).json(ApiResponse.success(null));
    } catch (error) {
      next(error);
    }
  }

  async updateStock(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const id = req.params.id as string;
      const { quantityChange } = req.body;
      const product = await productService.updateStock(id, storeId, quantityChange);
      res.status(200).json(ApiResponse.success(product));
    } catch (error) {
      next(error);
    }
  }

  async bulkImport(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const products = await productService.bulkImport(storeId, req.body.products);
      res.status(201).json(ApiResponse.success(products));
    } catch (error) {
      next(error);
    }
  }

  async getForecasts(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const id = req.params.id as string;
      const days = parseInt(req.query.days as string, 10) || 30;

      const forecasts = await forecastService.getForecasts(storeId, id);

      // Filter forecasts based on requested days
      const filteredForecasts = forecasts.slice(0, days);

      res.status(200).json(ApiResponse.success(filteredForecasts));
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();