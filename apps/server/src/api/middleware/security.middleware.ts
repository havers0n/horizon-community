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
  // Повышаем лимит для /api/v1/admin/*, чтобы не мешать массовым CRUD-операциям
  max: (req, _res) => {
    const url = (req.originalUrl || req.url || '').toLowerCase();
    return url.startsWith('/api/v1/admin/') ? 2000 : 100;
  },
  // Ключ — по userId, если аутентифицирован, иначе IP
  keyGenerator: (req) => {
    const userId = (req as any)?.user?.id;
    return userId ? `user:${userId}` : req.ip;
  },
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
 * Список разрешённых доменов читается из переменной окружения ALLOWED_ORIGINS
 * в формате CSV: "https://app.example.com,https://admin.example.com"
 */
const allowedOrigins: string[] = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

/**
 * CORS конфигурация. В production требуем явный origin и совпадение со списком.
 * В non-production допускаем отсутствие origin (запросы без браузера, локальные пробы).
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      if (process.env.NODE_ENV === 'production') {
        return callback(new Error('CORS: Origin header is required'));
      }
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
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
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' as const }
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