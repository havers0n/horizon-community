import { createClient } from '@supabase/supabase-js';
import type { Tables } from '../../../packages/db-types/src/index';

// ===== ТИПЫ ИЗ НОВОЙ БД =====

type Profile = Tables<'profiles'>;
type Character = Tables<{ schema: 'common' }, 'characters'>;

// ===== ИНТЕРФЕЙСЫ =====

export interface AuthUser {
  id: string; // UUID из profiles
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
  cadToken?: string;
  discordId?: string;
  discordUsername?: string;
  has2FA: boolean;
  isDarkTheme: boolean;
  soundSettings: any;
  apiToken?: string;
  createdAt: string | null;
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
        .eq('id', supabaseUser.id)
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
        id: profile.id, // UUID
        username: profile.username,
        email: profile.email,
        role: profile.role || 'user',
        status: 'active', // По умолчанию активный
        departmentId: undefined, // Будет из user_metadata
        secondaryDepartmentId: undefined, // Будет из user_metadata
        rank: undefined, // Будет из user_metadata
        division: undefined, // Будет из user_metadata
        qualifications: [], // Будет из user_metadata
        gameWarnings: 0, // Будет из user_metadata
        adminWarnings: 0, // Будет из user_metadata
        cadToken: supabaseUser.user_metadata?.cadToken,
        discordId: supabaseUser.user_metadata?.discordId,
        discordUsername: supabaseUser.user_metadata?.discordUsername,
        has2FA: supabaseUser.user_metadata?.has2FA || false,
        isDarkTheme: supabaseUser.user_metadata?.isDarkTheme || false,
        soundSettings: supabaseUser.user_metadata?.soundSettings || {},
        apiToken: supabaseUser.user_metadata?.apiToken,
        createdAt: profile.created_at,
        authId: profile.id // В новой схеме auth_id = id
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
        id: supabaseUser.id, // UUID
        email: supabaseUser.email,
        username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || null,
        role: supabaseUser.user_metadata?.role || 'user'
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
        id: profile.id, // UUID
        username: profile.username,
        email: profile.email,
        role: profile.role || 'user',
        status: 'active',
        departmentId: undefined,
        secondaryDepartmentId: undefined,
        rank: undefined,
        division: undefined,
        qualifications: [],
        gameWarnings: 0,
        adminWarnings: 0,
        cadToken: supabaseUser.user_metadata?.cadToken,
        discordId: supabaseUser.user_metadata?.discordId,
        discordUsername: supabaseUser.user_metadata?.discordUsername,
        has2FA: supabaseUser.user_metadata?.has2FA || false,
        isDarkTheme: supabaseUser.user_metadata?.isDarkTheme || false,
        soundSettings: supabaseUser.user_metadata?.soundSettings || {},
        apiToken: supabaseUser.user_metadata?.apiToken,
        createdAt: profile.created_at,
        authId: profile.id
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
      console.log('[AuthService] 🔍 Validating CAD token...');
      
      // Ищем пользователя по CAD токену в user_metadata
      const { data: { users }, error } = await this.supabase.auth.admin.listUsers();
      
      if (error) {
        console.error('[AuthService] ❌ Error listing users:', error);
        return {
          success: false,
          error: 'Failed to validate CAD token'
        };
      }

      const userWithCadToken = users.find(user => 
        user.user_metadata?.cadToken === token
      );

      if (!userWithCadToken) {
        console.log('[AuthService] ❌ No user found with CAD token');
        return {
          success: false,
          error: 'Invalid CAD token'
        };
      }

      // Получаем профиль пользователя
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userWithCadToken.id)
        .single();

      if (profileError || !profile) {
        console.error('[AuthService] ❌ Profile not found for CAD token user');
        return {
          success: false,
          error: 'User profile not found'
        };
      }

      const authUser: AuthUser = {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        role: profile.role || 'user',
        status: 'active',
        departmentId: userWithCadToken.user_metadata?.departmentId,
        secondaryDepartmentId: userWithCadToken.user_metadata?.secondaryDepartmentId,
        rank: userWithCadToken.user_metadata?.rank,
        division: userWithCadToken.user_metadata?.division,
        qualifications: userWithCadToken.user_metadata?.qualifications || [],
        gameWarnings: userWithCadToken.user_metadata?.gameWarnings || 0,
        adminWarnings: userWithCadToken.user_metadata?.adminWarnings || 0,
        cadToken: userWithCadToken.user_metadata?.cadToken,
        discordId: userWithCadToken.user_metadata?.discordId,
        discordUsername: userWithCadToken.user_metadata?.discordUsername,
        has2FA: userWithCadToken.user_metadata?.has2FA || false,
        isDarkTheme: userWithCadToken.user_metadata?.isDarkTheme || false,
        soundSettings: userWithCadToken.user_metadata?.soundSettings || {},
        apiToken: userWithCadToken.user_metadata?.apiToken,
        createdAt: profile.created_at,
        authId: profile.id
      };

      console.log('[AuthService] ✅ CAD token validated successfully');
      return {
        success: true,
        user: authUser
      };
    } catch (error) {
      console.error('[AuthService] ❌ Error validating CAD token:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Генерация CAD токена для пользователя
   */
  async generateCadToken(userId: string): Promise<string> {
    try {
      console.log('[AuthService] 🔑 Generating CAD token for user:', userId);
      
      const token = this.generateSecureToken();
      
      // Обновляем user_metadata в Supabase Auth
      const { error } = await this.supabase.auth.admin.updateUserById(userId, {
        user_metadata: { cadToken: token }
      });

      if (error) {
        console.error('[AuthService] ❌ Error updating user metadata:', error);
        throw new Error('Failed to generate CAD token');
      }

      console.log('[AuthService] ✅ CAD token generated successfully');
      return token;
    } catch (error) {
      console.error('[AuthService] ❌ Error generating CAD token:', error);
      throw new Error('Failed to generate CAD token');
    }
  }

  /**
   * Отзыв CAD токена
   */
  async revokeCadToken(userId: string): Promise<void> {
    try {
      console.log('[AuthService] 🔒 Revoking CAD token for user:', userId);
      
      // Удаляем CAD токен из user_metadata
      const { error } = await this.supabase.auth.admin.updateUserById(userId, {
        user_metadata: { cadToken: null }
      });

      if (error) {
        console.error('[AuthService] ❌ Error revoking CAD token:', error);
        throw new Error('Failed to revoke CAD token');
      }

      console.log('[AuthService] ✅ CAD token revoked successfully');
    } catch (error) {
      console.error('[AuthService] ❌ Error revoking CAD token:', error);
      throw new Error('Failed to revoke CAD token');
    }
  }

  // ===== API ТОКЕНЫ =====

  /**
   * Генерация API токена
   */
  async generateApiToken(userId: string): Promise<string> {
    try {
      console.log('[AuthService] 🔑 Generating API token for user:', userId);
      
      const token = this.generateSecureToken();
      
      // Обновляем user_metadata в Supabase Auth
      const { error } = await this.supabase.auth.admin.updateUserById(userId, {
        user_metadata: { apiToken: token }
      });

      if (error) {
        console.error('[AuthService] ❌ Error updating user metadata:', error);
        throw new Error('Failed to generate API token');
      }

      console.log('[AuthService] ✅ API token generated successfully');
      return token;
    } catch (error) {
      console.error('[AuthService] ❌ Error generating API token:', error);
      throw new Error('Failed to generate API token');
    }
  }

  /**
   * Валидация API токена
   */
  async validateApiToken(token: string): Promise<TokenValidationResult> {
    try {
      console.log('[AuthService] 🔍 Validating API token...');
      
      // Ищем пользователя по API токену в user_metadata
      const { data: { users }, error } = await this.supabase.auth.admin.listUsers();
      
      if (error) {
        console.error('[AuthService] ❌ Error listing users:', error);
        return {
          valid: false,
          error: 'Failed to validate API token'
        };
      }

      const userWithApiToken = users.find(user => 
        user.user_metadata?.apiToken === token
      );

      if (!userWithApiToken) {
        console.log('[AuthService] ❌ No user found with API token');
        return {
          valid: false,
          error: 'Invalid API token'
        };
      }

      // Получаем профиль пользователя
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userWithApiToken.id)
        .single();

      if (profileError || !profile) {
        console.error('[AuthService] ❌ Profile not found for API token user');
        return {
          valid: false,
          error: 'User profile not found'
        };
      }

      const authUser: AuthUser = {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        role: profile.role || 'user',
        status: 'active',
        departmentId: userWithApiToken.user_metadata?.departmentId,
        secondaryDepartmentId: userWithApiToken.user_metadata?.secondaryDepartmentId,
        rank: userWithApiToken.user_metadata?.rank,
        division: userWithApiToken.user_metadata?.division,
        qualifications: userWithApiToken.user_metadata?.qualifications || [],
        gameWarnings: userWithApiToken.user_metadata?.gameWarnings || 0,
        adminWarnings: userWithApiToken.user_metadata?.adminWarnings || 0,
        cadToken: userWithApiToken.user_metadata?.cadToken,
        discordId: userWithApiToken.user_metadata?.discordId,
        discordUsername: userWithApiToken.user_metadata?.discordUsername,
        has2FA: userWithApiToken.user_metadata?.has2FA || false,
        isDarkTheme: userWithApiToken.user_metadata?.isDarkTheme || false,
        soundSettings: userWithApiToken.user_metadata?.soundSettings || {},
        apiToken: userWithApiToken.user_metadata?.apiToken,
        createdAt: profile.created_at,
        authId: profile.id
      };

      console.log('[AuthService] ✅ API token validated successfully');
      return {
        valid: true,
        user: authUser
      };
    } catch (error) {
      console.error('[AuthService] ❌ Error validating API token:', error);
      return {
        valid: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Отзыв API токена
   */
  async revokeApiToken(userId: string): Promise<void> {
    try {
      console.log('[AuthService] 🔒 Revoking API token for user:', userId);
      
      // Удаляем API токен из user_metadata
      const { error } = await this.supabase.auth.admin.updateUserById(userId, {
        user_metadata: { apiToken: null }
      });

      if (error) {
        console.error('[AuthService] ❌ Error revoking API token:', error);
        throw new Error('Failed to revoke API token');
      }

      console.log('[AuthService] ✅ API token revoked successfully');
    } catch (error) {
      console.error('[AuthService] ❌ Error revoking API token:', error);
      throw new Error('Failed to revoke API token');
    }
  }

  // ===== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ =====

  /**
   * Получение пользователя по ID
   */
  async getUserById(id: string): Promise<AuthUser | null> {
    try {
      console.log('[AuthService] 🔍 Getting user by ID:', id);
      
      // Получаем профиль из БД
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError || !profile) {
        console.log('[AuthService] ❌ Profile not found for ID:', id);
        return null;
      }

      // Получаем данные пользователя из Supabase Auth
      const { data: { user: authUser }, error: authError } = await this.supabase.auth.admin.getUserById(id);

      if (authError || !authUser) {
        console.log('[AuthService] ❌ Auth user not found for ID:', id);
        return null;
      }

      const user: AuthUser = {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        role: profile.role || 'user',
        status: 'active',
        departmentId: authUser.user_metadata?.departmentId,
        secondaryDepartmentId: authUser.user_metadata?.secondaryDepartmentId,
        rank: authUser.user_metadata?.rank,
        division: authUser.user_metadata?.division,
        qualifications: authUser.user_metadata?.qualifications || [],
        gameWarnings: authUser.user_metadata?.gameWarnings || 0,
        adminWarnings: authUser.user_metadata?.adminWarnings || 0,
        cadToken: authUser.user_metadata?.cadToken,
        discordId: authUser.user_metadata?.discordId,
        discordUsername: authUser.user_metadata?.discordUsername,
        has2FA: authUser.user_metadata?.has2FA || false,
        isDarkTheme: authUser.user_metadata?.isDarkTheme || false,
        soundSettings: authUser.user_metadata?.soundSettings || {},
        apiToken: authUser.user_metadata?.apiToken,
        createdAt: profile.created_at,
        authId: profile.id
      };

      console.log('[AuthService] ✅ User retrieved successfully');
      return user;
    } catch (error) {
      console.error('[AuthService] ❌ Error getting user by ID:', error);
      return null;
    }
  }

  /**
   * Получение пользователя по email
   */
  async getUserByEmail(email: string): Promise<AuthUser | null> {
    try {
      console.log('[AuthService] 🔍 Getting user by email:', email);
      
      // Получаем профиль из БД
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        console.log('[AuthService] ❌ Profile not found for email:', email);
        return null;
      }

      // Получаем данные пользователя из Supabase Auth
      const { data: { user: authUser }, error: authError } = await this.supabase.auth.admin.getUserById(profile.id);

      if (authError || !authUser) {
        console.log('[AuthService] ❌ Auth user not found for email:', email);
        return null;
      }

      const user: AuthUser = {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        role: profile.role || 'user',
        status: 'active',
        departmentId: authUser.user_metadata?.departmentId,
        secondaryDepartmentId: authUser.user_metadata?.secondaryDepartmentId,
        rank: authUser.user_metadata?.rank,
        division: authUser.user_metadata?.division,
        qualifications: authUser.user_metadata?.qualifications || [],
        gameWarnings: authUser.user_metadata?.gameWarnings || 0,
        adminWarnings: authUser.user_metadata?.adminWarnings || 0,
        cadToken: authUser.user_metadata?.cadToken,
        discordId: authUser.user_metadata?.discordId,
        discordUsername: authUser.user_metadata?.discordUsername,
        has2FA: authUser.user_metadata?.has2FA || false,
        isDarkTheme: authUser.user_metadata?.isDarkTheme || false,
        soundSettings: authUser.user_metadata?.soundSettings || {},
        apiToken: authUser.user_metadata?.apiToken,
        createdAt: profile.created_at,
        authId: profile.id
      };

      console.log('[AuthService] ✅ User retrieved successfully');
      return user;
    } catch (error) {
      console.error('[AuthService] ❌ Error getting user by email:', error);
      return null;
    }
  }

  /**
   * Обновление профиля пользователя
   */
  async updateUserProfile(userId: string, data: any): Promise<AuthUser> {
    try {
      console.log('[AuthService] 🔄 Updating user profile:', userId);
      
      const updates: any = {};
      const metadataUpdates: any = {};
      
      // Обновляем профиль в БД
      if (data.username !== undefined) updates.username = data.username;
      if (data.email !== undefined) updates.email = data.email;
      if (data.role !== undefined) updates.role = data.role;
      
      // Обновляем user_metadata в Supabase Auth
      if (data.departmentId !== undefined) metadataUpdates.departmentId = data.departmentId;
      if (data.secondaryDepartmentId !== undefined) metadataUpdates.secondaryDepartmentId = data.secondaryDepartmentId;
      if (data.rank !== undefined) metadataUpdates.rank = data.rank;
      if (data.division !== undefined) metadataUpdates.division = data.division;
      if (data.qualifications !== undefined) metadataUpdates.qualifications = data.qualifications;

      // Обновляем профиль
      if (Object.keys(updates).length > 0) {
        const { error: profileError } = await this.supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId);

        if (profileError) {
          console.error('[AuthService] ❌ Error updating profile:', profileError);
          throw new Error('Failed to update profile');
        }
      }

      // Обновляем user_metadata
      if (Object.keys(metadataUpdates).length > 0) {
        const { error: metadataError } = await this.supabase.auth.admin.updateUserById(userId, {
          user_metadata: metadataUpdates
        });

        if (metadataError) {
          console.error('[AuthService] ❌ Error updating user metadata:', metadataError);
          throw new Error('Failed to update user metadata');
        }
      }

      // Получаем обновленного пользователя
      const updatedUser = await this.getUserById(userId);
      if (!updatedUser) {
        throw new Error('User not found after update');
      }

      console.log('[AuthService] ✅ User profile updated successfully');
      return updatedUser;
    } catch (error) {
      console.error('[AuthService] ❌ Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  /**
   * Обновление роли пользователя
   */
  async updateUserRole(userId: string, role: string): Promise<AuthUser> {
    try {
      console.log('[AuthService] 🔄 Updating user role:', userId, 'to:', role);
      
      const { error } = await this.supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) {
        console.error('[AuthService] ❌ Error updating user role:', error);
        throw new Error('Failed to update user role');
      }

      const updatedUser = await this.getUserById(userId);
      if (!updatedUser) {
        throw new Error('User not found after role update');
      }

      console.log('[AuthService] ✅ User role updated successfully');
      return updatedUser;
    } catch (error) {
      console.error('[AuthService] ❌ Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  }

  /**
   * Обновление статуса пользователя
   */
  async updateUserStatus(userId: string, status: string): Promise<AuthUser> {
    try {
      console.log('[AuthService] 🔄 Updating user status:', userId, 'to:', status);
      
      // Обновляем статус в user_metadata
      const { error } = await this.supabase.auth.admin.updateUserById(userId, {
        user_metadata: { status }
      });

      if (error) {
        console.error('[AuthService] ❌ Error updating user status:', error);
        throw new Error('Failed to update user status');
      }

      const updatedUser = await this.getUserById(userId);
      if (!updatedUser) {
        throw new Error('User not found after status update');
      }

      console.log('[AuthService] ✅ User status updated successfully');
      return updatedUser;
    } catch (error) {
      console.error('[AuthService] ❌ Error updating user status:', error);
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
      'user': 0,
      'candidate': 1,
      'member': 2,
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