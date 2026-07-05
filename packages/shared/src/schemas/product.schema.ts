import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(300),
  name_bn: z.string().max(300).optional().nullable(),
  sku: z.string().max(100).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  cost_price: z.number().min(0, 'Cost price must be non-negative').default(0),
  selling_price: z.number().positive('Selling price must be positive'),
  stock_quantity: z.number().int().min(0, 'Stock cannot be negative').default(0),
  low_stock_threshold: z.number().int().min(0).default(10),
  unit: z.string().max(20).default('pcs'),
});

export const updateProductSchema = createProductSchema.partial();

export const productFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
});

export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
export type ProductFiltersDTO = z.infer<typeof productFiltersSchema>;
