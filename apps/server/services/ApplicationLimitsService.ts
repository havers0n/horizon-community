import { SupabaseStorage } from './SupabaseStorage';
import { NotificationService } from './NotificationService';

export interface ApplicationLimits {
  entryApplicationsPerMonth: number;
  leaveApplicationsPerMonth: number;
  promotionQualificationCooldownDays: number;
}

export class ApplicationLimitsService {
  private storage: SupabaseStorage;
  private notificationService: NotificationService;
  private limits: ApplicationLimits = {
    entryApplicationsPerMonth: 3,
    leaveApplicationsPerMonth: 2,
    promotionQualificationCooldownDays: 7
  };

  constructor(storage: SupabaseStorage, notificationService: NotificationService) {
    this.storage = storage;
    this.notificationService = notificationService;
  }

  /**
   * Reset monthly limits (called via cron job)
   */
  async resetMonthlyLimits(): Promise<void> {
    // This would be called by a scheduled task on the 1st of each month
    // In a real implementation, this might update a database table
    // tracking user limits or clear cached limit data
    
    console.log(`Monthly application limits reset: ${new Date().toISOString()}`);
    
    // Create system notification about reset
    const allUsers = await this.storage.list('users');
    const resetMessage = "Monthly application limits have been reset. You can now submit new applications.";
    
    for (const user of allUsers) {
      await this.notificationService.createNotification({
        recipientId: user.id,
        content: resetMessage,
        link: `/applications`,
        isRead: false
      });
    }
  }

  /**
   * Get current application limits
   */
  getLimits(): ApplicationLimits {
    return { ...this.limits };
  }

  /**
   * Update application limits
   */
  updateLimits(newLimits: Partial<ApplicationLimits>): void {
    this.limits = { ...this.limits, ...newLimits };
  }

  /**
   * Check if monthly reset is needed
   */
  isMonthlyResetNeeded(): boolean {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastResetDate = this.getLastResetDate();
    
    return !lastResetDate || lastResetDate < firstDayOfMonth;
  }

  /**
   * Get last reset date (stored in database or cache)
   */
  private getLastResetDate(): Date | null {
    // In a real implementation, this would be stored in database
    // For now, return null to trigger reset
    return null;
  }

  /**
   * Set last reset date
   */
  private async setLastResetDate(date: Date): Promise<void> {
    // In a real implementation, this would be stored in database
    console.log(`Last reset date set to: ${date.toISOString()}`);
  }

  /**
   * Manual reset of limits for testing purposes
   */
  async manualResetLimits(): Promise<void> {
    console.log('Manual reset of application limits triggered');
    await this.resetMonthlyLimits();
    await this.setLastResetDate(new Date());
  }

  /**
   * Get reset statistics
   */
  async getResetStats(): Promise<{
    lastResetDate: Date | null;
    nextResetDate: Date;
    totalUsersNotified: number;
    isResetNeeded: boolean;
  }> {
    const lastResetDate = this.getLastResetDate();
    const now = new Date();
    const nextResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const allUsers = await this.storage.list('users');
    
    return {
      lastResetDate,
      nextResetDate,
      totalUsersNotified: allUsers.length,
      isResetNeeded: this.isMonthlyResetNeeded()
    };
  }
} 