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
    getCharactersByOwner: jest.fn(),
    getAllUsers: jest.fn(),
    createNotification: jest.fn(),
    getApplicationsByUser: jest.fn(),
    createApplication: jest.fn(),
    getReportsByUser: jest.fn(),
    createReport: jest.fn(),
    getNotificationsByUser: jest.fn(),
    getAllDepartments: jest.fn(),
    getDepartment: jest.fn(),
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

describe('API Integration Tests', () => {
  let app: express.Application;
  let server: any;
  let authToken: string;
  let userId: number;

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

  describe('Complete User Workflow', () => {
    it('should complete full user registration and application workflow', async () => {
      // 1. Регистрация пользователя
      const userData = {
        username: 'integrationtest',
        email: 'integration@test.com',
        password: 'password123'
      };

      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'auth-integration-123' } },
        error: null
      });

      (storage.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (storage.getUserByUsername as jest.Mock).mockResolvedValue(null);
      (storage.createUser as jest.Mock).mockResolvedValue({
        id: 999,
        username: userData.username,
        email: userData.email,
        role: 'candidate',
        status: 'active',
        authId: 'auth-integration-123'
      });

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body.user.username).toBe(userData.username);
      userId = registerResponse.body.user.id;

      // 2. Вход пользователя
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'auth-integration-123' },
          session: { access_token: 'integration-token-123' }
        },
        error: null
      });

      (storage.getUserByAuthId as jest.Mock).mockResolvedValue({
        id: userId,
        username: userData.username,
        email: userData.email,
        role: 'candidate',
        status: 'active',
        authId: 'auth-integration-123'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body.user.id).toBe(userId);
      authToken = loginResponse.body.session.access_token;

      // 3. Получение профиля пользователя
      (storage.getCharactersByOwner as jest.Mock).mockResolvedValue([]);

      const profileResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(profileResponse.body.user.id).toBe(userId);
      expect(profileResponse.body.characters).toEqual([]);

      // 4. Создание заявки
      const applicationData = {
        type: 'entry',
        data: {
          department: 'LSPD',
          reason: 'Integration test application',
          experience: 'Some experience'
        }
      };

      const mockApplication = {
        id: 1,
        type: 'entry',
        authorId: userId,
        status: 'pending',
        data: applicationData.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      (storage.createApplication as jest.Mock).mockResolvedValue(mockApplication);
      (storage.getAllUsers as jest.Mock).mockResolvedValue([
        { id: 2, username: 'supervisor1', role: 'supervisor' }
      ]);
      (storage.createNotification as jest.Mock).mockResolvedValue({});

      const applicationResponse = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData)
        .expect(201);

      expect(applicationResponse.body.authorId).toBe(userId);
      expect(applicationResponse.body.type).toBe('entry');

      // 5. Получение списка заявок пользователя
      (storage.getApplicationsByUser as jest.Mock).mockResolvedValue([mockApplication]);

      const applicationsResponse = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(applicationsResponse.body).toHaveLength(1);
      expect(applicationsResponse.body[0].id).toBe(mockApplication.id);

      // 6. Создание рапорта
      const reportData = {
        fileUrl: 'https://example.com/integration-report.pdf',
        type: 'incident',
        notes: 'Integration test report'
      };

      const mockReport = {
        id: 1,
        authorId: userId,
        status: 'pending',
        fileUrl: reportData.fileUrl,
        supervisorComment: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      (storage.createReport as jest.Mock).mockResolvedValue(mockReport);

      const reportResponse = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData)
        .expect(201);

      expect(reportResponse.body.authorId).toBe(userId);
      expect(reportResponse.body.fileUrl).toBe(reportData.fileUrl);

      // 7. Получение списка рапортов пользователя
      (storage.getReportsByUser as jest.Mock).mockResolvedValue([mockReport]);

      const reportsResponse = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(reportsResponse.body).toHaveLength(1);
      expect(reportsResponse.body[0].id).toBe(mockReport.id);

      // 8. Получение уведомлений
      const mockNotification = {
        id: 1,
        recipientId: userId,
        content: 'Test notification',
        isRead: false,
        link: '/test/link',
        createdAt: new Date().toISOString()
      };

      (storage.getNotificationsByUser as jest.Mock).mockResolvedValue([mockNotification]);

      const notificationsResponse = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(notificationsResponse.body).toHaveLength(1);
      expect(notificationsResponse.body[0].recipientId).toBe(userId);
    });
  });

  describe('Department and Application Integration', () => {
    it('should handle department listing and application creation workflow', async () => {
      // 1. Получение списка департаментов
      const mockDepartments = [
        {
          id: 1,
          name: 'Los Santos Police Department',
          shortName: 'LSPD',
          description: 'Law enforcement department',
          color: '#0066CC',
          isActive: true
        },
        {
          id: 2,
          name: 'Los Santos Fire Department',
          shortName: 'LSFD',
          description: 'Fire and rescue department',
          color: '#FF0000',
          isActive: true
        }
      ];

      (storage.getAllDepartments as jest.Mock).mockResolvedValue(mockDepartments);

      const departmentsResponse = await request(app)
        .get('/api/departments')
        .expect(200);

      expect(departmentsResponse.body).toHaveLength(2);
      expect(departmentsResponse.body[0].shortName).toBe('LSPD');
      expect(departmentsResponse.body[1].shortName).toBe('LSFD');

      // 2. Получение конкретного департамента
      (storage.getDepartment as jest.Mock).mockResolvedValue(mockDepartments[0]);

      const departmentResponse = await request(app)
        .get('/api/departments/1')
        .expect(200);

      expect(departmentResponse.body.id).toBe(1);
      expect(departmentResponse.body.name).toBe('Los Santos Police Department');

      // 3. Создание заявки в департамент (если пользователь аутентифицирован)
      const mockUser = {
        id: 100,
        username: 'testuser',
        email: 'test@example.com',
        role: 'candidate',
        status: 'active'
      };

      const mockApplication = {
        id: 1,
        type: 'entry',
        authorId: mockUser.id,
        status: 'pending',
        data: { department: 'LSPD', reason: 'Test application' },
        createdAt: new Date().toISOString()
      };

      (storage.createApplication as jest.Mock).mockResolvedValue(mockApplication);
      (storage.getAllUsers as jest.Mock).mockResolvedValue([
        { id: 2, username: 'supervisor1', role: 'supervisor' }
      ]);
      (storage.createNotification as jest.Mock).mockResolvedValue({});

      // Мокаем middleware аутентификации
      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = (req: any, res: any, next: any) => {
        req.user = mockUser;
        next();
      };

      const applicationData = {
        type: 'entry',
        data: {
          department: 'LSPD',
          reason: 'Integration test application',
          experience: 'Some experience'
        }
      };

      const applicationResponse = await request(app)
        .post('/api/applications')
        .set('Authorization', 'Bearer test-token')
        .send(applicationData)
        .expect(201);

      expect(applicationResponse.body.authorId).toBe(mockUser.id);
      expect(applicationResponse.body.data.department).toBe('LSPD');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database errors gracefully across endpoints', async () => {
      // Симулируем ошибку базы данных
      (storage.getAllDepartments as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/departments')
        .expect(500);

      expect(response.body.message).toBe('Internal server error');

      // Проверяем что другие эндпоинты все еще работают
      const healthResponse = await request(app)
        .get('/api/health')
        .expect(200);

      expect(healthResponse.body.status).toBe('ok');
    });

    it('should handle authentication errors consistently', async () => {
      // Попытка доступа к защищенному эндпоинту без токена
      const response = await request(app)
        .get('/api/applications')
        .expect(401);

      expect(response.body.message).toBe('Access token required');

      // Попытка с неверным токеном
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });

      const invalidTokenResponse = await request(app)
        .get('/api/applications')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(invalidTokenResponse.body.message).toBe('Authentication failed');
    });

    it('should handle validation errors consistently', async () => {
      // Неверные данные для регистрации
      const invalidUserData = {
        username: '',
        email: 'invalid-email',
        password: '123'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(invalidUserData)
        .expect(400);

      expect(registerResponse.body.message).toBe('Invalid request data');

      // Неверные данные для заявки
      const invalidApplicationData = {
        type: '',
        data: {}
      };

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

      const applicationResponse = await request(app)
        .post('/api/applications')
        .set('Authorization', 'Bearer test-token')
        .send(invalidApplicationData)
        .expect(400);

      expect(applicationResponse.body.message).toBe('Invalid application data');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('Performance Integration', () => {
    it('should handle multiple concurrent requests', async () => {
      // Создаем множество одновременных запросов
      const requests = Array(20).fill(null).map(() => 
        request(app).get('/api/health')
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();

      // Проверяем что все запросы прошли успешно
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
      });

      // Проверяем что время выполнения разумное (менее 5 секунд)
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(5000);
    });

    it('should handle mixed request types efficiently', async () => {
      const mixedRequests = [
        request(app).get('/api/health'),
        request(app).get('/api/departments'),
        request(app).get('/api/health'),
        request(app).post('/api/auth/register').send({
          username: 'perftest1',
          email: 'perf1@test.com',
          password: 'password123'
        }),
        request(app).get('/api/health'),
        request(app).get('/api/departments'),
      ];

      // Мокаем необходимые методы для регистрации
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'auth-perf-123' } },
        error: null
      });

      (storage.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (storage.getUserByUsername as jest.Mock).mockResolvedValue(null);
      (storage.createUser as jest.Mock).mockResolvedValue({
        id: 999,
        username: 'perftest1',
        email: 'perf1@test.com',
        role: 'candidate',
        status: 'active',
        authId: 'auth-perf-123'
      });

      const responses = await Promise.all(mixedRequests);

      // Проверяем что все запросы завершились
      responses.forEach(response => {
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(500);
      });
    });
  });
}); 