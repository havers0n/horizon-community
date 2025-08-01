import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

// ===== RATE LIMITING =====

/**
 * Общий rate limiter для API
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: {
    error: 'Too many requests from this IP',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

/**
 * Строгий rate limiter для аутентификации
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток входа
  message: {
    error: 'Too many authentication attempts',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skipFailedRequests: false
});

/**
 * Rate limiter для создания BOLO
 */
export const boloCreateRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 10, // максимум 10 BOLO в час
  message: {
    error: 'Too many BOLO creation attempts',
    code: 'BOLO_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

// ===== CORS CONFIGURATION =====

/**
 * CORS конфигурация для production
 */
export const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://your-domain.com',
        'https://www.your-domain.com',
        // Добавьте ваши домены
      ]
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5000'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CAD-Token',
    'X-API-Token'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

// ===== SECURITY HEADERS =====

/**
 * Конфигурация Helmet для безопасности
 */
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
};

// ===== INPUT VALIDATION =====

/**
 * Middleware для валидации входных данных
 */
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  // Проверяем Content-Type
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: 'Content-Type must be application/json',
        code: 'INVALID_CONTENT_TYPE'
      });
    }
  }

  // Проверяем размер тела запроса
  const contentLength = parseInt(req.headers['content-length'] || '0');
  if (contentLength > 1024 * 1024) { // 1MB limit
    return res.status(413).json({
      error: 'Request entity too large',
      code: 'PAYLOAD_TOO_LARGE'
    });
  }

  next();
};

/**
 * Middleware для санитизации входных данных
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Базовая санитизация строк
  const sanitizeString = (str: string): string => {
    return str
      .replace(/[<>]/g, '') // Убираем потенциальные HTML теги
      .trim();
  };

  // Рекурсивная санитизация объекта
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  // Санитизируем тело запроса
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Санитизируем query параметры
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// ===== ERROR HANDLING =====

/**
 * Middleware для обработки ошибок безопасности
 */
export const securityErrorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Security error:', error);

  // Не раскрываем детали ошибок в production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }

  // В development показываем детали
  return res.status(500).json({
    error: error.message,
    code: 'INTERNAL_ERROR',
    stack: error.stack
  });
};

// ===== COMBINED SECURITY MIDDLEWARE =====

/**
 * Комбинированный middleware безопасности
 */
export const securityMiddleware = [
  helmet(helmetConfig),
  cors(corsOptions),
  validateInput,
  sanitizeInput,
  apiRateLimiter
];

/**
 * Middleware безопасности для аутентификации
 */
export const authSecurityMiddleware = [
  helmet(helmetConfig),
  cors(corsOptions),
  validateInput,
  sanitizeInput,
  authRateLimiter
];

/**
 * Middleware безопасности для BOLO операций
 */
export const boloSecurityMiddleware = [
  helmet(helmetConfig),
  cors(corsOptions),
  validateInput,
  sanitizeInput,
  boloCreateRateLimiter
]; 