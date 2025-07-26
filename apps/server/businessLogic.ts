import { IStorage } from "./storage";
import { Application, User } from "@roleplay-identity/shared-schema";

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
    console.log(`🔍 BusinessLogic.canSubmitApplication - User ID: ${userId}, Type: ${applicationType}`);
    
    const user = await this.storage.getUser(userId);
    if (!user) {
      console.log(`❌ User not found: ${userId}`);
      return { allowed: false, reason: "User not found" };
    }
    
    console.log(`✅ User found: ${user.email} (ID: ${user.id})`);

    const now = new Date();
    // Исправляем расчет текущего месяца с учетом часового пояса
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const userApplications = await this.storage.getApplicationsByUser(userId);
    
    console.log(`📊 Total applications for user: ${userApplications.length}`);
    console.log(`📅 Current month: ${currentMonth.toISOString()}`);
    console.log(`📅 Now: ${now.toISOString()}`);
    
    // Логируем все заявки пользователя
    userApplications.forEach((app, index) => {
      console.log(`  ${index + 1}. ID: ${app.id}, Type: ${app.type}, Created: ${app.createdAt}, Status: ${app.status}`);
    });

    switch (applicationType) {
      case 'entry':
        return this.checkEntryApplicationLimit(userApplications, currentMonth);
      
      case 'leave':
        return this.checkLeaveApplicationLimit(userApplications, currentMonth, userId);
      
      case 'promotion':
      case 'qualification':
        return this.checkPromotionQualificationCooldown(userApplications, now);
      
      case 'joint_primary':
      case 'joint_secondary':
        return this.checkJointApplicationLimit(userId, userApplications);
      
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
    console.log(`🔍 checkEntryApplicationLimit - Total apps: ${applications.length}, Current month: ${currentMonth.toISOString()}`);
    
    const entryAppsThisMonth = applications.filter(app => 
      app.type === 'entry' && 
      new Date(app.createdAt) >= currentMonth
    );

    console.log(`📝 Entry apps this month: ${entryAppsThisMonth.length}`);
    entryAppsThisMonth.forEach((app, index) => {
      console.log(`  ${index + 1}. ID: ${app.id}, Created: ${app.createdAt}, Status: ${app.status}`);
    });

    const remainingCount = this.limits.entryApplicationsPerMonth - entryAppsThisMonth.length;
    console.log(`🎯 Remaining count: ${remainingCount} (limit: ${this.limits.entryApplicationsPerMonth})`);

    if (remainingCount <= 0) {
      console.log(`❌ Limit reached!`);
      return { 
        allowed: false, 
        reason: `Entry application limit reached (${this.limits.entryApplicationsPerMonth}/month)`,
        remainingCount: 0
      };
    }

    console.log(`✅ Limit available!`);
    return { 
      allowed: true, 
      remainingCount 
    };
  }

  /**
   * Check leave application limits and business rules
   */
  private async checkLeaveApplicationLimit(
    applications: Application[], 
    currentMonth: Date,
    userId: number,
    leaveData?: any
  ): Promise<ApplicationRestriction> {
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

    // Проверяем пересечения с существующими отпусками
    if (leaveData) {
      const overlapCheck = await this.checkLeaveOverlap(userId, leaveData);
      if (!overlapCheck.allowed) {
        return overlapCheck;
      }
    }

    // Проверяем минимальный срок подачи для отпуска (2 недели)
    if (leaveData && leaveData.leaveType === 'vacation') {
      const minAdvanceCheck = this.checkMinimumAdvanceNotice(leaveData.startDate);
      if (!minAdvanceCheck.allowed) {
        return minAdvanceCheck;
      }
    }

    // Проверяем максимальную продолжительность отпуска
    if (leaveData) {
      const maxDurationCheck = this.checkMaximumLeaveDuration(leaveData);
      if (!maxDurationCheck.allowed) {
        return maxDurationCheck;
      }
    }

    return { 
      allowed: true, 
      remainingCount 
    };
  }

  /**
   * Check for overlapping leave periods
   */
  private async checkLeaveOverlap(userId: number, leaveData: any): Promise<ApplicationRestriction> {
    const startDate = new Date(leaveData.startDate);
    const endDate = new Date(leaveData.endDate);

    // Получаем все активные и одобренные отпуска пользователя
    const userApplications = await this.storage.getApplicationsByUser(userId);
    const activeLeaves = userApplications.filter(app => 
      app.type === 'leave' && 
      (app.status === 'approved' || app.status === 'pending')
    );

    for (const existingLeave of activeLeaves) {
      const existingData = existingLeave.data as any;
      const existingStart = new Date(existingData.startDate);
      const existingEnd = new Date(existingData.endDate);

      // Проверяем пересечение периодов
      if (
        (startDate <= existingEnd && endDate >= existingStart) ||
        (existingStart <= endDate && existingEnd >= startDate)
      ) {
        return {
          allowed: false,
          reason: `Leave period overlaps with existing leave (${existingStart.toLocaleDateString()} - ${existingEnd.toLocaleDateString()})`
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Check minimum advance notice for vacation leave (5 days)
   */
  private checkMinimumAdvanceNotice(startDate: string): ApplicationRestriction {
    const start = new Date(startDate);
    const now = new Date();
    const minAdvanceDays = 5; // 5 дней
    const daysUntilStart = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilStart < minAdvanceDays) {
      return {
        allowed: false,
        reason: `Vacation leave must be requested at least ${minAdvanceDays} days in advance. Current advance notice: ${daysUntilStart} days`
      };
    }

    return { allowed: true };
  }

  /**
   * Check maximum leave duration
   */
  private checkMaximumLeaveDuration(leaveData: any): ApplicationRestriction {
    const startDate = new Date(leaveData.startDate);
    const endDate = new Date(leaveData.endDate);
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const maxDurations: Record<string, number> = {
      vacation: 30, // 30 дней для отпуска
      sick: 14, // 14 дней для больничного
      personal: 7, // 7 дней для личного
      emergency: 3, // 3 дня для экстренного
      medical: 90, // 90 дней для медицинского
      maternity: 365, // 365 дней для декретного
      bereavement: 7 // 7 дней для траура
    };

    const maxDuration = maxDurations[leaveData.leaveType] || 30;

    if (durationDays > maxDuration) {
      return {
        allowed: false,
        reason: `Maximum duration for ${leaveData.leaveType} leave is ${maxDuration} days. Requested: ${durationDays} days`
      };
    }

    return { allowed: true };
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
    // Исправляем расчет текущего месяца с учетом часового пояса
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
    
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
   * Get leave statistics for a user
   */
  async getUserLeaveStats(userId: number): Promise<{
    currentYear: {
      totalDays: number;
      usedDays: number;
      remainingDays: number;
      leaveTypes: Record<string, number>;
    };
    activeLeave?: {
      id: number;
      type: string;
      startDate: string;
      endDate: string;
      daysRemaining: number;
    };
    upcomingLeaves: Array<{
      id: number;
      type: string;
      startDate: string;
      endDate: string;
      daysUntilStart: number;
    }>;
  }> {
    const now = new Date();
    const currentYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    
    const userApplications = await this.storage.getApplicationsByUser(userId);
    const leaveApplications = userApplications.filter(app => app.type === 'leave');

    // Статистика за текущий год
    const thisYearLeaves = leaveApplications.filter(app => 
      new Date(app.createdAt) >= currentYear && app.status === 'approved'
    );

    let totalDays = 0;
    let usedDays = 0;
    const leaveTypes: Record<string, number> = {};

    for (const leave of thisYearLeaves) {
      const data = leave.data as any;
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      totalDays += days;
      leaveTypes[data.leaveType] = (leaveTypes[data.leaveType] || 0) + days;

      // Если отпуск уже завершен, считаем использованным
      if (endDate < now) {
        usedDays += days;
      }
    }

    // Активный отпуск
    const activeLeave = leaveApplications.find(app => {
      if (app.status !== 'approved') return false;
      const data = app.data as any;
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      return now >= startDate && now <= endDate;
    });

    let activeLeaveInfo = undefined;
    if (activeLeave) {
      const data = activeLeave.data as any;
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      activeLeaveInfo = {
        id: activeLeave.id,
        type: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        daysRemaining
      };
    }

    // Предстоящие отпуска
    const upcomingLeaves = leaveApplications
      .filter(app => {
        if (app.status !== 'approved') return false;
        const data = app.data as any;
        const startDate = new Date(data.startDate);
        return startDate > now;
      })
      .map(app => {
        const data = app.data as any;
        const startDate = new Date(data.startDate);
        const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: app.id,
          type: data.leaveType,
          startDate: data.startDate,
          endDate: data.endDate,
          daysUntilStart
        };
      })
      .sort((a, b) => a.daysUntilStart - b.daysUntilStart);

    return {
      currentYear: {
        totalDays: 30, // Стандартный лимит отпусков в год
        usedDays,
        remainingDays: 30 - usedDays,
        leaveTypes
      },
      activeLeave: activeLeaveInfo,
      upcomingLeaves
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

    // Prepare new status history entry
    const statusHistory = Array.isArray(application.statusHistory) ? [...application.statusHistory] : [];
    statusHistory.push({
      status: newStatus,
      date: new Date().toISOString(),
      comment: comment || '',
      reviewerId
    });

    // Update application
    const updatedApplication = await this.storage.updateApplication(applicationId, {
      status: newStatus,
      reviewerId,
      reviewComment: comment,
      statusHistory,
      updatedAt: new Date()
    });

    // Create notification for applicant
    if (updatedApplication) {
      await this.createApplicationNotification(updatedApplication, newStatus);
    }

    return updatedApplication ?? null;
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

  /**
   * Check joint application limits (max 1 active joint position)
   */
  private async checkJointApplicationLimit(
    userId: number,
    applications: Application[]
  ): Promise<ApplicationRestriction> {
    // Check if user already has an active joint position
    const user = await this.storage.getUser(userId);
    if (!user) {
      return { allowed: false, reason: "User not found" };
    }

    // Check if user already has a secondary department assigned
    if (user.secondaryDepartmentId) {
      return { 
        allowed: false, 
        reason: "You already have an active joint position. Please remove it before applying for a new one." 
      };
    }

    // Check for pending joint applications
    const pendingJointApps = applications.filter(app => 
      (app.type === 'joint_primary' || app.type === 'joint_secondary') && 
      app.status === 'pending'
    );

    if (pendingJointApps.length > 0) {
      return { 
        allowed: false, 
        reason: "You already have a pending joint application. Please wait for it to be processed." 
      };
    }

    // Check for recent rejected joint applications (7-day cooldown)
    const recentRejectedJoint = applications
      .filter(app => 
        (app.type === 'joint_primary' || app.type === 'joint_secondary') && 
        app.status === 'rejected'
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      [0];

    if (recentRejectedJoint) {
      const lastRejectionDate = new Date(recentRejectedJoint.createdAt);
      const cooldownEndDate = new Date(lastRejectionDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
      const now = new Date();

      if (now < cooldownEndDate) {
        return {
          allowed: false,
          reason: `Joint application cooldown active. Next application allowed after ${cooldownEndDate.toLocaleDateString()}`,
          cooldownEndsAt: cooldownEndDate
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Get active joint positions for a user
   */
  async getActiveJointPositions(userId: number): Promise<any[]> {
    const user = await this.storage.getUser(userId);
    if (!user || !user.secondaryDepartmentId) {
      return [];
    }

    // Get the secondary department info
    const secondaryDepartment = await this.storage.getDepartment(user.secondaryDepartmentId);
    if (!secondaryDepartment) {
      return [];
    }

    // Get the joint application that was approved
    const jointApplications = await this.storage.getApplicationsByUser(userId);
    const approvedJointApp = jointApplications.find(app => 
      (app.type === 'joint_primary' || app.type === 'joint_secondary') && 
      app.status === 'approved'
    );

    return [{
      id: user.id,
      userId: user.id,
      primaryDepartmentId: user.departmentId,
      secondaryDepartmentId: user.secondaryDepartmentId,
      secondaryDepartment: secondaryDepartment,
      type: approvedJointApp?.type || 'joint_secondary',
      status: 'active',
      approvedAt: approvedJointApp?.updatedAt,
      reason: (approvedJointApp?.data as any)?.reason || ''
    }];
  }

  /**
   * Process joint application approval/rejection
   */
  async processJointApplication(
    applicationId: number, 
    approved: boolean, 
    reviewerId: number,
    comment?: string
  ): Promise<void> {
    const application = await this.storage.getApplication(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    if (approved) {
      // Update user's secondary department
      const secondaryDepartmentId = (application.data as any)?.secondaryDepartmentId;
      if (!secondaryDepartmentId) {
        throw new Error('Secondary department not specified in application');
      }

      await this.storage.updateUser(application.authorId, {
        secondaryDepartmentId: secondaryDepartmentId
      });

      // Create notification
      await this.storage.createNotification({
        recipientId: application.authorId,
        content: `Your joint position application has been approved! You can now work in ${(application.data as any)?.secondaryDepartmentName || 'the selected department'}.`,
        link: '/joint-positions',
        isRead: false
      });
    } else {
      // Create rejection notification
      await this.storage.createNotification({
        recipientId: application.authorId,
        content: `Your joint position application has been rejected. ${comment ? `Reason: ${comment}` : ''}`,
        link: '/applications',
        isRead: false
      });
    }

    // Update application status
    await this.advanceApplicationStatus(
      applicationId,
      approved ? 'approved' : 'rejected',
      reviewerId,
      comment
    );
  }

  /**
   * Remove joint position
   */
  async removeJointPosition(userId: number, reason?: string): Promise<void> {
    const user = await this.storage.getUser(userId);
    if (!user || !user.secondaryDepartmentId) {
      throw new Error('No active joint position found');
    }

    // Clear secondary department
    await this.storage.updateUser(userId, {
      secondaryDepartmentId: null
    });

    // Create notification
    await this.storage.createNotification({
      recipientId: userId,
      content: `Your joint position has been removed. ${reason ? `Reason: ${reason}` : ''}`,
      link: '/joint-positions',
      isRead: false
    });
  }
}