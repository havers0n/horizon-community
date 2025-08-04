// src/core/services/ApplicationService.ts

import { supabase } from '../lib/supabase';
import type { Database } from '@roleplay-identity/db-types';
import { AppError } from '../../utils/AppError';

// ===== ТИПЫ ИЗ ЕДИНОГО ИСТОЧНИКА =====
type MDTApplication = Database['mdt']['Tables']['applications']['Row'];
type MDTApplicationInsert = Database['mdt']['Tables']['applications']['Insert'];
type MDTApplicationUpdate = Database['mdt']['Tables']['applications']['Update'];

// ===== ИНТЕРФЕЙСЫ ДЛЯ ВАЛИДАЦИИ =====
export interface CreateApplicationData {
  type: string;
  authorUserId: string; // ✅ UUID как string
  authorCharacterId: string; // ✅ UUID как string
  data?: any;
  status?: 'pending' | 'approved' | 'rejected';
  statusHistory?: any[];
}

export interface UpdateApplicationData extends Partial<CreateApplicationData> {}

// ===== СОВРЕМЕННЫЙ APPLICATION SERVICE =====
export class ApplicationService {
  private supabase = supabase;

  /**
   * Создать новую заявку
   */
  async createApplication(data: CreateApplicationData): Promise<MDTApplication> {
    try {
      const { data: application, error } = await this.supabase
        .from('applications')
        .insert({
          type: data.type,
          author_user_id: data.authorUserId,
          author_character_id: data.authorCharacterId,
          data: data.data,
          status: data.status || 'pending',
          status_history: data.statusHistory || []
        })
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
  async getApplicationById(id: string): Promise<MDTApplication | null> {
    try {
      const { data, error } = await this.supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
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
  async updateApplication(id: string, data: UpdateApplicationData): Promise<MDTApplication> {
    try {
      const updateData: any = {};
      
      if (data.type !== undefined) updateData.type = data.type;
      if (data.authorUserId !== undefined) updateData.author_user_id = data.authorUserId;
      if (data.authorCharacterId !== undefined) updateData.author_character_id = data.authorCharacterId;
      if (data.data !== undefined) updateData.data = data.data;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.statusHistory !== undefined) updateData.status_history = data.statusHistory;

      const { data: application, error } = await this.supabase
        .from('applications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[ApplicationService] Error updating application:', error);
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
      const { error } = await this.supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[ApplicationService] Error deleting application:', error);
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
  async getUserApplications(userId: string): Promise<MDTApplication[]> {
    try {
      const { data, error } = await this.supabase
        .from('applications')
        .select('*')
        .eq('author_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ApplicationService] Error fetching user applications:', error);
        throw new AppError('Не удалось получить заявки пользователя', 500);
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
  async getApplicationsByStatus(status: string): Promise<MDTApplication[]> {
    try {
      const { data, error } = await this.supabase
        .from('applications')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ApplicationService] Error fetching applications by status:', error);
        throw new AppError('Не удалось получить заявки по статусу', 500);
      }

      return data || [];
    } catch (error) {
      console.error('[ApplicationService] Error in getApplicationsByStatus:', error);
      throw error;
    }
  }
}

// Экспортируем экземпляр сервиса
const applicationService = new ApplicationService();
export default applicationService;