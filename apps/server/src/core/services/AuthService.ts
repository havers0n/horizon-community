import { createClient } from '@supabase/supabase-js';
import type { Database } from '@roleplay-identity/db-types';

// ===== ТИПЫ ИЗ ЕДИНОГО ИСТОЧНИКА =====
type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

// ===== ИНТЕРФЕЙСЫ ДЛЯ ВАЛИДАЦИИ =====
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: Profile;
    session?: any;
  };
  error?: string;
}

// ===== СОВРЕМЕННЫЙ AUTH SERVICE =====
export class AuthService {
  private supabaseAdmin;
  private supabase;

  constructor() {
    this.supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );
  }

  // ===== РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ =====
  async registerUser(data: RegisterData): Promise<AuthResponse> {
    try {
      // ✅ UUID правило: все ID как string
      const { username, email, password } = data;

      // Проверяем существование пользователя
      const { data: existingUsers, error: checkError } = await this.supabaseAdmin.auth.admin.listUsers();
      
      if (checkError) {
        return {
          success: false,
          error: 'Failed to check existing users'
        };
      }
      
      const userExists = existingUsers.users.some(user => 
        user.email === email || user.user_metadata?.username === username
      );
      
      if (userExists) {
        return {
          success: false,
          error: 'User already exists'
        };
      }
      
      // Создаем пользователя в Supabase Auth
      const { data: authData, error: authError } = await this.supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username }
      });
      
      if (authError) {
        return {
          success: false,
          error: authError.message
        };
      }

      // ✅ Сервисный слой: создаем профиль в БД
      const profileData: ProfileInsert = {
        id: authData.user.id, // ✅ UUID как string
        username,
        email,
        role: 'candidate'
      };

      const { data: profile, error: profileError } = await this.supabaseAdmin
        .from('profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (profileError) {
        // Удаляем созданного пользователя если не удалось создать профиль
        await this.supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return {
          success: false,
          error: 'Failed to create user profile'
        };
      }
      
      return {
        success: true,
        data: {
          user: profile,
          session: authData.session
        }
      };
    } catch (error) {
      console.error('[AuthService] Registration error:', error);
      return {
        success: false,
        error: 'Registration failed'
      };
    }
  }

  // ===== АВТОРИЗАЦИЯ ПОЛЬЗОВАТЕЛЯ =====
  async loginUser(data: LoginData): Promise<AuthResponse> {
    try {
      const { email, password } = data;
      
      // Аутентификация через Supabase
      const { data: authData, error: authError } = await this.supabaseAdmin.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }
      
      // ✅ Сервисный слой: получаем профиль из БД
      const { data: profile, error: profileError } = await this.supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id) // ✅ UUID как string
        .single();
      
      if (profileError || !profile) {
        return {
          success: false,
          error: 'User profile not found'
        };
      }
      
      return {
        success: true,
        data: {
          user: profile
        }
      };
    } catch (error) {
      console.error('[AuthService] Login error:', error);
      return {
        success: false,
        error: 'Login failed'
      };
    }
  }

  // ===== ПОЛУЧЕНИЕ ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ =====
  async getUserProfile(userId: string): Promise<Profile | null> {
    try {
      const { data: profile, error } = await this.supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId) // ✅ UUID как string
        .single();

      if (error || !profile) {
        return null;
      }

      return profile;
    } catch (error) {
      console.error('[AuthService] Error getting user profile:', error);
      return null;
    }
  }

  // ===== ВАЛИДАЦИЯ ТОКЕНА =====
  async validateToken(token: string): Promise<Profile | null> {
    try {
      const { data: { user }, error } = await this.supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        return null;
      }

      return await this.getUserProfile(user.id);
    } catch (error) {
      console.error('[AuthService] Token validation error:', error);
      return null;
    }
  }

  // ===== ВЫХОД ИЗ СИСТЕМЫ =====
  async logoutUser(): Promise<{ success: boolean; error?: string }> {
    try {
      // Supabase обрабатывает выход на клиентской стороне
      return { success: true };
    } catch (error) {
      console.error('[AuthService] Logout error:', error);
      return {
        success: false,
        error: 'Logout failed'
      };
    }
  }

  // ===== МЕТОДЫ ДЛЯ MIDDLEWARE =====
  
  async authenticate(token: string): Promise<AuthUser | null> {
    return await this.validateToken(token);
  }

  async validateCadToken(cadToken: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      // Здесь должна быть логика валидации CAD токена
      // Пока возвращаем заглушку
      return {
        success: false,
        error: 'CAD token validation not implemented'
      };
    } catch (error) {
      return {
        success: false,
        error: 'CAD token validation failed'
      };
    }
  }

  async validateApiToken(apiToken: string): Promise<{ valid: boolean; user?: AuthUser; error?: string }> {
    try {
      // Здесь должна быть логика валидации API токена
      // Пока возвращаем заглушку
      return {
        valid: false,
        error: 'API token validation not implemented'
      };
    } catch (error) {
      return {
        valid: false,
        error: 'API token validation failed'
      };
    }
  }

  hasMinimumRole(user: AuthUser | undefined, minimumRole: string): boolean {
    if (!user) return false;
    
    const roleHierarchy = {
      'candidate': 0,
      'citizen': 1,
      'leo': 2,
      'ems_fd': 2,
      'dispatch': 3,
      'admin': 4
    };
    
    const userRoleLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel = roleHierarchy[minimumRole as keyof typeof roleHierarchy] || 0;
    
    return userRoleLevel >= requiredRoleLevel;
  }

  hasRole(user: AuthUser | undefined, role: string): boolean {
    if (!user) return false;
    return user.role === role;
  }

  hasPermission(user: AuthUser | undefined, permission: string): boolean {
    if (!user) return false;
    
    // Базовая логика проверки разрешений
    // В реальном приложении здесь должна быть более сложная логика
    return user.role === 'admin' || user.role === 'dispatch';
  }
}

// Экспортируем экземпляр для использования в middleware
export const authService = new AuthService();

// Экспортируем тип для совместимости
export type AuthUser = Profile; 