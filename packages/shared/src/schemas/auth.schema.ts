import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = loginSchema.extend({
  preferred_lang: z.enum(['en', 'bn']).default('en'),
});

export type LoginDTO = z.infer<typeof loginSchema>;
export type SignupDTO = z.infer<typeof signupSchema>;

export const updateProfileSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  current_password: z.string().min(1, "Current password is required to make changes"),
  new_password: z.string().min(6, "New password must be at least 6 characters").optional(),
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
