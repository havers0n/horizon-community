import { SupabaseStorage } from './SupabaseStorage';
import { 
  Notification, 
  InsertNotification, 
  UpdateNotification,
  User
} from '@roleplay-identity/shared-types';

export class NotificationService {
  private storage: SupabaseStorage;

  constructor(storage: SupabaseStorage) {
    this.storage = storage;
  }

  // ===========================================
  // ОСНОВНЫЕ ОПЕРАЦИИ
  // ===========================================

  async createNotification(data: InsertNotification): Promise<Notification> {
    return this.storage.insert('notifications', data);
  }

  async getNotificationById(id: string): Promise<Notification | null> {
    return this.storage.getById('notifications', id);
  }

  async getAllNotifications(): Promise<Notification[]> {
    return this.storage.list('notifications');
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return this.storage.list('notifications', { userId });
  }

  async getUnreadNotificationsByUser(userId: string): Promise<Notification[]> {
    return this.storage.list('notifications', { userId, isRead: false });
  }

  async getNotificationsByType(userId: string, type: Notification['type']): Promise<Notification[]> {
    return this.storage.list('notifications', { userId, type });
  }

  async updateNotification(id: string, data: UpdateNotification): Promise<Notification> {
    return this.storage.update('notifications', id, data);
  }

  async deleteNotification(id: string): Promise<void> {
    await this.storage.delete('notifications', id);
  }

  // ===========================================
  // БИЗНЕС-ЛОГИКА
  // ===========================================

  async markAsRead(id: string): Promise<Notification> {
    return this.updateNotification(id, {
      isRead: true,
      readAt: new Date().toISOString()
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    const unreadNotifications = await this.getUnreadNotificationsByUser(userId);
    
    const updatePromises = unreadNotifications.map(notification =>
      this.markAsRead(notification.id)
    );

    await Promise.all(updatePromises);
  }

  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    const updatePromises = notificationIds.map(id =>
      this.markAsRead(id)
    );

    await Promise.all(updatePromises);
  }

  async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: Notification['type'] = 'info'
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      title,
      message,
      type,
      isRead: false
    });
  }

  async sendBulkNotifications(
    userIds: string[],
    title: string,
    message: string,
    type: Notification['type'] = 'info'
  ): Promise<Notification[]> {
    const notifications = userIds.map(userId => ({
      userId,
      title,
      message,
      type,
      isRead: false
    }));

    return this.storage.batchInsert('notifications', notifications);
  }

  async sendSystemNotification(
    title: string,
    message: string,
    type: Notification['type'] = 'info'
  ): Promise<Notification[]> {
    // Получаем всех активных пользователей
    const users = await this.storage.list('users', { isActive: true });
    const userIds = users.map(user => user.id);

    return this.sendBulkNotifications(userIds, title, message, type);
  }

  async sendDepartmentNotification(
    departmentId: string,
    title: string,
    message: string,
    type: Notification['type'] = 'info'
  ): Promise<Notification[]> {
    // Получаем всех членов департамента
    const members = await this.storage.list('character_career_history', {
      departmentId,
      isActive: true
    });

    const userIds = members.map(member => member.characterId);
    return this.sendBulkNotifications(userIds, title, message, type);
  }

  // ===========================================
  // СПЕЦИАЛИЗИРОВАННЫЕ УВЕДОМЛЕНИЯ
  // ===========================================

  async sendApplicationStatusNotification(
    userId: string,
    status: 'approved' | 'rejected' | 'under_review',
    departmentName: string,
    reason?: string
  ): Promise<Notification> {
    const messages = {
      approved: `Ваша заявка в департамент ${departmentName} была одобрена!`,
      rejected: `Ваша заявка в департамент ${departmentName} была отклонена.${reason ? ` Причина: ${reason}` : ''}`,
      under_review: `Ваша заявка в департамент ${departmentName} находится на рассмотрении.`
    };

    const types = {
      approved: 'success' as const,
      rejected: 'error' as const,
      under_review: 'info' as const
    };

    return this.sendNotification(
      userId,
      `Статус заявки: ${status === 'approved' ? 'Одобрена' : status === 'rejected' ? 'Отклонена' : 'На рассмотрении'}`,
      messages[status],
      types[status]
    );
  }

  async sendReportStatusNotification(
    userId: string,
    status: 'approved' | 'rejected' | 'submitted',
    reportTitle: string,
    reason?: string
  ): Promise<Notification> {
    const messages = {
      approved: `Ваш отчет "${reportTitle}" был одобрен.`,
      rejected: `Ваш отчет "${reportTitle}" был отклонен.${reason ? ` Причина: ${reason}` : ''}`,
      submitted: `Ваш отчет "${reportTitle}" был отправлен на рассмотрение.`
    };

    const types = {
      approved: 'success' as const,
      rejected: 'error' as const,
      submitted: 'info' as const
    };

    return this.sendNotification(
      userId,
      `Статус отчета: ${status === 'approved' ? 'Одобрен' : status === 'rejected' ? 'Отклонен' : 'Отправлен'}`,
      messages[status],
      types[status]
    );
  }

  async sendCall911Notification(
    userIds: string[],
    location: string,
    description: string,
    priority: 'low' | 'medium' | 'high' | 'emergency'
  ): Promise<Notification[]> {
    const priorityColors = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      emergency: '🔴'
    };

    const title = `${priorityColors[priority]} Новый вызов 911`;
    const message = `Локация: ${location}\nОписание: ${description}`;
    const type = priority === 'emergency' ? 'error' : priority === 'high' ? 'warning' : 'info';

    return this.sendBulkNotifications(userIds, title, message, type);
  }

  async sendShiftNotification(
    userId: string,
    action: 'start' | 'end',
    departmentName: string,
    unitName?: string
  ): Promise<Notification> {
    const messages = {
      start: `Вы начали смену в департаменте ${departmentName}${unitName ? `, юнит ${unitName}` : ''}.`,
      end: `Вы завершили смену в департаменте ${departmentName}${unitName ? `, юнит ${unitName}` : ''}.`
    };

    return this.sendNotification(
      userId,
      `Смена ${action === 'start' ? 'начата' : 'завершена'}`,
      messages[action],
      'info'
    );
  }

  // ===========================================
  // ПОИСК И ФИЛЬТРАЦИЯ
  // ===========================================

  async searchNotifications(userId: string, query: string): Promise<Notification[]> {
    const notifications = await this.getNotificationsByUser(userId);
    return notifications.filter(notification =>
      notification.title.toLowerCase().includes(query.toLowerCase()) ||
      notification.message.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getNotificationsWithUserDetails(): Promise<(Notification & {
    user: User;
  })[]> {
    const notifications = await this.getAllNotifications();
    
    const notificationsWithDetails = await Promise.all(
      notifications.map(async (notification) => {
        const user = await this.storage.getById('users', notification.userId);
        return {
          ...notification,
          user: user!
        };
      })
    );

    return notificationsWithDetails;
  }

  async getNotificationWithUserDetails(id: string): Promise<(Notification & {
    user: User;
  }) | null> {
    const notification = await this.getNotificationById(id);
    if (!notification) return null;

    const user = await this.storage.getById('users', notification.userId);
    return {
      ...notification,
      user: user!
    };
  }

  // ===========================================
  // СТАТИСТИКА
  // ===========================================

  async getNotificationStats(): Promise<{
    total: number;
    unread: number;
    read: number;
    byType: Record<Notification['type'], number>;
  }> {
    const [total, unread, read] = await Promise.all([
      this.storage.count('notifications'),
      this.storage.count('notifications', { isRead: false }),
      this.storage.count('notifications', { isRead: true })
    ]);

    const [info, warning, error, success] = await Promise.all([
      this.storage.count('notifications', { type: 'info' }),
      this.storage.count('notifications', { type: 'warning' }),
      this.storage.count('notifications', { type: 'error' }),
      this.storage.count('notifications', { type: 'success' })
    ]);

    return {
      total,
      unread,
      read,
      byType: {
        info,
        warning,
        error,
        success
      }
    };
  }

  async getUserNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    read: number;
    byType: Record<Notification['type'], number>;
  }> {
    const [total, unread, read] = await Promise.all([
      this.storage.count('notifications', { userId }),
      this.storage.count('notifications', { userId, isRead: false }),
      this.storage.count('notifications', { userId, isRead: true })
    ]);

    const [info, warning, error, success] = await Promise.all([
      this.storage.count('notifications', { userId, type: 'info' }),
      this.storage.count('notifications', { userId, type: 'warning' }),
      this.storage.count('notifications', { userId, type: 'error' }),
      this.storage.count('notifications', { userId, type: 'success' })
    ]);

    return {
      total,
      unread,
      read,
      byType: {
        info,
        warning,
        error,
        success
      }
    };
  }

  async getNotificationActivity(days: number = 30): Promise<{
    sent: number;
    read: number;
    byType: Record<Notification['type'], number>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [sent, read] = await Promise.all([
      this.storage.count('notifications', {
        createdAt: { gte: startDate.toISOString() }
      }),
      this.storage.count('notifications', {
        readAt: { gte: startDate.toISOString() }
      })
    ]);

    const [info, warning, error, success] = await Promise.all([
      this.storage.count('notifications', {
        type: 'info',
        createdAt: { gte: startDate.toISOString() }
      }),
      this.storage.count('notifications', {
        type: 'warning',
        createdAt: { gte: startDate.toISOString() }
      }),
      this.storage.count('notifications', {
        type: 'error',
        createdAt: { gte: startDate.toISOString() }
      }),
      this.storage.count('notifications', {
        type: 'success',
        createdAt: { gte: startDate.toISOString() }
      })
    ]);

    return {
      sent,
      read,
      byType: {
        info,
        warning,
        error,
        success
      }
    };
  }

  // ===========================================
  // ОЧИСТКА
  // ===========================================

  async deleteOldNotifications(daysOld: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldNotifications = await this.storage.list('notifications', {
      createdAt: { lt: cutoffDate.toISOString() },
      isRead: true
    });

    const deletePromises = oldNotifications.map(notification =>
      this.deleteNotification(notification.id)
    );

    await Promise.all(deletePromises);
  }

  async deleteReadNotifications(userId: string): Promise<void> {
    const readNotifications = await this.storage.list('notifications', {
      userId,
      isRead: true
    });

    const deletePromises = readNotifications.map(notification =>
      this.deleteNotification(notification.id)
    );

    await Promise.all(deletePromises);
  }
}

// Экспортируем единственный экземпляр
export const notificationService = new NotificationService(new SupabaseStorage()); 