import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, storeId, role, token } = await authService.signup(req.body);

      // Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json(ApiResponse.success({ user, storeId, role }));
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, storeId, role, token } = await authService.login(req.body);

      // Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json(ApiResponse.success({ user, storeId, role }));
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      res.status(200).json(ApiResponse.success(null));
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      // In a real app we'd fetch full user details from the DB here
      res.status(200).json(ApiResponse.success({ id: req.user?.id }));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const updatedUser = await authService.updateProfile(userId, req.body);
      res.status(200).json(ApiResponse.success(updatedUser));
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();