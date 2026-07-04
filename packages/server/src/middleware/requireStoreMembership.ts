import { Request, Response, NextFunction } from 'express';
import { storeRepository } from '../repositories/store.repository';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';
import { z } from 'zod';

const uuidSchema = z.string().uuid('Invalid store ID format');

export async function requireStoreMembership(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const storeId = req.params.storeId as string;
    if (!storeId) {
      throw new ForbiddenError('Store ID is required');
    }

    // Validate storeId is a valid UUID
    const result = uuidSchema.safeParse(storeId);
    if (!result.success) {
      throw new ForbiddenError('Invalid store ID format');
    }

    // Check if user is a member of this store
    const role = await storeRepository.getMemberRole(storeId, userId);
    if (!role) {
      throw new ForbiddenError('You are not a member of this store');
    }

    // Attach role to request for downstream use
    req.user!.role = role;
    next();
  } catch (error) {
    next(error);
  }
}
