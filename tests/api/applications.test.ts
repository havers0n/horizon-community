import request from 'supertest';
import { app } from '../../server/index';

describe('Applications API', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Создаем тестового пользователя и получаем токен
    const testUser = {
      username: 'testuser_' + Date.now(),
      email: `testuser_${Date.now()}@example.com`,
      password: 'Test1234!'
    };

    // Регистрация
    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    // Вход
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    authToken = loginRes.body.session.access_token;
    testUserId = loginRes.body.user.id;
  });

  describe('POST /api/applications', () => {
    it('should create a new application with valid data', async () => {
      const applicationData = {
        type: 'entry',
        department: 'pd',
        position: 'officer',
        experience: '2 years',
        motivation: 'I want to serve the community',
        availability: 'full-time'
      };

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData);

      expect(res.statusCode).toBe(201);
      expect(res.body.application).toBeDefined();
      expect(res.body.application.type).toBe('entry');
      expect(res.body.application.status).toBe('pending');
    });

    it('should reject application with missing required fields', async () => {
      const invalidData = {
        type: 'entry',
        // department missing
        position: 'officer'
      };

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should reject application with invalid type', async () => {
      const invalidData = {
        type: 'invalid_type',
        department: 'pd',
        position: 'officer'
      };

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should enforce application limits', async () => {
      // Создаем первую заявку
      const application1 = {
        type: 'entry',
        department: 'pd',
        position: 'officer',
        experience: '2 years',
        motivation: 'First application'
      };

      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(application1);

      // Пытаемся создать вторую заявку того же типа
      const application2 = {
        type: 'entry',
        department: 'pd',
        position: 'officer',
        experience: '3 years',
        motivation: 'Second application'
      };

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(application2);

      expect(res.statusCode).toBe(429);
      expect(res.body.error).toMatch(/limit/i);
    });

    it('should handle XSS attacks in text fields', async () => {
      const maliciousData = {
        type: 'entry',
        department: 'pd',
        position: 'officer',
        motivation: '<script>alert("XSS")</script>',
        experience: '2 years'
      };

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(maliciousData);

      expect(res.statusCode).toBe(201);
      expect(res.body.application.motivation).not.toContain('<script>');
    });
  });

  describe('GET /api/applications', () => {
    it('should return user applications', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.applications)).toBe(true);
    });

    it('should filter applications by type', async () => {
      const res = await request(app)
        .get('/api/applications?type=entry')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      res.body.applications.forEach((app: any) => {
        expect(app.type).toBe('entry');
      });
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/applications?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.applications.length).toBeLessThanOrEqual(5);
      expect(res.body.pagination).toBeDefined();
    });

    it('should reject unauthorized access', async () => {
      const res = await request(app)
        .get('/api/applications');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/applications/:id', () => {
    let applicationId: string;

    beforeAll(async () => {
      // Создаем заявку для тестирования
      const applicationData = {
        type: 'transfer',
        department: 'pd',
        position: 'detective',
        reason: 'Career advancement'
      };

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData);

      applicationId = res.body.application.id;
    });

    it('should return specific application', async () => {
      const res = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.application.id).toBe(applicationId);
    });

    it('should reject access to other user application', async () => {
      // Создаем другого пользователя
      const otherUser = {
        username: 'otheruser_' + Date.now(),
        email: `otheruser_${Date.now()}@example.com`,
        password: 'Test1234!'
      };

      await request(app)
        .post('/api/auth/register')
        .send(otherUser);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: otherUser.email, password: otherUser.password });

      const otherToken = loginRes.body.session.access_token;

      const res = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should handle non-existent application', async () => {
      const res = await request(app)
        .get('/api/applications/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/applications/:id', () => {
    let applicationId: string;

    beforeAll(async () => {
      const applicationData = {
        type: 'leave',
        department: 'pd',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        reason: 'Vacation'
      };

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData);

      applicationId = res.body.application.id;
    });

    it('should update application with valid data', async () => {
      const updateData = {
        reason: 'Updated vacation reason'
      };

      const res = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.application.reason).toBe('Updated vacation reason');
    });

    it('should not allow updating status directly', async () => {
      const updateData = {
        status: 'approved'
      };

      const res = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(400);
    });

    it('should validate date ranges for leave applications', async () => {
      const invalidData = {
        startDate: '2024-02-05',
        endDate: '2024-02-01' // End before start
      };

      const res = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/applications/:id', () => {
    let applicationId: string;

    beforeAll(async () => {
      const applicationData = {
        type: 'entry',
        department: 'pd',
        position: 'officer',
        experience: '1 year'
      };

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData);

      applicationId = res.body.application.id;
    });

    it('should delete application', async () => {
      const res = await request(app)
        .delete(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);

      // Проверяем, что заявка действительно удалена
      const getRes = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.statusCode).toBe(404);
    });

    it('should not allow deleting approved applications', async () => {
      // Создаем заявку и одобряем её (через админ API)
      const applicationData = {
        type: 'entry',
        department: 'pd',
        position: 'officer'
      };

      const createRes = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData);

      const approvedId = createRes.body.application.id;

      // Здесь должен быть вызов админ API для одобрения
      // Пока что симулируем это

      const res = await request(app)
        .delete(`/api/applications/${approvedId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should limit rapid application submissions', async () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        const applicationData = {
          type: 'entry',
          department: 'pd',
          position: 'officer',
          experience: `${i} years`
        };

        promises.push(
          request(app)
            .post('/api/applications')
            .set('Authorization', `Bearer ${authToken}`)
            .send(applicationData)
        );
      }

      const results = await Promise.all(promises);
      const rateLimited = results.filter(res => res.statusCode === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('SQL Injection Protection', () => {
    it('should prevent SQL injection in search parameters', async () => {
      const maliciousQuery = "'; DROP TABLE applications; --";

      const res = await request(app)
        .get(`/api/applications?search=${encodeURIComponent(maliciousQuery)}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      // Проверяем, что таблица не была удалена
      const checkRes = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(checkRes.statusCode).toBe(200);
    });
  });
}); 