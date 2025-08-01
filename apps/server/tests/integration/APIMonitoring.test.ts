import request from 'supertest';
import express from 'express';
import { authenticateToken, requireAdmin } from '../../middleware/auth.middleware.js';
import { storage } from '../../storage.js';
import { cacheService } from '../../services/CacheService.js';
import { logger } from '../../services/LoggerService.js';

// Мокаем сервисы
jest.mock('../../storage.js', () => ({
  storage: {
    getCacheInfo: jest.fn(),
    invalidateAllCache: jest.fn(),
    getSystemStats: jest.fn()
  }
}));

jest.mock('../../services/CacheService.js', () => ({
  cacheService: {
    size: jest.fn(),
    clear: jest.fn()
  }
}));

jest.mock('../../services/LoggerService.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

// Мокаем middleware
jest.mock('../../middleware/auth.middleware.js', () => ({
  authenticateToken: jest.fn((req, res, next) => next()),
  requireAdmin: [jest.fn((req, res, next) => next())]
}));

describe('API Monitoring Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Создаем тестовые маршруты
    app.get('/api/monitoring/performance', authenticateToken, ...requireAdmin, async (req, res) => {
      try {
        const cacheInfo = await storage.getCacheInfo();
        const systemStats = await storage.getSystemStats();
        
        res.json({
          success: true,
          data: {
            cache: cacheInfo,
            system: systemStats,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        logger.error('Error getting performance data', { error });
        res.status(500).json({
          success: false,
          error: 'Failed to get performance data'
        });
      }
    });

    app.post('/api/monitoring/invalidate-cache', authenticateToken, ...requireAdmin, async (req, res) => {
      try {
        await storage.invalidateAllCache();
        res.json({
          success: true,
          message: 'Cache invalidated successfully'
        });
      } catch (error) {
        logger.error('Error invalidating cache', { error });
        res.status(500).json({
          success: false,
          error: 'Failed to invalidate cache'
        });
      }
    });

    app.get('/api/monitoring/health', async (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/monitoring/performance', () => {
    it('should return correct JSON structure', async () => {
      const mockCacheInfo = {
        size: 5,
        keys: ['citizens:{}', 'departments:{}', 'stats:{}']
      };

      const mockSystemStats = {
        totalUsers: 100,
        activeUsers: 25,
        totalCharacters: 150,
        systemLoad: 0.75
      };

      (databaseService.getCacheInfo as jest.Mock).mockResolvedValue(mockCacheInfo);
      (databaseService.getSystemStats as jest.Mock).mockResolvedValue(mockSystemStats);

      const response = await request(app)
        .get('/api/monitoring/performance')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('cache');
      expect(response.body.data).toHaveProperty('system');
      expect(response.body.data).toHaveProperty('timestamp');

      expect(response.body.data.cache).toEqual(mockCacheInfo);
      expect(response.body.data.system).toEqual(mockSystemStats);
      expect(response.body.data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should handle database service errors', async () => {
      (databaseService.getCacheInfo as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/monitoring/performance')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Failed to get performance data');

      expect(logger.error).toHaveBeenCalledWith(
        'Error getting performance data',
        expect.objectContaining({ error: expect.any(Error) })
      );
    });

    it('should return cache information correctly', async () => {
      const mockCacheInfo = {
        size: 10,
        keys: ['user:1', 'user:2', 'post:1', 'comment:1']
      };

      (databaseService.getCacheInfo as jest.Mock).mockResolvedValue(mockCacheInfo);
      (databaseService.getSystemStats as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .get('/api/monitoring/performance')
        .expect(200);

      expect(response.body.data.cache.size).toBe(10);
      expect(response.body.data.cache.keys).toHaveLength(4);
      expect(response.body.data.cache.keys).toContain('user:1');
      expect(response.body.data.cache.keys).toContain('post:1');
    });
  });

  describe('POST /api/monitoring/invalidate-cache', () => {
    it('should invalidate cache successfully', async () => {
      (databaseService.invalidateAllCache as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/monitoring/invalidate-cache')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Cache invalidated successfully');

      expect(databaseService.invalidateAllCache).toHaveBeenCalled();
    });

    it('should handle cache invalidation errors', async () => {
      (databaseService.invalidateAllCache as jest.Mock).mockRejectedValue(new Error('Cache error'));

      const response = await request(app)
        .post('/api/monitoring/invalidate-cache')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Failed to invalidate cache');

      expect(logger.error).toHaveBeenCalledWith(
        'Error invalidating cache',
        expect.objectContaining({ error: expect.any(Error) })
      );
    });
  });

  describe('GET /api/monitoring/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/monitoring/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');

      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThan(0);
    });

    it('should not require authentication', async () => {
      // Этот эндпоинт не использует middleware аутентификации
      const response = await request(app)
        .get('/api/monitoring/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
    });
  });

  describe('API response format consistency', () => {
    it('should maintain consistent response format across endpoints', async () => {
      const mockCacheInfo = { size: 0, keys: [] };
      const mockSystemStats = { totalUsers: 0, activeUsers: 0 };

      (databaseService.getCacheInfo as jest.Mock).mockResolvedValue(mockCacheInfo);
      (databaseService.getSystemStats as jest.Mock).mockResolvedValue(mockSystemStats);
      (databaseService.invalidateAllCache as jest.Mock).mockResolvedValue(undefined);

      // Тестируем все эндпоинты
      const [performanceRes, invalidateRes, healthRes] = await Promise.all([
        request(app).get('/api/monitoring/performance'),
        request(app).post('/api/monitoring/invalidate-cache'),
        request(app).get('/api/monitoring/health')
      ]);

      // Все успешные ответы должны иметь правильную структуру
      expect(performanceRes.body).toHaveProperty('success');
      expect(invalidateRes.body).toHaveProperty('success');
      expect(healthRes.body).toHaveProperty('status');

      // Проверяем, что timestamp присутствует во всех ответах
      expect(performanceRes.body.data).toHaveProperty('timestamp');
      expect(healthRes.body).toHaveProperty('timestamp');
    });
  });
}); 