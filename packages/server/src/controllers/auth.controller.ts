import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import { env } from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, store, role, token } = await authService.signup(req.body);

      res.cookie('token', token, COOKIE_OPTIONS);
      res.status(201).json(ApiResponse.success({ user, store, role }));
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, store, role, token } = await authService.login(req.body);

      res.cookie('token', token, COOKIE_OPTIONS);
      res.status(200).json(ApiResponse.success({ user, store, role }));
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Revoke the token server-side
      const authHeader = req.headers.authorization;
      const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
      let tokenFromCookie: string | null = null;
      if (req.cookies?.token) {
        tokenFromCookie = req.cookies.token;
      }
      const token = tokenFromCookie || tokenFromHeader;
      if (token) {
        await authService.revokeToken(token);
      }

      res.clearCookie('token', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      res.status(200).json(ApiResponse.success(null));
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
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