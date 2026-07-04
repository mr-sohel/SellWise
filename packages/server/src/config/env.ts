import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(64, 'JWT_SECRET must be at least 64 characters for security'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ML_SERVICE_URL: z.string().url().default('http://localhost:8000'),
  CLIENT_URL: z.string().url().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

if (_env.data.NODE_ENV === 'production' && !_env.data.CLIENT_URL) {
  console.error('❌ CLIENT_URL must be set in production');
  process.exit(1);
}

export const env = _env.data;