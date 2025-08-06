import request from 'supertest';
import type { Express } from 'express';
import { createTestApp } from '../helpers/app-factory';
import type { ServicesContainer } from '../../src/types/services';
import { AppError } from '../../src/utils/AppError';

describe('Auth API (/api/v1/auth)', () => {
  let app: Express;
  let services: ServicesContainer;

  beforeEach(() => {
    const testApp = createTestApp();
    app = testApp.app;
    services = testApp.services;
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    const validUserData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    it('should register a new user successfully and return 201', async () => {
      const mockProfile = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'candidate',
      };

      (services.authService.registerUser as jest.Mock).mockResolvedValue(mockProfile);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData)
        .expect(201);

      expect(services.authService.registerUser).toHaveBeenCalledWith(validUserData);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe('testuser');
    });

    it('should return 409 if user already exists', async () => {
      (services.authService.registerUser as jest.Mock).mockRejectedValue(
        new AppError('User already exists', 409)
      );

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData)
        .expect(409);

      expect(response.body.error).toBe('User already exists');
    });
  });

  describe('POST /login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should login user successfully and return 200', async () => {
      const mockResult = {
        profile: {
          id: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
          role: 'candidate'
        },
        session: {
          access_token: 'test-token',
          refresh_token: 'refresh-token'
        }
      };

      (services.authService.loginUser as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(validLoginData)
        .expect(200);

      expect(services.authService.loginUser).toHaveBeenCalledWith(validLoginData);
      // Corrected to match the actual API response structure
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.access_token).toBe('test-token');
    });

    it('should return 401 if login fails', async () => {
      (services.authService.loginUser as jest.Mock).mockRejectedValue(
        new AppError('Invalid email or password.', 401)
      );

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(validLoginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid email or password.');
    });
  });
}); 