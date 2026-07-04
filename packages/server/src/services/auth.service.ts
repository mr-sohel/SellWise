import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { db } from '../config/db';
import { userRepository } from '../repositories/user.repository';
import { storeRepository } from '../repositories/store.repository';
import { LoginDTO, SignupDTO, User, UpdateProfileDTO } from '@sellwise/shared';
import { ConflictError, UnauthorizedError, NotFoundError } from '../errors/AppError';

export class AuthService {
  async signup(data: SignupDTO): Promise<{ user: Omit<User, 'password_hash'>, storeId: string, token: string }> {
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
      return { user: userWithoutPassword, storeId: store.id, token };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async login(data: LoginDTO): Promise<{ user: Omit<User, 'password_hash'>, storeId: string | null, token: string }> {
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
    return { user: userWithoutPassword, storeId: stores[0]?.id || null, token };
  }

  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<Omit<User, 'password_hash'>> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.password_hash);
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

    if (data.newPassword) {
      const salt = await bcrypt.genSalt(12);
      updates.password_hash = await bcrypt.hash(data.newPassword, salt);
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
    return jwt.sign({ userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }
}

export const authService = new AuthService();