// src/core/services/ApplicationService.ts

import { SupabaseClient } from '@supabase/supabase-js';
import { systemSupabase } from '../lib/supabase';
import type { Database } from '@roleplay-identity/db-types';
import { AppError } from '../../utils/AppError';

// ===== ТИПЫ ИЗ ЕДИНОГО ИСТОЧНИКА (system схема) =====
type SystemApplication = Database['system']['Tables']['applications']['Row'];
type SystemApplicationInsert = Database['system']['Tables']['applications']['Insert'];
type SystemApplicationUpdate = Database['system']['Tables']['applications']['Update'];

// Статус в system схеме хранится как строковый идентификатор
type ApplicationStatus = string;

// ===== ИНТЕРФЕЙСЫ ДЛЯ ВАЛИДАЦИИ =====
export interface CreateApplicationData {
  type: string;
  author_user_id: string; // ✅ UUID как string
  author_character_id: string; // ✅ UUID как string
  data?: any;
  status?: ApplicationStatus; // Идентификатор статуса
}

export interface UpdateApplicationData extends Partial<CreateApplicationData> {}

// ===== СОВРЕМЕННЫЙ APPLICATION SERVICE =====
export class ApplicationService {
  // ✅ Пер-запросный клиент для схемы 'system'. ВРЕМЕННЫЙ fallback для обратной совместимости с DI
  private readonly db: SupabaseClient<Database, 'system'>;

  constructor(systemDb?: SupabaseClient<Database, 'system'>) {
    this.db = systemDb ?? (systemSupabase as unknown as SupabaseClient<Database, 'system'>);
  }

  /**
   * Создать новую заявку
   */
  async createApplication(data: CreateApplicationData): Promise<SystemApplication> {
    try {
      const { data: application, error } = await this.db
        .from('applications')
        .insert({
          type: data.type,
          author_user_id: data.author_user_id,
          author_character_id: data.author_character_id,
          data: (data.data ?? null) as any,
          status_id: (data.status || 'awaiting_review') as any,
          target_department_id: (data as any).target_department_id || 'general'
        } as any)
        .select()
        .single();

      if (error) {
        console.error('[ApplicationService] Error creating application:', error);
        throw new AppError('Не удалось создать заявку', 500);
      }

      return application;
    } catch (error) {
      console.error('[ApplicationService] Error in createApplication:', error);
      throw error;
    }
  }

  /**
   * Получить заявку по ID
   */
  async getApplicationById(id: string): Promise<SystemApplication | null> {
    try {
      const { data, error } = await this.db
        .from('applications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if ((error as any).code === 'PGRST116') return null;
        console.error(`[ApplicationService] Error fetching application with id ${id}:`, error);
        throw new AppError('Ошибка при поиске заявки', 500);
      }

      return data;
    } catch (error) {
      console.error('[ApplicationService] Error in getApplicationById:', error);
      throw error;
    }
  }

  /**
   * Обновить заявку
   */
  async updateApplication(id: string, data: UpdateApplicationData): Promise<SystemApplication> {
    try {
      const updateData: any = {};
      
      if (data.type !== undefined) updateData.type = data.type;
      if (data.author_user_id !== undefined) updateData.author_user_id = data.author_user_id;
      if (data.author_character_id !== undefined) updateData.author_character_id = data.author_character_id;
      if (data.data !== undefined) updateData.data = data.data;
      if (data.status !== undefined) updateData.status_id = data.status;

      const { data: application, error } = await this.db
        .from('applications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`[ApplicationService] Error updating application with id ${id}:`, error);
        throw new AppError('Не удалось обновить заявку', 500);
      }

      return application;
    } catch (error) {
      console.error('[ApplicationService] Error in updateApplication:', error);
      throw error;
    }
  }

  /**
   * Удалить заявку
   */
  async deleteApplication(id: string): Promise<boolean> {
    try {
      const { error } = await this.db
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`[ApplicationService] Error deleting application with id ${id}:`, error);
        throw new AppError('Не удалось удалить заявку', 500);
      }

      return true;
    } catch (error) {
      console.error('[ApplicationService] Error in deleteApplication:', error);
      throw error;
    }
  }

  /**
   * Получить все заявки пользователя
   */
  async getUserApplications(user_id: string): Promise<SystemApplication[]> {
    try {
      const { data, error } = await this.db
        .from('applications')
        .select('*')
        .eq('author_user_id', user_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`[ApplicationService] Error fetching applications for user ${user_id}:`, error);
        throw new AppError('Ошибка при получении заявок пользователя', 500);
      }

      return data || [];
    } catch (error) {
      console.error('[ApplicationService] Error in getUserApplications:', error);
      throw error;
    }
  }

  /**
   * Получить заявки по статусу
   */
  async getApplicationsByStatus(status: ApplicationStatus): Promise<SystemApplication[]> {
    try {
      const { data, error } = await this.db
        .from('applications')
        .select('*')
        .eq('status_id', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`[ApplicationService] Error fetching applications with status ${status}:`, error);
        throw new AppError('Ошибка при получении заявок по статусу', 500);
      }

      return data || [];
    } catch (error) {
      console.error('[ApplicationService] Error in getApplicationsByStatus:', error);
      throw error;
    }
  }
}