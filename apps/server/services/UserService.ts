import type { Database } from '../../../packages/db-types/src/index';
import { SupabaseStorage } from './SupabaseStorage';

// ===== ТИПЫ ИЗ НОВОЙ БД =====

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// ===== ИНТЕРФЕЙСЫ ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ =====

export interface User {
  id: string; // UUID
  username: string | null;
  email: string | null;
  role: string;
  status: string;
  departmentId?: string;
  secondaryDepartmentId?: string;
  rank?: string;
  division?: string;
  qualifications: string[];
  gameWarnings: number;
  adminWarnings: number;
  authId?: string;
  apiToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertUser {
  username: string;
  email: string;
  passwordHash?: string;
  role: string;
  status?: string;
  departmentId?: string;
  secondaryDepartmentId?: string;
  rank?: string;
  division?: string;
  qualifications?: string[];
  gameWarnings?: number;
  adminWarnings?: number;
  authId?: string;
  apiToken?: string;
}

// ===== USER SERVICE - БИЗНЕС-ЛОГИКА ДЛЯ ПОЛЬЗОВАТЕЛЕЙ =====

export class UserService {
  private storage: SupabaseStorage;
  
  constructor(storage: SupabaseStorage) {
    this.storage = storage;
  }
  
  // ===== АДАПТЕРЫ ТИПОВ =====
  
  private adaptSupabaseProfileToUser(profile: Profile): User {
    return {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      role: profile.role,
      status: 'active', // По умолчанию активный
      departmentId: undefined, // Нет в profiles
      secondaryDepartmentId: undefined, // Нет в profiles
      rank: undefined, // Нет в profiles
      division: undefined, // Нет в profiles
      qualifications: [], // Нет в profiles
      gameWarnings: 0, // Нет в profiles
      adminWarnings: 0, // Нет в profiles
      authId: profile.id, // В новой схеме auth_id = id
      apiToken: undefined, // Нет в profiles
      createdAt: new Date(profile.created_at || new Date()),
      updatedAt: new Date(profile.created_at || new Date()) // В profiles нет updated_at, используем created_at
    };
  }

  private adaptUserToSupabaseProfile(user: InsertUser): ProfileInsert {
    return {
      id: user.authId || crypto.randomUUID(), // Используем authId или генерируем новый UUID
      username: user.username,
      email: user.email,
      role: user.role
    };
  }

  // ===== ОСНОВНЫЕ ОПЕРАЦИИ =====
  
  async getUser(id: string): Promise<User | undefined> {
    try {
      const profile = await this.storage.getById('profiles', id);
      if (!profile) {
        return undefined;
      }

      return this.adaptSupabaseProfileToUser(profile);
    } catch (error) {
      console.error('[UserService] Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const profile = await this.storage.getByField('profiles', 'email', email);
      if (!profile) {
        return undefined;
      }

      return this.adaptSupabaseProfileToUser(profile);
    } catch (error) {
      console.error('[UserService] Error getting user by email:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const profile = await this.storage.getByField('profiles', 'username', username);
      if (!profile) {
        return undefined;
      }

      return this.adaptSupabaseProfileToUser(profile);
    } catch (error) {
      console.error('[UserService] Error getting user by username:', error);
      return undefined;
    }
  }

  async getUserByAuthId(authId: string): Promise<User | undefined> {
    return this.getUser(authId);
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const profileData = this.adaptUserToSupabaseProfile(user);
      const profile = await this.storage.insert('profiles', profileData);
      
      if (!profile) {
        throw new Error('Failed to create user profile');
      }

      return this.adaptSupabaseProfileToUser(profile);
    } catch (error) {
      console.error('[UserService] Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      const profileUpdates: ProfileUpdate = {};
      
      if (updates.username !== undefined) profileUpdates.username = updates.username;
      if (updates.email !== undefined) profileUpdates.email = updates.email;
      if (updates.role !== undefined) profileUpdates.role = updates.role;

      const updatedProfile = await this.storage.update('profiles', id, profileUpdates);
      
      if (!updatedProfile) {
        return undefined;
      }

      return this.adaptSupabaseProfileToUser(updatedProfile);
    } catch (error) {
      console.error('[UserService] Error updating user:', error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const profiles = await this.storage.list('profiles');
      return profiles.map(profile => this.adaptSupabaseProfileToUser(profile));
    } catch (error) {
      console.error('[UserService] Error getting all users:', error);
      return [];
    }
  }

  async getUsersByDepartment(departmentId: string): Promise<User[]> {
    // В новой схеме profiles не содержит departmentId
    // Нужно использовать связи через characters или другие таблицы
    console.warn('[UserService] getUsersByDepartment: department filtering not supported in new schema');
    return [];
  }

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const profiles = await this.storage.list('profiles', { role });
      return profiles.map(profile => this.adaptSupabaseProfileToUser(profile));
    } catch (error) {
      console.error('[UserService] Error getting users by role:', error);
      return [];
    }
  }

  async getUsersByStatus(status: string): Promise<User[]> {
    // В новой схеме profiles не содержит status
    console.warn('[UserService] getUsersByStatus: status filtering not supported in new schema');
    return [];
  }

  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    try {
      const profiles = await this.storage.search('profiles', ['username', 'email'], query, limit);
      return profiles.map(profile => this.adaptSupabaseProfileToUser(profile));
    } catch (error) {
      console.error('[UserService] Error searching users:', error);
      return [];
    }
  }

  async getUsersWithFilters(filters: {
    departmentId?: string;
    role?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<User[]> {
    try {
      const queryFilters: Record<string, any> = {};
      
      if (filters.role) {
        queryFilters.role = filters.role;
      }

      const profiles = await this.storage.list('profiles', queryFilters, {
        limit: filters.limit,
        offset: filters.offset
      });

      return profiles.map(profile => this.adaptSupabaseProfileToUser(profile));
    } catch (error) {
      console.error('[UserService] Error getting users with filters:', error);
      return [];
    }
  }

  async getUserCount(): Promise<number> {
    try {
      return await this.storage.count('profiles');
    } catch (error) {
      console.error('[UserService] Error getting user count:', error);
      return 0;
    }
  }

  async getUserCountByDepartment(departmentId: string): Promise<number> {
    // В новой схеме profiles не содержит departmentId
    console.warn('[UserService] getUserCountByDepartment: department counting not supported in new schema');
    return 0;
  }

  async getUserCountByRole(role: string): Promise<number> {
    try {
      return await this.storage.count('profiles', { role });
    } catch (error) {
      console.error('[UserService] Error getting user count by role:', error);
      return 0;
    }
  }

  async getUserCountByStatus(status: string): Promise<number> {
    // В новой схеме profiles не содержит status
    console.warn('[UserService] getUserCountByStatus: status counting not supported in new schema');
    return 0;
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return this.storage.validatePassword(password, hash);
  }

  async hashPassword(password: string): Promise<string> {
    return this.storage.hashPassword(password);
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const existingUser = await this.getUserByUsername(username);
    return !existingUser;
  }

  async isEmailAvailable(email: string): Promise<boolean> {
    const existingUser = await this.getUserByEmail(email);
    return !existingUser;
  }

  async activateUser(id: string): Promise<User | undefined> {
    // В новой схеме profiles не содержит status
    console.warn('[UserService] activateUser: status management not supported in new schema');
    return await this.getUser(id);
  }

  async deactivateUser(id: string): Promise<User | undefined> {
    // В новой схеме profiles не содержит status
    console.warn('[UserService] deactivateUser: status management not supported in new schema');
    return await this.getUser(id);
  }

  async suspendUser(id: string): Promise<User | undefined> {
    // В новой схеме profiles не содержит status
    console.warn('[UserService] suspendUser: status management not supported in new schema');
    return await this.getUser(id);
  }

  async addGameWarning(id: string): Promise<User | undefined> {
    // В новой схеме profiles не содержит gameWarnings
    console.warn('[UserService] addGameWarning: warnings not supported in new schema');
    return await this.getUser(id);
  }

  async addAdminWarning(id: string): Promise<User | undefined> {
    // В новой схеме profiles не содержит adminWarnings
    console.warn('[UserService] addAdminWarning: warnings not supported in new schema');
    return await this.getUser(id);
  }

  async resetWarnings(id: string): Promise<User | undefined> {
    // В новой схеме profiles не содержит warnings
    console.warn('[UserService] resetWarnings: warnings not supported in new schema');
    return await this.getUser(id);
  }

  // ===========================================
  // СТАТИСТИКА ЗАЯВОК И ОТПУСКОВ
  // ===========================================

  /**
   * Get application statistics for a user
   */
  async getUserApplicationStats(userId: string): Promise<{
    thisMonth: {
      entryApplications: number;
      leaveApplications: number;
      totalApplications: number;
    };
    limits: {
      entryApplicationsPerMonth: number;
      leaveApplicationsPerMonth: number;
      promotionQualificationCooldownDays: number;
    };
    nextResetDate: Date;
    lastPromotionQualificationDate?: Date;
  }> {
    const now = new Date();
    // Исправляем расчет текущего месяца с учетом часового пояса
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
    
    // Получаем заявки пользователя из storage
    const userApplications = await this.storage.list('applications', { author_user_id: userId });
    
    const thisMonthApps = userApplications.filter(app => 
      new Date(app.created_at || '') >= currentMonth
    );

    const entryApplications = thisMonthApps.filter(app => app.type === 'entry').length;
    const leaveApplications = thisMonthApps.filter(app => app.type === 'leave').length;

    const lastPromotionQualification = userApplications
      .filter(app => app.type === 'promotion' || app.type === 'qualification')
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
      [0];

    return {
      thisMonth: {
        entryApplications,
        leaveApplications,
        totalApplications: thisMonthApps.length
      },
      limits: {
        entryApplicationsPerMonth: 3,
        leaveApplicationsPerMonth: 2,
        promotionQualificationCooldownDays: 7
      },
      nextResetDate: nextMonth,
      lastPromotionQualificationDate: lastPromotionQualification ? 
        new Date(lastPromotionQualification.created_at || '') : undefined
    };
  }

  /**
   * Get leave statistics for a user
   */
  async getUserLeaveStats(userId: string): Promise<{
    currentYear: {
      totalDays: number;
      usedDays: number;
      remainingDays: number;
      leaveTypes: Record<string, number>;
    };
    activeLeave?: {
      id: string;
      type: string;
      startDate: string;
      endDate: string;
      daysRemaining: number;
    };
    upcomingLeaves: Array<{
      id: string;
      type: string;
      startDate: string;
      endDate: string;
      daysUntilStart: number;
    }>;
  }> {
    const now = new Date();
    const currentYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    
    // Получаем заявки пользователя из storage
    const userApplications = await this.storage.list('applications', { author_user_id: userId });
    const leaveApplications = userApplications.filter(app => app.type === 'leave');

    // Статистика за текущий год
    const thisYearLeaves = leaveApplications.filter(app => 
      new Date(app.created_at || '') >= currentYear && app.status === 'approved'
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
}

// Экспортируем единственный экземпляр
export const userService = new UserService(new SupabaseStorage()); 