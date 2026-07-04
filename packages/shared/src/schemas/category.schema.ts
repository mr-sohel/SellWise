import { z } from 'zod';

export const categorySchema = z.object({
  id: z.string().uuid(),
  store_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  name_bn: z.string().max(100).optional().nullable(),
  is_default: z.boolean().default(false),
  sort_order: z.number().int().default(0),
  created_at: z.date(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  name_bn: z.string().max(100).optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type Category = z.infer<typeof categorySchema>;
export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;
