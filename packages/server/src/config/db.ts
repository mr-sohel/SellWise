import { Pool } from 'pg';
import { env } from './env';

export const db = new Pool({
  connectionString: env.DATABASE_URL,
});

db.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err);
  process.exit(-1);
});