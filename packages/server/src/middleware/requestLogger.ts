import { Request, Response, NextFunction } from 'express';
// import { logger } from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      requestId: req.id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: duration,
      userId: req.user?.id,
      storeId: req.params.storeId,
    };

    // Fallback to console if logger isn't available
    console.log(`[${req.id}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`, logData);
  });
  next();
}