// apps/server/src/core/services/Call911Service.ts

import { SupabaseClient } from '@supabase/supabase-js';
import { mdtSupabase } from '../lib/supabase';
import { AppError } from '../../utils/AppError';

// Импортируем только Database и создаем локальные типы-алиасы
import type { Database } from '@roleplay-identity/db-types';

// Создаем локальные типы-алиасы из глобального типа Database
type MDTCalls = Database['mdt']['Tables']['calls']['Row'];
type MDTCallsInsert = Database['mdt']['Tables']['calls']['Insert'];
type MDTCallsUpdate = Database['mdt']['Tables']['calls']['Update'];
type UnitsOnDuty = Database['mdt']['Tables']['units_on_duty']['Row'];
type UnitsOnDutyInsert = Database['mdt']['Tables']['units_on_duty']['Insert'];
type UnitsOnDutyUpdate = Database['mdt']['Tables']['units_on_duty']['Update'];

export class Call911Service {
  private db = mdtSupabase;

  // ===== ОСНОВНЫЕ ОПЕРАЦИИ С ВЫЗОВАМИ =====

  public async getActiveCalls(): Promise<MDTCalls[]> {
    // ✅ Обращаемся к таблице 'calls' внутри схемы 'mdt'
    const { data, error } = await (this.db as any)
      .from('calls')
      .select('*')
      .in('status_id', ['pending', 'assigned', 'on_scene'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Call911Service] Error fetching active calls:', error);
      throw new AppError('Не удалось получить активные вызовы.', 500);
    }
    return data || [];
  }

  public async findCallById(id: string): Promise<MDTCalls | null> {
    const { data, error } = await this.db
      .from('calls')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error(`[Call911Service] Error fetching call ${id}:`, error);
      throw new AppError('Ошибка при поиске вызова.', 500);
    }
    return data;
  }
  
  public async createCall(callData: MDTCallsInsert): Promise<MDTCalls> {
    const { data, error } = await this.db
      .from('calls')
      .insert(callData)
      .select()
      .single();

    if (error || !data) {
      console.error('[Call911Service] Error creating call:', error);
      throw new AppError('Не удалось создать вызов.', 500);
    }
    return data;
  }

  public async updateCall(id: string, callData: MDTCallsUpdate): Promise<MDTCalls> {
    const { data, error } = await this.db
      .from('calls')
      .update(callData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error(`[Call911Service] Error updating call ${id}:`, error);
      throw new AppError('Не удалось обновить вызов.', 500);
    }
    return data;
  }

  // ===== ОПЕРАЦИИ С ЮНИТАМИ =====

  public async getActiveUnits(): Promise<UnitsOnDuty[]> {
    const { data, error } = await this.db
      .from('units_on_duty')
      .select('*');

    if (error) {
        console.error('[Call911Service] Error fetching active units:', error);
        throw new AppError("Не удалось получить активные юниты.", 500);
    }
    return data || [];
  }
  
  public async createUnit(unitData: UnitsOnDutyInsert): Promise<UnitsOnDuty> {
    const { data, error } = await this.db
      .from('units_on_duty')
      .insert(unitData)
      .select()
      .single();

    if (error || !data) {
      console.error('[Call911Service] Error creating unit:', error);
      throw new AppError('Не удалось создать юнит.', 500);
    }
    return data;
  }

  public async updateUnit(unitId: string, unitData: UnitsOnDutyUpdate): Promise<UnitsOnDuty> {
    const { data, error } = await this.db
      .from('units_on_duty')
      .update(unitData)
      .eq('id', unitId)
      .select()
      .single();

    if (error || !data) {
      console.error(`[Call911Service] Error updating unit ${unitId}:`, error);
      throw new AppError('Не удалось обновить юнит.', 500);
    }
    return data;
  }
}
