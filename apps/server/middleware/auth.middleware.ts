import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

// ===== MIDDLEWARE АУТЕНТИФИКАЦИИ =====

/**
 * Middleware для аутентификации по JWT токену (Supabase)
 */
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, error: 'Token not provided' });

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(403).json({ success: false, error: 'Invalid token' });
  }

  req.user = user;
  next();
};

/**
 * Middleware для аутентификации по CAD токену (игровая интеграция)
 */
export const authenticateCadToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers['x-cad-token'] as string;

    if (!token) {
      return res.status(401).json({ 
        error: 'CAD token required',
        code: 'MISSING_CAD_TOKEN'
      });
    }

    // Упрощенная валидация CAD токена
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ 
        error: 'Invalid CAD token',
        code: 'INVALID_CAD_TOKEN'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('CAD token authentication error:', error);
    return res.status(401).json({ 
      error: 'CAD token validation failed',
      code: 'CAD_TOKEN_ERROR'
    });
  }
};

/**
 * Middleware для аутентификации по API токену
 */
export const authenticateApiToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers['x-api-token'] as string;

    if (!token) {
      return res.status(401).json({ 
        error: 'API token required',
        code: 'MISSING_API_TOKEN'
      });
    }

    // Упрощенная валидация API токена
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ 
        error: 'Invalid API token',
        code: 'INVALID_API_TOKEN'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('API token authentication error:', error);
    return res.status(401).json({ 
      error: 'API token validation failed',
      code: 'API_TOKEN_ERROR'
    });
  }
};

/**
 * Универсальный middleware аутентификации (пробует все типы токенов)
 */
export const authenticateAny = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Пробуем JWT токен
    const authHeader = req.headers.authorization;
    const jwtToken = authHeader && authHeader.split(' ')[1];

    if (jwtToken) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(jwtToken);
        if (!error && user) {
          req.user = user;
          return next();
        }
      } catch (error) {
        // Продолжаем к следующему типу токена
      }
    }

    // Пробуем CAD токен
    const cadToken = req.headers['x-cad-token'] as string;
    if (cadToken) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(cadToken);
        if (!error && user) {
          req.user = user;
          return next();
        }
      } catch (error) {
        // Продолжаем к следующему типу токена
      }
    }

    // Пробуем API токен
    const apiToken = req.headers['x-api-token'] as string;
    if (apiToken) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(apiToken);
        if (!error && user) {
          req.user = user;
          return next();
        }
      } catch (error) {
        // Продолжаем к следующему типу токена
      }
    }

    // Если ни один токен не подошел
    return res.status(401).json({ 
      error: 'Valid authentication token required',
      code: 'NO_VALID_TOKEN'
    });
  } catch (error) {
    console.error('Universal authentication error:', error);
    return res.status(401).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

// ===== MIDDLEWARE АВТОРИЗАЦИИ =====

/**
 * Middleware для проверки минимальной роли
 */
export const requireRole = (minimumRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Упрощенная проверка роли - проверяем user_metadata
    const userRole = req.user.user_metadata?.role || 'user';
    const roleHierarchy = ['user', 'candidate', 'member', 'supervisor', 'admin'];
    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const requiredRoleIndex = roleHierarchy.indexOf(minimumRole);

    if (userRoleIndex < requiredRoleIndex) {
      return res.status(403).json({ 
        error: `Minimum role '${minimumRole}' required`,
        code: 'INSUFFICIENT_ROLE'
      });
    }

    next();
  };
};

/**
 * Middleware для проверки конкретной роли
 */
export const requireExactRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.user_metadata?.role || 'user';
    if (userRole !== role) {
      return res.status(403).json({ 
        error: `Role '${role}' required`,
        code: 'WRONG_ROLE'
      });
    }

    next();
  };
};

/**
 * Middleware для проверки разрешения
 */
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Упрощенная проверка разрешений
    const userPermissions = req.user.user_metadata?.permissions || [];
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ 
        error: `Permission '${permission}' required`,
        code: 'INSUFFICIENT_PERMISSION'
      });
    }

    next();
  };
};

/**
 * Middleware для проверки активного статуса пользователя
 */
export const requireActiveStatus = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  const userStatus = req.user.user_metadata?.status || 'active';
  if (userStatus !== 'active') {
    return res.status(403).json({ 
      error: 'Account is not active',
      code: 'INACTIVE_ACCOUNT'
    });
  }

  next();
};

// ===== КОМБИНИРОВАННЫЕ MIDDLEWARE =====

/**
 * Middleware для администраторов
 */
export const requireAdmin = [
  authenticateAny,
  requireActiveStatus,
  requireRole('admin')
];

/**
 * Middleware для супервайзеров
 */
export const requireSupervisor = [
  authenticateAny,
  requireActiveStatus,
  requireRole('supervisor')
];

/**
 * Middleware для участников
 */
export const requireMember = [
  authenticateAny,
  requireActiveStatus,
  requireRole('member')
];

/**
 * Middleware для кандидатов и выше
 */
export const requireCandidate = [
  authenticateAny,
  requireActiveStatus,
  requireRole('candidate')
];

// ===== УТИЛИТЫ =====

/**
 * Middleware для логирования запросов
 */
export const logRequest = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - User: ${req.user?.email || 'anonymous'}`);
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};

/**
 * Middleware для обработки ошибок
 */
export const errorHandler = (error: Error, req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.error('Request error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: error.message,
      code: 'VALIDATION_ERROR'
    });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'UNAUTHORIZED'
    });
  }
  
  return res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
};

/**
 * Middleware для CORS
 */
export const corsMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CAD-Token, X-API-Token');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
}; 