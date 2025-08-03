import { ApplicationService } from './services/ApplicationService';
import { IStorage } from './storage';
import { Application } from '@roleplay-identity/shared-schema';

export interface SchedulerConfig {
  resetLimitsCron: string; // "0 0 1 * *" - 1 число каждого месяца в 00:00
  leaveProcessingCron: string; // "0 9 * * *" - каждый день в 9:00
  timezone: string; // "Europe/Moscow"
}

export class Scheduler {
  private applicationService: ApplicationService;
  private storage: IStorage;
  private config: SchedulerConfig;
  private intervals: NodeJS.Timeout[] = [];

  constructor(applicationService: ApplicationService, storage: IStorage, config: SchedulerConfig) {
    this.applicationService = applicationService;
    this.storage = storage;
    this.config = config;
  }

  start(): void {
    console.log('🚀 Starting scheduler...');
    
    // Запускаем планировщики
    this.scheduleMonthlyReset();
    this.scheduleLeaveProcessing();
    
    console.log('✅ Scheduler started successfully');
  }

  stop(): void {
    console.log('🛑 Stopping scheduler...');
    
    // Останавливаем все интервалы
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    
    console.log('✅ Scheduler stopped successfully');
  }

  private scheduleMonthlyReset(): void {
    // Парсим cron выражение для сброса лимитов
    const cronParts = this.config.resetLimitsCron.split(' ');
    const minute = parseInt(cronParts[0]);
    const hour = parseInt(cronParts[1]);
    const day = parseInt(cronParts[2]);
    
    const now = new Date();
    const nextReset = new Date(now.getFullYear(), now.getMonth(), day, hour, minute, 0, 0);
    
    // Если время уже прошло, переносим на следующий месяц
    if (nextReset <= now) {
      nextReset.setMonth(nextReset.getMonth() + 1);
    }
    
    const delay = nextReset.getTime() - now.getTime();
    
    console.log(`📅 Next monthly reset scheduled for: ${nextReset.toISOString()}`);
    
    // Устанавливаем таймер
    const interval = setInterval(async () => {
      try {
        await this.applicationService.resetMonthlyLimits();
        console.log('✅ Monthly limits reset completed');
      } catch (error) {
        console.error('❌ Error during monthly reset:', error);
      }
    }, delay);
    
    this.intervals.push(interval);
  }

  private scheduleLeaveProcessing(): void {
    // Парсим cron выражение для обработки отпусков
    const cronParts = this.config.leaveProcessingCron.split(' ');
    const minute = parseInt(cronParts[0]);
    const hour = parseInt(cronParts[1]);
    
    const now = new Date();
    const nextProcessing = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
    
    // Если время уже прошло, переносим на завтра
    if (nextProcessing <= now) {
      nextProcessing.setDate(nextProcessing.getDate() + 1);
    }
    
    const delay = nextProcessing.getTime() - now.getTime();
    
    console.log(`📅 Next leave processing scheduled for: ${nextProcessing.toISOString()}`);
    
    // Устанавливаем таймер
    const interval = setInterval(async () => {
      try {
        await this.processLeaveApplications();
        console.log('✅ Leave processing completed');
      } catch (error) {
        console.error('❌ Error during leave processing:', error);
      }
    }, delay);
    
    this.intervals.push(interval);
  }

  private async processLeaveApplications(): Promise<void> {
    console.log('🔄 Processing leave applications...');
    
    const applications = await this.storage.getAllApplications();
    const leaveApplications = applications.filter(app => app.type === 'leave' && app.status === 'approved');
    
    const now = new Date();
    
    for (const leaveApp of leaveApplications) {
      try {
        const data = leaveApp.data as any;
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        
        // Проверяем, нужно ли обработать отпуск сегодня
        if (now >= startDate && now <= endDate) {
          await this.processPartialDayLeave(leaveApp, now);
        }
        
        // Проверяем уведомления о предстоящих отпусках
        await this.checkUpcomingLeaveNotifications(leaveApp, now);
        
        // Проверяем завершение отпуска
        if (now > endDate) {
          await this.revokeLeaveRole(leaveApp);
        }
        
      } catch (error) {
        console.error(`❌ Error processing leave application ${leaveApp.id}:`, error);
      }
    }
  }

  private async processPartialDayLeave(leaveApp: any, now: Date): Promise<void> {
    const data = leaveApp.data as any;
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    // Если отпуск начался сегодня, выдаем роль
    if (now.toDateString() === startDate.toDateString()) {
      await this.grantLeaveRole(leaveApp);
    }
    
    // Если отпуск заканчивается сегодня, отзываем роль
    if (now.toDateString() === endDate.toDateString()) {
      await this.revokeLeaveRole(leaveApp);
    }
  }

  private async checkUpcomingLeaveNotifications(leaveApp: any, now: Date): Promise<void> {
    const data = leaveApp.data as any;
    const startDate = new Date(data.startDate);
    const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Уведомляем за день до начала отпуска
    if (daysUntilStart === 1) {
      await this.storage.createNotification({
        recipientId: leaveApp.authorId,
        content: `Your leave starts tomorrow (${data.startDate}). Please prepare for your absence.`,
        link: '/applications',
        isRead: false
      });
    }
    
    // Уведомляем за неделю до начала отпуска
    if (daysUntilStart === 7) {
      await this.storage.createNotification({
        recipientId: leaveApp.authorId,
        content: `Your leave starts in a week (${data.startDate}). Please ensure all tasks are delegated.`,
        link: '/applications',
        isRead: false
      });
    }
  }

  private async grantLeaveRole(leaveApp: any): Promise<void> {
    try {
      const user = await this.storage.getUser(leaveApp.authorId);
      if (!user) return;
      
      // В реальной системе здесь была бы логика выдачи роли "в отпуске"
      console.log(`🎭 Granting leave role to user ${user.id} for leave ${leaveApp.id}`);
      
      await this.storage.createNotification({
        recipientId: leaveApp.authorId,
        content: 'Your leave has started. You are now marked as "on leave".',
        link: '/applications',
        isRead: false
      });
    } catch (error) {
      console.error('❌ Error granting leave role:', error);
    }
  }

  private async revokeLeaveRole(leaveApp: any): Promise<void> {
    try {
      const user = await this.storage.getUser(leaveApp.authorId);
      if (!user) return;
      
      // В реальной системе здесь была бы логика отзыва роли "в отпуске"
      console.log(`🎭 Revoking leave role from user ${user.id} for leave ${leaveApp.id}`);
      
      await this.storage.createNotification({
        recipientId: leaveApp.authorId,
        content: 'Your leave has ended. Welcome back!',
        link: '/applications',
        isRead: false
      });
    } catch (error) {
      console.error('❌ Error revoking leave role:', error);
    }
  }

  async manualResetLimits(): Promise<void> {
    console.log('🔄 Manual reset of monthly limits triggered');
    await this.applicationService.resetMonthlyLimits();
  }

  async manualProcessLeaves(): Promise<void> {
    console.log('🔄 Manual processing of leaves triggered');
    await this.processLeaveApplications();
  }
} 
