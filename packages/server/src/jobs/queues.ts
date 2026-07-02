import { Queue } from 'bullmq';
import { bullMqConnection } from '../config/redis';

// Define Queues
export const forecastQueue = new Queue('forecasts', { connection: bullMqConnection });
export const alertsQueue = new Queue('alerts', { connection: bullMqConnection });
export const rfmQueue = new Queue('rfm', { connection: bullMqConnection });