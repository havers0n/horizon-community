import { Request, Response, NextFunction } from 'express';
import { getAuthenticatedUser, requireSupervisorOrAdmin } from '../utils/auth';
import type { User } from '@roleplay-identity/shared-schema';

// Расширяем Request для добавления user
interface AuthenticatedRequest extends Request {
  user: User;
}

// Middleware для проверки JWT и получения пользователя
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Access token required or invalid' });
    }
    
    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Middleware для проверки роли supervisor/admin
export const requireSupervisor = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user || !['supervisor', 'admin'].includes(user.role)) {
    return res.status(403).json({ message: 'Supervisor access required' });
  }
  next();
};

// Middleware для проверки роли admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Backward compatibility - deprecated (will be removed in future versions)
export const verifyJWT = authenticateToken;
export const requireAdminOrSupervisor = requireSupervisor;
