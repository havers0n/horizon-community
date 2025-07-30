// Загружаем переменные окружения
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { SupabaseStorage } from './SupabaseStorage.js';
import type { User } from '../types.js';

// ===== ТИПЫ =====

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  departmentId?: number;
  secondaryDepartmentId?: number;
  rank?: string;
  division?: string;
  qualifications: string[];
  gameWarnings: number;
  adminWarnings: number;
  cadToken?: string;
  discordId?: string;
  discordUsername?: string;
  has2FA: boolean;
  isDarkTheme: boolean;
  soundSettings: any;
  apiToken?: string;
  createdAt: Date;
  authId?: string;
}

export interface CadAuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export interface TokenValidationResult {
  valid: boolean;
  user?: AuthUser;
  error?: string;
}

// ===== AUTH SERVICE =====

export class AuthService {
  private supabase: any;
  private storage: SupabaseStorage;

  constructor() {
    // Проверяем наличие необходимых переменных окружения
    if (!process.env.SUPABASE_URL) {
      throw new Error('SUPABASE_URL is required');
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
    }

    // Инициализация Supabase клиента
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    this.storage = new SupabaseStorage();
  }

  // ===== ОСНОВНАЯ АУТЕНТИФИКАЦИЯ =====

  /**
   * Аутентификация пользователя по токену
   */
  async authenticate(token: string): Promise<AuthUser> {
    try {
      // Проверка токена в Supabase
      const { data: { user: supabaseUser }, error } = await this.supabase.auth.getUser(token);
      
      if (error || !supabaseUser) {
        throw new Error('Invalid token');
      }

      // Синхронизация с локальной БД
      return await this.syncUser(supabaseUser);
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Синхронизация пользователя между Supabase и локальной БД
   */
  async syncUser(supabaseUser: any): Promise<AuthUser> {
    try {
      // Поиск пользователя в локальной БД по authId
      let user = await this.storage.getUserByAuthId(supabaseUser.id);

      if (!user) {
        // Создание нового пользователя
        user = await this.createLocalUser(supabaseUser);
      } else {
        // Обновление существующего пользователя
        user = await this.updateLocalUser(user.id, supabaseUser);
      }

      return this.mapUserToAuthUser(user);
    } catch (error) {
      console.error('Error syncing user:', error);
      throw new Error('Failed to sync user');
    }
  }

  /**
   * Создание пользователя в локальной БД
   */
  async createLocalUser(supabaseUser: any): Promise<User> {
    try {
      const userData = {
        username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0],
        email: supabaseUser.email,
        passwordHash: '', // Пароль хранится в Supabase
        role: 'candidate',
        status: 'active',
        authId: supabaseUser.id,
        has2FA: false,
        isDarkTheme: false,
        soundSettings: {},
        createdAt: new Date()
      };

      return await this.storage.createUser(userData);
    } catch (error) {
      console.error('Error creating local user:', error);
      throw new Error('Failed to create local user');
    }
  }

  /**
   * Обновление пользователя в локальной БД
   */
  async updateLocalUser(userId: number, supabaseUser: any): Promise<User> {
    try {
      const updates = {
        email: supabaseUser.email,
        username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0],
        updatedAt: new Date()
      };

      const updatedUser = await this.storage.updateUser(userId, updates);
      if (!updatedUser) {
        throw new Error('User not found for update');
      }
      return updatedUser;
    } catch (error) {
      console.error('Error updating local user:', error);
      throw new Error('Failed to update local user');
    }
  }

  // ===== CAD АУТЕНТИФИКАЦИЯ =====

  /**
   * Валидация CAD токена для игровой интеграции
   */
  async validateCadToken(token: string): Promise<CadAuthResult> {
    try {
      // TODO: Добавить поле cadToken в схему пользователя
      // Пока используем временную логику
      const allUsers = await this.storage.getAllUsers();
      const user = allUsers.find(u => (u as any).cadToken === token);

      if (!user) {
        return {
          success: false,
          error: 'Invalid CAD token'
        };
      }

      if (user.status !== 'active') {
        return {
          success: false,
          error: 'User account is not active'
        };
      }

      return {
        success: true,
        user: this.mapUserToAuthUser(user)
      };
    } catch (error) {
      console.error('Error validating CAD token:', error);
      return {
        success: false,
        error: 'Token validation failed'
      };
    }
  }

  /**
   * Генерация нового CAD токена для пользователя
   */
  async generateCadToken(userId: number): Promise<string> {
    try {
      const token = this.generateSecureToken();
      
      // TODO: Добавить поле cadToken в схему пользователя
      await this.storage.updateUser(userId, { cadToken: token } as any);

      return token;
    } catch (error) {
      console.error('Error generating CAD token:', error);
      throw new Error('Failed to generate CAD token');
    }
  }

  /**
   * Отзыв CAD токена
   */
  async revokeCadToken(userId: number): Promise<void> {
    try {
      // TODO: Добавить поле cadToken в схему пользователя
      await this.storage.updateUser(userId, { cadToken: null } as any);
    } catch (error) {
      console.error('Error revoking CAD token:', error);
      throw new Error('Failed to revoke CAD token');
    }
  }

  // ===== API ТОКЕНЫ =====

  /**
   * Генерация API токена для пользователя
   */
  async generateApiToken(userId: number): Promise<string> {
    try {
      const token = this.generateSecureToken();
      
      await this.storage.updateUser(userId, { apiToken: token });

      return token;
    } catch (error) {
      console.error('Error generating API token:', error);
      throw new Error('Failed to generate API token');
    }
  }

  /**
   * Валидация API токена
   */
  async validateApiToken(token: string): Promise<TokenValidationResult> {
    try {
      const allUsers = await this.storage.getAllUsers();
      const user = allUsers.find(u => u.apiToken === token);

      if (!user) {
        return {
          valid: false,
          error: 'Invalid API token'
        };
      }

      if (user.status !== 'active') {
        return {
          valid: false,
          error: 'User account is not active'
        };
      }

      return {
        valid: true,
        user: this.mapUserToAuthUser(user)
      };
    } catch (error) {
      console.error('Error validating API token:', error);
      return {
        valid: false,
        error: 'Token validation failed'
      };
    }
  }

  /**
   * Отзыв API токена
   */
  async revokeApiToken(userId: number): Promise<void> {
    try {
      await this.storage.updateUser(userId, { apiToken: null });
    } catch (error) {
      console.error('Error revoking API token:', error);
      throw new Error('Failed to revoke API token');
    }
  }

  // ===== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ =====

  /**
   * Получение пользователя по ID
   */
  async getUserById(id: number): Promise<AuthUser | null> {
    try {
      const user = await this.storage.getUser(id);
      return user ? this.mapUserToAuthUser(user) : null;
    } catch (error) {
      console.error('Error getting user by id:', error);
      throw new Error('Failed to get user');
    }
  }

  /**
   * Получение пользователя по email
   */
  async getUserByEmail(email: string): Promise<AuthUser | null> {
    try {
      const user = await this.storage.getUserByEmail(email);
      return user ? this.mapUserToAuthUser(user) : null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Failed to get user');
    }
  }

  /**
   * Обновление профиля пользователя
   */
  async updateUserProfile(userId: number, data: any): Promise<AuthUser> {
    try {
      const updatedUser = await this.storage.updateUser(userId, {
        ...data,
        updatedAt: new Date()
      });

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return this.mapUserToAuthUser(updatedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  /**
   * Изменение роли пользователя
   */
  async updateUserRole(userId: number, role: string): Promise<AuthUser> {
    try {
      const updatedUser = await this.storage.updateUser(userId, {
        role,
        updatedAt: new Date()
      });

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return this.mapUserToAuthUser(updatedUser);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  }

  /**
   * Изменение статуса пользователя
   */
  async updateUserStatus(userId: number, status: string): Promise<AuthUser> {
    try {
      const updatedUser = await this.storage.updateUser(userId, {
        status,
        updatedAt: new Date()
      });

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return this.mapUserToAuthUser(updatedUser);
    } catch (error) {
      console.error('Error updating user status:', error);
      throw new Error('Failed to update user status');
    }
  }

  // ===== DISCORD ИНТЕГРАЦИЯ =====

  /**
   * Привязка Discord аккаунта
   */
  async linkDiscordAccount(userId: number, discordData: any): Promise<AuthUser> {
    try {
      const updatedUser = await this.storage.updateUser(userId, {
        discordId: discordData.id,
        discordUsername: discordData.username,
        // TODO: Добавить поля для Discord токенов в схему
        updatedAt: new Date()
      } as any);

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return this.mapUserToAuthUser(updatedUser);
    } catch (error) {
      console.error('Error linking Discord account:', error);
      throw new Error('Failed to link Discord account');
    }
  }

  /**
   * Отвязка Discord аккаунта
   */
  async unlinkDiscordAccount(userId: number): Promise<AuthUser> {
    try {
      const updatedUser = await this.storage.updateUser(userId, {
        discordId: null,
        discordUsername: null,
        // TODO: Добавить поля для Discord токенов в схему
        updatedAt: new Date()
      } as any);

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return this.mapUserToAuthUser(updatedUser);
    } catch (error) {
      console.error('Error unlinking Discord account:', error);
      throw new Error('Failed to unlink Discord account');
    }
  }

  // ===== НАСТРОЙКИ ПОЛЬЗОВАТЕЛЯ =====

  /**
   * Обновление настроек пользователя
   */
  async updateUserSettings(userId: number, settings: any): Promise<AuthUser> {
    try {
      const updatedUser = await this.storage.updateUser(userId, {
        isDarkTheme: settings.isDarkTheme,
        soundSettings: settings.soundSettings,
        has2FA: settings.has2FA,
        updatedAt: new Date()
      });

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return this.mapUserToAuthUser(updatedUser);
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw new Error('Failed to update user settings');
    }
  }

  // ===== УТИЛИТЫ =====

  /**
   * Генерация безопасного токена
   */
  private generateSecureToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Маппинг пользователя БД в AuthUser
   */
  private mapUserToAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      departmentId: user.departmentId || undefined,
      secondaryDepartmentId: user.secondaryDepartmentId || undefined,
      rank: user.rank || undefined,
      division: user.division || undefined,
      qualifications: user.qualifications || [],
      gameWarnings: user.gameWarnings,
      adminWarnings: user.adminWarnings,
      cadToken: (user as any).cadToken || undefined,
      discordId: (user as any).discordId || undefined,
      discordUsername: (user as any).discordUsername || undefined,
      has2FA: user.has2FA,
      isDarkTheme: user.isDarkTheme,
      soundSettings: user.soundSettings || {},
      apiToken: user.apiToken || undefined,
      createdAt: user.createdAt,
      authId: user.authId || undefined
    };
  }

  /**
   * Проверка прав доступа
   */
  hasPermission(user: AuthUser, permission: string): boolean {
    const rolePermissions = {
      admin: ['*'], // Все права
      supervisor: ['read', 'write', 'delete', 'manage_users'],
      member: ['read', 'write'],
      candidate: ['read']
    };

    const userPermissions = rolePermissions[user.role as keyof typeof rolePermissions] || [];
    
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }

  /**
   * Проверка роли пользователя
   */
  hasRole(user: AuthUser, role: string): boolean {
    return user.role === role;
  }

  /**
   * Проверка минимальной роли
   */
  hasMinimumRole(user: AuthUser, minimumRole: string): boolean {
    const roleHierarchy = {
      candidate: 1,
      member: 2,
      supervisor: 3,
      admin: 4
    };

    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[minimumRole as keyof typeof roleHierarchy] || 0;

    return userLevel >= requiredLevel;
  }
}

// Экспорт экземпляра сервиса
export const authService = new AuthService(); 