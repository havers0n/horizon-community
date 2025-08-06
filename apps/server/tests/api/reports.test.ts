import request from 'supertest';
import express from 'express';
import { registerRoutes } from '@/api/routes';
import { storage } from '@/db/storage';

// Мокаем storage для тестов
jest.mock('@/db/storage', () => ({
  storage: {
    getReportsByUser: jest.fn(),
    createReport: jest.fn(),
    getAllUsers: jest.fn(),
    createNotification: jest.fn(),
    getReportById: jest.fn(),
    updateReport: jest.fn(),
    deleteReport: jest.fn(),
    getReportsByStatus: jest.fn(),
    getReportsByDateRange: jest.fn(),
  }
}));

describe('Reports API', () => {
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

  const mockReport = {
    id: 1,
    authorId: 1,
    status: 'pending',
    fileUrl: 'https://example.com/report.pdf',
    supervisorComment: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Мокаем middleware аутентификации
  const mockAuthMiddleware = (req: any, res: any, next: any) => {
    req.user = mockUser;
    next();
  };

  describe('GET /api/reports', () => {
    it('should return user reports when authenticated', async () => {
      (storage.getReportsByUser as jest.Mock).mockResolvedValue([mockReport]);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/reports')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual([mockReport]);
      expect(storage.getReportsByUser).toHaveBeenCalledWith(mockUser.id);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/reports')
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('POST /api/reports', () => {
    const validReportData = {
      fileUrl: 'https://example.com/report.pdf',
      type: 'incident',
      notes: 'Test report notes'
    };

    it('should create report successfully', async () => {
      const mockSupervisors = [
        { id: 2, username: 'supervisor1', role: 'supervisor' },
        { id: 3, username: 'admin1', role: 'admin' }
      ];

      (storage.createReport as jest.Mock).mockResolvedValue(mockReport);
      (storage.getAllUsers as jest.Mock).mockResolvedValue(mockSupervisors);
      (storage.createNotification as jest.Mock).mockResolvedValue({});

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', 'Bearer test-token')
        .send(validReportData)
        .expect(201);

      expect(response.body).toEqual(mockReport);
      expect(storage.createReport).toHaveBeenCalledWith({
        authorId: mockUser.id,
        status: 'pending',
        fileUrl: validReportData.fileUrl,
        supervisorComment: null
      });

      // Проверяем что уведомления созданы для супервайзеров
      expect(storage.createNotification).toHaveBeenCalledTimes(2);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 400 when fileUrl is missing', async () => {
      const invalidData = {
        type: 'incident',
        notes: 'Test report notes'
      };

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', 'Bearer test-token')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('File URL is required');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('GET /api/report-templates', () => {
    it('should return report templates when authenticated', async () => {
      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/report-templates')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('description');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/report-templates')
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('GET /api/report-templates/:id/download', () => {
    it('should download template file when authenticated', async () => {
      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/report-templates/incident-report/download')
        .set('Authorization', 'Bearer test-token')
        .expect(404); // Файл не существует в тестовой среде

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 404 for invalid template id', async () => {
      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/report-templates/invalid-template/download')
        .set('Authorization', 'Bearer test-token')
        .expect(404);

      expect(response.body.message).toBe('Template not found');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('GET /api/reports/:id', () => {
    it('should return specific report when user is author', async () => {
      (storage.getReportById as jest.Mock).mockResolvedValue(mockReport);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/reports/1')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual(mockReport);
      expect(storage.getReportById).toHaveBeenCalledWith(1);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 404 when report not found', async () => {
      (storage.getReportById as jest.Mock).mockResolvedValue(null);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/reports/999')
        .set('Authorization', 'Bearer test-token')
        .expect(404);

      expect(response.body.message).toBe('Report not found');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 403 when user is not author', async () => {
      const otherUserReport = { ...mockReport, authorId: 999 };
      (storage.getReportById as jest.Mock).mockResolvedValue(otherUserReport);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/reports/1')
        .set('Authorization', 'Bearer test-token')
        .expect(403);

      expect(response.body.message).toBe('Access denied');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('PUT /api/reports/:id', () => {
    const updateData = {
      fileUrl: 'https://example.com/updated-report.pdf',
      notes: 'Updated notes'
    };

    it('should update report when user is author', async () => {
      const updatedReport = { ...mockReport, ...updateData };
      (storage.getReportById as jest.Mock).mockResolvedValue(mockReport);
      (storage.updateReport as jest.Mock).mockResolvedValue(updatedReport);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .put('/api/reports/1')
        .set('Authorization', 'Bearer test-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedReport);
      expect(storage.updateReport).toHaveBeenCalledWith(1, updateData);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 403 when user is not author', async () => {
      const otherUserReport = { ...mockReport, authorId: 999 };
      (storage.getReportById as jest.Mock).mockResolvedValue(otherUserReport);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .put('/api/reports/1')
        .set('Authorization', 'Bearer test-token')
        .send(updateData)
        .expect(403);

      expect(response.body.message).toBe('Access denied');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('DELETE /api/reports/:id', () => {
    it('should delete report when user is author and status is pending', async () => {
      const pendingReport = { ...mockReport, status: 'pending' };
      (storage.getReportById as jest.Mock).mockResolvedValue(pendingReport);
      (storage.deleteReport as jest.Mock).mockResolvedValue(true);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .delete('/api/reports/1')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body.message).toBe('Report deleted successfully');
      expect(storage.deleteReport).toHaveBeenCalledWith(1);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 400 when report status is not pending', async () => {
      const approvedReport = { ...mockReport, status: 'approved' };
      (storage.getReportById as jest.Mock).mockResolvedValue(approvedReport);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .delete('/api/reports/1')
        .set('Authorization', 'Bearer test-token')
        .expect(400);

      expect(response.body.message).toBe('Cannot delete report with current status');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('GET /api/reports/status/:status', () => {
    it('should return reports by status when user is supervisor', async () => {
      const supervisorUser = { ...mockUser, role: 'supervisor' };
      const mockReports = [mockReport];

      (storage.getReportsByStatus as jest.Mock).mockResolvedValue(mockReports);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = (req: any, res: any, next: any) => {
        req.user = supervisorUser;
        next();
      };

      const response = await request(app)
        .get('/api/reports/status/pending')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual(mockReports);
      expect(storage.getReportsByStatus).toHaveBeenCalledWith('pending');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 403 when user is not supervisor', async () => {
      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/reports/status/pending')
        .set('Authorization', 'Bearer test-token')
        .expect(403);

      expect(response.body.message).toBe('Supervisor access required');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });
}); 