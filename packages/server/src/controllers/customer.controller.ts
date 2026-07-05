import { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/customer.service';
import { ApiResponse } from '../utils/ApiResponse';
import { rfmQueue } from '../jobs/queues';

export class CustomerController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const filters = req.query as any;
      const result = await customerService.getCustomers(storeId, filters);
      res.status(200).json(ApiResponse.success(result.data, result.meta));
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const id = req.params.id as string;
      const customer = await customerService.getCustomer(id, storeId);
      res.status(200).json(ApiResponse.success(customer));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const customer = await customerService.createCustomer(storeId, req.body);
      res.status(201).json(ApiResponse.success(customer));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      const id = req.params.id as string;
      const customer = await customerService.updateCustomer(id, storeId, req.body);
      res.status(200).json(ApiResponse.success(customer));
    } catch (error) {
      next(error);
    }
  }

  async recalculateRFM(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string;
      await rfmQueue.add('rfm:calculate', {}, { jobId: `rfm-manual-${storeId}-${Date.now()}` });
      res.status(200).json(ApiResponse.success({ message: 'RFM recalculation queued' }));
    } catch (error) {
      next(error);
    }
  }
}

export const customerController = new CustomerController();