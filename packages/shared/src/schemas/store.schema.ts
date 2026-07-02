import { z } from 'zod';

export const createStoreSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters").max(100),
  currency: z.string().length(3).default('BDT'),
  timezone: z.string().default('Asia/Dhaka'),
});

export const updateStoreSchema = createStoreSchema.partial();

export type CreateStoreDTO = z.infer<typeof createStoreSchema>;
export type UpdateStoreDTO = z.infer<typeof updateStoreSchema>;
