import { Worker, Job } from 'bullmq';
import { bullMqConnection } from '../config/redis';
import { db } from '../config/db';

export const forecastWorker = new Worker('forecasts', async (job: Job) => {
  console.log(`[Worker: Forecast] Processing job ${job.id} for store ${job.data?.storeId || 'ALL'}`);

  if (job.name === 'forecast:generate') {
    // 1. Get all active stores
    const { rows: stores } = await db.query('SELECT id FROM stores');

    // 2. Process forecasts for each store
    for (const store of stores) {
      console.log(`[Worker: Forecast] Generating forecasts for store ${store.id}`);
      // In a real implementation:
      // await forecastService.generateForecasts(store.id);
    }
  }
}, {
  connection: bullMqConnection,
  concurrency: 5
});

forecastWorker.on('completed', (job) => {
  console.log(`[Worker: Forecast] Job ${job.id} completed successfully`);
});

forecastWorker.on('failed', (job, err) => {
  console.error(`[Worker: Forecast] Job ${job?.id} failed:`, err);
});