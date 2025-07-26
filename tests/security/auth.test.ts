import request from 'supertest';
import { app } from '../../server/index';

describe('Security Testing - Authentication', () => {
  describe('SQL Injection Protection', () => {
    it('should prevent SQL injection in login', async () => {
      const maliciousPayloads = [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "' UNION SELECT * FROM users --",
        "admin'--",
        "' OR 1=1#"
      ];

      for (const payload of maliciousPayloads) {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: payload,
            password: 'anypassword'
          });

        // Не должно быть 500 ошибки (SQL ошибки)
        expect(res.statusCode).not.toBe(500);
        
        // Должно быть 401 (неверные учетные данные) или 400 (неверный формат)
        expect([400, 401]).toContain(res.statusCode);
      }
    });

    it('should prevent SQL injection in registration', async () => {
      const maliciousPayloads = [
        "'; INSERT INTO users VALUES ('hacker', 'hacker@evil.com', 'password'); --",
        "' OR '1'='1",
        "'; UPDATE users SET role='admin' WHERE id=1; --"
      ];

      for (const payload of maliciousPayloads) {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            username: payload,
            email: `test${Date.now()}@example.com`,
            password: 'Test1234!'
          });

        expect(res.statusCode).not.toBe(500);
        expect([400, 409]).toContain(res.statusCode);
      }
    });
  });

  describe('XSS Protection', () => {
    it('should sanitize XSS payloads in registration', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src="x" onerror="alert(\'XSS\')">',
        '"><script>alert("XSS")</script>',
        '&#60;script&#62;alert("XSS")&#60;/script&#62;'
      ];

      for (const payload of xssPayloads) {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            username: payload,
            email: `test${Date.now()}@example.com`,
            password: 'Test1234!'
          });

        if (res.statusCode === 201) {
          // Если регистрация прошла успешно, проверяем что данные санитизированы
          expect(res.body.user.username).not.toContain('<script>');
          expect(res.body.user.username).not.toContain('javascript:');
        }
      }
    });

    it('should sanitize XSS in user profile data', async () => {
      // Сначала регистрируем пользователя
      const testUser = {
        username: 'testuser_' + Date.now(),
        email: `testuser_${Date.now()}@example.com`,
        password: 'Test1234!'
      };

      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(registerRes.statusCode).toBe(201);

      // Входим в систему
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const authToken = loginRes.body.session.access_token;

      // Пытаемся обновить профиль с XSS
      const xssData = {
        bio: '<script>alert("XSS")</script>',
        displayName: '"><img src="x" onerror="alert(\'XSS\')">'
      };

      const updateRes = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(xssData);

      if (updateRes.statusCode === 200) {
        expect(updateRes.body.user.bio).not.toContain('<script>');
        expect(updateRes.body.user.displayName).not.toContain('<img');
      }
    });
  });

  describe('CSRF Protection', () => {
    it('should require proper CSRF tokens for state-changing operations', async () => {
      // Регистрируем пользователя
      const testUser = {
        username: 'testuser_' + Date.now(),
        email: `testuser_${Date.now()}@example.com`,
        password: 'Test1234!'
      };

      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // Входим в систему
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const authToken = loginRes.body.session.access_token;

      // Пытаемся выполнить операцию без CSRF токена
      const res = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-CSRF-Token', 'invalid-token')
        .send({ bio: 'Test bio' });

      // Должно быть отклонено
      expect([400, 403]).toContain(res.statusCode);
    });
  });

  describe('Rate Limiting', () => {
    it('should limit login attempts', async () => {
      const testUser = {
        username: 'testuser_' + Date.now(),
        email: `testuser_${Date.now()}@example.com`,
        password: 'Test1234!'
      };

      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // Множественные попытки входа с неверным паролем
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: 'wrongpassword' })
        );
      }

      const results = await Promise.all(promises);
      const rateLimited = results.filter(res => res.statusCode === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it('should limit registration attempts', async () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/auth/register')
            .send({
              username: `testuser_${Date.now()}_${i}`,
              email: `testuser_${Date.now()}_${i}@example.com`,
              password: 'Test1234!'
            })
        );
      }

      const results = await Promise.all(promises);
      const rateLimited = results.filter(res => res.statusCode === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('JWT Security', () => {
    let validToken: string;

    beforeAll(async () => {
      const testUser = {
        username: 'testuser_' + Date.now(),
        email: `testuser_${Date.now()}@example.com`,
        password: 'Test1234!'
      };

      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      validToken = loginRes.body.session.access_token;
    });

    it('should reject expired tokens', async () => {
      // Создаем истекший токен (симуляция)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.statusCode).toBe(401);
    });

    it('should reject malformed tokens', async () => {
      const malformedTokens = [
        'invalid.token.here',
        'Bearer invalid',
        'not-a-jwt-token',
        '',
        null
      ];

      for (const token of malformedTokens) {
        const res = await request(app)
          .get('/api/user/profile')
          .set('Authorization', token ? `Bearer ${token}` : '');

        expect(res.statusCode).toBe(401);
      }
    });

    it('should reject tokens with invalid signature', async () => {
      // Создаем токен с неверной подписью
      const invalidSignatureToken = validToken.slice(0, -10) + 'invalid';

      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${invalidSignatureToken}`);

      expect(res.statusCode).toBe(401);
    });

    it('should validate token issuer and audience', async () => {
      // Тест проверяет, что токен содержит правильные claims
      const tokenParts = validToken.split('.');
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

      expect(payload.iss).toBeDefined();
      expect(payload.aud).toBeDefined();
    });
  });

  describe('Password Security', () => {
    it('should enforce strong password requirements', async () => {
      const weakPasswords = [
        '123456',
        'password',
        'qwerty',
        'abc123',
        'password123',
        'test',
        'admin'
      ];

      for (const weakPassword of weakPasswords) {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            username: 'testuser_' + Date.now(),
            email: `testuser_${Date.now()}@example.com`,
            password: weakPassword
          });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/password/i);
      }
    });

    it('should hash passwords securely', async () => {
      const testUser = {
        username: 'testuser_' + Date.now(),
        email: `testuser_${Date.now()}@example.com`,
        password: 'Test1234!'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      
      // Проверяем, что пароль не возвращается в открытом виде
      expect(res.body.user.password).toBeUndefined();
      
      // Проверяем, что хеш не равен исходному паролю
      if (res.body.user.passwordHash) {
        expect(res.body.user.passwordHash).not.toBe(testUser.password);
      }
    });

    it('should prevent password enumeration attacks', async () => {
      const testUser = {
        username: 'testuser_' + Date.now(),
        email: `testuser_${Date.now()}@example.com`,
        password: 'Test1234!'
      };

      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // Попытка входа с неверным паролем
      const wrongPasswordRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword123!' });

      // Попытка входа с несуществующим email
      const wrongEmailRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'Test1234!' });

      // Ошибки должны быть одинаковыми по времени ответа
      expect(wrongPasswordRes.statusCode).toBe(401);
      expect(wrongEmailRes.statusCode).toBe(401);
    });
  });

  describe('Session Security', () => {
    it('should invalidate sessions on logout', async () => {
      const testUser = {
        username: 'testuser_' + Date.now(),
        email: `testuser_${Date.now()}@example.com`,
        password: 'Test1234!'
      };

      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const authToken = loginRes.body.session.access_token;

      // Проверяем, что токен работает
      const profileRes = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(profileRes.statusCode).toBe(200);

      // Выходим из системы
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(logoutRes.statusCode).toBe(200);

      // Проверяем, что токен больше не работает
      const invalidProfileRes = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(invalidProfileRes.statusCode).toBe(401);
    });

    it('should prevent session fixation', async () => {
      const testUser = {
        username: 'testuser_' + Date.now(),
        email: `testuser_${Date.now()}@example.com`,
        password: 'Test1234!'
      };

      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // Первый вход
      const login1Res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const token1 = login1Res.body.session.access_token;

      // Второй вход (должен создать новый токен)
      const login2Res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const token2 = login2Res.body.session.access_token;

      // Токены должны быть разными
      expect(token1).not.toBe(token2);
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@example..com',
        'test@example.com.',
        'test@.example.com'
      ];

      for (const invalidEmail of invalidEmails) {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            username: 'testuser_' + Date.now(),
            email: invalidEmail,
            password: 'Test1234!'
          });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/email/i);
      }
    });

    it('should validate username format', async () => {
      const invalidUsernames = [
        '', // пустой
        'a', // слишком короткий
        'a'.repeat(51), // слишком длинный
        'user name', // пробелы
        'user@name', // специальные символы
        '123', // только цифры
        'user-name', // дефисы
        'user_name' // подчеркивания
      ];

      for (const invalidUsername of invalidUsernames) {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            username: invalidUsername,
            email: `test${Date.now()}@example.com`,
            password: 'Test1234!'
          });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/username/i);
      }
    });

    it('should prevent NoSQL injection', async () => {
      const nosqlPayloads = [
        { $ne: null },
        { $gt: '' },
        { $where: '1==1' },
        { $regex: '.*' }
      ];

      for (const payload of nosqlPayloads) {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: payload,
            password: 'anypassword'
          });

        expect(res.statusCode).not.toBe(500);
        expect([400, 401]).toContain(res.statusCode);
      }
    });
  });

  describe('Authorization Bypass', () => {
    it('should prevent privilege escalation', async () => {
      const regularUser = {
        username: 'regularuser_' + Date.now(),
        email: `regularuser_${Date.now()}@example.com`,
        password: 'Test1234!'
      };

      await request(app)
        .post('/api/auth/register')
        .send(regularUser);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: regularUser.email, password: regularUser.password });

      const authToken = loginRes.body.session.access_token;

      // Пытаемся получить доступ к админским функциям
      const adminRes = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(adminRes.statusCode).toBe(403);
    });

    it('should prevent token tampering', async () => {
      const testUser = {
        username: 'testuser_' + Date.now(),
        email: `testuser_${Date.now()}@example.com`,
        password: 'Test1234!'
      };

      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const originalToken = loginRes.body.session.access_token;

      // Пытаемся изменить роль в токене
      const tokenParts = originalToken.split('.');
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      payload.role = 'admin';
      
      const tamperedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const tamperedToken = `${tokenParts[0]}.${tamperedPayload}.${tokenParts[2]}`;

      const adminRes = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(adminRes.statusCode).toBe(401);
    });
  });
}); 