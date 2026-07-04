import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';

export function requireRole(allowedRoles: ('owner' | 'manager')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError('Authentication required');
      }

      const role = req.user?.role;
      if (!role || !allowedRoles.includes(role as 'owner' | 'manager')) {
        throw new ForbiddenError('You do not have the required permissions for this store');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}