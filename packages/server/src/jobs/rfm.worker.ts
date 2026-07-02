import { Worker, Job } from 'bullmq';
import { bullMqConnection } from '../config/redis';
import { db } from '../config/db';

export const rfmWorker = new Worker('rfm', async (job: Job) => {
  console.log(`[Worker: RFM/Churn] Processing job ${job.id}`);

  if (job.name === 'rfm:calculate') {
    const { rows: stores } = await db.query('SELECT id FROM stores');

    for (const store of stores) {
      console.log(`[Worker: RFM/Churn] Calculating RFM and Churn for store ${store.id}`);

      // In a real implementation:
      // 1. Calculate Recency, Frequency, Monetary values using SQL aggregation
      // 2. Score them into quintiles (1-5)
      // 3. Assign Segment (Champion, At Risk, etc)
      // 4. Send customer data to ML Service POST /churn
      // 5. Upsert results into customer_rfm table
    }
  }
}, {
  connection: bullMqConnection,
  concurrency: 2
});

rfmWorker.on('completed', (job) => {
  console.log(`[Worker: RFM/Churn] Job ${job.id} completed successfully`);
});

rfmWorker.on('failed', (job, err) => {
  console.error(`[Worker: RFM/Churn] Job ${job?.id} failed:`, err);
});