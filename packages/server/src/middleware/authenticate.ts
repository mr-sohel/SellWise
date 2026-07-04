import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { tokenBlacklist } from '../config/redis';
import { UnauthorizedError } from '../errors/AppError';

export interface JwtPayload {
  userId: string;
  jti?: string;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  // Use req.cookies if cookie-parser middleware is loaded, otherwise parse manually
  let tokenFromCookie: string | null = null;
  if (req.cookies?.token) {
    tokenFromCookie = req.cookies.token;
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').map(c => c.trim());
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    if (tokenCookie) {
      const parts = tokenCookie.split('=');
      tokenFromCookie = parts.slice(1).join('=');
    }
  }

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    return next(new UnauthorizedError('Authentication token missing'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Check if token has been revoked (blacklisted)
    if (decoded.jti) {
      try {
        const revoked = await Promise.race([
          tokenBlacklist.get(decoded.jti),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
        ]);
        if (revoked) {
          return next(new UnauthorizedError('Token has been revoked'));
        }
      } catch {
        // Redis down or timeout — fail open for availability
      }
    }

    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    return next(new UnauthorizedError('Invalid or expired authentication token'));
  }
}