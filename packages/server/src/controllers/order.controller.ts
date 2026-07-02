import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { ApiResponse } from '../utils/ApiResponse';

export class OrderController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const filters = req.query as any;
      const result = await orderService.listOrders(storeId, {
        page: Number(filters.page) || 1,
        limit: Number(filters.limit) || 20,
        status: filters.status,
        search: filters.search,
      });
      res.status(200).json(ApiResponse.success(result.data, result.meta));
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const id = req.params.id as string;
      const order = await orderService.getOrder(storeId, id);
      res.status(200).json(ApiResponse.success(order));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const order = await orderService.createOrder(storeId, req.body);
      res.status(201).json(ApiResponse.success(order));
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const id = req.params.id as string;
      const order = await orderService.updateOrderStatus(id, storeId, req.body);
      res.status(200).json(ApiResponse.success(order));
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
