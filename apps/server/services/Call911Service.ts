import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../packages/db-types/src/index';

// ===== ТИПЫ ИЗ ЕДИНОГО ИСТОЧНИКА =====
type MDTCalls = Database['mdt']['Tables']['calls']['Row'];
type MDTCallsInsert = Database['mdt']['Tables']['calls']['Insert'];
type MDTCallsUpdate = Database['mdt']['Tables']['calls']['Update'];

type UnitsOnDuty = Database['mdt']['Tables']['units_on_duty']['Row'];
type UnitsOnDutyInsert = Database['mdt']['Tables']['units_on_duty']['Insert'];
type UnitsOnDutyUpdate = Database['mdt']['Tables']['units_on_duty']['Update'];

// ===== ИНТЕРФЕЙСЫ ДЛЯ ВАЛИДАЦИИ =====
export interface CreateCallData {
  callerName?: string | null;
  callerPhone?: string | null;
  location: string;
  description: string;
  type: string;
  priority?: 'low' | 'medium' | 'high' | 'emergency';
  status?: 'pending' | 'assigned' | 'en_route' | 'on_scene' | 'completed' | 'cancelled';
  patientInfo?: any;
  fireInfo?: any;
  attachments?: any;
  assignedUnits?: string[];
}

export interface UpdateCallData extends Partial<CreateCallData> {}

export interface CreateUnitData {
  characterId: string; // ✅ UUID как string
  unitNumber: string;
  departmentId: string; // ✅ UUID как string
  status?: 'available' | 'busy' | 'en_route' | 'on_scene' | 'panic';
  location?: any;
  currentCallId?: string | null; // ✅ UUID как string
  userId: string; // ✅ UUID как string
}

export interface UpdateUnitData extends Partial<CreateUnitData> {}

export interface CallResponse {
  success: boolean;
  data?: MDTCalls | MDTCalls[];
  error?: string;
}

export interface UnitResponse {
  success: boolean;
  data?: UnitsOnDuty | UnitsOnDuty[];
  error?: string;
}

// ===== СОВРЕМЕННЫЙ CALL911 SERVICE =====
export class Call911Service {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // ===== ОСНОВНЫЕ ОПЕРАЦИИ С ВЫЗОВАМИ =====

  /**
   * Получить все активные вызовы
   */
  async getActiveCalls(): Promise<MDTCalls[]> {
    try {
      const { data, error } = await this.supabase
        .from("calls")
        .select("*")
        .in("status", ["pending", "assigned", "en_route", "on_scene"])
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Call911Service] Error fetching active calls:", error);
        throw new Error("Не удалось получить активные вызовы");
      }

      return data || [];
    } catch (error) {
      console.error("[Call911Service] Error in getActiveCalls:", error);
      throw error;
    }
  }

  /**
   * Найти вызов по ID
   */
  async findCallById(id: string): Promise<MDTCalls | null> {
    try {
      const { data, error } = await this.supabase
        .from("calls")
        .select("*")
        .eq("id", id) // ✅ UUID как string
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error(`[Call911Service] Error fetching call with id ${id}:`, error);
        throw new Error("Ошибка при поиске вызова");
      }

      return data;
    } catch (error) {
      console.error("[Call911Service] Error in findCallById:", error);
      throw error;
    }
  }

  /**
   * Получить все вызовы
   */
  async getAllCalls(): Promise<MDTCalls[]> {
    try {
      const { data, error } = await this.supabase
        .from("calls")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Call911Service] Error fetching all calls:", error);
        throw new Error("Не удалось получить вызовы");
      }

      return data || [];
    } catch (error) {
      console.error("[Call911Service] Error in getAllCalls:", error);
      throw error;
    }
  }

  /**
   * Получить вызовы по статусу
   */
  async getCallsByStatus(status: string): Promise<MDTCalls[]> {
    try {
      const { data, error } = await this.supabase
        .from("calls")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Call911Service] Error fetching calls by status:", error);
        throw new Error("Не удалось получить вызовы по статусу");
      }

      return data || [];
    } catch (error) {
      console.error("[Call911Service] Error in getCallsByStatus:", error);
      throw error;
    }
  }

  /**
   * Получить вызовы по типу
   */
  async getCallsByType(type: string): Promise<MDTCalls[]> {
    try {
      const { data, error } = await this.supabase
        .from("calls")
        .select("*")
        .eq("type", type)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Call911Service] Error fetching calls by type:", error);
        throw new Error("Не удалось получить вызовы по типу");
      }

      return data || [];
    } catch (error) {
      console.error("[Call911Service] Error in getCallsByType:", error);
      throw error;
    }
  }

  /**
   * Создать новый вызов
   */
  async createCall(callData: CreateCallData): Promise<MDTCalls> {
    try {
      const insertData: MDTCallsInsert = {
        caller_name: callData.callerName,
        caller_phone: callData.callerPhone,
        location: callData.location,
        description: callData.description,
        type: callData.type,
        priority: callData.priority || 'medium',
        status: callData.status || 'pending',
        patient_info: callData.patientInfo,
        fire_info: callData.fireInfo,
        attachments: callData.attachments,
        assigned_units: callData.assignedUnits
      };

      const { data, error } = await this.supabase
        .from("calls")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("[Call911Service] Error creating call:", error);
        throw new Error("Не удалось создать вызов");
      }

      return data;
    } catch (error) {
      console.error("[Call911Service] Error in createCall:", error);
      throw error;
    }
  }

  /**
   * Обновить вызов
   */
  async updateCall(id: string, callData: UpdateCallData): Promise<MDTCalls> {
    try {
      const updateData: MDTCallsUpdate = {};
      
      if (callData.callerName !== undefined) updateData.caller_name = callData.callerName;
      if (callData.callerPhone !== undefined) updateData.caller_phone = callData.callerPhone;
      if (callData.location !== undefined) updateData.location = callData.location;
      if (callData.description !== undefined) updateData.description = callData.description;
      if (callData.type !== undefined) updateData.type = callData.type;
      if (callData.priority !== undefined) updateData.priority = callData.priority;
      if (callData.status !== undefined) updateData.status = callData.status;
      if (callData.patientInfo !== undefined) updateData.patient_info = callData.patientInfo;
      if (callData.fireInfo !== undefined) updateData.fire_info = callData.fireInfo;
      if (callData.attachments !== undefined) updateData.attachments = callData.attachments;
      if (callData.assignedUnits !== undefined) updateData.assigned_units = callData.assignedUnits;

      const { data, error } = await this.supabase
        .from("calls")
        .update(updateData)
        .eq("id", id) // ✅ UUID как string
        .select()
        .single();

      if (error) {
        console.error("[Call911Service] Error updating call:", error);
        throw new Error("Не удалось обновить вызов");
      }

      return data;
    } catch (error) {
      console.error("[Call911Service] Error in updateCall:", error);
      throw error;
    }
  }

  /**
   * Удалить вызов
   */
  async deleteCall(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("calls")
        .delete()
        .eq("id", id); // ✅ UUID как string

      if (error) {
        console.error("[Call911Service] Error deleting call:", error);
        throw new Error("Не удалось удалить вызов");
      }

      return true;
    } catch (error) {
      console.error("[Call911Service] Error in deleteCall:", error);
      throw error;
    }
  }

  /**
   * Назначить юниты на вызов
   */
  async assignUnits(callId: string, unitIds: string[]): Promise<void> {
    try {
      // Обновляем вызов с назначенными юнитами
      await this.updateCall(callId, { assignedUnits: unitIds });

      // Обновляем статус юнитов
      for (const unitId of unitIds) {
        await this.updateUnit(unitId, { 
          currentCallId: callId,
          status: 'en_route'
        });
      }
    } catch (error) {
      console.error("[Call911Service] Error in assignUnits:", error);
      throw error;
    }
  }

  /**
   * Обновить статус вызова
   */
  async updateCallStatus(callId: string, status: 'pending' | 'assigned' | 'en_route' | 'on_scene' | 'completed' | 'cancelled'): Promise<MDTCalls> {
    try {
      return await this.updateCall(callId, { status });
    } catch (error) {
      console.error("[Call911Service] Error in updateCallStatus:", error);
      throw error;
    }
  }

  // ===== ОПЕРАЦИИ С ЮНИТАМИ =====

  /**
   * Получить все активные юниты
   */
  async getActiveUnits(): Promise<UnitsOnDuty[]> {
    try {
      const { data, error } = await this.supabase
        .from("units_on_duty")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Call911Service] Error fetching active units:", error);
        throw new Error("Не удалось получить активные юниты");
      }

      return data || [];
    } catch (error) {
      console.error("[Call911Service] Error in getActiveUnits:", error);
      throw error;
    }
  }

  /**
   * Получить юнит по ID
   */
  async getUnitById(unitId: string): Promise<UnitsOnDuty | null> {
    try {
      const { data, error } = await this.supabase
        .from("units_on_duty")
        .select("*")
        .eq("id", unitId) // ✅ UUID как string
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error(`[Call911Service] Error fetching unit with id ${unitId}:`, error);
        throw new Error("Ошибка при поиске юнита");
      }

      return data;
    } catch (error) {
      console.error("[Call911Service] Error in getUnitById:", error);
      throw error;
    }
  }

  /**
   * Получить юниты по департаменту
   */
  async getUnitsByDepartment(departmentId: string): Promise<UnitsOnDuty[]> {
    try {
      const { data, error } = await this.supabase
        .from("units_on_duty")
        .select("*")
        .eq("department_id", departmentId) // ✅ UUID как string
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Call911Service] Error fetching units by department:", error);
        throw new Error("Не удалось получить юниты по департаменту");
      }

      return data || [];
    } catch (error) {
      console.error("[Call911Service] Error in getUnitsByDepartment:", error);
      throw error;
    }
  }

  /**
   * Получить юниты по статусу
   */
  async getUnitsByStatus(status: string): Promise<UnitsOnDuty[]> {
    try {
      const { data, error } = await this.supabase
        .from("units_on_duty")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Call911Service] Error fetching units by status:", error);
        throw new Error("Не удалось получить юниты по статусу");
      }

      return data || [];
    } catch (error) {
      console.error("[Call911Service] Error in getUnitsByStatus:", error);
      throw error;
    }
  }

  /**
   * Создать новый юнит
   */
  async createUnit(data: CreateUnitData): Promise<UnitsOnDuty> {
    try {
      const insertData: UnitsOnDutyInsert = {
        character_id: data.characterId, // ✅ UUID как string
        unit_number: data.unitNumber,
        department_id: data.departmentId, // ✅ UUID как string
        status: data.status || 'available',
        location: data.location,
        current_call_id: data.currentCallId, // ✅ UUID как string
        user_id: data.userId // ✅ UUID как string
      };

      const { data: unit, error } = await this.supabase
        .from("units_on_duty")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("[Call911Service] Error creating unit:", error);
        throw new Error("Не удалось создать юнит");
      }

      return unit;
    } catch (error) {
      console.error("[Call911Service] Error in createUnit:", error);
      throw error;
    }
  }

  /**
   * Обновить юнит
   */
  async updateUnit(unitId: string, data: UpdateUnitData): Promise<UnitsOnDuty> {
    try {
      const updateData: UnitsOnDutyUpdate = {};
      
      if (data.characterId !== undefined) updateData.character_id = data.characterId;
      if (data.unitNumber !== undefined) updateData.unit_number = data.unitNumber;
      if (data.departmentId !== undefined) updateData.department_id = data.departmentId;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.currentCallId !== undefined) updateData.current_call_id = data.currentCallId;
      if (data.userId !== undefined) updateData.user_id = data.userId;

      const { data: unit, error } = await this.supabase
        .from("units_on_duty")
        .update(updateData)
        .eq("id", unitId) // ✅ UUID как string
        .select()
        .single();

      if (error) {
        console.error("[Call911Service] Error updating unit:", error);
        throw new Error("Не удалось обновить юнит");
      }

      return unit;
    } catch (error) {
      console.error("[Call911Service] Error in updateUnit:", error);
      throw error;
    }
  }

  /**
   * Обновить статус юнита
   */
  async updateUnitStatus(unitId: string, status: 'available' | 'busy' | 'en_route' | 'on_scene' | 'panic'): Promise<UnitsOnDuty> {
    try {
      return await this.updateUnit(unitId, { status });
    } catch (error) {
      console.error("[Call911Service] Error in updateUnitStatus:", error);
      throw error;
    }
  }

  /**
   * Обновить местоположение юнита
   */
  async updateUnitLocation(unitId: string, location: any): Promise<UnitsOnDuty> {
    try {
      return await this.updateUnit(unitId, { location });
    } catch (error) {
      console.error("[Call911Service] Error in updateUnitLocation:", error);
      throw error;
    }
  }

  /**
   * Удалить юнит
   */
  async deleteUnit(unitId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("units_on_duty")
        .delete()
        .eq("id", unitId); // ✅ UUID как string

      if (error) {
        console.error("[Call911Service] Error deleting unit:", error);
        throw new Error("Не удалось удалить юнит");
      }

      return true;
    } catch (error) {
      console.error("[Call911Service] Error in deleteUnit:", error);
      throw error;
    }
  }

  /**
   * Активировать панику для юнита
   */
  async activatePanic(unitId: string): Promise<void> {
    try {
      await this.updateUnitStatus(unitId, 'panic');
    } catch (error) {
      console.error("[Call911Service] Error in activatePanic:", error);
      throw error;
    }
  }

  /**
   * Деактивировать панику для юнита
   */
  async deactivatePanic(unitId: string): Promise<void> {
    try {
      await this.updateUnitStatus(unitId, 'available');
    } catch (error) {
      console.error("[Call911Service] Error in deactivatePanic:", error);
      throw error;
    }
  }

  /**
   * Получить доступные юниты
   */
  async getAvailableUnits(): Promise<UnitsOnDuty[]> {
    try {
      return await this.getUnitsByStatus('available');
    } catch (error) {
      console.error("[Call911Service] Error in getAvailableUnits:", error);
      throw error;
    }
  }

  /**
   * Получить ближайшие юниты (заглушка для будущей реализации)
   */
  async getNearbyUnits(location: string, radius: number = 5): Promise<UnitsOnDuty[]> {
    try {
      // TODO: Реализовать геолокационный поиск
      console.log(`[Call911Service] Getting units near ${location} within ${radius}km radius`);
      return await this.getAvailableUnits();
    } catch (error) {
      console.error("[Call911Service] Error in getNearbyUnits:", error);
      throw error;
    }
  }
} 