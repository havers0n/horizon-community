import request from 'supertest';
import type { Express } from 'express';
import { createTestApp } from '../helpers/app-factory';
import type { ServicesContainer } from '../../src/types/services';
import { AppError } from '../../src/utils/AppError';

describe('API Integration Tests', () => {
  let app: Express;
  let services: ServicesContainer;

  beforeEach(() => {
    const testApp = createTestApp();
    app = testApp.app;
    services = testApp.services;
    jest.clearAllMocks();
  });

  describe('Complete User Workflow', () => {
    it('should allow a user to register, login, and create an application', async () => {
      // 1. Регистрация пользователя
      const userData = {
        username: 'integration_user',
        email: 'integration@test.com',
        password: 'password123'
      };
      const mockProfile = {
        id: 'user-integration-id',
        username: userData.username,
        email: userData.email,
        role: 'candidate',
      };
      (services.authService.registerUser as jest.Mock).mockResolvedValue(mockProfile);

      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);
      expect(registerResponse.body.data.username).toBe(userData.username);

      // 2. Вход пользователя
      const mockLoginResult = {
        profile: mockProfile,
        session: { access_token: 'integration-test-token' }
      };
      (services.authService.loginUser as jest.Mock).mockResolvedValue(mockLoginResult);

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: userData.email, password: userData.password })
        .expect(200);

      const authToken = loginResponse.body.access_token;
      expect(authToken).toBe('integration-test-token');

      // 3. Создание заявки (как аутентифицированный пользователь)
      // The global auth mock in setup.ts will handle providing the user object to the request.
      const applicationData = { type: 'entry', data: { reason: 'Integration test' } };
      const mockApplication = { id: 'app-integration-id', ...applicationData, author_user_id: mockProfile.id };

      (services.applicationService.getUserApplications as jest.Mock).mockResolvedValue([]);
      (services.applicationService.createApplication as jest.Mock).mockResolvedValue(mockApplication);

      const applicationResponse = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${authToken}`) // This token is not actually validated, but good practice to include
        .send(applicationData)
        .expect(201);

      expect(applicationResponse.body.id).toBe(mockApplication.id);
      expect(applicationResponse.body.author_user_id).toBe(mockProfile.id);
    });
  });
}); 