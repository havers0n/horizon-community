import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { storage } from '../storage';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// УДАЛЕН ДУБЛИРУЮЩИЙ ИНТЕРФЕЙС AuthenticatedRequest
// Используется AuthenticatedRequest из middleware/auth.middleware.ts

export const authenticateSupabaseToken = async (
  req: any, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }
    
    // Валидируем токен через Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Supabase auth error:', error);
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Получаем пользователя из нашей БД
    const dbUser = await storage.getUserByAuthId(user.id);
    
    if (!dbUser) {
      console.error('User not found in database with auth_id:', user.id);
      return res.status(401).json({ message: 'User not found in database' });
    }
    
    // Добавляем пользователей в request
    req.user = dbUser;
    req.authUser = user;
    
    console.log('✅ User authenticated:', dbUser.username, '(ID:', dbUser.id, ')');
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

export const requireRole = (requiredRole: string) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: `Role ${requiredRole} required` });
    }
    
    next();
  };
};

export const requireSupervisor = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (!['supervisor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Supervisor access required' });
  }
  
  next();
};

export const requireAdmin = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
}; 