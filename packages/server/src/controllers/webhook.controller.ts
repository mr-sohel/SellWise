import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { ApiResponse } from '../utils/ApiResponse';

export class WebhookController {
  async handleOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId as string; // Injected by webhookAuth middleware
      const payload = req.body;

      // Ensure idempotency: Map external system's ID
      // You might need to map Shopify/WooCommerce specific payload format to CreateOrderDTO here
      // For this PoC, we assume the payload matches CreateOrderDTO shape

      const order = await orderService.createOrder(storeId, payload);

      res.status(200).json(ApiResponse.success({ order_number: order.order_number }));
    } catch (error: any) {
      // Handle Unique Violation for idempotency (PostgreSQL error code 23505)
      if (error.code === '23505' && error.constraint === 'uq_orders_store_ext_ref') {
        // Return 200 OK early without processing again
        return res.status(200).json(ApiResponse.success({ message: 'Order already processed' }));
      }
      next(error);
    }
  }
}

export const webhookController = new WebhookController();