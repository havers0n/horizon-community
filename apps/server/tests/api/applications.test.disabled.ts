import request from 'supertest';
import express from 'express';
import { storage } from '../../storage';
import { ApplicationService } from '../../services/ApplicationService';
import { NotificationService } from '../../services/NotificationService';

// Мокаем ApplicationService
jest.mock('../../services/ApplicationService', () => ({
  ApplicationService: jest.fn().mockImplementation(() => ({
    canSubmitApplication: jest.fn(),
    getUserApplicationStats: jest.fn(),
    advanceApplicationStatus: jest.fn(),
    getActiveJointPositions: jest.fn(),
    processJointApplication: jest.fn(),
    removeJointPosition: jest.fn(),
    resetMonthlyLimits: jest.fn()
  }))
}));

describe('Application API', () => {
  let app: express.Application;
  let mockApplicationService: ApplicationService;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Создаем мок сервиса
    const notificationService = new NotificationService(storage);
    mockApplicationService = new ApplicationService(storage, notificationService);

    // Добавляем тестовые роуты
    app.post('/api/applications/check', async (req, res) => {
      try {
        const { userId, type } = req.body;
        const restriction = await mockApplicationService.canSubmitApplication(userId, type);
        const stats = await mockApplicationService.getUserApplicationStats(userId);
        res.json({ restriction, stats });
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  });

  describe('POST /api/applications/check', () => {
    it('should check application submission', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockRestriction = { allowed: true, remainingCount: 2 };
      const mockStats = { thisMonth: { entryApplications: 1 } };

      (mockApplicationService.canSubmitApplication as jest.Mock).mockResolvedValue(mockRestriction);
      (mockApplicationService.getUserApplicationStats as jest.Mock).mockResolvedValue(mockStats);

      const response = await request(app)
        .post('/api/applications/check')
        .send({ userId: mockUser.id, type: 'entry' })
        .expect(200);

      expect(mockApplicationService.canSubmitApplication).toHaveBeenCalledWith(mockUser.id, 'entry');
      expect(response.body.restriction).toEqual(mockRestriction);
      expect(response.body.stats).toEqual(mockStats);
    });
  });
}); 