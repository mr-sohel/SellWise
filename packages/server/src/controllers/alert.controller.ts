import { Request, Response, NextFunction } from 'express';
import { alertService } from '../services/alert.service';
import { ApiResponse } from '../utils/ApiResponse';

export class AlertController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const unreadOnly = req.query.unread === 'true';
      const alerts = await alertService.getAlerts(storeId, unreadOnly);
      res.status(200).json(ApiResponse.success(alerts));
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const id = req.params.id as string;
      await alertService.markAsRead(id, storeId);
      res.status(200).json(ApiResponse.success({ message: 'Marked as read' }));
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      await alertService.markAllAsRead(storeId);
      res.status(200).json(ApiResponse.success({ message: 'All marked as read' }));
    } catch (error) {
      next(error);
    }
  }

  async triggerGeneration(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const result = await alertService.generateAlerts(storeId);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }
}

export const alertController = new AlertController();
