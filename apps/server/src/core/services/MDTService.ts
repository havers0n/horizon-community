import { SupabaseClient } from '@supabase/supabase-js';
import { mdtSupabase } from '../lib/supabase';
import { AppError } from '../../utils/AppError';
import type { Database } from '@roleplay-identity/db-types';

// ===== ТИПЫ ИЗ ЕДИНОГО ИСТОЧНИКА =====
type MDTBolo = Database['mdt']['Tables']['bolos']['Row'];
type MDTBoloInsert = Database['mdt']['Tables']['bolos']['Insert'];
type MDTBoloUpdate = Database['mdt']['Tables']['bolos']['Update'];

type MDTSignal = Database['mdt']['Tables']['mdt_signals']['Row'];
type MDTSignalInsert = Database['mdt']['Tables']['mdt_signals']['Insert'];
type MDTSignalUpdate = Database['mdt']['Tables']['mdt_signals']['Update'];

type MDTUnit = Database['mdt']['Tables']['units_on_duty']['Row'];
type MDTUnitInsert = Database['mdt']['Tables']['units_on_duty']['Insert'];
type MDTUnitUpdate = Database['mdt']['Tables']['units_on_duty']['Update'];

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

// ===== ENUM ТИПЫ =====
type BoloType = Database['mdt']['Enums']['bolo_type'];
type BoloPriority = Database['mdt']['Enums']['bolo_priority'];
type BoloStatus = Database['mdt']['Enums']['bolo_status'];
type CallPriority = Database['mdt']['Enums']['call_priority'];
type CallStatus = Database['mdt']['Enums']['call_status'];
type CallType = Database['mdt']['Enums']['call_type'];
type ApplicationStatus = Database['mdt']['Enums']['application_status'];
type ComplaintStatus = Database['mdt']['Enums']['complaint_status'];
type SupportTicketStatus = Database['mdt']['Enums']['support_ticket_status'];

// ===== ИНТЕРФЕЙСЫ ДЛЯ ВАЛИДАЦИИ (camelCase для API) =====
export interface CreateBoloData {
  type: BoloType;
  reason: string;
  priority?: BoloPriority;
  author_character_id: string;
  subject_name?: string;
  subject_description?: string;
  location?: string;
  vehicle_description?: string;
  vehicle_plate?: string;
  status?: BoloStatus;
}

export interface UpdateBoloData extends Partial<CreateBoloData> {}

export interface CreateSignalData {
  title: string;
  description?: string;
  type?: string;
  author_character_id?: string;
  priority?: string;
  location?: string;
  coordinates?: any;
  is_active?: boolean;
  expires_at?: string;
}

export interface UpdateSignalData extends Partial<CreateSignalData> {}

export interface CreateNotificationData {
  content: string;
  recipient_user_id: string;
  is_read?: boolean;
  link?: string;
}

export interface UpdateNotificationData extends Partial<CreateNotificationData> {}

export interface CreateApplicationData {
  type: string;
  author_user_id: string;
  author_character_id: string;
  data?: any;
  status?: ApplicationStatus;
  status_history?: any[];
}

export interface UpdateApplicationData extends Partial<CreateApplicationData> {}

export interface CreateLawReportData {
  title: string;
  description: string;
  author_character_id: string;
  incident_location: string;
  incident_time: string;
  incident_type: string;
  participants?: any;
  penal_codes?: any;
  seized_items?: any;
  call_id?: string;
}

export interface UpdateLawReportData extends Partial<CreateLawReportData> {}

export interface CreateEmsFdReportData {
  title: string;
  description: string;
  author_character_id: string;
  incident_location: string;
  incident_time: string;
  incident_type: string;
  patients?: any;
  vital_signs?: any;
  medications_administered?: any;
  treatment_provided?: string;
  outcome?: string;
  fire_details?: any;
  call_id?: string;
}

export interface UpdateEmsFdReportData extends Partial<CreateEmsFdReportData> {}

export class MDTService {
  private db = mdtSupabase;

  // ===== BOLO УПРАВЛЕНИЕ =====
  
  async getAllBolos(): Promise<MDTBolo[]> {
    const { data, error } = await this.db
      .from("bolos")
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[MDTService] Error fetching bolos:', error);
      throw new AppError('Не удалось получить BOLO', 500);
    }

    return data || [];
  }

  async getBoloById(id: string): Promise<MDTBolo | null> {
    const { data, error } = await this.db
      .from("bolos")
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[MDTService] Error fetching bolo:', error);
      throw new AppError('Не удалось получить BOLO', 500);
    }

    return data;
  }

  async createBolo(boloData: CreateBoloData): Promise<MDTBolo> {
    const insertData: MDTBoloInsert = {
      type: boloData.type,
      reason: boloData.reason,
      priority: boloData.priority || 'normal',
      author_character_id: boloData.author_character_id,
      subject_name: boloData.subject_name,
      subject_description: boloData.subject_description,
      location: boloData.location,
      vehicle_description: boloData.vehicle_description,
      vehicle_plate: boloData.vehicle_plate,
      status: boloData.status || 'active',
    };

    const { data, error } = await this.db
      .from("bolos")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[MDTService] Error creating bolo:', error);
      throw new AppError('Не удалось создать BOLO', 500);
    }

    return data;
  }

  async updateBolo(id: string, updateData: UpdateBoloData): Promise<MDTBolo> {
    const { data, error } = await this.db
      .from("bolos")
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[MDTService] Error updating bolo:', error);
      throw new AppError('Не удалось обновить BOLO', 500);
    }

    return data;
  }

  async deleteBolo(id: string): Promise<void> {
    const { error } = await this.db
      .from("bolos")
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[MDTService] Error deleting bolo:', error);
      throw new AppError('Не удалось удалить BOLO', 500);
    }
  }

  async getBolosByAuthor(author_character_id: string): Promise<MDTBolo[]> {
    const { data, error } = await this.db
      .from("bolos")
      .select('*')
      .eq('author_character_id', author_character_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[MDTService] Error fetching bolos by author:', error);
      throw new AppError('Не удалось получить BOLO по автору', 500);
    }

    return data || [];
  }

  async getBolosByPriority(priority: BoloPriority): Promise<MDTBolo[]> {
    const { data, error } = await this.db
      .from("bolos")
      .select('*')
      .eq('priority', priority)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[MDTService] Error fetching bolos by priority:', error);
      throw new AppError('Не удалось получить BOLO по приоритету', 500);
    }

    return data || [];
  }

  async getBolosByType(type: BoloType): Promise<MDTBolo[]> {
    const { data, error } = await this.db
      .from("bolos")
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[MDTService] Error fetching bolos by type:', error);
      throw new AppError('Не удалось получить BOLO по типу', 500);
    }

    return data || [];
  }

  // ===== SIGNAL УПРАВЛЕНИЕ =====

  async getAllSignals(): Promise<MDTSignal[]> {
    const { data, error } = await this.db
      .from("mdt_signals")
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[MDTService] Error fetching signals:', error);
      throw new AppError('Не удалось получить сигналы', 500);
    }

    return data || [];
  }

  async getSignalById(id: string): Promise<MDTSignal | null> {
    const { data, error } = await this.db
      .from("mdt_signals")
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[MDTService] Error fetching signal:', error);
      throw new AppError('Не удалось получить сигнал', 500);
    }

    return data;
  }

  async createSignal(signalData: CreateSignalData): Promise<MDTSignal> {
    const insertData: MDTSignalInsert = {
      title: signalData.title,
      description: signalData.description,
      type: signalData.type || 'general',
      author_character_id: signalData.author_character_id,
      priority: signalData.priority || 'normal',
      location: signalData.location,
      coordinates: signalData.coordinates,
      is_active: signalData.is_active !== false,
      expires_at: signalData.expires_at,
    };

    const { data, error } = await this.db
      .from("mdt_signals")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[MDTService] Error creating signal:', error);
      throw new AppError('Не удалось создать сигнал', 500);
    }

    return data;
  }

  async updateSignal(id: string, updateData: UpdateSignalData): Promise<MDTSignal> {
    const { data, error } = await this.db
      .from("mdt_signals")
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[MDTService] Error updating signal:', error);
      throw new AppError('Не удалось обновить сигнал', 500);
    }

    return data;
  }

  async deleteSignal(id: string): Promise<void> {
    const { error } = await this.db
      .from("mdt_signals")
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[MDTService] Error deleting signal:', error);
      throw new AppError('Не удалось удалить сигнал', 500);
    }
  }

  async getActiveSignals(): Promise<MDTSignal[]> {
    const { data, error } = await this.db
      .from("mdt_signals")
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[MDTService] Error fetching active signals:', error);
      throw new AppError('Не удалось получить активные сигналы', 500);
    }

    return data || [];
  }

  // ===== UNIT УПРАВЛЕНИЕ =====

  async getAllUnits(): Promise<MDTUnit[]> {
    const { data, error } = await this.db
      .from("units_on_duty")
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[MDTService] Error fetching units:', error);
      throw new AppError('Не удалось получить юниты', 500);
    }

    return data || [];
  }

  // ===== NOTIFICATION УПРАВЛЕНИЕ =====

  async createNotification(notificationData: CreateNotificationData): Promise<MDTNotification> {
    const insertData: MDTNotificationInsert = {
      content: notificationData.content,
      recipient_user_id: notificationData.recipient_user_id,
      is_read: notificationData.is_read || false,
      link: notificationData.link,
    };

    const { data, error } = await this.db
      .from("notifications")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[MDTService] Error creating notification:', error);
      throw new AppError('Не удалось создать уведомление', 500);
    }

    return data;
  }

  async getUnreadNotifications(user_id: string): Promise<MDTNotification[]> {
    const { data, error } = await this.db
      .from("notifications")
      .select('*')
      .eq('recipient_user_id', user_id)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[MDTService] Error fetching unread notifications:', error);
      throw new AppError('Не удалось получить непрочитанные уведомления', 500);
    }

    return data || [];
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const { error } = await this.db
      .from("notifications")
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('[MDTService] Error marking notification as read:', error);
      throw new AppError('Не удалось отметить уведомление как прочитанное', 500);
    }
  }

  async deleteNotification(id: string): Promise<void> {
    const { error } = await this.db
      .from("notifications")
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[MDTService] Error deleting notification:', error);
      throw new AppError('Не удалось удалить уведомление', 500);
    }
  }

  async getUserNotifications(user_id: string, limit: number = 50): Promise<MDTNotification[]> {
    const { data, error } = await this.db
      .from("notifications")
      .select('*')
      .eq('recipient_user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[MDTService] Error fetching user notifications:', error);
      throw new AppError('Не удалось получить уведомления пользователя', 500);
    }

    return data || [];
  }

  // ===== APPLICATION УПРАВЛЕНИЕ =====

  async createApplication(applicationData: CreateApplicationData): Promise<MDTApplication> {
    const insertData: MDTApplicationInsert = {
      type: applicationData.type,
      author_user_id: applicationData.author_user_id,
      author_character_id: applicationData.author_character_id,
      data: applicationData.data,
      status: applicationData.status || 'awaiting_interview',
      status_history: applicationData.status_history || [],
    };

    const { data, error } = await this.db
      .from("applications")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[MDTService] Error creating application:', error);
      throw new AppError('Не удалось создать заявку', 500);
    }

    return data;
  }

  async getApplicationById(id: string): Promise<MDTApplication | null> {
    const { data, error } = await this.db
      .from("applications")
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[MDTService] Error fetching application:', error);
      throw new AppError('Не удалось получить заявку', 500);
    }

    return data;
  }

  // ===== LAW REPORT УПРАВЛЕНИЕ =====

  async createLawReport(reportData: CreateLawReportData): Promise<MDTLawReport> {
    const insertData: MDTLawReportInsert = {
      title: reportData.title,
      description: reportData.description,
      author_character_id: reportData.author_character_id,
      incident_location: reportData.incident_location,
      incident_time: reportData.incident_time,
      incident_type: reportData.incident_type,
      penal_codes: reportData.penal_codes,
      seized_items: reportData.seized_items,
      call_id: reportData.call_id,
    };

    const { data, error } = await this.db
      .from("law_reports")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[MDTService] Error creating law report:', error);
      throw new AppError('Не удалось создать отчет правоохранительных органов', 500);
    }

    return data;
  }

  async getLawReportById(id: string): Promise<MDTLawReport | null> {
    const { data, error } = await this.db
      .from("law_reports")
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[MDTService] Error fetching law report:', error);
      throw new AppError('Не удалось получить отчет правоохранительных органов', 500);
    }

    return data;
  }

  // ===== EMS/FD REPORT УПРАВЛЕНИЕ =====

  async createEmsFdReport(reportData: CreateEmsFdReportData): Promise<MDTEmsFdReport> {
    const insertData: MDTEmsFdReportInsert = {
      title: reportData.title,
      description: reportData.description,
      author_character_id: reportData.author_character_id,
      incident_location: reportData.incident_location,
      incident_time: reportData.incident_time,
      incident_type: reportData.incident_type,
      patients: reportData.patients,
      vital_signs: reportData.vital_signs,
      medications_administered: reportData.medications_administered,
      treatment_provided: reportData.treatment_provided,
      outcome: reportData.outcome,
      fire_details: reportData.fire_details,
      call_id: reportData.call_id,
    };

    const { data, error } = await this.db
      .from("ems_fd_reports")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[MDTService] Error creating EMS/FD report:', error);
      throw new AppError('Не удалось создать отчет EMS/FD', 500);
    }

    return data;
  }

  async getEmsFdReportById(id: string): Promise<MDTEmsFdReport | null> {
    const { data, error } = await this.db
      .from("ems_fd_reports")
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[MDTService] Error fetching EMS/FD report:', error);
      throw new AppError('Не удалось получить отчет EMS/FD', 500);
    }

    return data;
  }
} 
