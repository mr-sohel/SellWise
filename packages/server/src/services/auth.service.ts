import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { db } from '../config/db';
import { tokenBlacklist } from '../config/redis';
import { userRepository } from '../repositories/user.repository';
import { storeRepository } from '../repositories/store.repository';
import { LoginDTO, SignupDTO, User, UpdateProfileDTO, Store } from '@sellwise/shared';
import { ConflictError, UnauthorizedError, NotFoundError } from '../errors/AppError';
import logger from '../utils/logger';

export class AuthService {
  async signup(data: SignupDTO): Promise<{ user: Omit<User, 'password_hash'>, store: Store, role: string, token: string }> {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const salt = await bcrypt.genSalt(12);
      const password_hash = await bcrypt.hash(data.password, salt);

      const user = await userRepository.create({
        email: data.email,
        password_hash,
        preferred_lang: data.preferred_lang,
      }, client);

      const store = await storeRepository.createStoreTransaction(
        user.id,
        { name: `${data.email.split('@')[0]}'s Store`, currency: 'BDT', timezone: 'Asia/Dhaka' },
        client
      );

      await client.query('COMMIT');

      const token = this.generateToken(user.id);
      const { password_hash: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, store, role: 'owner', token };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async login(data: LoginDTO): Promise<{ user: Omit<User, 'password_hash'>, store: Store | null, role: string | null, token: string }> {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const stores = await storeRepository.findStoresByUser(user.id);
    const token = this.generateToken(user.id);

    const { password_hash: _, ...userWithoutPassword } = user;
    const store = stores[0] || null;
    const role = store ? (stores[0] as any).role : null;
    return { user: userWithoutPassword, store, role, token };
  }

  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<Omit<User, 'password_hash'>> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await bcrypt.compare(data.current_password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Incorrect current password');
    }

    const updates: Partial<User> = {};

    if (data.email && data.email !== user.email) {
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictError('Email is already in use by another account');
      }
      updates.email = data.email;
    }

    if (data.new_password) {
      const salt = await bcrypt.genSalt(12);
      updates.password_hash = await bcrypt.hash(data.new_password, salt);
    }

    if (Object.keys(updates).length > 0) {
      const updatedUser = await userRepository.update(userId, updates);
      const { password_hash: _, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    }

    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private generateToken(userId: string): string {
    const jti = crypto.randomUUID();
    return jwt.sign({ userId, jti }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  async revokeToken(token: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; jti?: string; exp?: number };
      if (decoded.jti && decoded.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await tokenBlacklist.set(decoded.jti, 'revoked', 'EX', ttl);
        }
      }
    } catch {
      // Token is already invalid, no need to blacklist
    }
  }
}

export const authService = new AuthService();