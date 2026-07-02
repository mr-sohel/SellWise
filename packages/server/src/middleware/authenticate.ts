import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../errors/AppError';

export interface JwtPayload {
  userId: string;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Check cookies first (we will store token in an http-only cookie)
  // Need cookie-parser for req.cookies, but we can parse req.headers.cookie manually or add cookie-parser.
  // For now, let's also support Authorization header (Bearer) as fallback/standard.
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  // Parse cookie if available
  let tokenFromCookie = null;
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').map(c => c.trim());
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    if (tokenCookie) {
      tokenFromCookie = tokenCookie.split('=')[1];
    }
  }

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    return next(new UnauthorizedError('Authentication token missing'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    return next(new UnauthorizedError('Invalid or expired authentication token'));
  }
}