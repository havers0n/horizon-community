// apps/server/src/core/services/CabinetService.ts

// Правило №1: Импортируем базовые типы
import type { Database, Tables } from '@roleplay-identity/db-types';
import type { SupabaseClient } from '@supabase/supabase-js';

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
      user: this.formatUserProfile(typedProfile, character, role),
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
  private formatUserProfile(profile: ProfileWithStats, character: Character | null, role: string): DashboardData['user'] {
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
      attemptsLeft: 3,
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
}