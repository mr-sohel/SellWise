import { z } from 'zod';

export const createStoreSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters").max(100),
  currency: z.string().length(3).default('BDT'),
  timezone: z.string().default('Asia/Dhaka'),
});

export const updateStoreSchema = createStoreSchema.partial();

export type CreateStoreDTO = z.infer<typeof createStoreSchema>;
export type UpdateStoreDTO = z.infer<typeof updateStoreSchema>;

export const createMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  preferred_lang: z.enum(['en', 'bn']).default('en'),
});

export type CreateMemberDTO = z.infer<typeof createMemberSchema>;
