import { Queue } from 'bullmq';
import { bullMqConnection } from '../config/redis';

const defaultJobOptions = {
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 50 },
};

// Define Queues
export const forecastQueue = new Queue('forecasts', { connection: bullMqConnection, defaultJobOptions });
export const alertsQueue = new Queue('alerts', { connection: bullMqConnection, defaultJobOptions });
export const rfmQueue = new Queue('rfm', { connection: bullMqConnection, defaultJobOptions });