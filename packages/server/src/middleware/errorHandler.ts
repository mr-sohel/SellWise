import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ApiResponse } from '../utils/ApiResponse';
// import { logger } from '../utils/logger'; // Assuming Winston logger is added later

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(ApiResponse.error(err.code, err.message, err.details));
  }

  // logger.error('Unhandled error', { error: err, requestId: req.id });
  console.error('Unhandled error:', err);
  return res.status(500).json(ApiResponse.error('INTERNAL_ERROR', err.message || 'An unexpected error occurred'));
}