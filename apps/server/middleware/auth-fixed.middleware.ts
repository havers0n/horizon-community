import { Request, Response, NextFunction } from 'express';
import { authService, type AuthUser } from '../services/AuthService.js';

// Расширение типа Request для добавления пользователя
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// ===== ИСПРАВЛЕННЫЙ MIDDLEWARE АУТЕНТИФИКАЦИИ =====

/**
 * Middleware для аутентификации по JWT токену (только Supabase Auth)
 * Убирает локальную JWT валидацию и полагается только на Supabase
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'MISSING_TOKEN'
      });
    }

    // Используем только Supabase Auth для проверки токена
    const user = await authService.authenticate(token);
    req.user = user;
    next();
  } catch (error) {
    console.error('Token authentication error:', error);
    return res.status(401).json({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * Middleware для аутентификации по CAD токену (игровая интеграция)
 */
export const authenticateCadToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cadToken = req.headers['x-cad-token'] as string;
    
    if (!cadToken) {
      return res.status(401).json({ 
        error: 'CAD token required',
        code: 'MISSING_CAD_TOKEN'
      });
    }

    const result = await authService.validateCadToken(cadToken);
    
    if (!result.success) {
      return res.status(401).json({ 
        error: result.error || 'Invalid CAD token',
        code: 'INVALID_CAD_TOKEN'
      });
    }

    req.user = result.user!;
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
export const authenticateApiToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiToken = req.headers['x-api-token'] as string;
    
    if (!apiToken) {
      return res.status(401).json({ 
        error: 'API token required',
        code: 'MISSING_API_TOKEN'
      });
    }

    const result = await authService.validateApiToken(apiToken);
    
    if (!result.valid) {
      return res.status(401).json({ 
        error: result.error || 'Invalid API token',
        code: 'INVALID_API_TOKEN'
      });
    }

    req.user = result.user!;
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
 * Исправленная версия без локальной JWT валидации
 */
export const authenticateAny = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Пробуем JWT токен (только через Supabase)
    const authHeader = req.headers.authorization;
    const jwtToken = authHeader && authHeader.split(' ')[1];

    if (jwtToken) {
      try {
        const user = await authService.authenticate(jwtToken);
        req.user = user;
        return next();
      } catch (error) {
        console.log('JWT token failed, trying next method...');
        // Продолжаем к следующему типу токена
      }
    }

    // Пробуем CAD токен
    const cadToken = req.headers['x-cad-token'] as string;
    if (cadToken) {
      try {
        const result = await authService.validateCadToken(cadToken);
        if (result.success) {
          req.user = result.user!;
          return next();
        }
      } catch (error) {
        console.log('CAD token failed, trying next method...');
        // Продолжаем к следующему типу токена
      }
    }

    // Пробуем API токен
    const apiToken = req.headers['x-api-token'] as string;
    if (apiToken) {
      try {
        const result = await authService.validateApiToken(apiToken);
        if (result.valid) {
          req.user = result.user!;
          return next();
        }
      } catch (error) {
        console.log('API token failed...');
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
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!authService.hasMinimumRole(req.user, minimumRole)) {
      return res.status(403).json({ 
        error: `Minimum role '${minimumRole}' required`,
        code: 'INSUFFICIENT_ROLE'
      });
    }

    next();
  };
};

/**
 * Middleware для проверки точной роли
 */
export const requireExactRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!authService.hasRole(req.user, role)) {
      return res.status(403).json({ 
        error: `Role '${role}' required`,
        code: 'INSUFFICIENT_ROLE'
      });
    }

    next();
  };
};

/**
 * Middleware для проверки разрешений
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!authService.hasPermission(req.user, permission)) {
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
export const requireActiveStatus = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  if (req.user.status !== 'active') {
    return res.status(403).json({ 
      error: 'Account is not active',
      code: 'INACTIVE_ACCOUNT'
    });
  }

  next();
};

// ===== ДОПОЛНИТЕЛЬНЫЕ MIDDLEWARE =====

/**
 * Middleware для логирования запросов
 */
export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = req.user?.id || 'anonymous';
    
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - User: ${userId}`);
  });
  
  next();
};

/**
 * Middleware для обработки ошибок
 */
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);
  
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
};

/**
 * Middleware для CORS
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CAD-Token, X-API-Token');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}; 