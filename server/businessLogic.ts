import { IStorage } from "./storage";
import { Application, User } from "@shared/schema";

export interface ApplicationLimits {
  entryApplicationsPerMonth: number;
  leaveApplicationsPerMonth: number;
  promotionQualificationCooldownDays: number;
}

export interface ApplicationRestriction {
  allowed: boolean;
  reason?: string;
  remainingCount?: number;
  cooldownEndsAt?: Date;
}

export class BusinessLogic {
  private storage: IStorage;
  private limits: ApplicationLimits = {
    entryApplicationsPerMonth: 3,
    leaveApplicationsPerMonth: 2,
    promotionQualificationCooldownDays: 7
  };

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  /**
   * Check if user can submit a specific type of application
   */
  async canSubmitApplication(
    userId: number, 
    applicationType: string
  ): Promise<ApplicationRestriction> {
    const user = await this.storage.getUser(userId);
    if (!user) {
      return { allowed: false, reason: "User not found" };
    }

    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const userApplications = await this.storage.getApplicationsByUser(userId);

    switch (applicationType) {
      case 'entry':
        return this.checkEntryApplicationLimit(userApplications, currentMonth);
      
      case 'leave':
        return this.checkLeaveApplicationLimit(userApplications, currentMonth);
      
      case 'promotion':
      case 'qualification':
        return this.checkPromotionQualificationCooldown(userApplications, now);
      
      default:
        return { allowed: true };
    }
  }

  /**
   * Check entry application limits (max 3 per month)
   */
  private checkEntryApplicationLimit(
    applications: Application[], 
    currentMonth: Date
  ): ApplicationRestriction {
    const entryAppsThisMonth = applications.filter(app => 
      app.type === 'entry' && 
      new Date(app.createdAt) >= currentMonth
    );

    const remainingCount = this.limits.entryApplicationsPerMonth - entryAppsThisMonth.length;

    if (remainingCount <= 0) {
      return { 
        allowed: false, 
        reason: `Entry application limit reached (${this.limits.entryApplicationsPerMonth}/month)`,
        remainingCount: 0
      };
    }

    return { 
      allowed: true, 
      remainingCount 
    };
  }

  /**
   * Check leave application limits (max 2 per month)
   */
  private checkLeaveApplicationLimit(
    applications: Application[], 
    currentMonth: Date
  ): ApplicationRestriction {
    const leaveAppsThisMonth = applications.filter(app => 
      app.type === 'leave' && 
      new Date(app.createdAt) >= currentMonth
    );

    const remainingCount = this.limits.leaveApplicationsPerMonth - leaveAppsThisMonth.length;

    if (remainingCount <= 0) {
      return { 
        allowed: false, 
        reason: `Leave application limit reached (${this.limits.leaveApplicationsPerMonth}/month)`,
        remainingCount: 0
      };
    }

    return { 
      allowed: true, 
      remainingCount 
    };
  }

  /**
   * Check promotion/qualification cooldown (7 days between applications)
   */
  private checkPromotionQualificationCooldown(
    applications: Application[], 
    now: Date
  ): ApplicationRestriction {
    const recentPromotionQualification = applications
      .filter(app => app.type === 'promotion' || app.type === 'qualification')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      [0];

    if (recentPromotionQualification) {
      const lastApplicationDate = new Date(recentPromotionQualification.createdAt);
      const cooldownEndDate = new Date(lastApplicationDate.getTime() + 
        (this.limits.promotionQualificationCooldownDays * 24 * 60 * 60 * 1000));

      if (now < cooldownEndDate) {
        return {
          allowed: false,
          reason: `Cooldown active. Next application allowed after ${cooldownEndDate.toLocaleDateString()}`,
          cooldownEndsAt: cooldownEndDate
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Get application statistics for a user
   */
  async getUserApplicationStats(userId: number): Promise<{
    thisMonth: {
      entryApplications: number;
      leaveApplications: number;
      totalApplications: number;
    };
    limits: ApplicationLimits;
    nextResetDate: Date;
    lastPromotionQualificationDate?: Date;
  }> {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    const userApplications = await this.storage.getApplicationsByUser(userId);
    
    const thisMonthApps = userApplications.filter(app => 
      new Date(app.createdAt) >= currentMonth
    );

    const entryApplications = thisMonthApps.filter(app => app.type === 'entry').length;
    const leaveApplications = thisMonthApps.filter(app => app.type === 'leave').length;

    const lastPromotionQualification = userApplications
      .filter(app => app.type === 'promotion' || app.type === 'qualification')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      [0];

    return {
      thisMonth: {
        entryApplications,
        leaveApplications,
        totalApplications: thisMonthApps.length
      },
      limits: this.limits,
      nextResetDate: nextMonth,
      lastPromotionQualificationDate: lastPromotionQualification ? 
        new Date(lastPromotionQualification.createdAt) : undefined
    };
  }

  /**
   * Application lifecycle management
   */
  async advanceApplicationStatus(
    applicationId: number, 
    newStatus: string, 
    reviewerId: number,
    comment?: string
  ): Promise<Application | null> {
    const application = await this.storage.getApplication(applicationId);
    if (!application) return null;

    // Validate status transition
    const validTransitions = this.getValidStatusTransitions(application.status);
    if (!validTransitions.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${application.status} to ${newStatus}`);
    }

    // Update application
    const updatedApplication = await this.storage.updateApplication(applicationId, {
      status: newStatus,
      reviewerId,
      reviewComment: comment,
      updatedAt: new Date()
    });

    // Create notification for applicant
    if (updatedApplication) {
      await this.createApplicationNotification(updatedApplication, newStatus);
    }

    return updatedApplication;
  }

  /**
   * Get valid status transitions for application lifecycle
   */
  private getValidStatusTransitions(currentStatus: string): string[] {
    const transitions: Record<string, string[]> = {
      'pending': ['approved', 'rejected'],
      'approved': ['test_required', 'resolved', 'closed'],
      'test_required': ['test_completed', 'test_failed'],
      'test_completed': ['resolved', 'rejected'],
      'test_failed': ['rejected', 'test_required'], // Allow retake
      'resolved': ['closed'],
      'rejected': ['closed'],
      'closed': [] // Final state
    };

    return transitions[currentStatus] || [];
  }

  /**
   * Create notification for application status change
   */
  private async createApplicationNotification(
    application: Application, 
    newStatus: string
  ): Promise<void> {
    const statusMessages: Record<string, string> = {
      'approved': 'Your application has been approved!',
      'rejected': 'Your application has been rejected.',
      'test_required': 'Your application requires a test. Check your applications to proceed.',
      'test_completed': 'Test completed! Awaiting final review.',
      'test_failed': 'Test failed. You may retake after 24 hours.',
      'resolved': 'Your application has been successfully processed!',
      'closed': 'Your application has been closed.'
    };

    const message = statusMessages[newStatus] || `Application status updated to ${newStatus}`;

    await this.storage.createNotification({
      recipientId: application.authorId,
      content: message,
      link: `/applications`,
      isRead: false
    });
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
    const allUsers = await this.storage.getAllUsers();
    const resetMessage = "Monthly application limits have been reset. You can now submit new applications.";
    
    for (const user of allUsers) {
      await this.storage.createNotification({
        recipientId: user.id,
        content: resetMessage,
        link: `/applications`,
        isRead: false
      });
    }
  }

  /**
   * Check if application requires a test
   */
  async requiresTest(application: Application): Promise<boolean> {
    // Business logic to determine if application type requires testing
    const testRequiredTypes = ['entry', 'promotion', 'qualification'];
    return testRequiredTypes.includes(application.type);
  }

  /**
   * Get application with enhanced status info
   */
  async getApplicationWithStatus(applicationId: number): Promise<{
    application: Application;
    canAdvance: boolean;
    nextPossibleStatuses: string[];
    requiresTest: boolean;
  } | null> {
    const application = await this.storage.getApplication(applicationId);
    if (!application) return null;

    const nextPossibleStatuses = this.getValidStatusTransitions(application.status);
    const requiresTest = await this.requiresTest(application);
    const canAdvance = nextPossibleStatuses.length > 0;

    return {
      application,
      canAdvance,
      nextPossibleStatuses,
      requiresTest
    };
  }
}