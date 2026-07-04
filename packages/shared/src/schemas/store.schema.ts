import { z } from 'zod';
import { CATEGORY_PRESET_IDS } from '../constants/business';

export const createStoreSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters").max(100),
  currency: z.string().length(3).default('BDT'),
  timezone: z.string().default('Asia/Dhaka'),
});

export const updateStoreSchema = createStoreSchema.partial();

export const completeOnboardingSchema = z.object({
  categoryPresetIds: z.array(z.enum(CATEGORY_PRESET_IDS)).min(1, 'Select at least one category'),
});

export type CreateStoreDTO = z.infer<typeof createStoreSchema>;
export type UpdateStoreDTO = z.infer<typeof updateStoreSchema>;
export type CompleteOnboardingDTO = z.infer<typeof completeOnboardingSchema>;

export const createMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  preferred_lang: z.enum(['en', 'bn']).default('en'),
});

export type CreateMemberDTO = z.infer<typeof createMemberSchema>;
