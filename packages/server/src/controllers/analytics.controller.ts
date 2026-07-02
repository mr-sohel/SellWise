import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { ApiResponse } from '../utils/ApiResponse';

export class AnalyticsController {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const range = (req.query.range as string) || '30d';

      const overview = await analyticsService.getOverview(storeId, range);

      res.status(200).json(ApiResponse.success(overview));
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();