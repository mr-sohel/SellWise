import { storeRepository } from '../repositories/store.repository';
import { db } from '../config/db';
import { CreateStoreDTO, Store } from '@sellwise/shared';

export class StoreService {
  async createStore(userId: string, data: CreateStoreDTO): Promise<Store> {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const store = await storeRepository.createStoreTransaction(userId, data, client);
      await client.query('COMMIT');
      return store;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async listUserStores(userId: string): Promise<Store[]> {
    return storeRepository.findStoresByUser(userId);
  }
}

export const storeService = new StoreService();