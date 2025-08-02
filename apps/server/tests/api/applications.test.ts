import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../routes';
import { storage } from '../../storage';
import { BusinessLogic } from '../../businessLogic';

// Мокаем storage для тестов
jest.mock('../../storage', () => ({
  storage: {
    getApplicationsByUser: jest.fn(),
    createApplication: jest.fn(),
    getAllUsers: jest.fn(),
    createNotification: jest.fn(),
    getApplicationById: jest.fn(),
    updateApplication: jest.fn(),
    deleteApplication: jest.fn(),
  }
}));

// Мокаем BusinessLogic
jest.mock('../../businessLogic', () => ({
  BusinessLogic: jest.fn().mockImplementation(() => ({
    canSubmitApplication: jest.fn(),
    getUserApplicationStats: jest.fn(),
    advanceApplicationStatus: jest.fn(),
  }))
}));

describe('Applications API', () => {
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

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'candidate',
    status: 'active'
  };

  const mockApplication = {
    id: 1,
    type: 'entry',
    authorId: 1,
    status: 'pending',
    data: { department: 'LSPD', reason: 'Test application' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Мокаем middleware аутентификации
  const mockAuthMiddleware = (req: any, res: any, next: any) => {
    req.user = mockUser;
    next();
  };

  describe('GET /api/applications', () => {
    it('should return user applications when authenticated', async () => {
      (storage.getApplicationsByUser as jest.Mock).mockResolvedValue([mockApplication]);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/applications')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual([mockApplication]);
      expect(storage.getApplicationsByUser).toHaveBeenCalledWith(mockUser.id);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/applications')
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('POST /api/applications', () => {
    const validApplicationData = {
      type: 'entry',
      data: {
        department: 'LSPD',
        reason: 'Test application',
        experience: 'Some experience'
      }
    };

    it('should create application successfully', async () => {
      const mockSupervisors = [
        { id: 2, username: 'supervisor1', role: 'supervisor' },
        { id: 3, username: 'admin1', role: 'admin' }
      ];

      (storage.createApplication as jest.Mock).mockResolvedValue(mockApplication);
      (storage.getAllUsers as jest.Mock).mockResolvedValue(mockSupervisors);
      (storage.createNotification as jest.Mock).mockResolvedValue({});

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', 'Bearer test-token')
        .send(validApplicationData)
        .expect(201);

      expect(response.body).toEqual(mockApplication);
      expect(storage.createApplication).toHaveBeenCalledWith({
        ...validApplicationData,
        authorId: mockUser.id
      });

      // Проверяем что уведомления созданы для супервайзеров
      expect(storage.createNotification).toHaveBeenCalledTimes(2);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 400 for invalid application data', async () => {
      const invalidData = {
        type: '',
        data: {}
      };

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', 'Bearer test-token')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Invalid application data');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('GET /api/application-limits/:type', () => {
    it('should return application limits for user', async () => {
      const mockRestriction = {
        allowed: true,
        reason: null,
        remainingCount: 2,
        cooldownEndsAt: null
      };

      const mockBusinessLogic = new BusinessLogic(storage);
      (mockBusinessLogic.canSubmitApplication as jest.Mock).mockResolvedValue(mockRestriction);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/application-limits/entry')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual(mockRestriction);
      expect(mockBusinessLogic.canSubmitApplication).toHaveBeenCalledWith(mockUser.id, 'entry');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 400 for invalid application type', async () => {
      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/application-limits/invalid-type')
        .set('Authorization', 'Bearer test-token')
        .expect(400);

      expect(response.body.message).toBe('Invalid application type');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('GET /api/applications/:id', () => {
    it('should return specific application when user is author', async () => {
      (storage.getApplicationById as jest.Mock).mockResolvedValue(mockApplication);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/applications/1')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual(mockApplication);
      expect(storage.getApplicationById).toHaveBeenCalledWith(1);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 404 when application not found', async () => {
      (storage.getApplicationById as jest.Mock).mockResolvedValue(null);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/applications/999')
        .set('Authorization', 'Bearer test-token')
        .expect(404);

      expect(response.body.message).toBe('Application not found');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 403 when user is not author', async () => {
      const otherUserApplication = { ...mockApplication, authorId: 999 };
      (storage.getApplicationById as jest.Mock).mockResolvedValue(otherUserApplication);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/applications/1')
        .set('Authorization', 'Bearer test-token')
        .expect(403);

      expect(response.body.message).toBe('Access denied');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('PUT /api/applications/:id', () => {
    const updateData = {
      data: {
        department: 'LSPD',
        reason: 'Updated reason',
        experience: 'Updated experience'
      }
    };

    it('should update application when user is author', async () => {
      const updatedApplication = { ...mockApplication, ...updateData };
      (storage.getApplicationById as jest.Mock).mockResolvedValue(mockApplication);
      (storage.updateApplication as jest.Mock).mockResolvedValue(updatedApplication);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .put('/api/applications/1')
        .set('Authorization', 'Bearer test-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedApplication);
      expect(storage.updateApplication).toHaveBeenCalledWith(1, updateData);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 403 when user is not author', async () => {
      const otherUserApplication = { ...mockApplication, authorId: 999 };
      (storage.getApplicationById as jest.Mock).mockResolvedValue(otherUserApplication);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .put('/api/applications/1')
        .set('Authorization', 'Bearer test-token')
        .send(updateData)
        .expect(403);

      expect(response.body.message).toBe('Access denied');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('DELETE /api/applications/:id', () => {
    it('should delete application when user is author and status is pending', async () => {
      const pendingApplication = { ...mockApplication, status: 'pending' };
      (storage.getApplicationById as jest.Mock).mockResolvedValue(pendingApplication);
      (storage.deleteApplication as jest.Mock).mockResolvedValue(true);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .delete('/api/applications/1')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body.message).toBe('Application deleted successfully');
      expect(storage.deleteApplication).toHaveBeenCalledWith(1);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 400 when application status is not pending', async () => {
      const approvedApplication = { ...mockApplication, status: 'approved' };
      (storage.getApplicationById as jest.Mock).mockResolvedValue(approvedApplication);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .delete('/api/applications/1')
        .set('Authorization', 'Bearer test-token')
        .expect(400);

      expect(response.body.message).toBe('Cannot delete application with current status');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });
}); 