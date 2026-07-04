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

  async completeOnboarding(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const store = await storeService.completeOnboarding(storeId, req.body);
      res.status(200).json(ApiResponse.success(store));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const store = await storeService.updateStoreProfile(storeId, req.body);
      res.status(200).json(ApiResponse.success(store));
    } catch (error) {
      next(error);
    }
  }

  async createMember(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const member = await storeService.createMember(storeId, req.body);
      res.status(201).json(ApiResponse.success(member));
    } catch (error) {
      next(error);
    }
  }

  async listMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const members = await storeService.listMembers(storeId);
      res.status(200).json(ApiResponse.success(members));
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const targetUserId = req.params.userId as string;
      const requesterUserId = req.user!.id;

      await storeService.removeMember(storeId, targetUserId, requesterUserId);
      res.status(200).json(ApiResponse.success({ message: 'Member removed successfully' }));
    } catch (error) {
      next(error);
    }
  }
}

export const storeController = new StoreController();
