import Redis from 'ioredis';
import { env } from './env';

// Create a singleton connection for caching and rate limiting
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

// Create connection options specifically for BullMQ (it manages its own connections)
export const bullMqConnection = {
  url: env.REDIS_URL,
  maxRetriesPerRequest: null,
};