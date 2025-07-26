import { BusinessLogic } from './businessLogic';
import { IStorage } from './storage';
import { Application } from '@roleplay-identity/shared-schema';

export interface SchedulerConfig {
  resetLimitsCron: string; // "0 0 1 * *" - 1 число каждого месяца в 00:00
  leaveProcessingCron: string; // "0 9 * * *" - каждый день в 9:00
  timezone: string; // "Europe/Moscow"
}

export class Scheduler {
  private businessLogic: BusinessLogic;
  private storage: IStorage;
  private config: SchedulerConfig;
  private intervals: NodeJS.Timeout[] = [];

  constructor(businessLogic: BusinessLogic, storage: IStorage, config: SchedulerConfig) {
    this.businessLogic = businessLogic;
    this.storage = storage;
    this.config = config;
  }

  /**
   * Запуск всех планировщиков
   */
  start(): void {
    // Сброс лимитов 1 числа каждого месяца
    this.scheduleMonthlyReset();
    
    // Обработка отпусков каждый день
    this.scheduleLeaveProcessing();
  }

  /**
   * Остановка всех планировщиков
   */
  stop(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
  }

  /**
   * Планировщик сброса лимитов
   */
  private scheduleMonthlyReset(): void {
    const interval = setInterval(async () => {
      const now = new Date();
      if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
        try {
          await this.businessLogic.resetMonthlyLimits();
        } catch (error) {
          console.error('❌ Error during monthly limits reset:', error);
        }
      }
    }, 60000); // Проверяем каждую минуту

    this.intervals.push(interval);
  }

  /**
   * Планировщик обработки отпусков
   */
  private scheduleLeaveProcessing(): void {
    const interval = setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 9 && now.getMinutes() === 0) {
        try {
          await this.processLeaveApplications();
        } catch (error) {
          console.error('❌ Error during leave processing:', error);
        }
      }
    }, 60000); // Проверяем каждую минуту

    this.intervals.push(interval);
  }

  /**
   * Обработка заявок на отпуск
   */
  private async processLeaveApplications(): Promise<void> {
    const now = new Date();
    
    // Получаем все одобренные заявки на отпуск
    const leaveApplications = await this.storage.getApplicationsByType('leave');
    const approvedLeaves = leaveApplications.filter(app => app.status === 'approved');

    for (const leaveApp of approvedLeaves) {
      try {
        const leaveData = leaveApp.data as any;
        const startDate = new Date(leaveData.startDate);
        const endDate = new Date(leaveData.endDate);

        // Проверяем, нужно ли выдать роль "Отпуск"
        if (now >= startDate && now <= endDate) {
          await this.grantLeaveRole(leaveApp);
        }
        
        // Проверяем, нужно ли снять роль "Отпуск"
        if (now > endDate) {
          await this.revokeLeaveRole(leaveApp);
        }

        // Проверяем частичные дни
        if (leaveData.isPartialDay && leaveData.startTime && leaveData.endTime) {
          await this.processPartialDayLeave(leaveApp, now);
        }

        // Уведомления о приближающихся отпусках
        await this.checkUpcomingLeaveNotifications(leaveApp, now);
      } catch (error) {
        console.error(`Error processing leave application ${leaveApp.id}:`, error);
      }
    }
  }

  /**
   * Обработка частичных дней отпуска
   */
  private async processPartialDayLeave(leaveApp: Application, now: Date): Promise<void> {
    const leaveData = leaveApp.data as any;
    const startDate = new Date(leaveData.startDate);
    const endDate = new Date(leaveData.endDate);

    // Проверяем, что сегодня входит в период отпуска
    if (now >= startDate && now <= endDate) {
      const today = now.toDateString();
      const startDateStr = startDate.toDateString();
      const endDateStr = endDate.toDateString();

      // Если сегодня начало или конец отпуска, проверяем время
      if (today === startDateStr || today === endDateStr) {
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [startHour, startMinute] = leaveData.startTime.split(':').map(Number);
        const [endHour, endMinute] = leaveData.endTime.split(':').map(Number);
        const startTimeMinutes = startHour * 60 + startMinute;
        const endTimeMinutes = endHour * 60 + endMinute;

        // Выдаем роль в начале рабочего времени
        if (currentTime >= startTimeMinutes && currentTime <= endTimeMinutes) {
          await this.grantLeaveRole(leaveApp);
        } else if (currentTime > endTimeMinutes) {
          // Снимаем роль в конце рабочего времени
          await this.revokeLeaveRole(leaveApp);
        }
      }
    }
  }

  /**
   * Проверка и отправка уведомлений о приближающихся отпусках
   */
  private async checkUpcomingLeaveNotifications(leaveApp: Application, now: Date): Promise<void> {
    const leaveData = leaveApp.data as any;
    const startDate = new Date(leaveData.startDate);
    const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Уведомление за 3 дня до начала отпуска
    if (daysUntilStart === 3) {
      await this.storage.createNotification({
        recipientId: leaveApp.authorId,
        content: `Ваш отпуск начнется через 3 дня (${startDate.toLocaleDateString()}). Убедитесь, что все дела переданы.`,
        link: '/leave-management',
        isRead: false
      });
    }

    // Уведомление за 1 день до начала отпуска
    if (daysUntilStart === 1) {
      await this.storage.createNotification({
        recipientId: leaveApp.authorId,
        content: `Ваш отпуск начинается завтра! Роль "Отпуск" будет выдана автоматически.`,
        link: '/leave-management',
        isRead: false
      });
    }
  }

  /**
   * Выдача роли "Отпуск"
   */
  private async grantLeaveRole(leaveApp: Application): Promise<void> {
    const user = await this.storage.getUser(leaveApp.authorId);
    if (!user) return;

    // Проверяем, не выдана ли уже роль
    if (user.status === 'on_leave') return;

    // Обновляем статус пользователя
    await this.storage.updateUser(leaveApp.authorId, {
      status: 'on_leave'
    });

    // Создаем уведомление
    await this.storage.createNotification({
      recipientId: leaveApp.authorId,
      content: 'Ваш отпуск начался. Роль "Отпуск" выдана.',
      link: '/dashboard',
      isRead: false
    });

    console.log(`✅ Leave role granted to user ${leaveApp.authorId}`);
  }

  /**
   * Снятие роли "Отпуск"
   */
  private async revokeLeaveRole(leaveApp: Application): Promise<void> {
    const user = await this.storage.getUser(leaveApp.authorId);
    if (!user) return;

    // Проверяем, выдана ли роль
    if (user.status !== 'on_leave') return;

    // Обновляем статус пользователя
    await this.storage.updateUser(leaveApp.authorId, {
      status: 'active'
    });

    // Создаем уведомление
    await this.storage.createNotification({
      recipientId: leaveApp.authorId,
      content: 'Ваш отпуск завершен. Роль "Отпуск" снята.',
      link: '/dashboard',
      isRead: false
    });

    // Закрываем заявку
    await this.businessLogic.advanceApplicationStatus(
      leaveApp.id,
      'closed',
      0, // system user
      'Отпуск завершен автоматически'
    );

    console.log(`✅ Leave role revoked from user ${leaveApp.authorId}`);
  }

  /**
   * Ручной запуск сброса лимитов (для тестирования)
   */
  async manualResetLimits(): Promise<void> {
    console.log('🔄 Manual limits reset triggered...');
    await this.businessLogic.resetMonthlyLimits();
    console.log('✅ Manual limits reset completed');
  }

  /**
   * Ручная обработка отпусков (для тестирования)
   */
  async manualProcessLeaves(): Promise<void> {
    console.log('🏖️ Manual leave processing triggered...');
    await this.processLeaveApplications();
    console.log('✅ Manual leave processing completed');
  }
} 