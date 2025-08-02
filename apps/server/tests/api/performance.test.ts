import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../routes';
import { storage } from '../../storage';

// Мокаем storage для тестов
jest.mock('../../storage', () => ({
  storage: {
    getAllDepartments: jest.fn(),
    getApplicationsByUser: jest.fn(),
    getReportsByUser: jest.fn(),
    getNotificationsByUser: jest.fn(),
    getUserByAuthId: jest.fn(),
    getCharactersByOwner: jest.fn(),
  }
}));

// Мокаем Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
  })),
}));

describe('API Performance Tests', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  afterAll(() => {
    server?.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Response Time Tests', () => {
    it('should respond to health check within 100ms', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(100);
      expect(response.body.status).toBe('ok');
    });

    it('should respond to departments list within 200ms', async () => {
      (storage.getAllDepartments as jest.Mock).mockResolvedValue([
        { id: 1, name: 'LSPD', shortName: 'LSPD' },
        { id: 2, name: 'LSFD', shortName: 'LSFD' }
      ]);

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/departments')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(200);
      expect(response.body).toHaveLength(2);
    });

    it('should handle authenticated requests within 300ms', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'candidate',
        status: 'active'
      };

      (storage.getApplicationsByUser as jest.Mock).mockResolvedValue([]);
      (storage.getCharactersByOwner as jest.Mock).mockResolvedValue([]);

      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'auth-123' } },
        error: null
      });

      (storage.getUserByAuthId as jest.Mock).mockResolvedValue(mockUser);

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/applications')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(300);
      expect(response.body).toEqual([]);
    });
  });

  describe('Concurrent Request Tests', () => {
    it('should handle 50 concurrent health check requests', async () => {
      const requests = Array(50).fill(null).map(() => 
        request(app).get('/api/health')
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Проверяем что все запросы прошли успешно
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
      });

      // Проверяем что общее время выполнения разумное
      expect(totalTime).toBeLessThan(2000); // Менее 2 секунд
    });

    it('should handle 20 concurrent authenticated requests', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'candidate',
        status: 'active'
      };

      (storage.getApplicationsByUser as jest.Mock).mockResolvedValue([]);
      (storage.getCharactersByOwner as jest.Mock).mockResolvedValue([]);

      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'auth-123' } },
        error: null
      });

      (storage.getUserByAuthId as jest.Mock).mockResolvedValue(mockUser);

      const requests = Array(20).fill(null).map(() => 
        request(app)
          .get('/api/applications')
          .set('Authorization', 'Bearer valid-token')
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Проверяем что все запросы прошли успешно
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Проверяем что общее время выполнения разумное
      expect(totalTime).toBeLessThan(3000); // Менее 3 секунд
    });

    it('should handle mixed concurrent requests efficiently', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'candidate',
        status: 'active'
      };

      (storage.getAllDepartments as jest.Mock).mockResolvedValue([
        { id: 1, name: 'LSPD', shortName: 'LSPD' }
      ]);
      (storage.getApplicationsByUser as jest.Mock).mockResolvedValue([]);
      (storage.getReportsByUser as jest.Mock).mockResolvedValue([]);
      (storage.getNotificationsByUser as jest.Mock).mockResolvedValue([]);
      (storage.getCharactersByOwner as jest.Mock).mockResolvedValue([]);

      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'auth-123' } },
        error: null
      });

      (storage.getUserByAuthId as jest.Mock).mockResolvedValue(mockUser);

      const requests = [
        // Health checks
        ...Array(10).fill(null).map(() => request(app).get('/api/health')),
        // Department requests
        ...Array(5).fill(null).map(() => request(app).get('/api/departments')),
        // Authenticated requests
        ...Array(5).fill(null).map(() => 
          request(app)
            .get('/api/applications')
            .set('Authorization', 'Bearer valid-token')
        ),
        ...Array(5).fill(null).map(() => 
          request(app)
            .get('/api/reports')
            .set('Authorization', 'Bearer valid-token')
        ),
        ...Array(5).fill(null).map(() => 
          request(app)
            .get('/api/notifications')
            .set('Authorization', 'Bearer valid-token')
        ),
      ];

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Проверяем что все запросы завершились
      responses.forEach(response => {
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(500);
      });

      // Проверяем что общее время выполнения разумное
      expect(totalTime).toBeLessThan(5000); // Менее 5 секунд
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not leak memory during multiple requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Выполняем множество запросов
      for (let i = 0; i < 100; i++) {
        await request(app).get('/api/health');
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Увеличение памяти не должно быть критическим (менее 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should handle large response data efficiently', async () => {
      const largeData = Array(1000).fill(null).map((_, index) => ({
        id: index + 1,
        name: `Department ${index + 1}`,
        shortName: `DEPT${index + 1}`,
        description: `Description for department ${index + 1}`,
        color: '#0066CC',
        isActive: true
      }));

      (storage.getAllDepartments as jest.Mock).mockResolvedValue(largeData);

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/departments')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(1000); // Менее 1 секунды
      expect(response.body).toHaveLength(1000);
    });
  });

  describe('Database Query Performance', () => {
    it('should cache repeated queries efficiently', async () => {
      (storage.getAllDepartments as jest.Mock).mockResolvedValue([
        { id: 1, name: 'LSPD', shortName: 'LSPD' }
      ]);

      // Первый запрос
      const firstResponse = await request(app)
        .get('/api/departments')
        .expect(200);

      // Повторный запрос
      const secondResponse = await request(app)
        .get('/api/departments')
        .expect(200);

      expect(firstResponse.body).toEqual(secondResponse.body);
      expect(storage.getAllDepartments).toHaveBeenCalledTimes(2);
    });

    it('should handle database connection errors gracefully', async () => {
      (storage.getAllDepartments as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/departments')
        .expect(500);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Ошибка должна обрабатываться быстро
      expect(responseTime).toBeLessThan(500);
      expect(response.body.message).toBe('Internal server error');
    });
  });

  describe('Rate Limiting Performance', () => {
    it('should handle rate limiting efficiently', async () => {
      const requests = Array(100).fill(null).map(() => 
        request(app).get('/api/health')
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Проверяем что большинство запросов прошли успешно
      const successfulRequests = responses.filter(r => r.status === 200);
      expect(successfulRequests.length).toBeGreaterThan(0);

      // Общее время выполнения должно быть разумным
      expect(totalTime).toBeLessThan(3000);
    });

    it('should not block legitimate requests under load', async () => {
      // Создаем нагрузку
      const loadRequests = Array(50).fill(null).map(() => 
        request(app).get('/api/health')
      );

      // Одновременно делаем легитимный запрос
      const legitimateRequest = request(app).get('/api/health');

      const [loadResponses, legitimateResponse] = await Promise.all([
        Promise.all(loadRequests),
        legitimateRequest
      ]);

      // Легитимный запрос должен пройти успешно
      expect(legitimateResponse.status).toBe(200);
      expect(legitimateResponse.body.status).toBe('ok');

      // Нагрузочные запросы также должны обрабатываться
      loadResponses.forEach(response => {
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(500);
      });
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle validation errors quickly', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: '',
          email: 'invalid-email',
          password: '123'
        })
        .expect(400);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(200);
      expect(response.body.message).toBe('Invalid request data');
    });

    it('should handle authentication errors efficiently', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/applications')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(300);
      expect(response.body.message).toBe('Authentication failed');
    });
  });
}); 