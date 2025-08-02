import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../packages/db-types/src/index';

// Типы из базы данных
type MDTCall = Database['mdt']['Tables']['calls']['Row'];
type MDTUnit = Database['mdt']['Tables']['units_on_duty']['Row'];
type MDTBolo = Database['mdt']['Tables']['bolos']['Row'];
type MDTSignal = Database['mdt']['Tables']['mdt_signals']['Row'];
type MDTNotification = Database['mdt']['Tables']['notifications']['Row'];
type MDTApplication = Database['mdt']['Tables']['applications']['Row'];
type MDTLawReport = Database['mdt']['Tables']['law_reports']['Row'];
type MDTEmsFdReport = Database['mdt']['Tables']['ems_fd_reports']['Row'];

// Типы для создания/обновления
type CreateCallData = {
  callerName?: string | null;
  callerPhone?: string | null;
  location: string;
  description: string;
  type: string;
  priority?: string | null;
  status?: string;
  patientInfo?: any;
  fireInfo?: any;
  attachments?: any;
  assignedUnits?: any;
};

type UpdateCallData = Partial<CreateCallData>;

type CreateUnitData = {
  characterId: string;
  unitNumber: string;
  departmentId: string;
  status?: string;
  location?: any;
  currentCallId?: string | null;
  userId: string;
};

type UpdateUnitData = Partial<CreateUnitData>;

type CreateSignalData = {
  title: string;
  description?: string | null;
  type?: string | null;
  authorCharacterId?: string | null;
  priority?: string | null;
  location?: string | null;
  coordinates?: any;
  isActive?: boolean | null;
  expiresAt?: string | null;
};

type UpdateSignalData = Partial<CreateSignalData>;

type CreateBoloData = {
  type: string;
  reason: string;
  subjectName?: string | null;
  subjectDescription?: string | null;
  vehicleDescription?: string | null;
  vehiclePlate?: string | null;
  location?: string | null;
  priority?: string | null;
  authorCharacterId: string;
  status?: string;
};

type UpdateBoloData = Partial<CreateBoloData>;

type CreateNotificationData = {
  content: string;
  recipientUserId: string;
  isRead?: boolean;
  link?: string | null;
};

type CreateApplicationData = {
  type: string;
  authorUserId: string;
  authorCharacterId: string;
  data?: any;
  status?: string;
  statusHistory?: any[];
};

type UpdateApplicationData = Partial<CreateApplicationData>;

type CreateLawReportData = {
  title: string;
  description: string;
  authorCharacterId: string;
  incidentLocation: string;
  incidentTime: string;
  incidentType: string;
  participants?: any;
  penalCodes?: any;
  seizedItems?: any;
  callId?: string | null;
};

type CreateEmsFdReportData = {
  title: string;
  description: string;
  authorCharacterId: string;
  incidentLocation: string;
  incidentTime: string;
  incidentType: string;
  patients?: any;
  vitalSigns?: any;
  medicationsAdministered?: any;
  treatmentProvided?: string | null;
  outcome?: string | null;
  fireDetails?: any;
  callId?: string | null;
};

export class MDTService {
  private supabase: ReturnType<typeof createClient<Database>>;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    this.supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  // ===== УПРАВЛЕНИЕ ЮНИТАМИ =====

  /**
   * Получить все активные юниты
   */
  async getActiveUnits(): Promise<MDTUnit[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_active_units');
      
      if (error) {
        console.error('Error getting active units:', error);
        throw new Error('Failed to get active units');
      }

      return data || [];
    } catch (error) {
      console.error('Error getting active units:', error);
      throw new Error('Failed to get active units');
    }
  }

  /**
   * Получить юнит по ID
   */
  async getUnitById(unitId: string): Promise<MDTUnit | null> {
    try {
      const { data, error } = await this.supabase.rpc('get_unit_by_id', {
        p_unit_id: unitId
      });
      
      if (error) {
        console.error('Error getting unit by id:', error);
        throw new Error('Failed to get unit by id');
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Error getting unit by id:', error);
      throw new Error('Failed to get unit by id');
    }
  }

  /**
   * Получить юниты по департаменту
   */
  async getUnitsByDepartment(departmentId: string): Promise<MDTUnit[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_units_by_department', {
        p_department_id: departmentId
      });
      
      if (error) {
        console.error('Error getting units by department:', error);
        throw new Error('Failed to get units by department');
      }

      return data || [];
    } catch (error) {
      console.error('Error getting units by department:', error);
      throw new Error('Failed to get units by department');
    }
  }

  /**
   * Получить юниты по статусу
   */
  async getUnitsByStatus(status: string): Promise<MDTUnit[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_units_by_status', {
        p_status: status
      });
      
      if (error) {
        console.error('Error getting units by status:', error);
        throw new Error('Failed to get units by status');
      }

      return data || [];
    } catch (error) {
      console.error('Error getting units by status:', error);
      throw new Error('Failed to get units by status');
    }
  }

  /**
   * Создать новый юнит
   */
  async createUnit(data: CreateUnitData): Promise<MDTUnit> {
    try {
      const { data: unit, error } = await this.supabase.rpc('create_new_unit_on_duty', {
        p_data: {
          character_id: data.characterId,
          unit_number: data.unitNumber,
          department_id: data.departmentId,
          status: data.status || 'available',
          location: data.location || null,
          current_call_id: data.currentCallId || null,
          user_id: data.userId
        }
      });

      if (error) {
        console.error('Error creating unit:', error);
        throw new Error('Failed to create unit');
      }

      return unit as MDTUnit;
    } catch (error) {
      console.error('Error creating unit:', error);
      throw new Error('Failed to create unit');
    }
  }

  /**
   * Обновить юнит
   */
  async updateUnit(unitId: string, data: UpdateUnitData): Promise<MDTUnit> {
    try {
      const updateData: any = {};
      
      if (data.unitNumber !== undefined) updateData.unit_number = data.unitNumber;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.currentCallId !== undefined) updateData.current_call_id = data.currentCallId;

      const { data: unit, error } = await this.supabase.rpc('update_unit_on_duty', {
        p_unit_id: unitId,
        p_data: updateData
      });

      if (error) {
        console.error('Error updating unit:', error);
        throw new Error('Failed to update unit');
      }

      return unit as MDTUnit;
    } catch (error) {
      console.error('Error updating unit:', error);
      throw new Error('Failed to update unit');
    }
  }

  /**
   * Обновить статус юнита
   */
  async updateUnitStatus(unitId: string, status: string): Promise<MDTUnit> {
    return this.updateUnit(unitId, { status });
  }

  /**
   * Обновить местоположение юнита
   */
  async updateUnitLocation(unitId: string, location: any): Promise<MDTUnit> {
    return this.updateUnit(unitId, { location });
  }

  /**
   * Удалить юнит с дежурства
   */
  async deleteUnit(unitId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('delete_unit_on_duty', {
        p_unit_id: unitId
      });

      if (error) {
        console.error('Error deleting unit:', error);
        throw new Error('Failed to delete unit');
      }

      return data;
    } catch (error) {
      console.error('Error deleting unit:', error);
      throw new Error('Failed to delete unit');
    }
  }

  // ===== УПРАВЛЕНИЕ ВЫЗОВАМИ 911 =====

  /**
   * Получить все активные вызовы
   */
  async getCalls(): Promise<MDTCall[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_active_calls');
      
      if (error) {
        console.error('Error getting calls:', error);
        throw new Error('Failed to get calls');
      }

      return data || [];
    } catch (error) {
      console.error('Error getting calls:', error);
      throw new Error('Failed to get calls');
    }
  }

  /**
   * Получить вызов по ID
   */
  async getCallById(callId: string): Promise<MDTCall | null> {
    try {
      const { data, error } = await this.supabase.rpc('get_call_by_id', {
        p_call_id: callId
      });
      
      if (error) {
        console.error('Error getting call by id:', error);
        throw new Error('Failed to get call by id');
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Error getting call by id:', error);
      throw new Error('Failed to get call by id');
    }
  }

  /**
   * Получить вызовы по статусу
   */
  async getCallsByStatus(status: string): Promise<MDTCall[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_calls_by_status', {
        p_status: status
      });
      
      if (error) {
        console.error('Error getting calls by status:', error);
        throw new Error('Failed to get calls by status');
      }

      return data || [];
    } catch (error) {
      console.error('Error getting calls by status:', error);
      throw new Error('Failed to get calls by status');
    }
  }

  /**
   * Получить вызовы по типу
   */
  async getCallsByType(type: string): Promise<MDTCall[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_calls_by_type', {
        p_type: type
      });
      
      if (error) {
        console.error('Error getting calls by type:', error);
        throw new Error('Failed to get calls by type');
      }

      return data || [];
    } catch (error) {
      console.error('Error getting calls by type:', error);
      throw new Error('Failed to get calls by type');
    }
  }

  /**
   * Создать новый вызов 911
   */
  async createCall(data: CreateCallData): Promise<MDTCall> {
    try {
      const { data: call, error } = await this.supabase.rpc('create_new_call', {
        p_data: {
          caller_name: data.callerName || null,
          caller_phone: data.callerPhone || null,
          location: data.location,
          description: data.description,
          type: data.type,
          priority: data.priority || null,
          status: data.status || 'pending',
          patient_info: data.patientInfo || null,
          fire_info: data.fireInfo || null,
          attachments: data.attachments || null,
          assigned_units: data.assignedUnits || null
        }
      });

      if (error) {
        console.error('Error creating call:', error);
        throw new Error('Failed to create call');
      }

      return call as MDTCall;
    } catch (error) {
      console.error('Error creating call:', error);
      throw new Error('Failed to create call');
    }
  }

  /**
   * Обновить вызов 911
   */
  async updateCall(callId: string, data: UpdateCallData): Promise<MDTCall> {
    try {
      const updateData: any = {};

      if (data.callerName !== undefined) updateData.caller_name = data.callerName;
      if (data.callerPhone !== undefined) updateData.caller_phone = data.callerPhone;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.patientInfo !== undefined) updateData.patient_info = data.patientInfo;
      if (data.fireInfo !== undefined) updateData.fire_info = data.fireInfo;
      if (data.attachments !== undefined) updateData.attachments = data.attachments;
      if (data.assignedUnits !== undefined) updateData.assigned_units = data.assignedUnits;

      const { data: call, error } = await this.supabase.rpc('update_call', {
        p_call_id: callId,
        p_data: updateData
      });

      if (error) {
        console.error('Error updating call:', error);
        throw new Error('Failed to update call');
      }

      return call as MDTCall;
    } catch (error) {
      console.error('Error updating call:', error);
      throw new Error('Failed to update call');
    }
  }

  /**
   * Назначить юниты на вызов
   */
  async assignUnitsToCall(callId: string, unitIds: string[]): Promise<void> {
    try {
      // Обновляем вызов
      await this.updateCall(callId, { assignedUnits: unitIds });

      // Обновляем статус юнитов
      for (const unitId of unitIds) {
        await this.updateUnit(unitId, {
          status: 'en_route',
          currentCallId: callId
        });
      }
    } catch (error) {
      console.error('Error assigning units to call:', error);
      throw new Error('Failed to assign units to call');
    }
  }

  /**
   * Обновить статус вызова
   */
  async updateCallStatus(callId: string, status: string): Promise<MDTCall> {
    return this.updateCall(callId, { status });
  }

  /**
   * Удалить вызов (soft delete)
   */
  async deleteCall(callId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('delete_call', {
        p_call_id: callId
      });

      if (error) {
        console.error('Error deleting call:', error);
        throw new Error('Failed to delete call');
      }

      return data;
    } catch (error) {
      console.error('Error deleting call:', error);
      throw new Error('Failed to delete call');
    }
  }

  // ===== УПРАВЛЕНИЕ BOLO =====

  /**
   * Получить все активные BOLO с информацией об авторе
   */
  async getBolos(): Promise<MDTBolo[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_active_bolos_with_author');
      
      if (error) {
        console.error('Error getting BOLOs:', error);
        throw new Error('Failed to get BOLOs');
      }

      return data || [];
    } catch (error) {
      console.error('Error getting BOLOs:', error);
      throw new Error('Failed to get BOLOs');
    }
  }

  /**
   * Получить BOLO по ID
   */
  async getBoloById(boloId: string): Promise<MDTBolo | null> {
    try {
      const { data, error } = await this.supabase.rpc('get_bolo_by_id', {
        p_bolo_id: boloId
      });
      
      if (error) {
        console.error('Error getting BOLO by id:', error);
        throw new Error('Failed to get BOLO by id');
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Error getting BOLO by id:', error);
      throw new Error('Failed to get BOLO by id');
    }
  }

  /**
   * Получить BOLO по типу
   */
  async getBolosByType(type: string): Promise<MDTBolo[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_bolos_by_type', {
        p_type: type
      });
      
      if (error) {
        console.error('Error getting BOLOs by type:', error);
        throw new Error('Failed to get BOLOs by type');
      }

      return data || [];
    } catch (error) {
      console.error('Error getting BOLOs by type:', error);
      throw new Error('Failed to get BOLOs by type');
    }
  }

  /**
   * Получить BOLO по приоритету
   */
  async getBolosByPriority(priority: string): Promise<MDTBolo[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_bolos_by_priority', {
        p_priority: priority
      });
      
      if (error) {
        console.error('Error getting BOLOs by priority:', error);
        throw new Error('Failed to get BOLOs by priority');
      }

      return data || [];
    } catch (error) {
      console.error('Error getting BOLOs by priority:', error);
      throw new Error('Failed to get BOLOs by priority');
    }
  }

  /**
   * Создать новый BOLO
   */
  async createBolo(data: CreateBoloData): Promise<MDTBolo> {
    try {
      const { data: bolo, error } = await this.supabase.rpc('create_new_bolo', {
        p_data: {
          type: data.type,
          reason: data.reason,
          subject_name: data.subjectName || null,
          subject_description: data.subjectDescription || null,
          vehicle_description: data.vehicleDescription || null,
          vehicle_plate: data.vehiclePlate || null,
          location: data.location || null,
          priority: data.priority || null,
          author_character_id: data.authorCharacterId,
          status: data.status || 'active'
        }
      });

      if (error) {
        console.error('Error creating BOLO:', error);
        throw new Error('Failed to create BOLO');
      }

      return bolo as MDTBolo;
    } catch (error) {
      console.error('Error creating BOLO:', error);
      throw new Error('Failed to create BOLO');
    }
  }

  /**
   * Обновить BOLO
   */
  async updateBolo(boloId: string, data: UpdateBoloData): Promise<MDTBolo> {
    try {
      const updateData: any = {};

      if (data.type !== undefined) updateData.type = data.type;
      if (data.reason !== undefined) updateData.reason = data.reason;
      if (data.subjectName !== undefined) updateData.subject_name = data.subjectName;
      if (data.subjectDescription !== undefined) updateData.subject_description = data.subjectDescription;
      if (data.vehicleDescription !== undefined) updateData.vehicle_description = data.vehicleDescription;
      if (data.vehiclePlate !== undefined) updateData.vehicle_plate = data.vehiclePlate;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.status !== undefined) updateData.status = data.status;

      const { data: bolo, error } = await this.supabase.rpc('update_bolo', {
        p_bolo_id: boloId,
        p_data: updateData
      });

      if (error) {
        console.error('Error updating BOLO:', error);
        throw new Error('Failed to update BOLO');
      }

      return bolo as MDTBolo;
    } catch (error) {
      console.error('Error updating BOLO:', error);
      throw new Error('Failed to update BOLO');
    }
  }

  /**
   * Удалить BOLO (soft delete)
   */
  async deleteBolo(boloId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('delete_bolo', {
        p_bolo_id: boloId
      });

      if (error) {
        console.error('Error deleting BOLO:', error);
        throw new Error('Failed to delete BOLO');
      }

      return data;
    } catch (error) {
      console.error('Error deleting BOLO:', error);
      throw new Error('Failed to delete BOLO');
    }
  }

  // ===== УПРАВЛЕНИЕ СИГНАЛАМИ =====

  /**
   * Получить активные сигналы
   */
  async getActiveSignals(): Promise<MDTSignal[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_active_signals');
      
      if (error) {
        console.error('Error getting active signals:', error);
        throw new Error('Failed to get active signals');
      }

      return data || [];
    } catch (error) {
      console.error('Error getting active signals:', error);
      throw new Error('Failed to get active signals');
    }
  }

  /**
   * Получить сигнал по ID
   */
  async getSignalById(signalId: string): Promise<MDTSignal | null> {
    try {
      const { data, error } = await this.supabase.rpc('get_signal_by_id', {
        p_signal_id: signalId
      });
      
      if (error) {
        console.error('Error getting signal by id:', error);
        throw new Error('Failed to get signal by id');
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Error getting signal by id:', error);
      throw new Error('Failed to get signal by id');
    }
  }

  /**
   * Создать новый сигнал
   */
  async createSignal(data: CreateSignalData): Promise<MDTSignal> {
    try {
      const { data: signal, error } = await this.supabase.rpc('create_new_signal', {
        p_data: {
          title: data.title,
          description: data.description || null,
          type: data.type || null,
          author_character_id: data.authorCharacterId || null,
          priority: data.priority || null,
          location: data.location || null,
          coordinates: data.coordinates || null,
          is_active: data.isActive !== false,
          expires_at: data.expiresAt || null
        }
      });

      if (error) {
        console.error('Error creating signal:', error);
        throw new Error('Failed to create signal');
      }

      return signal as MDTSignal;
    } catch (error) {
      console.error('Error creating signal:', error);
      throw new Error('Failed to create signal');
    }
  }

  /**
   * Обновить сигнал
   */
  async updateSignal(signalId: string, data: UpdateSignalData): Promise<MDTSignal> {
    try {
      const updateData: any = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.coordinates !== undefined) updateData.coordinates = data.coordinates;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;
      if (data.expiresAt !== undefined) updateData.expires_at = data.expiresAt;

      const { data: signal, error } = await this.supabase.rpc('update_signal', {
        p_signal_id: signalId,
        p_data: updateData
      });

      if (error) {
        console.error('Error updating signal:', error);
        throw new Error('Failed to update signal');
      }

      return signal as MDTSignal;
    } catch (error) {
      console.error('Error updating signal:', error);
      throw new Error('Failed to update signal');
    }
  }

  /**
   * Отозвать сигнал
   */
  async revokeSignal(signalId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('revoke_signal', {
        p_signal_id: signalId
      });

      if (error) {
        console.error('Error revoking signal:', error);
        throw new Error('Failed to revoke signal');
      }

      return data;
    } catch (error) {
      console.error('Error revoking signal:', error);
      throw new Error('Failed to revoke signal');
    }
  }

  // ===== УПРАВЛЕНИЕ УВЕДОМЛЕНИЯМИ =====

  /**
   * Создать новое уведомление
   */
  async createNotification(data: CreateNotificationData): Promise<MDTNotification> {
    try {
      const { data: notification, error } = await this.supabase.rpc('create_new_notification', {
        p_data: {
          content: data.content,
          recipient_user_id: data.recipientUserId,
          is_read: data.isRead || false,
          link: data.link || null
        }
      });

      if (error) {
        console.error('Error creating notification:', error);
        throw new Error('Failed to create notification');
      }

      return notification as MDTNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Получить уведомления пользователя
   */
  async getNotifications(userId: string): Promise<MDTNotification[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_user_notifications', {
        p_user_id: userId
      });
      
      if (error) {
        console.error('Error getting notifications:', error);
        throw new Error('Failed to get notifications');
      }

      return data || [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw new Error('Failed to get notifications');
    }
  }

  /**
   * Получить непрочитанные уведомления пользователя
   */
  async getUnreadNotifications(userId: string): Promise<MDTNotification[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_unread_notifications', {
        p_user_id: userId
      });
      
      if (error) {
        console.error('Error getting unread notifications:', error);
        throw new Error('Failed to get unread notifications');
      }

      return data || [];
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      throw new Error('Failed to get unread notifications');
    }
  }

  /**
   * Отметить уведомление как прочитанное
   */
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId
      });

      if (error) {
        console.error('Error marking notification as read:', error);
        throw new Error('Failed to mark notification as read');
      }

      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  // ===== УПРАВЛЕНИЕ ЗАЯВКАМИ =====

  /**
   * Создать новую заявку
   */
  async createApplication(data: CreateApplicationData): Promise<MDTApplication> {
    try {
      const { data: application, error } = await this.supabase.rpc('create_new_application', {
        p_data: {
          type: data.type,
          author_user_id: data.authorUserId,
          author_character_id: data.authorCharacterId,
          data: data.data || null,
          status: data.status || 'pending',
          status_history: data.statusHistory || []
        }
      });

      if (error) {
        console.error('Error creating application:', error);
        throw new Error('Failed to create application');
      }

      return application as MDTApplication;
    } catch (error) {
      console.error('Error creating application:', error);
      throw new Error('Failed to create application');
    }
  }

  /**
   * Обновить заявку
   */
  async updateApplication(applicationId: string, data: UpdateApplicationData): Promise<MDTApplication> {
    try {
      const updateData: any = {};

      if (data.data !== undefined) updateData.data = data.data;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.statusHistory !== undefined) updateData.status_history = data.statusHistory;

      const { data: application, error } = await this.supabase.rpc('update_application', {
        p_application_id: applicationId,
        p_data: updateData
      });

      if (error) {
        console.error('Error updating application:', error);
        throw new Error('Failed to update application');
      }

      return application as MDTApplication;
    } catch (error) {
      console.error('Error updating application:', error);
      throw new Error('Failed to update application');
    }
  }

  // ===== УПРАВЛЕНИЕ ОТЧЕТАМИ =====

  /**
   * Создать отчет правоохранительных органов
   */
  async createLawReport(data: CreateLawReportData): Promise<MDTLawReport> {
    try {
      const { data: report, error } = await this.supabase.rpc('create_new_law_report', {
        p_data: {
          title: data.title,
          description: data.description,
          author_character_id: data.authorCharacterId,
          incident_location: data.incidentLocation,
          incident_time: data.incidentTime,
          incident_type: data.incidentType,
          participants: data.participants || null,
          penal_codes: data.penalCodes || null,
          seized_items: data.seizedItems || null,
          call_id: data.callId || null
        }
      });

      if (error) {
        console.error('Error creating law report:', error);
        throw new Error('Failed to create law report');
      }

      return report as MDTLawReport;
    } catch (error) {
      console.error('Error creating law report:', error);
      throw new Error('Failed to create law report');
    }
  }

  /**
   * Создать отчет EMS/FD
   */
  async createEmsFdReport(data: CreateEmsFdReportData): Promise<MDTEmsFdReport> {
    try {
      const { data: report, error } = await this.supabase.rpc('create_new_ems_fd_report', {
        p_data: {
          title: data.title,
          description: data.description,
          author_character_id: data.authorCharacterId,
          incident_location: data.incidentLocation,
          incident_time: data.incidentTime,
          incident_type: data.incidentType,
          patients: data.patients || null,
          vital_signs: data.vitalSigns || null,
          medications_administered: data.medicationsAdministered || null,
          treatment_provided: data.treatmentProvided || null,
          outcome: data.outcome || null,
          fire_details: data.fireDetails || null,
          call_id: data.callId || null
        }
      });

      if (error) {
        console.error('Error creating EMS/FD report:', error);
        throw new Error('Failed to create EMS/FD report');
      }

      return report as MDTEmsFdReport;
    } catch (error) {
      console.error('Error creating EMS/FD report:', error);
      throw new Error('Failed to create EMS/FD report');
    }
  }

  // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====

  /**
   * Активировать панику для юнита
   */
  async activatePanic(unitId: string): Promise<void> {
    try {
      // Получаем информацию о юните
      const unit = await this.getUnitById(unitId);
      if (!unit) {
        throw new Error('Unit not found');
      }

      // Создаем сигнал о панике
      await this.createSignal({
        title: `ПАНИКА: ${unit.unit_number}`,
        description: `Офицер активировал панику`,
        type: 'LEO',
        priority: 'critical',
        isActive: true
      });
    } catch (error) {
      console.error('Error activating panic:', error);
      throw new Error('Failed to activate panic');
    }
  }

  /**
   * Деактивировать панику для юнита
   */
  async deactivatePanic(unitId: string): Promise<void> {
    try {
      // В данной реализации просто логируем деактивацию
      console.log(`Panic deactivated for unit ${unitId}`);
    } catch (error) {
      console.error('Error deactivating panic:', error);
      throw new Error('Failed to deactivate panic');
    }
  }
}

// Экспортируем экземпляр сервиса
export const mdtService = new MDTService(); 