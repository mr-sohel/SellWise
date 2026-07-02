import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { requestId } from './middleware/requestId';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

// Middleware Stack
// TODO: Add helmet() for security headers
app.use(cors({
  origin: env.NODE_ENV === 'production' ? process.env.CLIENT_URL : true,
  credentials: true,
}));
app.use(express.json());
app.use(requestId);
app.use(requestLogger);

// Health check route
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'up',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV
    },
    error: null,
  });
});

// API Routes
app.use('/api/v1', routes);

// Global Error Handler
app.use(errorHandler);

export default app;