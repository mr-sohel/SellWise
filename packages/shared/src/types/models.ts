import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password_hash: z.string(),
  preferred_lang: z.enum(['en', 'bn']).default('en'),
  created_at: z.date(),
  updated_at: z.date(),
});

export const storeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  name_bn: z.string().optional().nullable(),
  currency: z.string().default('BDT'),
  timezone: z.string().default('Asia/Dhaka'),
  created_at: z.date(),
  updated_at: z.date(),
});

export const storeMemberSchema = z.object({
  store_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(['owner', 'manager']),
  created_at: z.date(),
});

export const productSchema = z.object({
  id: z.string().uuid(),
  store_id: z.string().uuid(),
  name: z.string(),
  name_bn: z.string().nullable(),
  sku: z.string().nullable(),
  category: z.string().nullable(),
  cost_price: z.number(),
  selling_price: z.number(),
  stock_quantity: z.number(),
  low_stock_threshold: z.number(),
  unit: z.string(),
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const customerSchema = z.object({
  id: z.string().uuid(),
  store_id: z.string().uuid(),
  name: z.string(),
  phone: z.string(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  total_orders: z.number(),
  total_spent: z.number(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const orderItemModelSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  product_name: z.string(),
  unit_price: z.number(),
  cost_price: z.number(),
  quantity: z.number(),
  created_at: z.date(),
});

export const orderSchema = z.object({
  id: z.string().uuid(),
  store_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  order_number: z.string(),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']),
  source: z.string(),
  total: z.number(),
  delivery_charge: z.number(),
  discount: z.number(),
  notes: z.string().nullable(),
  order_date: z.date(),
  external_reference_id: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const expenseSchema = z.object({
  id: z.string().uuid(),
  store_id: z.string().uuid(),
  category: z.string(),
  amount: z.number(),
  expense_date: z.date(),
  notes: z.string().nullable(),
  created_at: z.date(),
});

export type User = z.infer<typeof userSchema>;
export type Store = z.infer<typeof storeSchema>;
export type StoreMember = z.infer<typeof storeMemberSchema>;
export type Product = z.infer<typeof productSchema>;
export type Customer = z.infer<typeof customerSchema>;
export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemModelSchema>;
export type Expense = z.infer<typeof expenseSchema>;
