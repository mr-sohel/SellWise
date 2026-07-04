import { z } from 'zod';

const passwordValidation = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: passwordValidation,
  preferred_lang: z.enum(['en', 'bn']).default('en'),
});

export type LoginDTO = z.infer<typeof loginSchema>;
export type SignupDTO = z.infer<typeof signupSchema>;

export const updateProfileSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  current_password: z.string().min(1, "Current password is required to make changes"),
  new_password: passwordValidation.optional(),
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
