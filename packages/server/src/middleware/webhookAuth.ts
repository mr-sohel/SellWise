import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { apiKeyRepository } from '../repositories/apiKey.repository';
import { UnauthorizedError } from '../errors/AppError';

export async function webhookAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || typeof apiKey !== 'string') {
      throw new UnauthorizedError('Missing or invalid API Key');
    }

    // In a real app, the client provides the raw key, we hash it to compare with DB
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    const keyRecord = await apiKeyRepository.findByHash(keyHash);

    if (!keyRecord) {
      throw new UnauthorizedError('Invalid API Key');
    }

    // Attach storeId to request params so downstream controllers can use it
    req.params.storeId = keyRecord.store_id;
    next();
  } catch (error) {
    next(error);
  }
}