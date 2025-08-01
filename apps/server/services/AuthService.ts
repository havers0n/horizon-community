import { createClient } from '@supabase/supabase-js';
import { userService } from './UserService.js';
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

  constructor() {
    // Проверяем наличие необходимых переменных окружения
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL or VITE_SUPABASE_URL is required');
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
    }

    // Инициализация Supabase клиента
    this.supabase = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  // ===== ОСНОВНАЯ АУТЕНТИФИКАЦИЯ =====

  /**
   * Аутентификация пользователя по токену
   */
  async authenticate(token: string): Promise<AuthUser> {
    try {
      console.log('[AuthService] 🔍 Starting token authentication...');
      
      // Проверка токена в Supabase
      const { data: { user: supabaseUser }, error } = await this.supabase.auth.getUser(token);
      
      if (error) {
        console.error('[AuthService] ❌ Supabase auth error:', error);
        throw new Error(`Supabase auth error: ${error.message}`);
      }
      
      if (!supabaseUser) {
        console.error('[AuthService] ❌ No user returned from Supabase');
        throw new Error('No user found for token');
      }

      console.log('[AuthService] ✅ Supabase user found:', {
        id: supabaseUser.id,
        email: supabaseUser.email
      });

      // Синхронизация с локальной БД
      return await this.syncUser(supabaseUser);
    } catch (error) {
      console.error('[AuthService] ❌ Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Синхронизация пользователя с локальной БД
   */
  async syncUser(supabaseUser: any): Promise<AuthUser> {
    try {
      console.log('[AuthService] 🔄 Syncing user with local database...');
      
      // Ищем пользователя в таблице profiles
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('auth_id', supabaseUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('[AuthService] ❌ Error getting profile:', profileError);
        throw new Error(`Database error: ${profileError.message}`);
      }

      if (!profile) {
        console.log('[AuthService] 📝 Creating new local profile...');
        return await this.createLocalProfile(supabaseUser);
      }

      // Маппинг профиля в AuthUser
      const authUser: AuthUser = {
        id: parseInt(profile.id.replace(/-/g, '').substring(0, 8), 16), // Генерируем числовой ID из UUID
        username: profile.email.split('@')[0], // Используем email как username
        email: profile.email,
        role: profile.role || 'user',
        status: profile.is_active ? 'active' : 'inactive',
        departmentId: profile.department_id,
        rank: profile.badge_number,
        qualifications: [],
        gameWarnings: 0,
        adminWarnings: 0,
        has2FA: false,
        isDarkTheme: false,
        soundSettings: {},
        createdAt: new Date(profile.created_at),
        authId: profile.auth_id
      };

      console.log('[AuthService] ✅ User synced successfully');
      return authUser;
    } catch (error) {
      console.error('[AuthService] ❌ Error syncing user:', error);
      throw error;
    }
  }

  /**
   * Создание нового профиля в локальной БД
   */
  async createLocalProfile(supabaseUser: any): Promise<AuthUser> {
    try {
      console.log('[AuthService] 📝 Creating new local profile...');
      
      const profileData = {
        auth_id: supabaseUser.id,
        email: supabaseUser.email,
        first_name: supabaseUser.user_metadata?.first_name || '',
        last_name: supabaseUser.user_metadata?.last_name || '',
        role: supabaseUser.user_metadata?.role || 'user',
        is_active: true
      };

      const { data: profile, error } = await this.supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('[AuthService] ❌ Error creating profile:', error);
        throw new Error(`Failed to create profile: ${error.message}`);
      }

      // Маппинг профиля в AuthUser
      const authUser: AuthUser = {
        id: parseInt(profile.id.replace(/-/g, '').substring(0, 8), 16),
        username: profile.email.split('@')[0],
        email: profile.email,
        role: profile.role || 'user',
        status: 'active',
        departmentId: profile.department_id,
        rank: profile.badge_number,
        qualifications: [],
        gameWarnings: 0,
        adminWarnings: 0,
        has2FA: false,
        isDarkTheme: false,
        soundSettings: {},
        createdAt: new Date(profile.created_at),
        authId: profile.auth_id
      };

      console.log('[AuthService] ✅ Local profile created successfully');
      return authUser;
    } catch (error) {
      console.error('[AuthService] ❌ Error creating local profile:', error);
      throw new Error('Failed to create local profile');
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
      const allUsers = await userService.getAllUsers();
      const user = allUsers.find((u: any) => u.cadToken === token);

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
        error: 'Internal server error'
      };
    }
  }

  /**
   * Генерация CAD токена для пользователя
   */
  async generateCadToken(userId: number): Promise<string> {
    try {
      const token = this.generateSecureToken();
      await userService.updateUser(userId, { apiToken: token });
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
      await userService.updateUser(userId, { apiToken: null });
    } catch (error) {
      console.error('Error revoking CAD token:', error);
      throw new Error('Failed to revoke CAD token');
    }
  }

  // ===== API ТОКЕНЫ =====

  /**
   * Генерация API токена
   */
  async generateApiToken(userId: number): Promise<string> {
    try {
      const token = this.generateSecureToken();
      await userService.updateUser(userId, { apiToken: token });
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
      const allUsers = await userService.getAllUsers();
      const user = allUsers.find((u: any) => u.apiToken === token);

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
        error: 'Internal server error'
      };
    }
  }

  /**
   * Отзыв API токена
   */
  async revokeApiToken(userId: number): Promise<void> {
    try {
      await userService.updateUser(userId, { apiToken: null });
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
      const user = await userService.getUser(id);
      return user ? this.mapUserToAuthUser(user) : null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  /**
   * Получение пользователя по email
   */
  async getUserByEmail(email: string): Promise<AuthUser | null> {
    try {
      const user = await userService.getUserByEmail(email);
      return user ? this.mapUserToAuthUser(user) : null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  /**
   * Обновление профиля пользователя
   */
  async updateUserProfile(userId: number, data: any): Promise<AuthUser> {
    try {
      const updates: any = {};
      
      if (data.username) updates.username = data.username;
      if (data.email) updates.email = data.email;
      if (data.departmentId !== undefined) updates.departmentId = data.departmentId;
      if (data.secondaryDepartmentId !== undefined) updates.secondaryDepartmentId = data.secondaryDepartmentId;
      if (data.rank) updates.rank = data.rank;
      if (data.division) updates.division = data.division;
      if (data.qualifications) updates.qualifications = data.qualifications;

      const updatedUser = await userService.updateUser(userId, updates);
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
   * Обновление роли пользователя
   */
  async updateUserRole(userId: number, role: string): Promise<AuthUser> {
    try {
      const updatedUser = await userService.updateUser(userId, { role });
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
   * Обновление статуса пользователя
   */
  async updateUserStatus(userId: number, status: string): Promise<AuthUser> {
    try {
      const updatedUser = await userService.updateUser(userId, { status });
      if (!updatedUser) {
        throw new Error('User not found');
      }

      return this.mapUserToAuthUser(updatedUser);
    } catch (error) {
      console.error('Error updating user status:', error);
      throw new Error('Failed to update user status');
    }
  }

  // ===== УТИЛИТЫ =====

  /**
   * Генерация безопасного токена
   */
  private generateSecureToken(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `token_${timestamp}_${random}`;
  }

  /**
   * Преобразование User в AuthUser
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
      gameWarnings: user.gameWarnings || 0,
      adminWarnings: user.adminWarnings || 0,
      cadToken: undefined, // TODO: Добавить в схему
      discordId: undefined, // TODO: Добавить в схему
      discordUsername: undefined, // TODO: Добавить в схему
      has2FA: false, // TODO: Добавить в схему
      isDarkTheme: false, // TODO: Добавить в схему
      soundSettings: {}, // TODO: Добавить в схему
      apiToken: user.apiToken || undefined,
      createdAt: user.createdAt,
      authId: user.authId || undefined
    };
  }

  // ===== ПРОВЕРКИ ПРАВ =====

  /**
   * Проверка наличия разрешения у пользователя
   */
  hasPermission(user: AuthUser, permission: string): boolean {
    // TODO: Реализовать систему разрешений
    return user.role === 'admin' || user.role === 'supervisor';
  }

  /**
   * Проверка роли пользователя
   */
  hasRole(user: AuthUser, role: string): boolean {
    return user.role === role;
  }

  /**
   * Проверка минимальной роли пользователя
   */
  hasMinimumRole(user: AuthUser, minimumRole: string): boolean {
    const roleHierarchy = {
      'candidate': 0,
      'member': 1,
      'officer': 2,
      'supervisor': 3,
      'admin': 4
    };

    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[minimumRole as keyof typeof roleHierarchy] || 0;

    return userLevel >= requiredLevel;
  }
}

// Экспортируем единственный экземпляр
export const authService = new AuthService(); 