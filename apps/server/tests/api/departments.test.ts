import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../routes';
import { storage } from '../../storage';

// Мокаем storage для тестов
jest.mock('../../storage', () => ({
  storage: {
    getAllDepartments: jest.fn(),
    getDepartment: jest.fn(),
    createDepartment: jest.fn(),
    updateDepartment: jest.fn(),
    deleteDepartment: jest.fn(),
    getDepartmentMembers: jest.fn(),
    getDepartmentStats: jest.fn(),
  }
}));

describe('Departments API', () => {
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

  const mockDepartment = {
    id: 1,
    name: 'Los Santos Police Department',
    shortName: 'LSPD',
    description: 'Law enforcement department',
    color: '#0066CC',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockDepartmentMember = {
    id: 1,
    username: 'officer1',
    email: 'officer1@lspd.gov',
    role: 'officer',
    departmentId: 1,
    rank: 'Officer',
    status: 'active'
  };

  describe('GET /api/departments', () => {
    it('should return all departments', async () => {
      (storage.getAllDepartments as jest.Mock).mockResolvedValue([mockDepartment]);

      const response = await request(app)
        .get('/api/departments')
        .expect(200);

      expect(response.body).toEqual([mockDepartment]);
      expect(storage.getAllDepartments).toHaveBeenCalled();
    });

    it('should return empty array when no departments exist', async () => {
      (storage.getAllDepartments as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/departments')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should handle storage errors gracefully', async () => {
      (storage.getAllDepartments as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/departments')
        .expect(500);

      expect(response.body.message).toBe('Internal server error');
    });
  });

  describe('GET /api/departments/:id', () => {
    it('should return specific department when found', async () => {
      (storage.getDepartment as jest.Mock).mockResolvedValue(mockDepartment);

      const response = await request(app)
        .get('/api/departments/1')
        .expect(200);

      expect(response.body).toEqual(mockDepartment);
      expect(storage.getDepartment).toHaveBeenCalledWith(1);
    });

    it('should return 404 when department not found', async () => {
      (storage.getDepartment as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/departments/999')
        .expect(404);

      expect(response.body.message).toBe('Department not found');
    });

    it('should return 400 for invalid department ID', async () => {
      const response = await request(app)
        .get('/api/departments/invalid')
        .expect(400);

      expect(response.body.message).toBe('Invalid department ID');
    });
  });

  describe('POST /api/departments', () => {
    const validDepartmentData = {
      name: 'New Department',
      shortName: 'ND',
      description: 'A new department',
      color: '#FF0000',
      isActive: true
    };

    it('should create department successfully when user is admin', async () => {
      const adminUser = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active'
      };

      (storage.createDepartment as jest.Mock).mockResolvedValue({
        id: 2,
        ...validDepartmentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Мокаем middleware аутентификации
      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      const originalRequireAdmin = require('../../middleware/auth.middleware').requireAdmin;
      
      require('../../middleware/auth.middleware').authenticateToken = (req: any, res: any, next: any) => {
        req.user = adminUser;
        next();
      };
      
      require('../../middleware/auth.middleware').requireAdmin = (req: any, res: any, next: any) => {
        next();
      };

      const response = await request(app)
        .post('/api/departments')
        .set('Authorization', 'Bearer test-token')
        .send(validDepartmentData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(validDepartmentData.name);
      expect(storage.createDepartment).toHaveBeenCalledWith(validDepartmentData);

      // Восстанавливаем оригинальные middleware
      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
      require('../../middleware/auth.middleware').requireAdmin = originalRequireAdmin;
    });

    it('should return 403 when user is not admin', async () => {
      const regularUser = {
        id: 1,
        username: 'user',
        email: 'user@example.com',
        role: 'candidate',
        status: 'active'
      };

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = (req: any, res: any, next: any) => {
        req.user = regularUser;
        next();
      };

      const response = await request(app)
        .post('/api/departments')
        .set('Authorization', 'Bearer test-token')
        .send(validDepartmentData)
        .expect(403);

      expect(response.body.message).toBe('Admin access required');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 400 for invalid department data', async () => {
      const invalidData = {
        name: '',
        shortName: 'ND'
      };

      const adminUser = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active'
      };

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      const originalRequireAdmin = require('../../middleware/auth.middleware').requireAdmin;
      
      require('../../middleware/auth.middleware').authenticateToken = (req: any, res: any, next: any) => {
        req.user = adminUser;
        next();
      };
      
      require('../../middleware/auth.middleware').requireAdmin = (req: any, res: any, next: any) => {
        next();
      };

      const response = await request(app)
        .post('/api/departments')
        .set('Authorization', 'Bearer test-token')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Invalid department data');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
      require('../../middleware/auth.middleware').requireAdmin = originalRequireAdmin;
    });
  });

  describe('PUT /api/departments/:id', () => {
    const updateData = {
      name: 'Updated Department Name',
      description: 'Updated description'
    };

    it('should update department successfully when user is admin', async () => {
      const adminUser = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active'
      };

      const updatedDepartment = { ...mockDepartment, ...updateData };
      (storage.getDepartment as jest.Mock).mockResolvedValue(mockDepartment);
      (storage.updateDepartment as jest.Mock).mockResolvedValue(updatedDepartment);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      const originalRequireAdmin = require('../../middleware/auth.middleware').requireAdmin;
      
      require('../../middleware/auth.middleware').authenticateToken = (req: any, res: any, next: any) => {
        req.user = adminUser;
        next();
      };
      
      require('../../middleware/auth.middleware').requireAdmin = (req: any, res: any, next: any) => {
        next();
      };

      const response = await request(app)
        .put('/api/departments/1')
        .set('Authorization', 'Bearer test-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedDepartment);
      expect(storage.updateDepartment).toHaveBeenCalledWith(1, updateData);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
      require('../../middleware/auth.middleware').requireAdmin = originalRequireAdmin;
    });

    it('should return 404 when department not found', async () => {
      const adminUser = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active'
      };

      (storage.getDepartment as jest.Mock).mockResolvedValue(null);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      const originalRequireAdmin = require('../../middleware/auth.middleware').requireAdmin;
      
      require('../../middleware/auth.middleware').authenticateToken = (req: any, res: any, next: any) => {
        req.user = adminUser;
        next();
      };
      
      require('../../middleware/auth.middleware').requireAdmin = (req: any, res: any, next: any) => {
        next();
      };

      const response = await request(app)
        .put('/api/departments/999')
        .set('Authorization', 'Bearer test-token')
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Department not found');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
      require('../../middleware/auth.middleware').requireAdmin = originalRequireAdmin;
    });
  });

  describe('DELETE /api/departments/:id', () => {
    it('should delete department successfully when user is admin', async () => {
      const adminUser = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active'
      };

      (storage.getDepartment as jest.Mock).mockResolvedValue(mockDepartment);
      (storage.deleteDepartment as jest.Mock).mockResolvedValue(true);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      const originalRequireAdmin = require('../../middleware/auth.middleware').requireAdmin;
      
      require('../../middleware/auth.middleware').authenticateToken = (req: any, res: any, next: any) => {
        req.user = adminUser;
        next();
      };
      
      require('../../middleware/auth.middleware').requireAdmin = (req: any, res: any, next: any) => {
        next();
      };

      const response = await request(app)
        .delete('/api/departments/1')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body.message).toBe('Department deleted successfully');
      expect(storage.deleteDepartment).toHaveBeenCalledWith(1);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
      require('../../middleware/auth.middleware').requireAdmin = originalRequireAdmin;
    });

    it('should return 400 when department has active members', async () => {
      const adminUser = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active'
      };

      (storage.getDepartment as jest.Mock).mockResolvedValue(mockDepartment);
      (storage.getDepartmentMembers as jest.Mock).mockResolvedValue([mockDepartmentMember]);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      const originalRequireAdmin = require('../../middleware/auth.middleware').requireAdmin;
      
      require('../../middleware/auth.middleware').authenticateToken = (req: any, res: any, next: any) => {
        req.user = adminUser;
        next();
      };
      
      require('../../middleware/auth.middleware').requireAdmin = (req: any, res: any, next: any) => {
        next();
      };

      const response = await request(app)
        .delete('/api/departments/1')
        .set('Authorization', 'Bearer test-token')
        .expect(400);

      expect(response.body.message).toBe('Cannot delete department with active members');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
      require('../../middleware/auth.middleware').requireAdmin = originalRequireAdmin;
    });
  });

  describe('GET /api/departments/:id/members', () => {
    it('should return department members when user has access', async () => {
      const user = {
        id: 1,
        username: 'user',
        email: 'user@example.com',
        role: 'supervisor',
        status: 'active'
      };

      (storage.getDepartment as jest.Mock).mockResolvedValue(mockDepartment);
      (storage.getDepartmentMembers as jest.Mock).mockResolvedValue([mockDepartmentMember]);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = (req: any, res: any, next: any) => {
        req.user = user;
        next();
      };

      const response = await request(app)
        .get('/api/departments/1/members')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual([mockDepartmentMember]);
      expect(storage.getDepartmentMembers).toHaveBeenCalledWith(1);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 404 when department not found', async () => {
      const user = {
        id: 1,
        username: 'user',
        email: 'user@example.com',
        role: 'supervisor',
        status: 'active'
      };

      (storage.getDepartment as jest.Mock).mockResolvedValue(null);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = (req: any, res: any, next: any) => {
        req.user = user;
        next();
      };

      const response = await request(app)
        .get('/api/departments/999/members')
        .set('Authorization', 'Bearer test-token')
        .expect(404);

      expect(response.body.message).toBe('Department not found');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('GET /api/departments/:id/stats', () => {
    it('should return department statistics when user has access', async () => {
      const user = {
        id: 1,
        username: 'user',
        email: 'user@example.com',
        role: 'supervisor',
        status: 'active'
      };

      const mockStats = {
        totalMembers: 25,
        activeMembers: 20,
        inactiveMembers: 5,
        applications: 10,
        reports: 50
      };

      (storage.getDepartment as jest.Mock).mockResolvedValue(mockDepartment);
      (storage.getDepartmentStats as jest.Mock).mockResolvedValue(mockStats);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = (req: any, res: any, next: any) => {
        req.user = user;
        next();
      };

      const response = await request(app)
        .get('/api/departments/1/stats')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual(mockStats);
      expect(storage.getDepartmentStats).toHaveBeenCalledWith(1);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });
}); 