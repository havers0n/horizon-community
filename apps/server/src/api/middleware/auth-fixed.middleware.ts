// ВРЕМЕННО ЗАКОММЕНТИРОВАНО - используется auth.middleware.ts
/*
import { Request, Response, NextFunction } from 'express';
import { authService } from '../../core/services/index.js';

// Расширение типа Request для добавления пользователя
declare global {
  namespace Express {
    interface Request {
      user?: any; // Временно используем any, пока не определим точный тип AuthUser
    }
  }
}

// ===== ИСПРАВЛЕННЫЙ MIDDLEWARE АУТЕНТИФИКАЦИИ =====

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  // Временно закомментировано
};

export const authenticateCadToken = async (req: Request, res: Response, next: NextFunction) => {
  // Временно закомментировано
};

export const authenticateApiToken = async (req: Request, res: Response, next: NextFunction) => {
  // Временно закомментировано
};

export const authenticateAny = async (req: Request, res: Response, next: NextFunction) => {
  // Временно закомментировано
};

export const requireRole = (minimumRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Временно закомментировано
  };
};

export const requireExactRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Временно закомментировано
  };
};

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Временно закомментировано
  };
};

export const requireActiveStatus = (req: Request, res: Response, next: NextFunction) => {
  // Временно закомментировано
};

export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  // Временно закомментировано
};

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // Временно закомментировано
};

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Временно закомментировано
};
*/ 