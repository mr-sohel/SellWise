import { Worker, Job } from 'bullmq';
import { bullMqConnection } from '../config/redis';
import { db } from '../config/db';
import { forecastService } from '../services/forecast.service';
import logger from '../utils/logger';

export const forecastWorker = new Worker('forecasts', async (job: Job) => {
  logger.info(`[Worker: Forecast] Processing job ${job.id}`);

  if (job.name === 'forecast:generate') {
    const { rows: stores } = await db.query('SELECT id FROM stores');
    let totalProcessed = 0;

    for (const store of stores) {
      logger.info(`[Worker: Forecast] Generating forecasts for store ${store.id}`);
      const result = await forecastService.generateForecasts(store.id);
      totalProcessed += result.productsProcessed;
      await job.updateProgress(totalProcessed);
    }

    logger.info(`[Worker: Forecast] Done. Processed ${totalProcessed} products across ${stores.length} stores`);
  }
}, {
  connection: bullMqConnection,
  concurrency: 5
});

forecastWorker.on('completed', (job) => {
  logger.info(`[Worker: Forecast] Job ${job.id} completed successfully`);
});

forecastWorker.on('failed', (job, err) => {
  logger.error(`[Worker: Forecast] Job ${job?.id} failed:`, err);
});