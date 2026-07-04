import Redis from 'ioredis';
import { env } from './env';
import logger from '../utils/logger';

// Create a singleton connection for caching and rate limiting
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redis.on('error', (err) => {
  logger.error('Redis error:', err);
});

// Dedicated connection for token blacklist (no key limitations)
export const tokenBlacklist = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  keyPrefix: 'bl:',
});

// Create connection options specifically for BullMQ (it manages its own connections)
export const bullMqConnection = {
  url: env.REDIS_URL,
  maxRetriesPerRequest: null,
};