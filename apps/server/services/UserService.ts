import { supabase } from '../lib/supabase.js';
import type { Database } from '../../../packages/db-types/src/index';

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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return undefined;
      }

      return this.adaptSupabaseProfileToUser(data);
    } catch (error) {
      console.error('[UserService] Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        return undefined;
      }

      return this.adaptSupabaseProfileToUser(data);
    } catch (error) {
      console.error('[UserService] Error getting user by email:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) {
        return undefined;
      }

      return this.adaptSupabaseProfileToUser(data);
    } catch (error) {
      console.error('[UserService] Error getting user by username:', error);
      return undefined;
    }
  }

  async getUserByAuthId(authId: string): Promise<User | undefined> {
    // В новой схеме auth_id = id
    return await this.getUser(authId);
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const supabaseProfile = this.adaptUserToSupabaseProfile(user);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(supabaseProfile)
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to create user: ${error?.message || 'Unknown error'}`);
      }

      return this.adaptSupabaseProfileToUser(data);
    } catch (error) {
      console.error('[UserService] Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      const supabaseUpdates: ProfileUpdate = {};
      
      if (updates.username !== undefined) supabaseUpdates.username = updates.username;
      if (updates.email !== undefined) supabaseUpdates.email = updates.email;
      if (updates.role !== undefined) supabaseUpdates.role = updates.role;
      
      const { data, error } = await supabase
        .from('profiles')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        return undefined;
      }

      return this.adaptSupabaseProfileToUser(data);
    } catch (error) {
      console.error('[UserService] Error updating user:', error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error || !data) {
        return [];
      }

      return data.map(profile => this.adaptSupabaseProfileToUser(profile));
    } catch (error) {
      console.error('[UserService] Error getting all users:', error);
      return [];
    }
  }

  async getUsersByDepartment(departmentId: string): Promise<User[]> {
    // В новой схеме department_id не хранится в profiles
    // Возвращаем пустой массив, так как эта информация не доступна
    console.warn('[UserService] getUsersByDepartment: department information not available in profiles table');
    return [];
  }

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', role);

      if (error || !data) {
        return [];
      }

      return data.map(profile => this.adaptSupabaseProfileToUser(profile));
    } catch (error) {
      console.error('[UserService] Error getting users by role:', error);
      return [];
    }
  }

  async getUsersByStatus(status: string): Promise<User[]> {
    // В новой схеме статус не хранится в profiles
    // Возвращаем всех пользователей как активных
    if (status === 'active') {
      return await this.getAllUsers();
    }
    return [];
  }

  // ===== ПОИСК И ФИЛЬТРАЦИЯ =====
  
  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(limit);

      if (error || !data) {
        return [];
      }

      return data.map(profile => this.adaptSupabaseProfileToUser(profile));
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
      let query = supabase.from('profiles').select('*');
      
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      let filteredData = data;
      
      // Фильтрация по статусу (все пользователи считаются активными)
      if (filters.status && filters.status !== 'active') {
        filteredData = [];
      }
      
      return filteredData.map(profile => this.adaptSupabaseProfileToUser(profile));
    } catch (error) {
      console.error('[UserService] Error getting users with filters:', error);
      return [];
    }
  }

  // ===== СТАТИСТИКА =====
  
  async getUserCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('[UserService] Error getting user count:', error);
      return 0;
    }
  }

  async getUserCountByDepartment(departmentId: string): Promise<number> {
    // В новой схеме department_id не хранится в profiles
    console.warn('[UserService] getUserCountByDepartment: department information not available in profiles table');
    return 0;
  }

  async getUserCountByRole(role: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', role);

      if (error) {
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('[UserService] Error getting user count by role:', error);
      return 0;
    }
  }

  async getUserCountByStatus(status: string): Promise<number> {
    // В новой схеме статус не хранится в profiles
    if (status === 'active') {
      return await this.getUserCount();
    }
    return 0;
  }

  // ===== ВАЛИДАЦИЯ =====
  
  async validatePassword(password: string, hash: string): Promise<boolean> {
    // Используем bcrypt для валидации паролей
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(password, hash);
  }

  async hashPassword(password: string): Promise<string> {
    // Используем bcrypt для хеширования паролей
    const bcrypt = require('bcrypt');
    return await bcrypt.hash(password, 10);
  }

  // ===== БИЗНЕС-ЛОГИКА =====
  
  async isUsernameAvailable(username: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    return !user;
  }

  async isEmailAvailable(email: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    return !user;
  }

  async activateUser(id: string): Promise<User | undefined> {
    // В новой схеме все пользователи считаются активными
    return await this.getUser(id);
  }

  async deactivateUser(id: string): Promise<User | undefined> {
    // В новой схеме деактивация не поддерживается
    console.warn('[UserService] deactivateUser: user deactivation not supported in new schema');
    return await this.getUser(id);
  }

  async suspendUser(id: string): Promise<User | undefined> {
    // В новой схеме приостановка не поддерживается
    console.warn('[UserService] suspendUser: user suspension not supported in new schema');
    return await this.getUser(id);
  }

  async addGameWarning(id: string): Promise<User | undefined> {
    // В новой схеме предупреждения не поддерживаются
    console.warn('[UserService] addGameWarning: warnings not supported in new schema');
    return await this.getUser(id);
  }

  async addAdminWarning(id: string): Promise<User | undefined> {
    // В новой схеме предупреждения не поддерживаются
    console.warn('[UserService] addAdminWarning: warnings not supported in new schema');
    return await this.getUser(id);
  }

  async resetWarnings(id: string): Promise<User | undefined> {
    // В новой схеме предупреждения не поддерживаются
    console.warn('[UserService] resetWarnings: warnings not supported in new schema');
    return await this.getUser(id);
  }
}

// Экспортируем единственный экземпляр
export const userService = new UserService(); 