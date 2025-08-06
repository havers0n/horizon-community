import request from 'supertest';
import express from 'express';
import { ApplicationService } from '../../src/core/services/ApplicationService';

// Мокаем ApplicationService
jest.mock('../../src/core/services/ApplicationService', () => ({
  ApplicationService: jest.fn().mockImplementation(() => ({
    createApplication: jest.fn(),
    getApplicationById: jest.fn(),
    updateApplication: jest.fn(),
    deleteApplication: jest.fn(),
    getUserApplications: jest.fn(),
    getApplicationsByStatus: jest.fn()
  }))
}));

describe('Application API', () => {
  let app: express.Application;
  let mockApplicationService: ApplicationService;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Создаем мок сервиса
    mockApplicationService = new ApplicationService();

    // Добавляем тестовые роуты
    app.post('/api/applications', async (req, res) => {
      try {
        const application = await mockApplicationService.createApplication(req.body);
        res.json(application);
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.get('/api/applications/:id', async (req, res) => {
      try {
        const application = await mockApplicationService.getApplicationById(req.params.id);
        if (!application) {
          return res.status(404).json({ error: 'Application not found' });
        }
        res.json(application);
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  });

  describe('POST /api/applications', () => {
    it('should create a new application', async () => {
      const mockApplication = {
        id: '1',
        type: 'entry',
        author_user_id: 'user123',
        author_character_id: 'char456',
        status: 'awaiting_interview',
        created_at: new Date().toISOString(),
        updated_at: null,
        data: null,
        result: null,
        review_comment: null,
        reviewer_character_id: null,
        status_history: []
      };

      (mockApplicationService.createApplication as jest.Mock).mockResolvedValue(mockApplication);

      const response = await request(app)
        .post('/api/applications')
        .send({
          type: 'entry',
          author_user_id: 'user123',
          author_character_id: 'char456'
        })
        .expect(200);

      expect(mockApplicationService.createApplication).toHaveBeenCalledWith({
        type: 'entry',
        author_user_id: 'user123',
        author_character_id: 'char456'
      });
      expect(response.body).toEqual(mockApplication);
    });
  });

  describe('GET /api/applications/:id', () => {
    it('should get application by id', async () => {
      const mockApplication = {
        id: '1',
        type: 'entry',
        author_user_id: 'user123',
        author_character_id: 'char456',
        status: 'awaiting_interview',
        created_at: new Date().toISOString(),
        updated_at: null,
        data: null,
        result: null,
        review_comment: null,
        reviewer_character_id: null,
        status_history: []
      };

      (mockApplicationService.getApplicationById as jest.Mock).mockResolvedValue(mockApplication);

      const response = await request(app)
        .get('/api/applications/1')
        .expect(200);

      expect(mockApplicationService.getApplicationById).toHaveBeenCalledWith('1');
      expect(response.body).toEqual(mockApplication);
    });

    it('should return 404 when application not found', async () => {
      (mockApplicationService.getApplicationById as jest.Mock).mockResolvedValue(null);

      await request(app)
        .get('/api/applications/999')
        .expect(404);
    });
  });
}); 