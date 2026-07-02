import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

// Extend Express Request interface to include 'id'
declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: { id: string; [key: string]: any }; // Adjust based on your Auth implementation
    }
  }
}

export function requestId(req: Request, _res: Response, next: NextFunction) {
  req.id = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  next();
}