import request from 'supertest';
import { app } from '../../server/index';

describe('Auth API', () => {
  const testUser = {
    username: 'testuser_' + Date.now(),
    email: `testuser_${Date.now()}@example.com`,
    password: 'Test1234!'
  };

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('should not register with existing email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already/);
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.authUser).toBeDefined();
    expect(res.body.session).toBeDefined();
  });

  it('should not login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Invalid credentials/);
  });
}); 