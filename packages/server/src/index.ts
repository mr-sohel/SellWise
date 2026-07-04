import app from './app';
import { env } from './config/env';
import { db } from './config/db';
import { redis } from './config/redis';
import { setupSchedules } from './jobs/scheduler';
import { forecastQueue, alertsQueue, rfmQueue } from './jobs/queues';
import logger from './utils/logger';

async function bootstrap() {
  try {
    // Test DB Connection
    await db.query('SELECT NOW()');
    logger.info('✅ Connected to PostgreSQL');

    // Initialize BullMQ schedules and workers
    await setupSchedules();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    // Graceful shutdown handler
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      server.close(async () => {
        logger.log('info', 'HTTP server closed');
        await forecastQueue.close();
        await alertsQueue.close();
        await rfmQueue.close();
        await redis.quit();
        await db.end();
        logger.log('info', 'All connections closed. Exiting.');
        process.exit(0);
      });

      // Force shutdown after 30s
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();