import { Pool } from 'pg';
import { env } from './env';
import logger from '../utils/logger';

export const db = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

db.on('error', (err) => {
  logger.error('Unexpected error on idle pg client', err);
});