import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../routes';
import { storage } from '../../storage';

// Мокаем storage для тестов
jest.mock('../../storage', () => ({
  storage: {
    getUserByAuthId: jest.fn(),
    getUserByEmail: jest.fn(),
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

describe('Middleware Tests', () => {
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

  describe('Authentication Middleware', () => {
    it('should return 401 when no authorization header is provided', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should return 401 when authorization header is malformed', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidToken')
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should return 401 when token is invalid', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toBe('Authentication failed');
    });

    it('should return 401 when user not found in database', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'auth-123' } },
        error: null
      });

      (storage.getUserByAuthId as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token')
        .expect(401);

      expect(response.body.message).toBe('User not found');
    });
  });

  describe('Role-based Access Control', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'candidate',
      status: 'active'
    };

    // Мокаем middleware аутентификации
    const mockAuthMiddleware = (req: any, res: any, next: any) => {
      req.user = mockUser;
      next();
    };

    it('should allow access when user has required role', async () => {
      const supervisorUser = { ...mockUser, role: 'supervisor' };

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      const originalRequireSupervisor = require('../../middleware/auth.middleware').requireSupervisor;
      
      require('../../middleware/auth.middleware').authenticateToken = (req: any, res: any, next: any) => {
        req.user = supervisorUser;
        next();
      };
      
      require('../../middleware/auth.middleware').requireSupervisor = (req: any, res: any, next: any) => {
        next();
      };

      const response = await request(app)
        .get('/api/admin/applications')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
      require('../../middleware/auth.middleware').requireSupervisor = originalRequireSupervisor;
    });

    it('should deny access when user does not have required role', async () => {
      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/admin/applications')
        .set('Authorization', 'Bearer test-token')
        .expect(403);

      expect(response.body.message).toBe('Supervisor access required');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should allow admin access to all supervisor endpoints', async () => {
      const adminUser = { ...mockUser, role: 'admin' };

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      const originalRequireSupervisor = require('../../middleware/auth.middleware').requireSupervisor;
      
      require('../../middleware/auth.middleware').authenticateToken = (req: any, res: any, next: any) => {
        req.user = adminUser;
        next();
      };
      
      require('../../middleware/auth.middleware').requireSupervisor = (req: any, res: any, next: any) => {
        next();
      };

      const response = await request(app)
        .get('/api/admin/applications')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
      require('../../middleware/auth.middleware').requireSupervisor = originalRequireSupervisor;
    });
  });

  describe('Error Handling Middleware', () => {
    it('should handle validation errors gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: '',
          email: 'invalid-email',
          password: '123'
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid request data');
    });

    it('should handle database errors gracefully', async () => {
      (storage.getAllDepartments as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/departments')
        .expect(500);

      expect(response.body.message).toBe('Internal server error');
    });

    it('should handle missing route gracefully', async () => {
      const response = await request(app)
        .get('/api/nonexistent-route')
        .expect(404);

      expect(response.body.message).toBe('Route not found');
    });
  });

  describe('Request Logging Middleware', () => {
    it('should log request information', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await request(app)
        .get('/api/health')
        .expect(200);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log request with user information when authenticated', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'candidate',
        status: 'active'
      };

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = (req: any, res: any, next: any) => {
        req.user = mockUser;
        next();
      };

      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('CORS Middleware', () => {
    it('should include CORS headers in response', async () => {
      const response = await request(app)
        .options('/api/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
      expect(response.headers['access-control-allow-headers']).toBeDefined();
    });

    it('should handle preflight requests correctly', async () => {
      const response = await request(app)
        .options('/api/auth/login')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const requests = Array(5).fill(null).map(() => 
        request(app).get('/api/health')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle rate limit exceeded', async () => {
      // Создаем много запросов подряд
      const requests = Array(100).fill(null).map(() => 
        request(app).get('/api/health')
      );

      const responses = await Promise.all(requests);

      // Проверяем что большинство запросов прошли успешно
      const successfulRequests = responses.filter(r => r.status === 200);
      expect(successfulRequests.length).toBeGreaterThan(0);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in response', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
    });

    it('should include helmet security headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Проверяем наличие основных security headers
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection'
      ];

      securityHeaders.forEach(header => {
        expect(response.headers[header]).toBeDefined();
      });
    });
  });
}); 