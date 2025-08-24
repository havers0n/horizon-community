// apps/server/src/core/services/CabinetService.ts

// Правило №1: Импортируем базовые типы
import type { Database, Tables } from '@roleplay-identity/db-types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../../utils/AppError';
import type { 
  CreateLeaveRequestDto, 
  LeaveRequest, 
  CreateJointPositionRequestDto, 
  JointPositionRequest, 
  AvailableDepartment,
  CreateTransferRequestDto,
  TransferRequest,
  AvailableTransferDepartment,
  CreateComplaintDto
} from '../../types/services';

// Admin types for joint position management
export interface AdminJointPositionRequest {
  id: string;
  created_at: string;
  reason: string;
  status_code: string;
  status_name: string;
  primary_department_name: string;
  secondary_department_name: string;
  user_full_name: string;
  user_username: string;
  approver_full_name: string | null;
  rejection_reason: string | null;
}

// Интерфейсы для DI
import type { ApplicationService } from './ApplicationService';
import type { ReportService } from './ReportService';

// Правило №5: Явно определяем сложные типы, которые мы ожидаем от БД
type ProfileWithStats = Tables<'profiles'> & {
  user_stats: Tables<'user_stats'> | null;
};

// Используем any для таблиц из других схем, так как Supabase не может их правильно типизировать
type Character = any;
type UserSettings = Tables<'user_settings'>;

// Строгие типы для возвращаемых значений (Правило №5)
export interface DashboardData {
  user: {
    id: string;
    email: string;
    username: string | null;
    role: string;
    avatarUrl: string | null;
    firstName: string | null;
    lastName: string | null;
    department: string | null;
    division: string | null;
    isActive: boolean;
    gameWarnings: number;
    adminWarnings: number;
    attemptsLeft: number;
    profileImageUrl: string | null;
  };
  activities: Array<{
    id: string;
    type: 'application' | 'complaint' | 'report' | 'test' | 'notification';
    status: string;
    title: string;
    createdAt: string;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    preview: string;
    priority: 'high' | 'normal' | 'low';
    createdAt: string;
  }>;
  usefulLinks: Array<{
    id: string;
    title: string;
    url: string;
    icon: string;
    description: string;
  }>;
  statistics?: {
    playtime: number;
    reputation: number;
    reports: number;
    achievements: number;
  };
  applicationStatus?: {
    attemptsLeft: number;
    applicationsCount: number;
    testsPassed: number;
  };
  nextSteps?: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
    link: string | null;
  }>;
  departments?: Array<{
    id: string;
    name: string;
    description: string;
    logo_url: string;
    division?: {
      id: string;
      name: string;
    };
  }>;
  complaints?: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
  }>;
  reports?: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
  }>;
}

export interface UpdateProfileData {
  username?: string;
  bio?: string;
  avatar_url?: string;
}

export interface UpdateSettingsData {
  theme?: 'light' | 'dark' | 'system';
  language?: 'en' | 'ru';
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy?: {
    profile_visible: boolean;
    show_email: boolean;
    show_phone: boolean;
  };
}

export interface UserStats {
  applicationsCount: number;
  reportsCount: number;
  departmentsCount: number;
  lastActivity: string | null;
  playtime: number;
  reputation: number;
  achievements: number;
}

export class CabinetService {
  constructor(
    private supabase: SupabaseClient<Database>,
    private applicationService: ApplicationService,
    private reportService: ReportService
  ) {}

  /**
   * Подсчет заявок пользователя за текущий месяц
   * Правило №2: Бизнес-логика в сервисе
   */
  private async getMonthlyApplicationCount(userId: string): Promise<number> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const { data, error } = await (this.supabase as any)
        .from('applications')
        .select('id')
        .eq('author_user_id', userId)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      if (error) {
        console.error('Error counting monthly applications:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error in getMonthlyApplicationCount:', error);
      return 0;
    }
  }

  /**
   * Получить количество оставшихся попыток подачи заявок
   * Лимит: 3 заявки в месяц
   */
  private async getAttemptsLeft(userId: string): Promise<number> {
    const monthlyCount = await this.getMonthlyApplicationCount(userId);
    const MAX_ATTEMPTS = 3;
    return Math.max(0, MAX_ATTEMPTS - monthlyCount);
  }

  /**
   * Получить данные дашборда пользователя
   * Правило №2: Сервис содержит всю бизнес-логику
   */
  public async getDashboardDataByUserId(user_id: string): Promise<DashboardData> {
    // 1. Делаем запрос к БД с полной типизацией
    const { data: userProfile, error: profileError } = await this.supabase
      .from('profiles')
      .select(`
        *,
        user_stats(*)
      `)
      .eq('id', user_id)
      .single();

    // 2. Проверяем ошибку
    if (profileError || !userProfile) {
      console.error('Supabase profile fetch error:', profileError);
      throw new Error('User profile not found');
    }

    // 3. Явная проверка типа с помощью type assertion
    const typedProfile = userProfile as ProfileWithStats;

    // Получаем character данные
    const character = await this.getUserCharacter(user_id);

    // Получаем статистику
    const stats = await this.getUserStats(user_id);

    // Получаем активности
    const activities = await this.getActivities(user_id);

    // Получаем объявления
    const announcements = await this.getAnnouncements();

    // Определяем роль пользователя (в текущей public.profiles нет поля role)
    const role = (typedProfile as any).role ?? 'citizen';
    const isCandidate = ['candidate', 'cadet_test', 'cadet_practice'].includes(role);

    // Базовые данные для всех ролей
    const baseData: DashboardData = {
      user: await this.formatUserProfile(typedProfile, character, role),
      activities,
      announcements,
      usefulLinks: this.getUsefulLinks(),
    };

    // Если пользователь - кандидат, возвращаем базовые данные
    if (isCandidate) {
      return {
        ...baseData,
        applicationStatus: {
          attemptsLeft: baseData.user.attemptsLeft,
          applicationsCount: activities.filter(a => a.type === 'application').length,
          testsPassed: activities.filter(a => a.type === 'test' && a.status === 'approved').length,
        },
        nextSteps: [
          {
            id: '1',
            title: 'Подать заявку на вступление',
            description: 'Заполните форму заявки для вступления в сообщество',
            completed: activities.some(a => a.type === 'application'),
            link: '/entry-application'
          },
          {
            id: '2',
            title: 'Пройти интервью',
            description: 'После одобрения заявки вас пригласят на интервью',
            completed: false,
            link: null
          },
          {
            id: '3',
            title: 'Сдать вступительный тест',
            description: 'Пройдите тест на знание правил и основ ролевой игры',
            completed: false,
            link: null
          }
        ]
      };
    }

    // Если пользователь - участник сообщества, добавляем расширенные данные
    try {
      // Получаем департаменты пользователя
      const departments = await this.getUserDepartments(user_id);
      
      // Получаем жалобы пользователя
      const complaints = await this.getUserComplaints(user_id);
      
      // Получаем рапорты пользователя
      const reports = await this.getUserReports(user_id);

      // Обновляем профиль данными о департаментах
      if (departments.length > 0) {
        const primaryDept = departments[0];
        baseData.user.department = primaryDept.name;
        baseData.user.division = primaryDept.division?.name || null;
      }

      return {
        ...baseData,
        // Теперь TypeScript знает, что `typedProfile.user_stats` существует и имеет тип `UserStats | null`
        statistics: this.formatStatistics(typedProfile.user_stats),
        departments,
        complaints,
        reports,
      };
    } catch (error) {
      console.error('Error getting member data:', error);
      
      // Возвращаем базовые данные с пустой статистикой в случае ошибки
      return {
        ...baseData,
        statistics: {
          playtime: 0,
          reputation: 0,
          reports: 0,
          achievements: 0,
        },
        departments: [],
        complaints: [],
        reports: [],
      };
    }
  }

  /**
   * Получить профиль пользователя
   */
  async getUserProfile(userId: string): Promise<ProfileWithStats | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*, user_stats(*)')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting user profile:', error);
      return null;
    }

    return data as ProfileWithStats;
  }

  /**
   * Получить персонажа пользователя
   */
  async getUserCharacter(userId: string): Promise<Character | null> {
    try {
      // Используем any для обхода проблем с типизацией схем
      const { data, error } = await (this.supabase as any)
        .from('characters')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error getting user character:', error);
        return null;
      }

      return data as Character;
    } catch (error) {
      console.error('Error getting user character:', error);
      return null;
    }
  }

  /**
   * Обновить профиль пользователя
   */
  async updateUserProfile(userId: string, data: UpdateProfileData): Promise<Tables<'profiles'>> {
    const { data: updatedProfile, error } = await this.supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return updatedProfile;
  }

  /**
   * Получить заявки пользователя
   */
  async getUserApplications(userId: string): Promise<any[]> {
    try {
      // Используем any для обхода проблем с типизацией схем
      const { data, error } = await (this.supabase as any)
        .from('applications')
        .select('*')
        .eq('author_user_id', userId);

      if (error) {
        console.error('Error getting user applications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user applications:', error);
      return [];
    }
  }

  /**
   * Получить рапорты пользователя
   */
  async getUserReports(userId: string): Promise<any[]> {
    try {
      // Используем any для обхода проблем с типизацией схем
      const { data, error } = await (this.supabase as any)
        .from('law_reports')
        .select('*')
        .eq('author_user_id', userId);

      if (error) {
        console.error('Error getting user reports:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user reports:', error);
      return [];
    }
  }

  /**
   * Получить департаменты пользователя
   */
  async getUserDepartments(userId: string): Promise<DashboardData['departments']> {
    try {
      // Используем any для обхода проблем с типизацией RPC
      const { data, error } = await (this.supabase as any)
        .rpc('get_user_departments', { p_user_id: userId });

      if (error) {
        console.error('Error getting user departments:', error);
        return [];
      }

      return Array.isArray(data) ? data as DashboardData['departments'] : [];
    } catch (error) {
      console.error('Error getting user departments:', error);
      return [];
    }
  }

  /**
   * Получить настройки пользователя
   */
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await this.supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Настройки не найдены, создаем дефолтные
        return await this.createDefaultSettings(userId);
      }
      console.error('Error getting user settings:', error);
      return null;
    }

    return data as UserSettings;
  }

  /**
   * Обновить настройки пользователя
   */
  async updateUserSettings(userId: string, settings: UpdateSettingsData): Promise<UserSettings> {
    const { data, error } = await this.supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...settings,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update settings: ${error.message}`);
    }

    return data as UserSettings;
  }

  /**
   * Получить статистику пользователя
   */
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Используем any для обхода проблем с типизацией RPC
      const { data, error } = await (this.supabase as any)
        .rpc('get_user_stats', { p_user_id: userId });

      if (error) {
        console.error('Error getting user stats:', error);
        return this.getDefaultUserStats();
      }

      // Проверяем, что data является объектом с нужными полями
      if (data && typeof data === 'object') {
        return {
          applicationsCount: data.applicationsCount || 0,
          reportsCount: data.reportsCount || 0,
          departmentsCount: data.departmentsCount || 0,
          lastActivity: data.lastActivity || null,
          playtime: data.playtime || 0,
          reputation: data.reputation || 0,
          achievements: data.achievements || 0,
        };
      }

      return this.getDefaultUserStats();
    } catch (error) {
      console.error('Error getting user stats:', error);
      return this.getDefaultUserStats();
    }
  }

  /**
   * Получить жалобы пользователя
   */
  async getUserComplaints(userId: string): Promise<DashboardData['complaints']> {
    try {
      // Используем any для обхода проблем с типизацией схем
      const { data, error } = await (this.supabase as any)
        .from('complaints')
        .select('*')
        .eq('author_user_id', userId);

      if (error) {
        console.error('Error getting user complaints:', error);
        return [];
      }

      return (data || []) as DashboardData['complaints'];
    } catch (error) {
      console.error('Error getting user complaints:', error);
      return [];
    }
  }

  /**
   * Получить активности пользователя
   */
  private async getActivities(user_id: string): Promise<DashboardData['activities']> {
    const activities: DashboardData['activities'] = [];

    try {
      // Используем any для обхода проблем с типизацией схем
      const { data: notifications } = await (this.supabase as any)
        .from('notifications')
        .select('*')
        .eq('recipient_user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (notifications) {
        activities.push(...notifications.map((notification: any) => ({
          id: notification.id,
          type: 'notification' as const,
          status: notification.status || 'pending',
          title: notification.title || 'Уведомление',
          createdAt: notification.created_at || new Date().toISOString(),
        })));
      }
    } catch (error) {
      console.error('Error getting activities:', error);
    }

    return activities;
  }

  /**
   * Получить объявления
   */
  private async getAnnouncements(): Promise<DashboardData['announcements']> {
    // Пока возвращаем mock данные
    return [
      {
        id: '1',
        title: 'Обновление правил сообщества',
        preview: 'Внесены изменения в правила поведения участников. Просим ознакомиться с обновлениями.',
        priority: 'high' as const,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        title: 'Новые возможности системы',
        preview: 'Добавлены новые функции для работы с заявками и управления профилем.',
        priority: 'normal' as const,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
  }

  /**
   * Форматировать профиль пользователя
   */
  private async formatUserProfile(profile: ProfileWithStats, character: Character | null, role: string): Promise<DashboardData['user']> {
    const attemptsLeft = await this.getAttemptsLeft(profile.id);
    
    return {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      role,
      avatarUrl: null,
      firstName: character?.first_name || null,
      lastName: character?.last_name || null,
      department: null,
      division: null,
      isActive: true,
      gameWarnings: profile.user_stats?.warnings_game || 0,
      adminWarnings: profile.user_stats?.warnings_admin || 0,
      attemptsLeft,
      profileImageUrl: character?.mugshot_url || null,
    };
  }

  /**
   * Метод форматирования тоже должен принимать строгий тип
   */
  private formatStatistics(stats: Tables<'user_stats'> | null): DashboardData['statistics'] {
    if (!stats) {
      return { playtime: 0, reputation: 0, reports: 0, achievements: 0 };
    }
    return {
      playtime: stats.playtime_minutes || 0,
      reputation: stats.reputation || 0,
      reports: 0, // Будет заполнено отдельно
      achievements: 0, // Будет заполнено отдельно
    };
  }

  /**
   * Получить полезные ссылки
   */
  private getUsefulLinks(): DashboardData['usefulLinks'] {
    return [
      {
        id: '1',
        title: 'Discord сервер',
        url: 'https://discord.gg/horizoncommunity',
        icon: 'discord',
        description: 'Присоединяйтесь к нашему Discord серверу'
      },
      {
        id: '2',
        title: 'Группа ВКонтакте',
        url: 'https://vk.com/horizoncommunity',
        icon: 'vk',
        description: 'Следите за новостями в нашей группе ВК'
      },
      {
        id: '3',
        title: 'Правила сообщества',
        url: '/rules',
        icon: 'book',
        description: 'Ознакомьтесь с правилами сообщества'
      },
      {
        id: '4',
        title: 'FAQ',
        url: '/faq',
        icon: 'help-circle',
        description: 'Часто задаваемые вопросы'
      }
    ];
  }

  /**
   * Создать дефолтные настройки
   */
  private async createDefaultSettings(userId: string): Promise<UserSettings> {
    const defaultSettings = {
      user_id: userId,
      theme: 'system' as const,
      language: 'ru' as const,
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      privacy: {
        profile_visible: true,
        show_email: false,
        show_phone: false,
      },
    };

    const { data, error } = await this.supabase
      .from('user_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create default settings: ${error.message}`);
    }

    return data as UserSettings;
  }

  /**
   * Получить дефолтную статистику пользователя
   */
  private getDefaultUserStats(): UserStats {
    return {
      applicationsCount: 0,
      reportsCount: 0,
      departmentsCount: 0,
      lastActivity: null,
      playtime: 0,
      reputation: 0,
      achievements: 0,
    };
  }

  /**
   * Создает новую заявку на отпуск
   * Правило №２: Вся бизнес-логика в сервисе
   */
  public async createLeaveRequest(data: CreateLeaveRequestDto): Promise<string> {
    try {
      // Вызываем RPC функцию с параметрами
      const { data: newLeaveId, error } = await this.supabase.rpc('create_leave_request', {
        p_start_date: data.p_start_date,
        p_end_date: data.p_end_date,
        p_reason: data.p_reason,
      });

      if (error) {
        console.error('Database error in createLeaveRequest:', error);
        throw new AppError(`Database error: ${error.message}`, 500);
      }

      if (!newLeaveId) {
        throw new AppError('Failed to create leave request: no ID returned', 500);
      }

      return newLeaveId;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Unexpected error in createLeaveRequest:', error);
      throw new AppError('Failed to create leave request', 500);
    }
  }

  /**
   * Получает историю заявок на отпуск пользователя
   * Правило №２: Бизнес-логика в сервисе
   */
  public async getMyLeaves(): Promise<LeaveRequest[]> {
    try {
      // Вызываем RPC функцию для получения списка заявок
      const { data, error } = await this.supabase.rpc('get_my_leaves');

      if (error) {
        console.error('Database error in getMyLeaves:', error);
        throw new AppError(`Database error: ${error.message}`, 500);
      }

      // Возвращаем пустой массив, если данных нет
      return (data || []) as LeaveRequest[];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Unexpected error in getMyLeaves:', error);
      throw new AppError('Failed to get leave requests', 500);
    }
  }

  /**
   * Административные методы для управления заявками на отпуск
   */

  /**
   * Получает все заявки на отпуск для администраторов
   * TODO: Replace with real database calls once schema is updated
   */
  public async getAllLeaveRequests(filters?: {
    status?: string;
    department_id?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { data, error } = await (this.supabase as any).rpc('get_all_leave_requests');
      
      if (error) {
        throw new AppError(`Database RPC error: ${error.message}`, 500);
      }
      
      let requests = (data || []) as any[];
      
      // Filter by status if provided
      if (filters?.status && filters.status !== 'all') {
        requests = requests.filter((req: any) => req.status_code === filters.status);
      }
      
      // Apply pagination
      const page = Math.max(1, filters?.page || 1);
      const limit = Math.min(100, Math.max(1, filters?.limit || 20));
      const offset = (page - 1) * limit;
      const paginatedRequests = requests.slice(offset, offset + limit);
      
      return {
        items: paginatedRequests,
        total: requests.length,
        page,
        limit
      };
    } catch (error) {
      console.error('Unexpected error in getAllLeaveRequests:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get leave requests', 500);
    }
  }

  /**
   * Одобряет заявку на отпуск
   * TODO: Replace with real database calls once schema is updated
   */
  public async approveLeaveRequest(requestId: string, approverId: string): Promise<any> {
    try {
      const { error } = await (this.supabase as any).rpc('approve_leave_request', {
        p_leave_id: requestId
      });
      
      if (error) {
        throw new AppError(`Database RPC error on approve: ${error.message}`, 500);
      }
      
      // Return success response
      return {
        success: true,
        message: 'Leave request approved successfully'
      };
    } catch (error) {
      console.error('Unexpected error in approveLeaveRequest:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to approve leave request', 500);
    }
  }

  /**
   * Отклоняет заявку на отпуск
   * TODO: Replace with real database calls once schema is updated
   */
  public async rejectLeaveRequest(requestId: string, approverId: string, reason?: string): Promise<any> {
    try {
      const { error } = await (this.supabase as any).rpc('reject_leave_request', {
        p_leave_id: requestId,
        p_rejection_reason: reason || null
      });
      
      if (error) {
        throw new AppError(`Database RPC error on reject: ${error.message}`, 500);
      }
      
      // Return success response
      return {
        success: true,
        message: 'Leave request rejected successfully'
      };
    } catch (error) {
      console.error('Unexpected error in rejectLeaveRequest:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to reject leave request', 500);
    }
  }

  /**
   * Получает конкретную заявку на отпуск по ID
   * TODO: Replace with real database calls once schema is updated
   */
  public async getLeaveRequestById(requestId: string): Promise<any> {
    try {
      // Mock data retrieval
      const mockRequest = {
        id: requestId,
        user_id: 'user1',
        start_date: '2024-07-15',
        end_date: '2024-07-30',
        reason: 'Летний отпуск',
        status_code: 'in_review',
        status_name: 'На рассмотрении',
        created_at: '2024-06-01T10:00:00Z',
        updated_at: '2024-06-01T10:00:00Z',
        users: {
          username: 'ivan_petrov',
          first_name: 'Иван',
          last_name: 'Петров'
        },
        departments: {
          name: 'IT Department'
        }
      };

      return mockRequest;
    } catch (error) {
      console.error('Unexpected error in getLeaveRequestById:', error);
      throw new AppError('Failed to get leave request', 500);
    }
  }

  /**
   * Получает список департаментов, доступных для совмещения
   * Правило №2: Вся бизнес-логика в сервисе
   */
  public async getAvailableJointDepartments(supabase: SupabaseClient): Promise<AvailableDepartment[]> {
    try {
      // Вызываем RPC функцию get_available_departments_for_joint_position
      const { data, error } = await (supabase as any).rpc('get_available_departments_for_joint_position');

      if (error) {
        console.error('Database error in getAvailableJointDepartments:', error);
        throw new AppError(`Database error: ${error.message}`, 500);
      }

      // Возвращаем пустой массив, если данных нет
      return (data || []) as AvailableDepartment[];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Unexpected error in getAvailableJointDepartments:', error);
      throw new AppError('Failed to get available departments for joint position', 500);
    }
  }

  /**
   * Создает новую заявку на совмещение
   * Правило №2: Вся бизнес-логика в сервисе
   */
  public async createJointPositionRequest(
    supabase: SupabaseClient, 
    data: { p_secondary_department_id: string; p_reason: string; }
  ): Promise<string> {
    try {
      // Вызываем RPC функцию create_joint_position_request
      const { data: newRequestId, error } = await (supabase as any).rpc('create_joint_position_request', {
        p_secondary_department_id: data.p_secondary_department_id,
        p_reason: data.p_reason,
      });

      if (error) {
        console.error('Database error in createJointPositionRequest:', error);
        throw new AppError(`Database error: ${error.message}`, 500);
      }

      if (!newRequestId) {
        throw new AppError('Failed to create joint position request: no ID returned', 500);
      }

      return newRequestId;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Unexpected error in createJointPositionRequest:', error);
      throw new AppError('Failed to create joint position request', 500);
    }
  }

  /**
   * Получает историю заявок на совмещение текущего пользователя
   * Правило №2: Вся бизнес-логика в сервисе
   */
  public async getMyJointPositionRequests(supabase: SupabaseClient): Promise<JointPositionRequest[]> {
    try {
      // Вызываем RPC функцию get_my_joint_position_requests
      const { data, error } = await (supabase as any).rpc('get_my_joint_position_requests');

      if (error) {
        console.error('Database error in getMyJointPositionRequests:', error);
        throw new AppError(`Database error: ${error.message}`, 500);
      }

      // Возвращаем пустой массив, если данных нет
      return (data || []) as JointPositionRequest[];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Unexpected error in getMyJointPositionRequests:', error);
      throw new AppError('Failed to get joint position requests', 500);
    }
  }

  /**
   * [ADMIN] Получает все заявки на совмещение для администрирования
   * Правило №2: Вся бизнес-логика в сервисе
   */
  public async getAllJointPositionRequests(supabase: SupabaseClient): Promise<AdminJointPositionRequest[]> {
    try {
      // Вызываем RPC функцию get_all_joint_position_requests
      const { data, error } = await (supabase as any).rpc('get_all_joint_position_requests');

      if (error) {
        console.error('Database error in getAllJointPositionRequests:', error);
        throw new AppError(`Database error: ${error.message}`, 500);
      }

      // Возвращаем пустой массив, если данных нет
      return (data || []) as AdminJointPositionRequest[];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Unexpected error in getAllJointPositionRequests:', error);
      throw new AppError('Failed to get all joint position requests', 500);
    }
  }

  /**
   * [ADMIN] Одобряет заявку на совмещение
   * Правило №2: Вся бизнес-логика в сервисе
   */
  public async approveJointPositionRequest(supabase: SupabaseClient, requestId: string): Promise<void> {
    try {
      // Вызываем RPC функцию approve_joint_position_request
      const { error } = await (supabase as any).rpc('approve_joint_position_request', {
        p_request_id: requestId
      });

      if (error) {
        console.error('Database error in approveJointPositionRequest:', error);
        throw new AppError(`Database error: ${error.message}`, 500);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Unexpected error in approveJointPositionRequest:', error);
      throw new AppError('Failed to approve joint position request', 500);
    }
  }

  /**
   * [ADMIN] Отклоняет заявку на совмещение с указанием причины
   * Правило №2: Вся бизнес-логика в сервисе
   */
  public async rejectJointPositionRequest(supabase: SupabaseClient, requestId: string, reason: string): Promise<void> {
    try {
      // Вызываем RPC функцию reject_joint_position_request
      const { error } = await (supabase as any).rpc('reject_joint_position_request', {
        p_request_id: requestId,
        p_reason: reason
      });

      if (error) {
        console.error('Database error in rejectJointPositionRequest:', error);
        throw new AppError(`Database error: ${error.message}`, 500);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Unexpected error in rejectJointPositionRequest:', error);
      throw new AppError('Failed to reject joint position request', 500);
    }
  }

  /**
   * Получает список департаментов, доступных для перевода
   * Правило №2: Вся бизнес-логика в сервисе
   */
  public async getAvailableTransferDepartments(supabase: SupabaseClient): Promise<AvailableTransferDepartment[]> {
    try {
      // Вызываем RPC функцию get_available_departments_for_transfer
      const { data, error } = await (supabase as any).rpc('get_available_departments_for_transfer');

      if (error) {
        console.error('Database error in getAvailableTransferDepartments:', error);
        throw new AppError(`Database error: ${error.message}`, 500);
      }

      // Возвращаем пустой массив, если данных нет
      return (data || []) as AvailableTransferDepartment[];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Unexpected error in getAvailableTransferDepartments:', error);
      throw new AppError('Failed to get available departments for transfer', 500);
    }
  }

  /**
   * Создает новую заявку на перевод
   * Правило №2: Вся бизнес-логика в сервисе
   */
  public async createTransferRequest(
    supabase: SupabaseClient, 
    data: { p_target_department_id: string; p_reason: string; }
  ): Promise<string> {
    try {
      // Вызываем RPC функцию create_transfer_request
      const { data: newRequestId, error } = await (supabase as any).rpc('create_transfer_request', {
        p_target_department_id: data.p_target_department_id,
        p_reason: data.p_reason,
      });

      if (error) {
        console.error('Database error in createTransferRequest:', error);
        throw new AppError(`Database error: ${error.message}`, 500);
      }

      if (!newRequestId) {
        throw new AppError('Failed to create transfer request: no ID returned', 500);
      }

      return newRequestId;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Unexpected error in createTransferRequest:', error);
      throw new AppError('Failed to create transfer request', 500);
    }
  }

  /**
   * Создает новый тикет в службу поддержки
   * Правило №2: Вся бизнес-логика в сервисе
   */
  public async createSupportTicket(
    supabase: SupabaseClient, 
    data: { p_title: string; p_initial_message: string; }
  ): Promise<string> {
    try {
      // Вызываем RPC функцию create_support_ticket
      const { data: newTicketId, error } = await (supabase as any).rpc('create_support_ticket', {
        p_title: data.p_title,
        p_initial_message: data.p_initial_message,
      });

      if (error) {
        console.error('Database error in createSupportTicket:', error);
        throw new AppError(`Database error: ${error.message}`, 500);
      }

      if (!newTicketId) {
        throw new AppError('Failed to create support ticket: no ID returned', 500);
      }

      return newTicketId;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Unexpected error in createSupportTicket:', error);
      throw new AppError('Failed to create support ticket', 500);
    }
  }

  /**
   * Создает новую жалобу
   * Правило №2: Вся бизнес-логика в сервисе
   */
  public async createComplaint(
    supabase: SupabaseClient, 
    data: {
      p_incident_date: string;
      p_title: string;
      p_type: string;
      p_participants: string[];
      p_description: string;
      p_evidence?: string;
    }
  ): Promise<string> {
    try {
      // Вызываем RPC функцию create_complaint
      const { data: newComplaintId, error } = await (supabase as any).rpc('create_complaint', {
        p_incident_date: data.p_incident_date,
        p_title: data.p_title,
        p_type: data.p_type,
        p_participants: data.p_participants, // Массив строк автоматически преобразуется в JSONB
        p_description: data.p_description,
        p_evidence: data.p_evidence || '',
      });

      if (error) {
        console.error('Database error in createComplaint:', error);
        throw new AppError(`Database error: ${error.message}`, 500);
      }

      if (!newComplaintId) {
        throw new AppError('Failed to create complaint: no ID returned', 500);
      }

      return newComplaintId;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Unexpected error in createComplaint:', error);
      throw new AppError('Failed to create complaint', 500);
    }
  }

  /**
   * Получает историю заявок на перевод текущего пользователя
   * Правило №2: Вся бизнес-логика в сервисе
   */
  public async getMyTransferRequests(supabase: SupabaseClient): Promise<TransferRequest[]> {
    try {
      // Вызываем RPC функцию get_my_transfer_requests
      const { data, error } = await (supabase as any).rpc('get_my_transfer_requests');

      if (error) {
        console.error('Database error in getMyTransferRequests:', error);
        throw new AppError(`Database error: ${error.message}`, 500);
      }

      // Возвращаем пустой массив, если данных нет
      return (data || []) as TransferRequest[];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Unexpected error in getMyTransferRequests:', error);
      throw new AppError('Failed to get transfer requests', 500);
    }
  }

  /**
   * [ADMIN] Получает все тикеты поддержки для администрирования
   * Правило №2: Вся бизнес-логика в сервисе
   */
  public async getAllSupportTickets(supabase: SupabaseClient): Promise<any[]> {
    try {
      // Вызываем RPC функцию get_all_support_tickets
      const { data, error } = await (supabase as any).rpc('get_all_support_tickets');

      if (error) {
        console.error('Database error in getAllSupportTickets:', error);
        throw new AppError(`Database error: ${error.message}`, 500);
      }

      // Возвращаем пустой массив, если данных нет
      return (data || []) as any[];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Unexpected error in getAllSupportTickets:', error);
      throw new AppError('Failed to get all support tickets', 500);
    }
  }

  /**
   * [ADMIN] Получает детали конкретного тикета поддержки и всю переписку по нему
   * Правило №2: Вся бизнес-логика в сервисе
   */
  public async getSupportTicketDetails(supabase: SupabaseClient, ticketId: string): Promise<any> {
    try {
      // Вызываем RPC функцию get_support_ticket_details
      const { data, error } = await (supabase as any).rpc('get_support_ticket_details', {
        p_ticket_id: ticketId
      });

      if (error) {
        console.error('Database error in getSupportTicketDetails:', error);
        throw new AppError(`Database error: ${error.message}`, 500);
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Unexpected error in getSupportTicketDetails:', error);
      throw new AppError('Failed to get support ticket details', 500);
    }
  }

  /**
   * [ADMIN] Добавляет ответ администратора в тикет поддержки
   * Правило №2: Вся бизнес-логика в сервисе
   */
  public async addMessageToSupportTicket(
    supabase: SupabaseClient, 
    ticketId: string, 
    content: string
  ): Promise<any> {
    try {
      // Вызываем RPC функцию add_message_to_support_ticket
      const { data, error } = await (supabase as any).rpc('add_message_to_support_ticket', {
        p_ticket_id: ticketId,
        p_content: content
      });

      if (error) {
        console.error('Database error in addMessageToSupportTicket:', error);
        throw new AppError(`Database error: ${error.message}`, 500);
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Unexpected error in addMessageToSupportTicket:', error);
      throw new AppError('Failed to add message to support ticket', 500);
    }
  }

  /**
   * [ADMIN] Изменяет статус тикета поддержки (например, закрывает тикет)
   * Правило №2: Вся бизнес-логика в сервисе
   */
  public async changeSupportTicketStatus(
    supabase: SupabaseClient, 
    ticketId: string, 
    statusCode: string
  ): Promise<any> {
    try {
      // Вызываем RPC функцию change_support_ticket_status
      const { data, error } = await (supabase as any).rpc('change_support_ticket_status', {
        p_ticket_id: ticketId,
        p_status_code: statusCode
      });

      if (error) {
        console.error('Database error in changeSupportTicketStatus:', error);
        throw new AppError(`Database error: ${error.message}`, 500);
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Unexpected error in changeSupportTicketStatus:', error);
      throw new AppError('Failed to change support ticket status', 500);
    }
  }
}