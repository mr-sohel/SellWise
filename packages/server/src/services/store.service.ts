import { storeRepository } from '../repositories/store.repository';
import { userRepository } from '../repositories/user.repository';
import { categoryRepository } from '../repositories/category.repository';
import { db } from '../config/db';
import { CreateStoreDTO, Store, CreateMemberDTO, CompleteOnboardingDTO, getCategoriesFromPresets, detectBusinessType } from '@sellwise/shared';
import bcrypt from 'bcryptjs';
import { ConflictError, NotFoundError, ForbiddenError } from '../errors/AppError';

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

  async completeOnboarding(storeId: string, data: CompleteOnboardingDTO): Promise<Store> {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Detect business_type from selected category presets
      const businessType = detectBusinessType(data.categoryPresetIds);

      // Update store profile with detected business_type
      const store = await storeRepository.updateStoreProfile(storeId, {
        business_type: businessType,
      }, client);

      // Seed categories from selected presets
      const categories = getCategoriesFromPresets(data.categoryPresetIds);
      await categoryRepository.bulkCreate(
        storeId,
        categories.map(name => ({ name, is_default: true })),
        client
      );

      await client.query('COMMIT');
      return store;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateStoreProfile(storeId: string, data: { name?: string; name_bn?: string }): Promise<Store> {
    const store = await storeRepository.findById(storeId);
    if (!store) {
      throw new NotFoundError('Store not found');
    }

    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      params.push(data.name);
    }
    if (data.name_bn !== undefined) {
      fields.push(`name_bn = $${paramIndex++}`);
      params.push(data.name_bn);
    }

    if (fields.length === 0) return store;

    fields.push(`updated_at = NOW()`);
    params.push(storeId);

    const { rows } = await db.query(
      `UPDATE stores SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );
    return rows[0];
  }

  async createMember(storeId: string, data: CreateMemberDTO): Promise<any> {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Check if user already exists
      let user = await userRepository.findByEmail(data.email, client);
      
      if (user) {
        // If user exists, check if they are already in the store
        const existingRole = await storeRepository.getMemberRole(storeId, user.id, client);
        if (existingRole) {
          throw new ConflictError('User is already a member of this store');
        }
      } else {
        // Create new user
        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(data.password, salt);
        user = await userRepository.create({
          email: data.email,
          password_hash,
          preferred_lang: data.preferred_lang,
        }, client);
      }

      // Add user to store as manager
      await storeRepository.addMember(storeId, user.id, 'manager', client);

      await client.query('COMMIT');
      
      const { password_hash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async listMembers(storeId: string): Promise<any[]> {
    return storeRepository.listMembers(storeId);
  }

  async removeMember(storeId: string, targetUserId: string, requesterUserId: string): Promise<void> {
    // Ensure the requester isn't removing themselves (or we can allow it, but usually owners shouldn't remove themselves this way)
    if (targetUserId === requesterUserId) {
      throw new ForbiddenError('You cannot remove yourself from the store');
    }

    const role = await storeRepository.getMemberRole(storeId, targetUserId);
    if (!role) {
      throw new NotFoundError('User is not a member of this store');
    }
    
    // Prevent removing another owner
    if (role === 'owner') {
      throw new ForbiddenError('Cannot remove an owner from the store');
    }

    await storeRepository.removeMember(storeId, targetUserId);
  }
}

export const storeService = new StoreService();
