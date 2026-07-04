import { forecastQueue, alertsQueue, rfmQueue } from './queues';
import './forecast.worker'; // Import to initialize worker
import './alert.worker'; // Import to initialize worker
import './rfm.worker'; // Import to initialize worker
import logger from '../utils/logger';

export async function setupSchedules() {
  logger.info('Setting up BullMQ schedules...');

  // Remove existing repeatable jobs before adding new ones to prevent duplicates
  const existingForecastJobs = await forecastQueue.getJobSchedulers();
  for (const job of existingForecastJobs) {
    if (job.id) await forecastQueue.removeJobScheduler(job.id);
  }

  const existingAlertJobs = await alertsQueue.getJobSchedulers();
  for (const job of existingAlertJobs) {
    if (job.id) await alertsQueue.removeJobScheduler(job.id);
  }

  const existingRfmJobs = await rfmQueue.getJobSchedulers();
  for (const job of existingRfmJobs) {
    if (job.id) await rfmQueue.removeJobScheduler(job.id);
  }

  // Daily Forecast Generation (Every day at 2:00 AM)
  await forecastQueue.add('forecast:generate', {}, {
    repeat: { pattern: '0 2 * * *' } // CRON pattern
  });

  // Daily Inventory Alerts (Every day at 3:00 AM)
  await alertsQueue.add('alerts:generate', {}, {
    repeat: { pattern: '0 3 * * *' }
  });

  // Weekly Customer RFM/Churn calculation (Sunday at 4:00 AM)
  await rfmQueue.add('rfm:calculate', {}, {
    repeat: { pattern: '0 4 * * 0' }
  });
}