import { z } from 'zod';
import { createCustomerSchema } from './customer.schema';
import { ORDER_STATUSES } from '../constants/order-status';

export const orderItemSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
});

// Link existing customer by ID or create/upsert by phone
export const orderCustomerSchema = z.union([
  z.object({ customer_id: z.string().uuid('Invalid customer ID') }),
  createCustomerSchema,
]);

export const createOrderSchema = z.object({
  customer: orderCustomerSchema,
  items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
  delivery_charge: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().optional().nullable(),
  source: z.enum(['manual', 'csv_import', 'webhook', 'facebook', 'other']).default('manual'),
  external_reference_id: z.string().optional().nullable(), // Used for webhook idempotency
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const orderFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  search: z.string().optional(), // search by order_number or customer phone
});

export type OrderItemDTO = z.infer<typeof orderItemSchema>;
export type CreateOrderDTO = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDTO = z.infer<typeof updateOrderStatusSchema>;
export type OrderFiltersDTO = z.infer<typeof orderFiltersSchema>;