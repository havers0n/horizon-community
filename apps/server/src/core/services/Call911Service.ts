// apps/server/src/core/services/Call911Service.ts

import { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseClient } from '../lib/supabase';
import { AppError } from '../../utils/AppError';

// ПРАВИЛО 2: ✅ Импортируем ВСЕ типы напрямую из db-types
import type {
  Database,
  MDTCalls,
  MDTCallsInsert,
  MDTCallsUpdate,
  UnitsOnDuty,
  UnitsOnDutyInsert,
  UnitsOnDutyUpdate
} from '@roleplay-identity/db-types';

export class Call911Service {
  // ✅ Явно указываем, что клиент работает с таблицами из схемы 'mdt'
  private supabase: any; 

  constructor() {
    // ✅ Создаем клиент для конкретной схемы
    this.supabase = createSupabaseClient('public');
  }

  // ===== ОСНОВНЫЕ ОПЕРАЦИИ С ВЫЗОВАМИ =====

  public async getActiveCalls(): Promise<MDTCalls[]> {
    // ✅ Обращаемся к таблице 'calls' внутри схемы 'mdt'
    const { data, error } = await this.supabase
      .from('calls')
      .select('*')
      .in('status', ['pending', 'assigned', 'en_route', 'on_scene'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Call911Service] Error fetching active calls:', error);
      throw new AppError('Не удалось получить активные вызовы.', 500);
    }
    return data || [];
  }

  public async findCallById(id: string): Promise<MDTCalls | null> {
    const { data, error } = await this.supabase
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
    const { data, error } = await this.supabase
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
    const { data, error } = await this.supabase
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
    const { data, error } = await this.supabase
      .from('units_on_duty')
      .select('*');

    if (error) {
        console.error('[Call911Service] Error fetching active units:', error);
        throw new AppError("Не удалось получить активные юниты.", 500);
    }
    return data || [];
  }
  
  public async createUnit(unitData: UnitsOnDutyInsert): Promise<UnitsOnDuty> {
    const { data, error } = await this.supabase
      .from('units_on_duty')
      .insert(unitData)
      .select()
      .single();

    if (error || !data) {
        console.error('[Call911Service] Error creating unit:', error);
        throw new AppError("Не удалось создать юнит.", 500);
    }
    return data;
  }
  
  public async updateUnit(unitId: string, unitData: UnitsOnDutyUpdate): Promise<UnitsOnDuty> {
    const { data, error } = await this.supabase
      .from('units_on_duty')
      .update(unitData)
      .eq('id', unitId)
      .select()
      .single();

    if (error || !data) {
        console.error(`[Call911Service] Error updating unit ${unitId}:`, error);
        throw new AppError("Не удалось обновить юнит.", 500);
    }
    return data;
  }

  // ... (здесь должны быть остальные методы из старого файла, но они уже написаны по этому же принципу)
}
