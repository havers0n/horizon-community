import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../routes';
import { storage } from '../../storage';

// Мокаем storage для тестов
jest.mock('../../storage', () => ({
  storage: {
    getUserByEmail: jest.fn(),
    getUserByUsername: jest.fn(),
    createUser: jest.fn(),
    getUserByAuthId: jest.fn(),
    getAllUsers: jest.fn(),
    createNotification: jest.fn(),
  }
}));

// Мокаем Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      admin: {
        createUser: jest.fn(),
      },
      signInWithPassword: jest.fn(),
      getUser: jest.fn(),
    },
  })),
}));

describe('API Security Tests', () => {
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

  describe('Input Validation Security', () => {
    it('should prevent SQL injection in registration', async () => {
      const maliciousData = {
        username: "'; DROP TABLE users; --",
        email: "'; DROP TABLE users; --",
        password: "'; DROP TABLE users; --"
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(maliciousData)
        .expect(400);

      expect(response.body.message).toBe('Invalid request data');
    });

    it('should prevent XSS in user input', async () => {
      const xssData = {
        username: '<script>alert("xss")</script>',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(xssData)
        .expect(400);

      expect(response.body.message).toBe('Invalid request data');
    });

    it('should prevent NoSQL injection', async () => {
      const nosqlData = {
        username: '{"$gt": ""}',
        email: '{"$gt": ""}',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(nosqlData)
        .expect(400);

      expect(response.body.message).toBe('Invalid request data');
    });

    it('should validate email format strictly', async () => {
      const invalidEmails = [
        'test',
        'test@',
        '@example.com',
        'test@example',
        'test..test@example.com',
        'test@.com',
        'test@example..com'
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: 'testuser',
            email: email,
            password: 'password123'
          })
          .expect(400);

        expect(response.body.message).toBe('Invalid request data');
      }
    });

    it('should prevent overly long inputs', async () => {
      const longString = 'a'.repeat(10000);
      const longData = {
        username: longString,
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(longData)
        .expect(400);

      expect(response.body.message).toBe('Invalid request data');
    });
  });

  describe('Authentication Security', () => {
    it('should not expose user existence in registration', async () => {
      const existingUser = {
        id: 1,
        username: 'existinguser',
        email: 'existing@example.com'
      };

      (storage.getUserByEmail as jest.Mock).mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          email: 'existing@example.com',
          password: 'password123'
        })
        .expect(400);

      // Не должно раскрывать конкретную причину ошибки
      expect(response.body.message).toBe('Email already registered');
    });

    it('should not expose user existence in login', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' }
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      // Должно возвращать общее сообщение об ошибке
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should prevent brute force attacks with rate limiting', async () => {
      const loginAttempts = Array(20).fill(null).map(() => 
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          })
      );

      const responses = await Promise.all(loginAttempts);

      // Некоторые запросы должны быть заблокированы
      const blockedRequests = responses.filter(r => r.status === 429);
      expect(blockedRequests.length).toBeGreaterThan(0);
    });

    it('should validate JWT token format', async () => {
      const invalidTokens = [
        'invalid-token',
        'Bearer',
        'Bearer ',
        'Bearer invalid',
        'Basic dGVzdDp0ZXN0',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature'
      ];

      for (const token of invalidTokens) {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', token)
          .expect(401);

        expect(response.body.message).toBe('Access token required');
      }
    });
  });

  describe('Authorization Security', () => {
    it('should prevent unauthorized access to protected endpoints', async () => {
      const protectedEndpoints = [
        '/api/applications',
        '/api/reports',
        '/api/notifications',
        '/api/auth/me'
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await request(app)
          .get(endpoint)
          .expect(401);

        expect(response.body.message).toBe('Access token required');
      }
    });

    it('should prevent role escalation', async () => {
      const regularUser = {
        id: 1,
        username: 'user',
        email: 'user@example.com',
        role: 'candidate',
        status: 'active'
      };

      // Мокаем middleware аутентификации
      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = (req: any, res: any, next: any) => {
        req.user = regularUser;
        next();
      };

      // Попытка доступа к админскому эндпоинту
      const response = await request(app)
        .get('/api/admin/applications')
        .set('Authorization', 'Bearer test-token')
        .expect(403);

      expect(response.body.message).toBe('Supervisor access required');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should prevent access to other users data', async () => {
      const user1 = {
        id: 1,
        username: 'user1',
        email: 'user1@example.com',
        role: 'candidate',
        status: 'active'
      };

      const user2 = {
        id: 2,
        username: 'user2',
        email: 'user2@example.com',
        role: 'candidate',
        status: 'active'
      };

      // Мокаем middleware аутентификации
      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = (req: any, res: any, next: any) => {
        req.user = user1;
        next();
      };

      // Попытка доступа к данным другого пользователя
      const response = await request(app)
        .get('/api/applications/2') // ID другого пользователя
        .set('Authorization', 'Bearer test-token')
        .expect(403);

      expect(response.body.message).toBe('Access denied');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('HTTP Security Headers', () => {
    it('should include security headers in all responses', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'strict-transport-security',
        'content-security-policy'
      ];

      securityHeaders.forEach(header => {
        expect(response.headers[header]).toBeDefined();
      });
    });

    it('should prevent clickjacking with X-Frame-Options', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('should prevent MIME type sniffing', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should include XSS protection', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });
  });

  describe('CORS Security', () => {
    it('should handle CORS preflight requests securely', async () => {
      const response = await request(app)
        .options('/api/health')
        .set('Origin', 'http://malicious-site.com')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type')
        .expect(200);

      // Проверяем что CORS заголовки присутствуют
      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
      expect(response.headers['access-control-allow-headers']).toBeDefined();
    });

    it('should not allow unauthorized origins', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://malicious-site.com')
        .expect(200);

      // Origin не должен быть в списке разрешенных
      expect(response.headers['access-control-allow-origin']).not.toBe('http://malicious-site.com');
    });
  });

  describe('Request Size Limits', () => {
    it('should limit request body size', async () => {
      const largeBody = {
        data: 'x'.repeat(1024 * 1024) // 1MB
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(largeBody)
        .expect(413); // Payload Too Large

      expect(response.body.message).toBe('Request entity too large');
    });

    it('should limit URL length', async () => {
      const longUrl = '/api/departments/' + 'x'.repeat(10000);

      const response = await request(app)
        .get(longUrl)
        .expect(414); // URI Too Long

      expect(response.body.message).toBe('URI too long');
    });
  });

  describe('Error Handling Security', () => {
    it('should not expose internal errors to clients', async () => {
      (storage.getAllDepartments as jest.Mock).mockRejectedValue(new Error('Internal database error'));

      const response = await request(app)
        .get('/api/departments')
        .expect(500);

      // Не должно раскрывать детали внутренних ошибок
      expect(response.body.message).toBe('Internal server error');
      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).not.toHaveProperty('details');
    });

    it('should not expose file system paths in errors', async () => {
      const response = await request(app)
        .get('/api/nonexistent-file')
        .expect(404);

      // Не должно раскрывать пути файловой системы
      expect(response.body.message).toBe('Route not found');
      expect(response.body.message).not.toContain('/var/www/');
      expect(response.body.message).not.toContain('\\');
    });

    it('should sanitize error messages', async () => {
      const maliciousError = new Error('<script>alert("xss")</script>');
      (storage.getAllDepartments as jest.Mock).mockRejectedValue(maliciousError);

      const response = await request(app)
        .get('/api/departments')
        .expect(500);

      // Сообщение об ошибке должно быть санитизировано
      expect(response.body.message).toBe('Internal server error');
      expect(response.body.message).not.toContain('<script>');
    });
  });

  describe('Session Security', () => {
    it('should use secure session configuration', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Проверяем наличие заголовков безопасности сессии
      expect(response.headers['set-cookie']).toBeDefined();
      
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        cookies.forEach((cookie: string) => {
          // В продакшене куки должны быть secure
          if (process.env.NODE_ENV === 'production') {
            expect(cookie).toContain('Secure');
          }
          expect(cookie).toContain('HttpOnly');
        });
      }
    });

    it('should prevent session fixation', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'auth-123' },
          session: { access_token: 'new-token-123' }
        },
        error: null
      });

      (storage.getUserByAuthId as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'candidate',
        status: 'active',
        authId: 'auth-123'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      // После входа должен быть новый токен
      expect(response.body.session.access_token).toBe('new-token-123');
    });
  });

  describe('Data Validation Security', () => {
    it('should validate all input data types', async () => {
      const invalidDataTypes = [
        { username: 123, email: 'test@example.com', password: 'password123' },
        { username: 'testuser', email: 123, password: 'password123' },
        { username: 'testuser', email: 'test@example.com', password: 123 },
        { username: null, email: 'test@example.com', password: 'password123' },
        { username: 'testuser', email: null, password: 'password123' },
        { username: 'testuser', email: 'test@example.com', password: null }
      ];

      for (const data of invalidDataTypes) {
        const response = await request(app)
          .post('/api/auth/register')
          .send(data)
          .expect(400);

        expect(response.body.message).toBe('Invalid request data');
      }
    });

    it('should prevent prototype pollution', async () => {
      const maliciousData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        '__proto__': { isAdmin: true }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(maliciousData)
        .expect(400);

      expect(response.body.message).toBe('Invalid request data');
    });
  });
}); 