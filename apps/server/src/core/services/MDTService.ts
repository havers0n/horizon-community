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

// Таблицы notifications/apps/ems_fd_reports отсутствуют — отключаем типы и операции
type MDTNotification = never;
type MDTNotificationInsert = never;
type MDTNotificationUpdate = never;

type MDTApplication = never;
type MDTApplicationInsert = never;
type MDTApplicationUpdate = never;

type MDTLawReport = Database['mdt']['Tables']['law_reports']['Row'];
type MDTLawReportInsert = Database['mdt']['Tables']['law_reports']['Insert'];
type MDTLawReportUpdate = Database['mdt']['Tables']['law_reports']['Update'];

type MDTEmsFdReport = never;
type MDTEmsFdReportInsert = never;
type MDTEmsFdReportUpdate = never;

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
      type_id: (boloData.type as any),
      reason: boloData.reason,
      priority_id: (boloData.priority as any) || 'normal',
      author_character_id: boloData.author_character_id,
      subject_name: boloData.subject_name,
      subject_description: boloData.subject_description,
      location: boloData.location,
      vehicle_description: boloData.vehicle_description,
      vehicle_plate: boloData.vehicle_plate,
      status_id: (boloData.status as any) || 'active',
    } as any;

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
      .eq('priority_id', priority as any)
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
      .eq('type_id', type as any)
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
      type_id: (signalData.type as any) || 'general',
      author_character_id: signalData.author_character_id,
      priority_id: (signalData.priority as any) || 'normal',
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

  async createNotification(_notificationData: CreateNotificationData): Promise<MDTNotification> {
    throw new AppError('Notifications временно недоступны: таблица отсутствует в схеме', 501);
  }

  async getUnreadNotifications(_user_id: string): Promise<MDTNotification[]> {
    return [] as unknown as MDTNotification[];
  }

  async markNotificationAsRead(_id: string): Promise<void> {
    return;
  }

  async deleteNotification(_id: string): Promise<void> {
    return;
  }

  async getUserNotifications(_user_id: string, _limit: number = 50): Promise<MDTNotification[]> {
    return [] as unknown as MDTNotification[];
  }

  // ===== APPLICATION УПРАВЛЕНИЕ =====

  async createApplication(_applicationData: CreateApplicationData): Promise<MDTApplication> {
    throw new AppError('MDT applications перемещены в схему system', 501);
  }

  async getApplicationById(_id: string): Promise<MDTApplication | null> {
    return null as unknown as MDTApplication | null;
  }

  // ===== LAW REPORT УПРАВЛЕНИЕ =====

  async createLawReport(reportData: CreateLawReportData): Promise<MDTLawReport> {
    const insertData: MDTLawReportInsert = {
      // Схема reports/fd_reports/ems_reports: поле title отсутствует, храним в description
      description: reportData.description || reportData.title,
      author_character_id: reportData.author_character_id,
      incident_location: reportData.incident_location,
      incident_time: reportData.incident_time,
      incident_type: reportData.incident_type,
      penal_codes: reportData.penal_codes as any,
      seized_items: reportData.seized_items as any,
      call_id: reportData.call_id,
    } as any;

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

  async createEmsFdReport(_reportData: CreateEmsFdReportData): Promise<MDTEmsFdReport> {
    throw new AppError('EMS/FD reporting временно недоступен: таблица отсутствует в схеме', 501);
  }

  async getEmsFdReportById(_id: string): Promise<MDTEmsFdReport | null> {
    return null as unknown as MDTEmsFdReport | null;
  }
} 
