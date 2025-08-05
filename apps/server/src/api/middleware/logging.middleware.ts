import { Request, Response, NextFunction } from 'express';
import { logger } from '../../core/services/index.js';

/**
 * Middleware для логирования API запросов
 */
export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Логирование входящего запроса
  logger.info('Incoming Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });
  
  // Перехват ответа для логирования
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    logger.logApiCall(
      req.method,
      req.url,
      res.statusCode,
      duration,
      req.user?.id
    );
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware для логирования ошибок
 */
export const errorLoggingMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.logError(error, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.user?.id,
    userAgent: req.get('User-Agent')
  });
  
  next(error);
};

/**
 * Middleware для мониторинга производительности
 */
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Логируем медленные запросы
    if (duration > 1000) {
      logger.warn('Slow Request', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
        userId: req.user?.id
      });
    }
  });
  
  next();
};

/**
 * Middleware для логирования безопасности
 */
export const securityLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Логируем подозрительные запросы
  const suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /<script/i, // XSS attempts
    /union\s+select/i, // SQL injection
    /eval\s*\(/i, // Code injection
  ];
  
  const url = req.url.toLowerCase();
  const body = JSON.stringify(req.body || {}).toLowerCase();
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(body)) {
      logger.logSecurityEvent('Suspicious Request Detected', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        pattern: pattern.source
      });
      break;
    }
  }
  
  next();
}; 