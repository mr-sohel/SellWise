import { Worker, Job } from 'bullmq';
import { bullMqConnection } from '../config/redis';
import { db } from '../config/db';

export const alertsWorker = new Worker('alerts', async (job: Job) => {
  console.log(`[Worker: Alerts] Processing job ${job.id}`);

  if (job.name === 'alerts:generate') {
    const { rows: stores } = await db.query('SELECT id FROM stores');

    for (const store of stores) {
      console.log(`[Worker: Alerts] Generating alerts for store ${store.id}`);

      // In a real implementation:
      // await alertService.generateAlerts(store.id);

      // Mock logic:
      // 1. Find products where stock_quantity <= low_stock_threshold
      // 2. Insert into inventory_alerts table
    }
  }
}, {
  connection: bullMqConnection,
  concurrency: 5
});

alertsWorker.on('completed', (job) => {
  console.log(`[Worker: Alerts] Job ${job.id} completed successfully`);
});

alertsWorker.on('failed', (job, err) => {
  console.error(`[Worker: Alerts] Job ${job?.id} failed:`, err);
});