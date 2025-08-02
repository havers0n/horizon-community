import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../routes';
import { storage } from '../../storage';

// Мокаем storage для тестов
jest.mock('../../storage', () => ({
  storage: {
    getNotificationsByUser: jest.fn(),
    createNotification: jest.fn(),
    markNotificationAsRead: jest.fn(),
    markAllNotificationsAsRead: jest.fn(),
    deleteNotification: jest.fn(),
    getNotificationById: jest.fn(),
    getUnreadNotificationsByUser: jest.fn(),
  }
}));

describe('Notifications API', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'candidate',
    status: 'active'
  };

  const mockNotification = {
    id: 1,
    recipientId: 1,
    content: 'Test notification',
    isRead: false,
    link: '/test/link',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Мокаем middleware аутентификации
  const mockAuthMiddleware = (req: any, res: any, next: any) => {
    req.user = mockUser;
    next();
  };

  describe('GET /api/notifications', () => {
    it('should return user notifications when authenticated', async () => {
      (storage.getNotificationsByUser as jest.Mock).mockResolvedValue([mockNotification]);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual([mockNotification]);
      expect(storage.getNotificationsByUser).toHaveBeenCalledWith(mockUser.id);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('GET /api/notifications/unread', () => {
    it('should return unread notifications when authenticated', async () => {
      const unreadNotifications = [{ ...mockNotification, isRead: false }];
      (storage.getUnreadNotificationsByUser as jest.Mock).mockResolvedValue(unreadNotifications);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/notifications/unread')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual(unreadNotifications);
      expect(storage.getUnreadNotificationsByUser).toHaveBeenCalledWith(mockUser.id);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('POST /api/notifications/:id/read', () => {
    it('should mark notification as read when user is recipient', async () => {
      const readNotification = { ...mockNotification, isRead: true };
      (storage.getNotificationById as jest.Mock).mockResolvedValue(mockNotification);
      (storage.markNotificationAsRead as jest.Mock).mockResolvedValue(readNotification);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .post('/api/notifications/1/read')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual(readNotification);
      expect(storage.markNotificationAsRead).toHaveBeenCalledWith(1);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 404 when notification not found', async () => {
      (storage.getNotificationById as jest.Mock).mockResolvedValue(null);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .post('/api/notifications/999/read')
        .set('Authorization', 'Bearer test-token')
        .expect(404);

      expect(response.body.message).toBe('Notification not found');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 403 when user is not recipient', async () => {
      const otherUserNotification = { ...mockNotification, recipientId: 999 };
      (storage.getNotificationById as jest.Mock).mockResolvedValue(otherUserNotification);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .post('/api/notifications/1/read')
        .set('Authorization', 'Bearer test-token')
        .expect(403);

      expect(response.body.message).toBe('Access denied');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('POST /api/notifications/read-all', () => {
    it('should mark all notifications as read when authenticated', async () => {
      (storage.markAllNotificationsAsRead as jest.Mock).mockResolvedValue(true);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .post('/api/notifications/read-all')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body.message).toBe('All notifications marked as read');
      expect(storage.markAllNotificationsAsRead).toHaveBeenCalledWith(mockUser.id);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('should delete notification when user is recipient', async () => {
      (storage.getNotificationById as jest.Mock).mockResolvedValue(mockNotification);
      (storage.deleteNotification as jest.Mock).mockResolvedValue(true);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .delete('/api/notifications/1')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body.message).toBe('Notification deleted successfully');
      expect(storage.deleteNotification).toHaveBeenCalledWith(1);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 404 when notification not found', async () => {
      (storage.getNotificationById as jest.Mock).mockResolvedValue(null);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .delete('/api/notifications/999')
        .set('Authorization', 'Bearer test-token')
        .expect(404);

      expect(response.body.message).toBe('Notification not found');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 403 when user is not recipient', async () => {
      const otherUserNotification = { ...mockNotification, recipientId: 999 };
      (storage.getNotificationById as jest.Mock).mockResolvedValue(otherUserNotification);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .delete('/api/notifications/1')
        .set('Authorization', 'Bearer test-token')
        .expect(403);

      expect(response.body.message).toBe('Access denied');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('GET /api/notifications/:id', () => {
    it('should return specific notification when user is recipient', async () => {
      (storage.getNotificationById as jest.Mock).mockResolvedValue(mockNotification);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/notifications/1')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual(mockNotification);
      expect(storage.getNotificationById).toHaveBeenCalledWith(1);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 404 when notification not found', async () => {
      (storage.getNotificationById as jest.Mock).mockResolvedValue(null);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/notifications/999')
        .set('Authorization', 'Bearer test-token')
        .expect(404);

      expect(response.body.message).toBe('Notification not found');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 403 when user is not recipient', async () => {
      const otherUserNotification = { ...mockNotification, recipientId: 999 };
      (storage.getNotificationById as jest.Mock).mockResolvedValue(otherUserNotification);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/notifications/1')
        .set('Authorization', 'Bearer test-token')
        .expect(403);

      expect(response.body.message).toBe('Access denied');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('POST /api/notifications/bulk-read', () => {
    it('should mark multiple notifications as read when user is recipient', async () => {
      const notificationIds = [1, 2, 3];
      const notifications = notificationIds.map(id => ({ ...mockNotification, id }));
      
      (storage.getNotificationById as jest.Mock)
        .mockResolvedValueOnce(notifications[0])
        .mockResolvedValueOnce(notifications[1])
        .mockResolvedValueOnce(notifications[2]);
      
      (storage.markNotificationAsRead as jest.Mock).mockResolvedValue({ ...mockNotification, isRead: true });

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .post('/api/notifications/bulk-read')
        .set('Authorization', 'Bearer test-token')
        .send({ notificationIds })
        .expect(200);

      expect(response.body.message).toBe('Notifications marked as read');
      expect(storage.markNotificationAsRead).toHaveBeenCalledTimes(3);

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 400 when notificationIds is missing', async () => {
      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .post('/api/notifications/bulk-read')
        .set('Authorization', 'Bearer test-token')
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Notification IDs are required');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 400 when notificationIds is not an array', async () => {
      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .post('/api/notifications/bulk-read')
        .set('Authorization', 'Bearer test-token')
        .send({ notificationIds: 'invalid' })
        .expect(400);

      expect(response.body.message).toBe('Notification IDs must be an array');

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });

  describe('GET /api/notifications/count', () => {
    it('should return notification count when authenticated', async () => {
      const mockNotifications = [mockNotification, { ...mockNotification, id: 2 }];
      (storage.getNotificationsByUser as jest.Mock).mockResolvedValue(mockNotifications);

      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = mockAuthMiddleware;

      const response = await request(app)
        .get('/api/notifications/count')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual({
        total: 2,
        unread: 2,
        read: 0
      });

      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });
}); 