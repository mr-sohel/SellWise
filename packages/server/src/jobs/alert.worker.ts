import { Worker, Job } from 'bullmq';
import { bullMqConnection } from '../config/redis';
import { db } from '../config/db';
import { alertService } from '../services/alert.service';
import logger from '../utils/logger';

export const alertsWorker = new Worker('alerts', async (job: Job) => {
  logger.info(`[Worker: Alerts] Processing job ${job.id}`);

  if (job.name === 'alerts:generate') {
    const { rows: stores } = await db.query('SELECT id FROM stores');
    let totalCreated = 0;

    for (const store of stores) {
      logger.info(`[Worker: Alerts] Generating alerts for store ${store.id}`);
      const result = await alertService.generateAlerts(store.id);
      totalCreated += result.alertsCreated;
      await job.updateProgress(totalCreated);
    }

    logger.info(`[Worker: Alerts] Done. Created ${totalCreated} alerts across ${stores.length} stores`);
  }
}, {
  connection: bullMqConnection,
  concurrency: 5
});

alertsWorker.on('completed', (job) => {
  logger.info(`[Worker: Alerts] Job ${job.id} completed successfully`);
});

alertsWorker.on('failed', (job, err) => {
  logger.error(`[Worker: Alerts] Job ${job?.id} failed:`, err);
});