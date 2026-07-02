import { forecastQueue, alertsQueue, rfmQueue } from './queues';
import './forecast.worker'; // Import to initialize worker
import './alert.worker'; // Import to initialize worker
import './rfm.worker'; // Import to initialize worker

export async function setupSchedules() {
  console.log('🗓️ Setting up BullMQ schedules...');

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