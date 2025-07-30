import { Request, Response, NextFunction } from 'express';
import { loggingMiddleware } from '../../middleware/logging.middleware.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { logger } from '../../services/LoggerService.js';

// Мокаем logger
jest.mock('../../services/LoggerService.js', () => ({
  logger: {
    info: jest.fn()
  }
}));

describe('Middleware Integration Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      url: '/api/test',
      headers: {
        'user-agent': 'test-agent',
        'x-forwarded-for': '192.168.1.1'
      },
      ip: '192.168.1.1'
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loggingMiddleware', () => {
    it('should call LoggerService.info for each request', () => {
      // Вызываем middleware
      loggingMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Проверяем, что logger.info был вызван
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('API Request'),
        expect.objectContaining({
          method: 'GET',
          url: '/api/test',
          ip: '192.168.1.1'
        })
      );

      // Проверяем, что next() был вызван
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle requests without user-agent', () => {
      delete mockRequest.headers!['user-agent'];

      loggingMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('API Request'),
        expect.objectContaining({
          method: 'GET',
          url: '/api/test',
          ip: '192.168.1.1'
        })
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle requests with different HTTP methods', () => {
      const methods = ['POST', 'PUT', 'DELETE', 'PATCH'];

      methods.forEach(method => {
        mockRequest.method = method;
        jest.clearAllMocks();

        loggingMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(logger.info).toHaveBeenCalledWith(
          expect.stringContaining('API Request'),
          expect.objectContaining({
            method: method,
            url: '/api/test'
          })
        );
      });
    });
  });

  describe('authMiddleware', () => {
    it('should return 401 Unauthorized for missing token', () => {
      // Вызываем middleware без токена
      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Проверяем, что возвращается 401
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access token required'
      });

      // Проверяем, что next() НЕ был вызван
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 Unauthorized for invalid token format', () => {
      // Добавляем неправильный формат токена
      mockRequest.headers = {
        ...mockRequest.headers,
        authorization: 'InvalidToken'
      };

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access token required'
      });

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 Unauthorized for malformed Bearer token', () => {
      // Добавляем неправильный Bearer токен
      mockRequest.headers = {
        ...mockRequest.headers,
        authorization: 'Bearer'
      };

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access token required'
      });

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() for valid token format', () => {
      // Добавляем правильный формат токена (но не проверяем его валидность)
      mockRequest.headers = {
        ...mockRequest.headers,
        authorization: 'Bearer valid-token-here'
      };

      // Мокаем jwt.verify чтобы он не выбрасывал ошибку
      jest.doMock('jsonwebtoken', () => ({
        verify: jest.fn().mockReturnValue({ userId: '123' })
      }));

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Проверяем, что next() был вызван
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('error handling in middleware', () => {
    it('should handle errors in loggingMiddleware gracefully', () => {
      // Мокаем logger.info чтобы он выбрасывал ошибку
      (logger.info as jest.Mock).mockImplementation(() => {
        throw new Error('Logger error');
      });

      // Middleware не должно падать
      expect(() => {
        loggingMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).not.toThrow();

      // next() все равно должен быть вызван
      expect(mockNext).toHaveBeenCalled();
    });
  });
}); 