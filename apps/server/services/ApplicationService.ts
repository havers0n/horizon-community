// apps/server/services/ApplicationService.ts

// ШАГ 1: Правильные импорты
import { SupabaseClient } from '@supabase/supabase-js';
// ПРАВИЛО: Все типы импортируются напрямую из db-types
import {
  Database,
  Applications,
  ApplicationsInsert,
  ApplicationsUpdate,
  CharacterCareerHistoryInsert,
  Profiles,
  Departments,
  Ranks,
  Divisions,
  Units
} from 'db-types';
import { createSupabaseClient } from '../lib/supabase';
import { AppError } from '../utils/AppError';
import NotificationService from './NotificationService';

// ===== ТИПЫ ДЛЯ БИЗНЕС-ЛОГИКИ =====

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

class ApplicationService {
  // ШАГ 2: Один клиент для всех операций
  private supabase: SupabaseClient<Database>;
  private notificationService: typeof NotificationService;
  private limits: ApplicationLimits = {
    entryApplicationsPerMonth: 3,
    leaveApplicationsPerMonth: 2,
    promotionQualificationCooldownDays: 7
  };

  constructor(notificationService: typeof NotificationService) {
    this.supabase = createSupabaseClient();
    this.notificationService = notificationService;
  }

  // ===========================================
  // ОСНОВНЫЕ ОПЕРАЦИИ (CRUD)
  // ===========================================

  public async createApplication(data: ApplicationsInsert): Promise<Applications> {
    const { data: application, error } = await this.supabase
      .from('applications')
      .insert(data)
      .select()
      .single();

    if (error || !application) {
      console.error('[ApplicationService] Error creating application:', error);
      throw new AppError('Не удалось создать заявку.', 500);
    }
    return application;
  }

  public async getApplicationById(id: string): Promise<Applications | null> {
    const { data: application, error } = await this.supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error(`[ApplicationService] Error getting application ${id}:`, error);
      throw new AppError('Ошибка при получении заявки.', 500);
    }
    return application;
  }
  
  public async getApplicationsByUser(userId: string): Promise<Applications[]> {
    const { data, error } = await this.supabase
      .from('applications')
      .select('*')
      .eq('author_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
        console.error(`[ApplicationService] Error getting applications for user ${userId}:`, error);
        throw new AppError('Ошибка при получении заявок пользователя.', 500);
    }
    return data || [];
  }

  public async getAllApplications(): Promise<Applications[]> {
    const { data: applications, error } = await this.supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ApplicationService] Error getting all applications:', error);
      throw new AppError('Ошибка при получении всех заявок.', 500);
    }
    return applications || [];
  }

  public async getApplicationsByDepartment(departmentId: string): Promise<Applications[]> {
    const { data: applications, error } = await this.supabase
      .from('applications')
      .select('*')
      .eq('data->department_id', departmentId) // Запрос к полю JSONB
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`[ApplicationService] Error getting applications for department ${departmentId}:`, error);
      throw new AppError('Ошибка при получении заявок департамента.', 500);
    }
    return applications || [];
  }

  public async getApplicationsByStatus(status: Applications['status']): Promise<Applications[]> {
    const { data: applications, error } = await this.supabase
      .from('applications')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`[ApplicationService] Error getting applications by status ${status}:`, error);
      throw new AppError('Ошибка при получении заявок по статусу.', 500);
    }
    return applications || [];
  }

  public async updateApplication(id: string, data: ApplicationsUpdate): Promise<Applications> {
    const { data: application, error } = await this.supabase
      .from('applications')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error || !application) {
      console.error(`[ApplicationService] Error updating application ${id}:`, error);
      throw new AppError('Не удалось обновить заявку.', 500);
    }
    return application;
  }
  
  public async deleteApplication(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`[ApplicationService] Error deleting application ${id}:`, error);
      throw new AppError('Не удалось удалить заявку.', 500);
    }
  }

  // ===========================================
  // БИЗНЕС-ЛОГИКА ПРОВЕРОК
  // ===========================================

  public async canSubmitApplication(
    userId: string, 
    applicationType: Applications['type']
  ): Promise<ApplicationRestriction> {
    // Получаем пользователя из таблицы 'profiles' (схема 'public')
    const { data: user, error: userError } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return { allowed: false, reason: "Пользователь не найден" };
    }
    
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const userApplications = await this.getApplicationsByUser(userId);

    switch (applicationType) {
      case 'entry':
        return this.checkEntryApplicationLimit(userApplications, currentMonth);
      case 'leave':
        return this.checkLeaveApplicationLimit(userApplications, currentMonth);
      case 'promotion':
      case 'qualification':
        return this.checkPromotionQualificationCooldown(userApplications, now);
      case 'joint_primary':
      case 'joint_secondary':
        return this.checkJointApplicationLimit(userApplications);
      default:
        return { allowed: true };
    }
  }

  private checkEntryApplicationLimit(apps: Applications[], currentMonth: Date): ApplicationRestriction {
    const count = apps.filter(app => 
        app.type === 'entry' && new Date(app.created_at) >= currentMonth
    ).length;

    const remaining = this.limits.entryApplicationsPerMonth - count;
    if (remaining <= 0) {
      return { 
        allowed: false, 
        reason: `Лимит заявок на вступление достигнут (${this.limits.entryApplicationsPerMonth}/мес).`,
        remainingCount: 0
      };
    }
    return { allowed: true, remainingCount: remaining };
  }

  private checkLeaveApplicationLimit(apps: Applications[], currentMonth: Date): ApplicationRestriction {
    const count = apps.filter(app => 
        app.type === 'leave' && new Date(app.created_at) >= currentMonth
    ).length;

    const remaining = this.limits.leaveApplicationsPerMonth - count;
    if (remaining <= 0) {
      return { 
        allowed: false, 
        reason: `Лимит заявок на отпуск достигнут (${this.limits.leaveApplicationsPerMonth}/мес).`,
        remainingCount: 0
      };
    }
    return { allowed: true, remainingCount: remaining };
  }

  private checkPromotionQualificationCooldown(apps: Applications[], now: Date): ApplicationRestriction {
    const recentApp = apps
      .filter(app => app.type === 'promotion' || app.type === 'qualification')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    if (recentApp) {
      const lastAppDate = new Date(recentApp.created_at);
      const cooldownEndDate = new Date(lastAppDate.getTime() + 
        (this.limits.promotionQualificationCooldownDays * 24 * 60 * 60 * 1000));

      if (now < cooldownEndDate) {
        return {
          allowed: false,
          reason: `Перерыв между заявками. Следующая возможна после ${cooldownEndDate.toLocaleDateString()}`,
          cooldownEndsAt: cooldownEndDate
        };
      }
    }
    return { allowed: true };
  }

  private checkJointApplicationLimit(apps: Applications[]): ApplicationRestriction {
    const pendingJointApp = apps.find(app => 
      (app.type === 'joint_primary' || app.type === 'joint_secondary') && app.status === 'pending'
    );

    if (pendingJointApp) {
      return { 
        allowed: false, 
        reason: "У вас уже есть активная заявка на совмещение. Дождитесь её рассмотрения." 
      };
    }
    return { allowed: true };
  }

  // ===========================================
  // БИЗНЕС-ЛОГИКА ДЕЙСТВИЙ
  // ===========================================

  public async submitApplication(data: ApplicationsInsert): Promise<Applications> {
    const { data: existingApplications, error: existingError } = await this.supabase
      .from('applications')
      .select('id')
      .eq('author_user_id', data.author_user_id)
      .in('status', ['pending', 'under_review']);

    if (existingError) {
      throw new AppError('Ошибка проверки существующих заявок.', 500);
    }
    if (existingApplications && existingApplications.length > 0) {
      throw new AppError('У вас уже есть активная заявка. Пожалуйста, дождитесь её рассмотрения.', 400);
    }
    
    // Проверяем, что связанные сущности существуют в схеме 'common'
    const appData = data.data as any;
    if (appData?.department_id) {
        const { error } = await this.supabase.from('departments').select('id').eq('id', appData.department_id).single();
        if(error) throw new AppError('Указанный департамент не найден.', 400);
    }
    if (appData?.rank_id) {
        const { error } = await this.supabase.from('ranks').select('id').eq('id', appData.rank_id).single();
        if(error) throw new AppError('Указанный ранг не найден.', 400);
    }
    
    return this.createApplication(data);
  }

  public async reviewApplication(
    id: string,
    status: 'approved' | 'rejected',
    reviewedByCharacterId: string,
    reason?: string
  ): Promise<Applications> {
    const application = await this.getApplicationById(id);
    if (!application) throw new AppError('Заявка не найдена.', 404);

    if (application.status !== 'pending' && application.status !== 'under_review') {
        throw new AppError(`Невозможно изменить статус заявки. Текущий статус: ${application.status}`, 400);
    }

    const updatedApplication = await this.updateApplication(id, {
      status,
      reviewer_character_id: reviewedByCharacterId,
      review_comment: reason,
      updated_at: new Date().toISOString(),
    });

    if (status === 'approved' && application.type === 'entry') {
        await this.createCareerFromApplication(application);
    }

    await this.notificationService.createNotification({
      recipient_user_id: application.author_user_id,
      content: `Статус вашей заявки #${id.slice(0, 8)} обновлен: ${status === 'approved' ? 'Одобрена' : 'Отклонена'}.`,
      link: `/applications/${id}`,
    });

    return updatedApplication;
  }

  private async createCareerFromApplication(application: Applications): Promise<void> {
    const appData = application.data as any;
    if (!appData?.department_id || !appData?.rank_id) {
        console.warn(`[ApplicationService] Application ${application.id} is approved but missing department/rank data.`);
        return;
    }

    const careerData: CharacterCareerHistoryInsert = {
      character_id: application.author_character_id,
      action_type: 'hire',
      department_id: appData.department_id,
      rank_id: appData.rank_id,
      division_id: appData.division_id, // Может быть null
      unit_id: appData.unit_id, // Может быть null
      effective_date: new Date().toISOString(),
      reason: `По одобренной заявке #${application.id.slice(0, 8)}`,
    };

    // Обращаемся к таблице 'character_career_history' из схемы 'common'
    const { error } = await this.supabase.from('character_career_history').insert(careerData);
    if (error) {
      console.error(`[ApplicationService] Failed to create career history for application ${application.id}:`, error);
      // Не бросаем ошибку, чтобы не откатывать весь процесс ревью, но логируем проблему.
    }
  }

  // ===========================================
  // МЕТОДЫ ДЛЯ ПОЛУЧЕНИЯ ДЕТАЛЬНОЙ ИНФОРМАЦИИ
  // ===========================================
  
  public async getApplicationsWithDetails(): Promise<(Applications & {
    user: Profiles | null;
    department: Departments | null;
    rank: Ranks | null;
    division?: Divisions | null;
    unit?: Units | null;
  })[]> {
    const applications = await this.getAllApplications();
    const userIds = [...new Set(applications.map(app => app.author_user_id))];
    const departmentIds = [...new Set(applications.map(app => (app.data as any)?.department_id).filter(Boolean))];
    const rankIds = [...new Set(applications.map(app => (app.data as any)?.rank_id).filter(Boolean))];

    const [usersRes, departmentsRes, ranksRes] = await Promise.all([
        this.supabase.from('profiles').select('*').in('id', userIds),
        this.supabase.from('departments').select('*').in('id', departmentIds),
        this.supabase.from('ranks').select('*').in('id', rankIds)
    ]);

    const usersMap = new Map(usersRes.data?.map(u => [u.id, u]));
    const departmentsMap = new Map(departmentsRes.data?.map(d => [d.id, d]));
    const ranksMap = new Map(ranksRes.data?.map(r => [r.id, r]));

    return applications.map(app => {
      const appData = app.data as any;
      return {
        ...app,
        user: usersMap.get(app.author_user_id) || null,
        department: departmentsMap.get(appData?.department_id) || null,
        rank: ranksMap.get(appData?.rank_id) || null,
        // division и unit можно подгружать аналогично при необходимости
      };
    });
  }

  public async getApplicationWithDetails(id: string): Promise<(Applications & {
    user: Profiles | null;
    department: Departments | null;
    rank: Ranks | null;
    division?: Divisions | null;
    unit?: Units | null;
  }) | null> {
    const application = await this.getApplicationById(id);
    if (!application) return null;

    const appData = application.data as any;

    const [userRes, departmentRes, rankRes, divisionRes, unitRes] = await Promise.all([
        this.supabase.from('profiles').select('*').eq('id', application.author_user_id).single(),
        appData?.department_id ? this.supabase.from('departments').select('*').eq('id', appData.department_id).single() : Promise.resolve({data: null}),
        appData?.rank_id ? this.supabase.from('ranks').select('*').eq('id', appData.rank_id).single() : Promise.resolve({data: null}),
        appData?.division_id ? this.supabase.from('divisions').select('*').eq('id', appData.division_id).single() : Promise.resolve({data: null}),
        appData?.unit_id ? this.supabase.from('units').select('*').eq('id', appData.unit_id).single() : Promise.resolve({data: null})
    ]);

    return {
      ...application,
      user: userRes.data,
      department: departmentRes.data,
      rank: rankRes.data,
      division: divisionRes.data,
      unit: unitRes.data
    };
  }

  // ===========================================
  // СТАТИСТИКА
  // ===========================================

  public async getApplicationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    underReview: number;
  }> {
    const { data, error } = await this.supabase
      .from('applications')
      .select('status');

    if (error || !data) {
        throw new AppError('Ошибка при получении статистики заявок.', 500);
    }
    
    return {
      total: data.length,
      pending: data.filter(app => app.status === 'pending').length,
      approved: data.filter(app => app.status === 'approved').length,
      rejected: data.filter(app => app.status === 'rejected').length,
      underReview: data.filter(app => app.status === 'under_review').length
    };
  }
}

// ШАГ 3: Правильный экспорт экземпляра
const applicationService = new ApplicationService(NotificationService);
export default applicationService;