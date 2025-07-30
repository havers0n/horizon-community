import { Request, Response, NextFunction } from 'express';

// Тестовая версия middleware для разработки
export const testAuthenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  // В тестовом режиме пропускаем всех
  console.log('🔓 Test auth: Skipping authentication');
  next();
};