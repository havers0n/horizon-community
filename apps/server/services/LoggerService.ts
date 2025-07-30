/**
 * Улучшенный сервис логирования для оптимизации архитектуры
 * Поддерживает разные уровни логирования, структурированные логи и производительность
 */
export class LoggerService {
  private logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';
  private isProduction: boolean = process.env.NODE_ENV === 'production';

  constructor() {
    // Определение уровня логирования из env
    this.logLevel = (process.env.LOG_LEVEL as any) || 'info';
  }

  private shouldLog(level: string): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(level: string, message: string, data?: any, context?: any): string {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(data && { data }),
      ...(context && { context })
    };

    if (this.isProduction) {
      return JSON.stringify(logData);
    }

    const dataStr = data ? ` | ${JSON.stringify(data, null, 2)}` : '';
    const contextStr = context ? ` | Context: ${JSON.stringify(context, null, 2)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}${contextStr}`;
  }

  private log(level: string, message: string, data?: any, context?: any) {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, data, context);
    
    switch (level) {
      case 'debug':
        console.debug(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
    }
  }

  debug(message: string, data?: any, context?: any) {
    this.log('debug', message, data, context);
  }

  info(message: string, data?: any, context?: any) {
    this.log('info', message, data, context);
  }

  warn(message: string, data?: any, context?: any) {
    this.log('warn', message, data, context);
  }

  error(message: string, data?: any, context?: any) {
    this.log('error', message, data, context);
  }

  // Специализированные методы логирования

  logApiCall(method: string, url: string, statusCode: number, duration: number, userId?: string) {
    this.info('API Call', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      userId
    });
  }

  logDatabaseQuery(query: string, duration: number, params?: any[]) {
    this.debug('Database Query', {
      query,
      duration: `${duration}ms`,
      params: params?.length || 0
    });
  }

  logUserAction(userId: string, action: string, details?: any) {
    this.info('User Action', { userId, action, details });
  }

  logSecurityEvent(event: string, details?: any) {
    this.warn('Security Event', { event, details });
  }

  logPerformance(operation: string, duration: number, details?: any) {
    if (duration > 1000) { // Логируем медленные операции как предупреждения
      this.warn('Slow Operation', { operation, duration: `${duration}ms`, details });
    } else {
      this.debug('Performance', { operation, duration: `${duration}ms`, details });
    }
  }

  logError(error: Error, context?: any) {
    this.error('Application Error', {
      message: error.message,
      stack: error.stack,
      name: error.name
    }, context);
  }

  // Методы для мониторинга производительности

  timeOperation<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    return fn().finally(() => {
      const duration = Date.now() - startTime;
      this.logPerformance(operation, duration);
    }).catch((error) => {
      this.logError(error as Error, { operation });
      throw error;
    });
  }

  timeSyncOperation<T>(operation: string, fn: () => T): T {
    const startTime = Date.now();
    try {
      const result = fn();
      const duration = Date.now() - startTime;
      this.logPerformance(operation, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logPerformance(operation, duration);
      this.logError(error as Error, { operation });
      throw error;
    }
  }
}

// Создаем глобальный экземпляр логгера
export const logger = new LoggerService(); 