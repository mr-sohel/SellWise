import { z } from 'zod';
import { BUSINESS_TYPES, SALES_CHANNELS } from '../constants/business';

export const createStoreSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters").max(100),
  currency: z.string().length(3).default('BDT'),
  timezone: z.string().default('Asia/Dhaka'),
});

export const updateStoreSchema = createStoreSchema.partial();

export const completeOnboardingSchema = z.object({
  business_type: z.enum(BUSINESS_TYPES),
  sales_channels: z.array(z.enum(SALES_CHANNELS)).min(1, 'Select at least one sales channel'),
});

export type CreateStoreDTO = z.infer<typeof createStoreSchema>;
export type UpdateStoreDTO = z.infer<typeof updateStoreSchema>;
export type CompleteOnboardingDTO = z.infer<typeof completeOnboardingSchema>;

export const createMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  preferred_lang: z.enum(['en', 'bn']).default('en'),
});

export type CreateMemberDTO = z.infer<typeof createMemberSchema>;
