import { supabase } from '../lib/supabase';
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

// ===== ENUM ТИПЫ ИЗ СХЕМЫ БД =====
type BoloPriority = Database['mdt']['Enums']['bolo_priority'];
type BoloStatus = Database['mdt']['Enums']['bolo_status'];
type BoloType = Database['mdt']['Enums']['bolo_type'];
type CallPriority = Database['mdt']['Enums']['call_priority'];
type CallStatus = Database['mdt']['Enums']['call_status'];
type CallType = Database['mdt']['Enums']['call_type'];
type ApplicationStatus = Database['mdt']['Enums']['application_status'];
type ComplaintStatus = Database['mdt']['Enums']['complaint_status'];
type SupportTicketStatus = Database['mdt']['Enums']['support_ticket_status'];

// ===== ИНТЕРФЕЙСЫ ДЛЯ ВАЛИДАЦИИ =====
export interface CreateBoloData {
  type: BoloType; // ✅ ИСПРАВЛЕНО: используем ENUM из схемы
  reason: string;
  priority?: BoloPriority; // ✅ ИСПРАВЛЕНО: используем ENUM из схемы
  author_character_id: string; // ✅ ИСПРАВЛЕНО: snake_case
  subject_name?: string; // ✅ ИСПРАВЛЕНО: snake_case
  subject_description?: string; // ✅ ИСПРАВЛЕНО: snake_case
  location?: string;
  vehicle_description?: string; // ✅ ИСПРАВЛЕНО: snake_case
  vehicle_plate?: string; // ✅ ИСПРАВЛЕНО: snake_case
  status?: BoloStatus; // ✅ ИСПРАВЛЕНО: используем ENUM из схемы
}

export interface UpdateBoloData extends Partial<CreateBoloData> {}

export interface CreateSignalData {
  title: string;
  description?: string;
  type?: string;
  author_character_id?: string; // ✅ ИСПРАВЛЕНО: snake_case
  priority?: CallPriority; // ✅ ИСПРАВЛЕНО: используем ENUM из схемы
  location?: string;
  coordinates?: any;
  is_active?: boolean; // ✅ ИСПРАВЛЕНО: snake_case
  expires_at?: string; // ✅ ИСПРАВЛЕНО: snake_case
}

export interface UpdateSignalData extends Partial<CreateSignalData> {}

export interface CreateNotificationData {
  content: string;
  recipient_user_id: string; // ✅ ИСПРАВЛЕНО: snake_case
  is_read?: boolean; // ✅ ИСПРАВЛЕНО: snake_case
  link?: string;
}

export interface UpdateNotificationData extends Partial<CreateNotificationData> {}

export interface CreateApplicationData {
  type: string;
  author_user_id: string; // ✅ ИСПРАВЛЕНО: snake_case
  author_character_id: string; // ✅ ИСПРАВЛЕНО: snake_case
  data?: any;
  status?: ApplicationStatus; // ✅ ИСПРАВЛЕНО: используем ENUM из схемы
  status_history?: any[]; // ✅ ИСПРАВЛЕНО: snake_case
}

export interface UpdateApplicationData extends Partial<CreateApplicationData> {}

export interface CreateLawReportData {
  title: string;
  description: string;
  author_character_id: string; // ✅ ИСПРАВЛЕНО: snake_case
  incident_location: string; // ✅ ИСПРАВЛЕНО: snake_case
  incident_time: string; // ✅ ИСПРАВЛЕНО: snake_case
  incident_type: string; // ✅ ИСПРАВЛЕНО: snake_case
  participants?: any;
  penal_codes?: any; // ✅ ИСПРАВЛЕНО: snake_case
  seized_items?: any; // ✅ ИСПРАВЛЕНО: snake_case
  call_id?: string; // ✅ ИСПРАВЛЕНО: snake_case
}

export interface UpdateLawReportData extends Partial<CreateLawReportData> {}

export interface CreateEmsFdReportData {
  title: string;
  description: string;
  author_character_id: string; // ✅ ИСПРАВЛЕНО: snake_case
  incident_location: string; // ✅ ИСПРАВЛЕНО: snake_case
  incident_time: string; // ✅ ИСПРАВЛЕНО: snake_case
  incident_type: string; // ✅ ИСПРАВЛЕНО: snake_case
  patients?: any;
  vital_signs?: any; // ✅ ИСПРАВЛЕНО: snake_case
  medications_administered?: any; // ✅ ИСПРАВЛЕНО: snake_case
  treatment_provided?: string; // ✅ ИСПРАВЛЕНО: snake_case
  outcome?: string;
  fire_details?: any; // ✅ ИСПРАВЛЕНО: snake_case
  call_id?: string; // ✅ ИСПРАВЛЕНО: snake_case
}

export interface UpdateEmsFdReportData extends Partial<CreateEmsFdReportData> {}

// ===== КЛАСС MDT СЕРВИСА =====
export class MDTService {
  // ===== BOLO УПРАВЛЕНИЕ =====
  
  async getAllBolos(): Promise<MDTBolo[]> {
    const { data, error } = await (supabase as any)
      .from("mdt.bolos")
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[MDTService] Error fetching bolos:', error);
      throw new Error('Failed to fetch bolos');
    }

    return data || [];
  }

  async getBoloById(id: string): Promise<MDTBolo | null> {
    const { data, error } = await (supabase as any)
      .from("mdt.bolos")
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[MDTService] Error fetching bolo:', error);
      throw new Error('Failed to fetch bolo');
    }

    return data;
  }

  async createBolo(boloData: CreateBoloData): Promise<MDTBolo> {
    const insertData: MDTBoloInsert = {
      type: boloData.type,
      reason: boloData.reason,
      priority: boloData.priority || 'medium',
      author_character_id: boloData.author_character_id,
      subject_name: boloData.subject_name,
      subject_description: boloData.subject_description,
      location: boloData.location,
      vehicle_description: boloData.vehicle_description,
      vehicle_plate: boloData.vehicle_plate,
      status: boloData.status || 'active',
    };

    const { data, error } = await (supabase as any)
      .from("mdt.bolos")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[MDTService] Error creating bolo:', error);
      throw new Error('Failed to create bolo');
    }

    return data;
  }

  async updateBolo(id: string, updateData: UpdateBoloData): Promise<MDTBolo> {
    const { data, error } = await (supabase as any)
      .from("mdt.bolos")
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[MDTService] Error updating bolo:', error);
      throw new Error('Failed to update bolo');
    }

    return data;
  }

  async deleteBolo(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from("mdt.bolos")
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[MDTService] Error deleting bolo:', error);
      throw new Error('Failed to delete bolo');
    }
  }

  async getBolosByAuthor(authorCharacterId: string): Promise<MDTBolo[]> {
    const { data, error } = await (supabase as any)
      .from("mdt.bolos")
      .select('*')
      .eq('author_character_id', authorCharacterId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[MDTService] Error fetching author bolos:', error);
      throw new Error('Failed to fetch author bolos');
    }

    return data || [];
  }

  async getBolosByPriority(priority: string): Promise<MDTBolo[]> {
    const { data, error } = await (supabase as any)
      .from("mdt.bolos")
      .select('*')
      .eq('priority', priority)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[MDTService] Error fetching priority bolos:', error);
      throw new Error('Failed to fetch priority bolos');
    }

    return data || [];
  }

  async getBolosByType(type: string): Promise<MDTBolo[]> {
    const { data, error } = await (supabase as any)
      .from("mdt.bolos")
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[MDTService] Error fetching type bolos:', error);
      throw new Error('Failed to fetch type bolos');
    }

    return data || [];
  }

  // ===== SIGNAL УПРАВЛЕНИЕ =====

  async getAllSignals(): Promise<MDTSignal[]> {
    const { data, error } = await (supabase as any)
      .from("mdt.mdt_signals")
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[MDTService] Error fetching signals:', error);
      throw new Error('Failed to fetch signals');
    }

    return data || [];
  }

  async getSignalById(id: string): Promise<MDTSignal | null> {
    const { data, error } = await (supabase as any)
      .from("mdt.mdt_signals")
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[MDTService] Error fetching signal:', error);
      throw new Error('Failed to fetch signal');
    }

    return data;
  }

  async createSignal(signalData: CreateSignalData): Promise<MDTSignal> {
    const insertData: MDTSignalInsert = {
      title: signalData.title,
      description: signalData.description,
      type: signalData.type,
      author_character_id: signalData.author_character_id,
      priority: signalData.priority || 'medium',
      location: signalData.location,
      coordinates: signalData.coordinates,
      is_active: signalData.is_active ?? true,
      expires_at: signalData.expires_at,
    };

    const { data, error } = await (supabase as any)
      .from("mdt.mdt_signals")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[MDTService] Error creating signal:', error);
      throw new Error('Failed to create signal');
    }

    return data;
  }

  async updateSignal(id: string, updateData: UpdateSignalData): Promise<MDTSignal> {
    const { data, error } = await (supabase as any)
      .from("mdt.mdt_signals")
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[MDTService] Error updating signal:', error);
      throw new Error('Failed to update signal');
    }

    return data;
  }

  async deleteSignal(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from("mdt.mdt_signals")
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[MDTService] Error deleting signal:', error);
      throw new Error('Failed to delete signal');
    }
  }

  async getActiveSignals(): Promise<MDTSignal[]> {
    const { data, error } = await (supabase as any)
      .from("mdt.mdt_signals")
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[MDTService] Error fetching active signals:', error);
      throw new Error('Failed to fetch active signals');
    }

    return data || [];
  }

  // ===== UNIT УПРАВЛЕНИЕ =====

  async getAllUnits(): Promise<MDTUnit[]> {
    const { data, error } = await (supabase as any)
      .from("mdt.units_on_duty")
      .select('*')
      .order('last_update', { ascending: false });

    if (error) {
      console.error('[MDTService] Error fetching units:', error);
      throw new Error('Failed to fetch units');
    }

    return data || [];
  }

  // ===== NOTIFICATION УПРАВЛЕНИЕ =====

  async createNotification(notificationData: CreateNotificationData): Promise<MDTNotification> {
    const insertData: MDTNotificationInsert = {
      content: notificationData.content,
      recipient_user_id: notificationData.recipient_user_id,
      is_read: notificationData.is_read ?? false,
      link: notificationData.link,
    };

    const { data, error } = await (supabase as any)
      .from("mdt.notifications")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[MDTService] Error creating notification:', error);
      throw new Error('Failed to create notification');
    }

    return data;
  }

  async getUnreadNotifications(userId: string): Promise<MDTNotification[]> {
    const { data, error } = await (supabase as any)
      .from("mdt.notifications")
      .select('*')
      .eq('recipient_user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[MDTService] Error fetching unread notifications:', error);
      throw new Error('Failed to fetch unread notifications');
    }

    return data || [];
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from("mdt.notifications")
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('[MDTService] Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  async deleteNotification(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from("mdt.notifications")
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[MDTService] Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<MDTNotification[]> {
    const { data, error } = await (supabase as any)
      .from("mdt.notifications")
      .select('*')
      .eq('recipient_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[MDTService] Error fetching user notifications:', error);
      throw new Error('Failed to fetch user notifications');
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
      status: applicationData.status || 'pending',
      status_history: applicationData.status_history,
    };

    const { data, error } = await (supabase as any)
      .from("mdt.applications")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[MDTService] Error creating application:', error);
      throw new Error('Failed to create application');
    }

    return data;
  }

  async getApplicationById(id: string): Promise<MDTApplication | null> {
    const { data, error } = await (supabase as any)
      .from("mdt.applications")
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[MDTService] Error fetching application:', error);
      throw new Error('Failed to fetch application');
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
      participants: reportData.participants,
      penal_codes: reportData.penal_codes,
      seized_items: reportData.seized_items,
      call_id: reportData.call_id,
    };

    const { data, error } = await (supabase as any)
      .from("mdt.law_reports")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[MDTService] Error creating law report:', error);
      throw new Error('Failed to create law report');
    }

    return data;
  }

  async getLawReportById(id: string): Promise<MDTLawReport | null> {
    const { data, error } = await (supabase as any)
      .from("mdt.law_reports")
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[MDTService] Error fetching law report:', error);
      throw new Error('Failed to fetch law report');
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

    const { data, error } = await (supabase as any)
      .from("mdt.ems_fd_reports")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[MDTService] Error creating EMS/FD report:', error);
      throw new Error('Failed to create EMS/FD report');
    }

    return data;
  }

  async getEmsFdReportById(id: string): Promise<MDTEmsFdReport | null> {
    const { data, error } = await (supabase as any)
      .from("mdt.ems_fd_reports")
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[MDTService] Error fetching EMS/FD report:', error);
      throw new Error('Failed to fetch EMS/FD report');
    }

    return data;
  }
} 