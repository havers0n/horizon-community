import { LoggerService } from '../../services/LoggerService.js';

describe('LoggerService', () => {
  let logger: LoggerService;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    // Устанавливаем уровень логирования на debug для тестов
    process.env.LOG_LEVEL = 'debug';
    logger = new LoggerService();
    // Мокаем console методы
    consoleSpy = jest.spyOn(console, 'info').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('basic logging methods', () => {
    it('should format info messages correctly', () => {
      const message = 'Test info message';
      const data = { key: 'value' };
      const context = { userId: '123' };

      logger.info(message, data, context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO\] Test info message/)
      );
    });

    it('should format warn messages correctly', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const message = 'Test warning message';

      logger.warn(message);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[WARN\] Test warning message/)
      );
      warnSpy.mockRestore();
    });

    it('should format error messages correctly', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const message = 'Test error message';
      const data = { errorCode: 500 };

      logger.error(message, data);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[ERROR\] Test error message/)
      );
      errorSpy.mockRestore();
    });

    it('should format debug messages correctly', () => {
      const debugSpy = jest.spyOn(console, 'debug').mockImplementation();
      const message = 'Test debug message';

      logger.debug(message);

      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[DEBUG\] Test debug message/)
      );
      debugSpy.mockRestore();
    });
  });

  describe('message formatting', () => {
    it('should include data in formatted message', () => {
      const message = 'Test message';
      const data = { userId: '123', action: 'login' };

      logger.info(message, data);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"userId": "123"')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"action": "login"')
      );
    });

    it('should include context in formatted message', () => {
      const message = 'Test message';
      const context = { requestId: 'req-123', ip: '192.168.1.1' };

      logger.info(message, undefined, context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"requestId": "req-123"')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"ip": "192.168.1.1"')
      );
    });

    it('should handle complex data structures', () => {
      const message = 'Complex data test';
      const data = {
        user: {
          id: '123',
          profile: {
            name: 'John Doe',
            preferences: ['dark', 'notifications']
          }
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      logger.info(message, data);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"id": "123"')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"name": "John Doe"')
      );
    });
  });

  describe('specialized logging methods', () => {
    it('should log API calls correctly', () => {
      const method = 'POST';
      const url = '/api/users';
      const statusCode = 201;
      const duration = 150;
      const userId = 'user-123';

      logger.logApiCall(method, url, statusCode, duration, userId);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('API Call')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"method": "POST"')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"url": "/api/users"')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"statusCode": 201')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"duration": "150ms"')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"userId": "user-123"')
      );
    });

    it('should log database queries correctly', () => {
      const debugSpy = jest.spyOn(console, 'debug').mockImplementation();
      const query = 'SELECT * FROM users WHERE id = $1';
      const duration = 25;
      const params = ['user-123'];

      logger.logDatabaseQuery(query, duration, params);

      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('Database Query')
      );
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('"query": "SELECT * FROM users WHERE id = $1"')
      );
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('"duration": "25ms"')
      );
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('"params": 1')
      );
      debugSpy.mockRestore();
    });

    it('should log user actions correctly', () => {
      const userId = 'user-123';
      const action = 'profile_update';
      const details = { field: 'email', oldValue: 'old@email.com', newValue: 'new@email.com' };

      logger.logUserAction(userId, action, details);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('User Action')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"userId": "user-123"')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"action": "profile_update"')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"field": "email"')
      );
    });

    it('should log security events correctly', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const event = 'failed_login_attempt';
      const details = { ip: '192.168.1.1', attempts: 5 };

      logger.logSecurityEvent(event, details);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Security Event')
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('"event": "failed_login_attempt"')
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('"ip": "192.168.1.1"')
      );
      warnSpy.mockRestore();
    });

    it('should log performance metrics correctly', () => {
      const operation = 'database_query';
      const duration = 2500; // 2.5 seconds - should trigger warn level
      const details = { table: 'users', rows: 1000 };

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      logger.logPerformance(operation, duration, details);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow Operation')
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('"operation": "database_query"')
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('"duration": "2500ms"')
      );
      warnSpy.mockRestore();
    });

    it('should log fast operations as debug', () => {
      const debugSpy = jest.spyOn(console, 'debug').mockImplementation();
      const operation = 'cache_lookup';
      const duration = 5; // 5ms - should trigger debug level

      logger.logPerformance(operation, duration);

      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance')
      );
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('"operation": "cache_lookup"')
      );
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('"duration": "5ms"')
      );
      debugSpy.mockRestore();
    });

    it('should log errors with stack trace', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error message');
      const context = { userId: 'user-123', action: 'data_processing' };

      logger.logError(error, context);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Application Error')
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('"message": "Test error message"')
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('"name": "Error"')
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('"stack":')
      );
      errorSpy.mockRestore();
    });
  });

  describe('performance monitoring methods', () => {
    it('should time async operations correctly', async () => {
      const debugSpy = jest.spyOn(console, 'debug').mockImplementation();
      const operation = 'async_test';
      
      const result = await logger.timeOperation(operation, async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'test result';
      });

      expect(result).toBe('test result');
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance')
      );
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('"operation": "async_test"')
      );
      debugSpy.mockRestore();
    });

    it('should time sync operations correctly', () => {
      const debugSpy = jest.spyOn(console, 'debug').mockImplementation();
      const operation = 'sync_test';
      
      const result = logger.timeSyncOperation(operation, () => {
        return 'sync result';
      });

      expect(result).toBe('sync result');
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance')
      );
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('"operation": "sync_test"')
      );
      debugSpy.mockRestore();
    });

    it('should handle errors in async operations', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const operation = 'async_error_test';
      
      await expect(logger.timeOperation(operation, async () => {
        throw new Error('Async operation failed');
      })).rejects.toThrow('Async operation failed');

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Application Error')
      );
      errorSpy.mockRestore();
    });

    it('should handle errors in sync operations', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const operation = 'sync_error_test';
      
      expect(() => {
        logger.timeSyncOperation(operation, () => {
          throw new Error('Sync operation failed');
        });
      }).toThrow('Sync operation failed');

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Application Error')
      );
      errorSpy.mockRestore();
    });
  });
}); 