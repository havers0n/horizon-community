import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../routes';

describe('Basic API Tests', () => {
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

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
      
      expect(response.body.status).toBe('ok');
      expect(response.body.environment).toBe('test');
    });
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should login user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('session');
    });
  });

  describe('Departments', () => {
    it('should return all departments', async () => {
      const response = await request(app)
        .get('/api/departments')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return specific department', async () => {
      const response = await request(app)
        .get('/api/departments/1')
        .expect(200);

      expect(response.body).toHaveProperty('id');
    });
  });

  describe('Applications', () => {
    it('should return user applications when authenticated', async () => {
      const response = await request(app)
        .get('/api/applications')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should create application', async () => {
      const applicationData = {
        type: 'police',
        content: 'Test application content',
        characterId: 1
      };

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', 'Bearer test-token')
        .send(applicationData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe('police');
    });
  });

  describe('Reports', () => {
    it('should return user reports when authenticated', async () => {
      const response = await request(app)
        .get('/api/reports')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should create report', async () => {
      const reportData = {
        title: 'Test Report',
        content: 'Test report content',
        type: 'incident'
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', 'Bearer test-token')
        .send(reportData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Report');
    });
  });

  describe('Notifications', () => {
    it('should return user notifications when authenticated', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Admin Routes', () => {
    it('should return admin applications when supervisor', async () => {
      const response = await request(app)
        .get('/api/admin/applications')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return admin users when supervisor', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
}); 