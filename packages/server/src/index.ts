import app from './app';
import { env } from './config/env';
import { db } from './config/db';
import { setupSchedules } from './jobs/scheduler';

async function bootstrap() {
  try {
    // Test DB Connection
    await db.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL');

    // Initialize BullMQ schedules and workers
    await setupSchedules();

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();