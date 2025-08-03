import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../packages/db-types/src/index';

// ===== ТИПЫ ИЗ ЕДИНОГО ИСТОЧНИКА =====
type MDTBolo = Database['mdt']['Tables']['bolos']['Row'];
type MDTBoloInsert = Database['mdt']['Tables']['bolos']['Insert'];
type MDTBoloUpdate = Database['mdt']['Tables']['bolos']['Update'];

type MDTSignal = Database['mdt']['Tables']['mdt_signals']['Row'];
type MDTSignalInsert = Database['mdt']['Tables']['mdt_signals']['Insert'];
type MDTSignalUpdate = Database['mdt']['Tables']['mdt_signals']['Update'];

type MDTNotification = Database['mdt']['Tables']['notifications']['Row'];
type MDTNotificationInsert = Database['mdt']['Tables']['notifications']['Insert'];
type MDTNotificationUpdate = Database['mdt']['Tables']['notifications']['Update'];

type MDTApplication = Database['mdt']['Tables']['applications']['Row'];
type MDTApplicationInsert = Database['mdt']['Tables']['applications']['Insert'];
type MDTApplicationUpdate = Database['mdt']['Tables']['applications']['Update'];

type MDTLawReport = Database['mdt']['Tables']['law_reports']['Row'];
type MDTLawReportInsert = Database['mdt']['Tables']['law_reports']['Insert'];
type MDTLawReportUpdate = Database['mdt']['Tables']['law_reports']['Update'];

type MDTEmsFdReport = Database['mdt']['Tables']['ems_fd_reports']['Row'];
type MDTEmsFdReportInsert = Database['mdt']['Tables']['ems_fd_reports']['Insert'];
type MDTEmsFdReportUpdate = Database['mdt']['Tables']['ems_fd_reports']['Update'];

// ===== ИНТЕРФЕЙСЫ ДЛЯ ВАЛИДАЦИИ =====

export interface CreateBoloData {
  type: string;
  reason: string;
  subjectName?: string | null;
  subjectDescription?: string | null;
  vehicleDescription?: string | null;
  vehiclePlate?: string | null;
  location?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'emergency';
  authorCharacterId: string; // ✅ UUID как string
  status?: 'active' | 'resolved' | 'expired';
}

export interface UpdateBoloData extends Partial<CreateBoloData> {}

export interface CreateSignalData {
  title: string;
  description?: string | null;
  type?: string | null;
  authorCharacterId?: string | null; // ✅ UUID как string
  priority?: 'low' | 'medium' | 'high' | 'emergency';
  location?: string | null;
  coordinates?: any;
  isActive?: boolean | null;
  expiresAt?: string | null;
}

export interface UpdateSignalData extends Partial<CreateSignalData> {}

export interface CreateNotificationData {
  content: string;
  recipientUserId: string; // ✅ UUID как string
  isRead?: boolean;
  link?: string | null;
}

export interface CreateApplicationData {
  type: string;
  authorUserId: string; // ✅ UUID как string
  authorCharacterId: string; // ✅ UUID как string
  data?: any;
  status?: 'pending' | 'approved' | 'rejected';
  statusHistory?: any[];
}

export interface UpdateApplicationData extends Partial<CreateApplicationData> {}

export interface CreateLawReportData {
  title: string;
  description: string;
  authorCharacterId: string; // ✅ UUID как string
  incidentLocation: string;
  incidentTime: string;
  incidentType: string;
  participants?: any;
  penalCodes?: any;
  seizedItems?: any;
  callId?: string | null; // ✅ UUID как string
}

export interface CreateEmsFdReportData {
  title: string;
  description: string;
  authorCharacterId: string; // ✅ UUID как string
  incidentLocation: string;
  incidentTime: string;
  incidentType: string;
  patients?: any;
  vitalSigns?: any;
  medicationsAdministered?: any;
  treatmentProvided?: string | null;
  outcome?: string | null;
  fireDetails?: any;
  callId?: string | null; // ✅ UUID как string
}

// ===== СОВРЕМЕННЫЙ MDT SERVICE =====
export class MDTService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // ===== ОПЕРАЦИИ С BOLO (BE ON THE LOOKOUT) =====

  /**
   * Получить все активные BOLO
   */
  async getBolos(): Promise<MDTBolo[]> {
    try {
      const { data, error } = await this.supabase
        .from("bolos")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[MDTService] Error fetching bolos:", error);
        throw new Error("Не удалось получить BOLO");
      }

      return data || [];
    } catch (error) {
      console.error("[MDTService] Error in getBolos:", error);
      throw error;
    }
  }

  /**
   * Получить BOLO по ID
   */
  async getBoloById(boloId: string): Promise<MDTBolo | null> {
    try {
      const { data, error } = await this.supabase
        .from("bolos")
        .select("*")
        .eq("id", boloId) // ✅ UUID как string
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error(`[MDTService] Error fetching bolo with id ${boloId}:`, error);
        throw new Error("Ошибка при поиске BOLO");
      }

      return data;
    } catch (error) {
      console.error("[MDTService] Error in getBoloById:", error);
      throw error;
    }
  }

  /**
   * Получить BOLO по типу
   */
  async getBolosByType(type: string): Promise<MDTBolo[]> {
    try {
      const { data, error } = await this.supabase
        .from("bolos")
        .select("*")
        .eq("type", type)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[MDTService] Error fetching bolos by type:", error);
        throw new Error("Не удалось получить BOLO по типу");
      }

      return data || [];
    } catch (error) {
      console.error("[MDTService] Error in getBolosByType:", error);
      throw error;
    }
  }

  /**
   * Получить BOLO по приоритету
   */
  async getBolosByPriority(priority: string): Promise<MDTBolo[]> {
    try {
      const { data, error } = await this.supabase
        .from("bolos")
        .select("*")
        .eq("priority", priority)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[MDTService] Error fetching bolos by priority:", error);
        throw new Error("Не удалось получить BOLO по приоритету");
      }

      return data || [];
    } catch (error) {
      console.error("[MDTService] Error in getBolosByPriority:", error);
      throw error;
    }
  }

  /**
   * Создать новый BOLO
   */
  async createBolo(data: CreateBoloData): Promise<MDTBolo> {
    try {
      const insertData: MDTBoloInsert = {
        type: data.type,
        reason: data.reason,
        subject_name: data.subjectName,
        subject_description: data.subjectDescription,
        vehicle_description: data.vehicleDescription,
        vehicle_plate: data.vehiclePlate,
        location: data.location,
        priority: data.priority || 'medium',
        author_character_id: data.authorCharacterId, // ✅ UUID как string
        status: data.status || 'active'
      };

      const { data: bolo, error } = await this.supabase
        .from("bolos")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("[MDTService] Error creating bolo:", error);
        throw new Error("Не удалось создать BOLO");
      }

      return bolo;
    } catch (error) {
      console.error("[MDTService] Error in createBolo:", error);
      throw error;
    }
  }

  /**
   * Обновить BOLO
   */
  async updateBolo(boloId: string, data: UpdateBoloData): Promise<MDTBolo> {
    try {
      const updateData: MDTBoloUpdate = {};
      
      if (data.type !== undefined) updateData.type = data.type;
      if (data.reason !== undefined) updateData.reason = data.reason;
      if (data.subjectName !== undefined) updateData.subject_name = data.subjectName;
      if (data.subjectDescription !== undefined) updateData.subject_description = data.subjectDescription;
      if (data.vehicleDescription !== undefined) updateData.vehicle_description = data.vehicleDescription;
      if (data.vehiclePlate !== undefined) updateData.vehicle_plate = data.vehiclePlate;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.authorCharacterId !== undefined) updateData.author_character_id = data.authorCharacterId;
      if (data.status !== undefined) updateData.status = data.status;

      const { data: bolo, error } = await this.supabase
        .from("bolos")
        .update(updateData)
        .eq("id", boloId) // ✅ UUID как string
        .select()
        .single();

      if (error) {
        console.error("[MDTService] Error updating bolo:", error);
        throw new Error("Не удалось обновить BOLO");
      }

      return bolo;
    } catch (error) {
      console.error("[MDTService] Error in updateBolo:", error);
      throw error;
    }
  }

  /**
   * Удалить BOLO
   */
  async deleteBolo(boloId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("bolos")
        .delete()
        .eq("id", boloId); // ✅ UUID как string

      if (error) {
        console.error("[MDTService] Error deleting bolo:", error);
        throw new Error("Не удалось удалить BOLO");
      }

      return true;
    } catch (error) {
      console.error("[MDTService] Error in deleteBolo:", error);
      throw error;
    }
  }

  // ===== ОПЕРАЦИИ С СИГНАЛАМИ =====

  /**
   * Получить все активные сигналы
   */
  async getActiveSignals(): Promise<MDTSignal[]> {
    try {
      const { data, error } = await this.supabase
        .from("mdt_signals")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[MDTService] Error fetching signals:", error);
        throw new Error("Не удалось получить сигналы");
      }

      return data || [];
    } catch (error) {
      console.error("[MDTService] Error in getActiveSignals:", error);
      throw error;
    }
  }

  /**
   * Получить сигнал по ID
   */
  async getSignalById(signalId: string): Promise<MDTSignal | null> {
    try {
      const { data, error } = await this.supabase
        .from("mdt_signals")
        .select("*")
        .eq("id", signalId) // ✅ UUID как string
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error(`[MDTService] Error fetching signal with id ${signalId}:`, error);
        throw new Error("Ошибка при поиске сигнала");
      }

      return data;
    } catch (error) {
      console.error("[MDTService] Error in getSignalById:", error);
      throw error;
    }
  }

  /**
   * Создать новый сигнал
   */
  async createSignal(data: CreateSignalData): Promise<MDTSignal> {
    try {
      const insertData: MDTSignalInsert = {
        title: data.title,
        description: data.description,
        type: data.type,
        author_character_id: data.authorCharacterId, // ✅ UUID как string
        priority: data.priority || 'medium',
        location: data.location,
        coordinates: data.coordinates,
        is_active: data.isActive ?? true,
        expires_at: data.expiresAt
      };

      const { data: signal, error } = await this.supabase
        .from("mdt_signals")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("[MDTService] Error creating signal:", error);
        throw new Error("Не удалось создать сигнал");
      }

      return signal;
    } catch (error) {
      console.error("[MDTService] Error in createSignal:", error);
      throw error;
    }
  }

  /**
   * Обновить сигнал
   */
  async updateSignal(signalId: string, data: UpdateSignalData): Promise<MDTSignal> {
    try {
      const updateData: MDTSignalUpdate = {};
      
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.authorCharacterId !== undefined) updateData.author_character_id = data.authorCharacterId;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.coordinates !== undefined) updateData.coordinates = data.coordinates;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;
      if (data.expiresAt !== undefined) updateData.expires_at = data.expiresAt;

      const { data: signal, error } = await this.supabase
        .from("mdt_signals")
        .update(updateData)
        .eq("id", signalId) // ✅ UUID как string
        .select()
        .single();

      if (error) {
        console.error("[MDTService] Error updating signal:", error);
        throw new Error("Не удалось обновить сигнал");
      }

      return signal;
    } catch (error) {
      console.error("[MDTService] Error in updateSignal:", error);
      throw error;
    }
  }

  /**
   * Отозвать сигнал
   */
  async revokeSignal(signalId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("mdt_signals")
        .update({ is_active: false })
        .eq("id", signalId); // ✅ UUID как string

      if (error) {
        console.error("[MDTService] Error revoking signal:", error);
        throw new Error("Не удалось отозвать сигнал");
      }

      return true;
    } catch (error) {
      console.error("[MDTService] Error in revokeSignal:", error);
      throw error;
    }
  }

  /**
   * Уведомить о сигнале
   */
  async notifySignal(signalId: string): Promise<void> {
    try {
      // Получаем сигнал
      const signal = await this.getSignalById(signalId);
      if (!signal) {
        throw new Error("Сигнал не найден");
      }

      // Создаем уведомление для всех активных юнитов
      const { data: units, error: unitsError } = await this.supabase
        .from("units_on_duty")
        .select("user_id")
        .eq("status", "available");

      if (unitsError) {
        console.error("[MDTService] Error fetching units for notification:", unitsError);
        throw new Error("Не удалось получить юниты для уведомления");
      }

      // Создаем уведомления
      const notifications = units.map(unit => ({
        content: `Новый сигнал: ${signal.title}`,
        recipient_user_id: unit.user_id, // ✅ UUID как string
        link: `/mdt/signals/${signalId}`
      }));

      if (notifications.length > 0) {
        const { error: notifyError } = await this.supabase
          .from("notifications")
          .insert(notifications);

        if (notifyError) {
          console.error("[MDTService] Error creating notifications:", notifyError);
          throw new Error("Не удалось создать уведомления");
        }
      }
    } catch (error) {
      console.error("[MDTService] Error in notifySignal:", error);
      throw error;
    }
  }

  // ===== ОПЕРАЦИИ С УВЕДОМЛЕНИЯМИ =====

  /**
   * Создать уведомление
   */
  async createNotification(data: CreateNotificationData): Promise<MDTNotification> {
    try {
      const insertData: MDTNotificationInsert = {
        content: data.content,
        recipient_user_id: data.recipientUserId, // ✅ UUID как string
        is_read: data.isRead ?? false,
        link: data.link
      };

      const { data: notification, error } = await this.supabase
        .from("notifications")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("[MDTService] Error creating notification:", error);
        throw new Error("Не удалось создать уведомление");
      }

      return notification;
    } catch (error) {
      console.error("[MDTService] Error in createNotification:", error);
      throw error;
    }
  }

  /**
   * Получить уведомления пользователя
   */
  async getNotifications(userId: string): Promise<MDTNotification[]> {
    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .select("*")
        .eq("recipient_user_id", userId) // ✅ UUID как string
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[MDTService] Error fetching notifications:", error);
        throw new Error("Не удалось получить уведомления");
      }

      return data || [];
    } catch (error) {
      console.error("[MDTService] Error in getNotifications:", error);
      throw error;
    }
  }

  /**
   * Получить непрочитанные уведомления
   */
  async getUnreadNotifications(userId: string): Promise<MDTNotification[]> {
    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .select("*")
        .eq("recipient_user_id", userId) // ✅ UUID как string
        .eq("is_read", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[MDTService] Error fetching unread notifications:", error);
        throw new Error("Не удалось получить непрочитанные уведомления");
      }

      return data || [];
    } catch (error) {
      console.error("[MDTService] Error in getUnreadNotifications:", error);
      throw error;
    }
  }

  /**
   * Отметить уведомление как прочитанное
   */
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId); // ✅ UUID как string

      if (error) {
        console.error("[MDTService] Error marking notification as read:", error);
        throw new Error("Не удалось отметить уведомление как прочитанное");
      }

      return true;
    } catch (error) {
      console.error("[MDTService] Error in markNotificationAsRead:", error);
      throw error;
    }
  }

  // ===== ОПЕРАЦИИ С ЗАЯВКАМИ =====

  /**
   * Создать заявку
   */
  async createApplication(data: CreateApplicationData): Promise<MDTApplication> {
    try {
      const insertData: MDTApplicationInsert = {
        type: data.type,
        author_user_id: data.authorUserId, // ✅ UUID как string
        author_character_id: data.authorCharacterId, // ✅ UUID как string
        data: data.data,
        status: data.status || 'pending',
        status_history: data.statusHistory
      };

      const { data: application, error } = await this.supabase
        .from("applications")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("[MDTService] Error creating application:", error);
        throw new Error("Не удалось создать заявку");
      }

      return application;
    } catch (error) {
      console.error("[MDTService] Error in createApplication:", error);
      throw error;
    }
  }

  /**
   * Обновить заявку
   */
  async updateApplication(applicationId: string, data: UpdateApplicationData): Promise<MDTApplication> {
    try {
      const updateData: MDTApplicationUpdate = {};
      
      if (data.type !== undefined) updateData.type = data.type;
      if (data.authorUserId !== undefined) updateData.author_user_id = data.authorUserId;
      if (data.authorCharacterId !== undefined) updateData.author_character_id = data.authorCharacterId;
      if (data.data !== undefined) updateData.data = data.data;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.statusHistory !== undefined) updateData.status_history = data.statusHistory;

      const { data: application, error } = await this.supabase
        .from("applications")
        .update(updateData)
        .eq("id", applicationId) // ✅ UUID как string
        .select()
        .single();

      if (error) {
        console.error("[MDTService] Error updating application:", error);
        throw new Error("Не удалось обновить заявку");
      }

      return application;
    } catch (error) {
      console.error("[MDTService] Error in updateApplication:", error);
      throw error;
    }
  }

  // ===== ОПЕРАЦИИ С РАПОРТАМИ =====

  /**
   * Создать рапорт правоохранительных органов
   */
  async createLawReport(data: CreateLawReportData): Promise<MDTLawReport> {
    try {
      const insertData: MDTLawReportInsert = {
        title: data.title,
        description: data.description,
        author_character_id: data.authorCharacterId, // ✅ UUID как string
        incident_location: data.incidentLocation,
        incident_time: data.incidentTime,
        incident_type: data.incidentType,
        participants: data.participants,
        penal_codes: data.penalCodes,
        seized_items: data.seizedItems,
        call_id: data.callId // ✅ UUID как string
      };

      const { data: report, error } = await this.supabase
        .from("law_reports")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("[MDTService] Error creating law report:", error);
        throw new Error("Не удалось создать рапорт");
      }

      return report;
    } catch (error) {
      console.error("[MDTService] Error in createLawReport:", error);
      throw error;
    }
  }

  /**
   * Создать рапорт EMS/FD
   */
  async createEmsFdReport(data: CreateEmsFdReportData): Promise<MDTEmsFdReport> {
    try {
      const insertData: MDTEmsFdReportInsert = {
        title: data.title,
        description: data.description,
        author_character_id: data.authorCharacterId, // ✅ UUID как string
        incident_location: data.incidentLocation,
        incident_time: data.incidentTime,
        incident_type: data.incidentType,
        patients: data.patients,
        vital_signs: data.vitalSigns,
        medications_administered: data.medicationsAdministered,
        treatment_provided: data.treatmentProvided,
        outcome: data.outcome,
        fire_details: data.fireDetails,
        call_id: data.callId // ✅ UUID как string
      };

      const { data: report, error } = await this.supabase
        .from("ems_fd_reports")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("[MDTService] Error creating EMS/FD report:", error);
        throw new Error("Не удалось создать рапорт");
      }

      return report;
    } catch (error) {
      console.error("[MDTService] Error in createEmsFdReport:", error);
      throw error;
    }
  }
} 