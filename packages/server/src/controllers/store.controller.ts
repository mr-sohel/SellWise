import { Request, Response, NextFunction } from 'express';
import { storeService } from '../services/store.service';
import { ApiResponse } from '../utils/ApiResponse';

export class StoreController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id; // Authenticated via middleware
      const store = await storeService.createStore(userId, req.body);
      res.status(201).json(ApiResponse.success(store));
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const stores = await storeService.listUserStores(userId);
      res.status(200).json(ApiResponse.success(stores));
    } catch (error) {
      next(error);
    }
  }
}

export const storeController = new StoreController();