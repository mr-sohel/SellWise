import { Request, Response, NextFunction } from 'express';
import { storeRepository } from '../repositories/store.repository';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';

export function requireRole(allowedRoles: ('owner' | 'manager')[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError('Authentication required');
      }

      const storeId = req.params.storeId as string;
      if (!storeId) {
        throw new ForbiddenError('Store ID is required to perform this action');
      }

      // TODO: Add Redis caching here as specified in implementation_plan.md
      const role = await storeRepository.getMemberRole(storeId, userId);

      if (!role || !allowedRoles.includes(role as 'owner' | 'manager')) {
        throw new ForbiddenError('You do not have the required permissions for this store');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}