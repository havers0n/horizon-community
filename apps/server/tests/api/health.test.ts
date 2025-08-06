import request from 'supertest';
import express from 'express';

describe('Health Check API', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Добавляем тестовые health check роуты
    app.get('/api/health', (req, res) => {
      res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    app.get('/api/v1/health', (req, res) => {
      res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        version: 'v1',
        environment: process.env.NODE_ENV || 'development'
      });
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
      
      expect(response.body.status).toBe('UP');
      expect(response.body.environment).toBe('test');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('should return correct environment in development', async () => {
      // Временно изменяем NODE_ENV
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.environment).toBe('development');

      // Восстанавливаем оригинальное значение
      process.env.NODE_ENV = originalEnv;
    });

    it('should return correct environment in production', async () => {
      // Временно изменяем NODE_ENV
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.environment).toBe('production');

      // Восстанавливаем оригинальное значение
      process.env.NODE_ENV = originalEnv;
    });

    it('should return valid ISO timestamp', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const timestamp = response.body.timestamp;
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      
      // Проверяем что timestamp не слишком старый
      const timestampDate = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.abs(now.getTime() - timestampDate.getTime()) / 1000;
      
      expect(diffInSeconds).toBeLessThan(5); // Разница не должна быть больше 5 секунд
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() => 
        request(app).get('/api/health')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('UP');
      });
    });

    it('should return consistent response structure', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const expectedKeys = ['status', 'timestamp', 'environment'];
      const actualKeys = Object.keys(response.body);

      expect(actualKeys).toEqual(expect.arrayContaining(expectedKeys));
      expect(actualKeys.length).toBe(expectedKeys.length);
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return v1 health status with version', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      
      expect(response.body.status).toBe('UP');
      expect(response.body.version).toBe('v1');
      expect(response.body.environment).toBe('test');
    });
  });
}); 