import request from 'supertest';
import type { Express } from 'express';
import { createTestApp } from '../helpers/app-factory';
import type { ServicesContainer } from '../../src/types/services';

// The auth middleware is now mocked globally in tests/setup.ts
// No need for a local mock here.

const MOCK_APPLICATION_ID = 'e7a4f45c-2d3a-4f4a-8f6d-3e7e4a5b6c7d';
const MOCK_USER_ID = 'test-user-id'; // Corrected to match the mock in setup.ts
const MOCK_CHARACTER_ID = 'char-test-id';

describe('Application API (/api/v1/applications)', () => {
  let app: Express;
  let services: ServicesContainer;

  beforeEach(() => {
    const testApp = createTestApp();
    app = testApp.app;
    services = testApp.services;
    jest.clearAllMocks();
  });

  describe('POST /', () => {
    it('should create a new application and return 201', async () => {
      const newApplicationData = { type: 'entry', data: { department: 'LSPD' } };
      const createdApplication = {
        id: MOCK_APPLICATION_ID,
        author_user_id: MOCK_USER_ID,
        ...newApplicationData
      };

      (services.applicationService.getUserApplications as jest.Mock).mockResolvedValue([]);
      (services.applicationService.createApplication as jest.Mock).mockResolvedValue(createdApplication);

      const response = await request(app)
        .post('/api/v1/applications')
        .send(newApplicationData)
        .expect(201);

      expect(response.body).toEqual(createdApplication);
      expect(services.applicationService.createApplication).toHaveBeenCalledWith({
        ...newApplicationData,
        author_user_id: MOCK_USER_ID,
        author_character_id: MOCK_CHARACTER_ID,
      });
    });
  });

  describe('GET /:id', () => {
    it('should get an application by ID and return 200', async () => {
      const application = { id: MOCK_APPLICATION_ID, type: 'entry' };
      (services.applicationService.getApplicationById as jest.Mock).mockResolvedValue(application);

      const response = await request(app)
        .get(`/api/v1/applications/${MOCK_APPLICATION_ID}`)
        .expect(200);

      expect(response.body).toEqual(application);
      expect(services.applicationService.getApplicationById).toHaveBeenCalledWith(MOCK_APPLICATION_ID);
    });

    it('should return 404 if application not found', async () => {
      (services.applicationService.getApplicationById as jest.Mock).mockResolvedValue(null);
      await request(app)
        .get(`/api/v1/applications/${MOCK_APPLICATION_ID}`)
        .expect(404);
    });
  });

  describe('PUT /:id/status', () => {
    it('should update application status and return 200', async () => {
      const updatedApplication = { id: MOCK_APPLICATION_ID, status: 'approved' };
      (services.applicationService.updateApplication as jest.Mock).mockResolvedValue(updatedApplication);

      const response = await request(app)
        .put(`/api/v1/applications/${MOCK_APPLICATION_ID}/status`)
        .send({ status: 'approved' })
        .expect(200);

      expect(response.body).toEqual(updatedApplication);
      expect(services.applicationService.updateApplication).toHaveBeenCalledWith(MOCK_APPLICATION_ID, { status: 'approved' });
    });
  });

  describe('POST /:id/test-session', () => {
    it('should create a test session for an application', async () => {
      const mockApplication = { id: MOCK_APPLICATION_ID, test_id: 'test-123' };
      const mockTestSession = { sessionId: 'session-abc', questions: [] };

      (services.applicationService.getApplicationById as jest.Mock).mockResolvedValue(mockApplication);
      (services.testSessionService.startTestSession as jest.Mock).mockResolvedValue(mockTestSession);

      const response = await request(app)
        .post(`/api/v1/applications/${MOCK_APPLICATION_ID}/test-session`)
        .expect(201);

      expect(services.applicationService.getApplicationById).toHaveBeenCalledWith(MOCK_APPLICATION_ID);
      expect(services.testSessionService.startTestSession).toHaveBeenCalledWith(MOCK_USER_ID, 'test-123', MOCK_APPLICATION_ID);
      expect(response.body).toEqual(mockTestSession);
    });
  });

  describe('Application Limits', () => {
    it('should return 429 when creating more than 3 applications per month', async () => {
        const applicationsThisMonth = [
            { id: '1', created_at: new Date().toISOString() },
            { id: '2', created_at: new Date().toISOString() },
            { id: '3', created_at: new Date().toISOString() },
        ];
        (services.applicationService.getUserApplications as jest.Mock).mockResolvedValue(applicationsThisMonth);

        const response = await request(app)
            .post('/api/v1/applications')
            .send({ type: 'entry', data: { department: 'SAFD' } })
            .expect(429);

        expect(response.body.error).toContain('Лимит заявок на этот месяц исчерпан');
        expect(services.applicationService.createApplication).not.toHaveBeenCalled();
    });

    it('should allow creating an application if limit is not reached', async () => {
        const applicationsThisMonth = [
            { id: '1', created_at: new Date().toISOString() },
            { id: '2', created_at: new Date().toISOString() },
        ];
        (services.applicationService.getUserApplications as jest.Mock).mockResolvedValue(applicationsThisMonth);
        (services.applicationService.createApplication as jest.Mock).mockResolvedValue({ id: '4' });

        await request(app)
            .post('/api/v1/applications')
            .send({ type: 'entry', data: { department: 'LSSD' } })
            .expect(201);

        expect(services.applicationService.createApplication).toHaveBeenCalled();
    });
  });
}); 