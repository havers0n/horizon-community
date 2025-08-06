// apps/server/src/core/services/UserService.ts
// Сервис для работы с пользователями

import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '@roleplay-identity/db-types';
import bcrypt from 'bcrypt';

// Типы из базы данных
type Profiles = Database['public']['Tables']['profiles']['Row'];
type ProfilesInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfilesUpdate = Database['public']['Tables']['profiles']['Update'];

// Интерфейсы для API
export interface User extends Profiles {}
export interface InsertUser {
  id: string;
  email: string;
  username: string;
  role?: "citizen" | "candidate" | "staff" | "admin";
}
export interface UpdateUser extends Partial<ProfilesUpdate> {}

export enum UserRole {
  CITIZEN = 'citizen',
  CANDIDATE = 'candidate',
  STAFF = 'staff',
  ADMIN = 'admin'
}

export class UserService {
  private db = supabase;

  private mapUserRoleToDatabase(userRole: UserRole): "citizen" | "candidate" | "staff" | "admin" {
    switch (userRole) {
      case UserRole.CITIZEN:
        return "citizen";
      case UserRole.CANDIDATE:
        return "candidate";
      case UserRole.STAFF:
        return "staff";
      case UserRole.ADMIN:
        return "admin";
      default:
        return "citizen";
    }
  }

  private mapDatabaseRoleToUserRole(dbRole: string): UserRole {
    switch (dbRole) {
      case "citizen":
        return UserRole.CITIZEN;
      case "candidate":
        return UserRole.CANDIDATE;
      case "staff":
        return UserRole.STAFF;
      case "admin":
        return UserRole.ADMIN;
      default:
        return UserRole.CITIZEN;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    const { data, error } = await this.db
      .from('profiles')
      .insert({
        id: userData.id,
        email: userData.email,
        username: userData.username,
        role: userData.role || 'citizen'
      })
      .select()
      .single();

    if (error || !data) {
      console.error('[UserService] Error creating user:', error);
      throw new Error('Не удалось создать пользователя');
    }

    return data;
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[UserService] Error fetching all users:', error);
      throw new Error('Не удалось получить список пользователей');
    }

    return data || [];
  }

  async updateUser(id: string, updates: UpdateUser): Promise<User> {
    const { data, error } = await this.db
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('[UserService] Error updating user:', error);
      throw new Error('Не удалось обновить пользователя');
    }

    return data;
  }

  async deactivateUser(id: string): Promise<User> {
    // В текущей схеме нет поля is_active, поэтому просто возвращаем пользователя
    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[UserService] Error getting user:', error);
      throw new Error('Не удалось получить пользователя');
    }

    return data;
  }

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await this.db
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[UserService] Error deleting user:', error);
      throw new Error('Не удалось удалить пользователя');
    }

    return true;
  }

  async updateLastLogin(id: string): Promise<User> {
    // В текущей схеме нет поля last_login, поэтому просто возвращаем пользователя
    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[UserService] Error getting user:', error);
      throw new Error('Не удалось получить пользователя');
    }

    return data;
  }

  async searchUsers(query: string): Promise<User[]> {
    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[UserService] Error searching users:', error);
      throw new Error('Не удалось выполнить поиск пользователей');
    }

    return data || [];
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .eq('role', this.mapUserRoleToDatabase(role))
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[UserService] Error fetching users by role:', error);
      throw new Error('Не удалось получить пользователей по роли');
    }

    return data || [];
  }

  async verifyUser(id: string): Promise<User> {
    // В текущей схеме нет поля is_verified, поэтому просто возвращаем пользователя
    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[UserService] Error getting user:', error);
      throw new Error('Не удалось получить пользователя');
    }

    return data;
  }

  async getUsersCount(): Promise<number> {
    const { count, error } = await this.db
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('[UserService] Error getting users count:', error);
      throw new Error('Не удалось получить количество пользователей');
    }

    return count || 0;
  }

  async getActiveUsersCount(): Promise<number> {
    // В текущей схеме нет поля is_active, поэтому возвращаем общее количество
    return this.getUsersCount();
  }

  async getUserStats(): Promise<any> {
    const { data, error } = await this.db
      .from('profiles')
      .select('role');

    if (error) {
      console.error('[UserService] Error getting user stats:', error);
      throw new Error('Не удалось получить статистику пользователей');
    }

    const stats = {
      total: data?.length || 0,
      active: data?.length || 0, // В текущей схеме нет поля is_active
      inactive: 0, // В текущей схеме нет поля is_active
      byRole: {} as Record<string, number>
    };

    data?.forEach(user => {
      const role = user.role || 'unknown';
      stats.byRole[role] = (stats.byRole[role] || 0) + 1;
    });

    return stats;
  }

  async getUserActivity(days: number): Promise<any[]> {
    // Этот метод может быть реализован позже для отслеживания активности пользователей
    return [];
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private mapDatabaseUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      role: dbUser.role,
      created_at: dbUser.created_at
    };
  }
} 