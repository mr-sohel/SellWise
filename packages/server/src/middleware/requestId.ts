import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: { id: string; role?: string; [key: string]: any };
    }
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function requestId(req: Request, _res: Response, next: NextFunction) {
  const headerId = req.headers['x-request-id'] as string;
  req.id = (headerId && UUID_REGEX.test(headerId) && headerId.length <= 36)
    ? headerId
    : crypto.randomUUID();
  next();
}