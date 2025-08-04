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

// ===== ИНТЕРФЕЙСЫ ДЛЯ ВАЛИДАЦИИ =====
export interface CreateBoloData {
  type: string;
  reason: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  authorCharacterId: string;
  subjectName?: string;
  subjectDescription?: string;
  location?: string;
  vehicleDescription?: string;
  vehiclePlate?: string;
  status?: 'active' | 'resolved' | 'expired' | 'deleted';
}

export interface UpdateBoloData extends Partial<CreateBoloData> {}

export interface CreateSignalData {
  title: string;
  description?: string;
  type?: string;
  authorCharacterId?: string;
  priority?: 'low' | 'medium' | 'high' | 'emergency';
  location?: string;
  coordinates?: any;
  isActive?: boolean;
  expiresAt?: string;
}

export interface UpdateSignalData extends Partial<CreateSignalData> {}

export interface CreateNotificationData {
  content: string;
  recipientUserId: string;
  isRead?: boolean;
  link?: string;
}

export interface UpdateNotificationData extends Partial<CreateNotificationData> {}

export interface CreateApplicationData {
  type: string;
  authorUserId: string;
  authorCharacterId: string;
  data?: any;
  status?: 'pending' | 'approved' | 'rejected';
  statusHistory?: any[];
}

export interface UpdateApplicationData extends Partial<CreateApplicationData> {}

export interface CreateLawReportData {
  title: string;
  description: string;
  authorCharacterId: string;
  incidentLocation: string;
  incidentTime: string;
  incidentType: string;
  participants?: any;
  penalCodes?: any;
  seizedItems?: any;
  callId?: string;
}

export interface UpdateLawReportData extends Partial<CreateLawReportData> {}

export interface CreateEmsFdReportData {
  title: string;
  description: string;
  authorCharacterId: string;
  incidentLocation: string;
  incidentTime: string;
  incidentType: string;
  patients?: any;
  vitalSigns?: any;
  medicationsAdministered?: any;
  treatmentProvided?: string;
  outcome?: string;
  fireDetails?: any;
  callId?: string;
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
      author_character_id: boloData.authorCharacterId,
      subject_name: boloData.subjectName,
      subject_description: boloData.subjectDescription,
      location: boloData.location,
      vehicle_description: boloData.vehicleDescription,
      vehicle_plate: boloData.vehiclePlate,
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
      author_character_id: signalData.authorCharacterId,
      priority: signalData.priority || 'medium',
      location: signalData.location,
      coordinates: signalData.coordinates,
      is_active: signalData.isActive ?? true,
      expires_at: signalData.expiresAt,
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
      recipient_user_id: notificationData.recipientUserId,
      is_read: notificationData.isRead ?? false,
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
      author_user_id: applicationData.authorUserId,
      author_character_id: applicationData.authorCharacterId,
      data: applicationData.data,
      status: applicationData.status || 'pending',
      status_history: applicationData.statusHistory,
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
      author_character_id: reportData.authorCharacterId,
      incident_location: reportData.incidentLocation,
      incident_time: reportData.incidentTime,
      incident_type: reportData.incidentType,
      participants: reportData.participants,
      penal_codes: reportData.penalCodes,
      seized_items: reportData.seizedItems,
      call_id: reportData.callId,
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
      author_character_id: reportData.authorCharacterId,
      incident_location: reportData.incidentLocation,
      incident_time: reportData.incidentTime,
      incident_type: reportData.incidentType,
      patients: reportData.patients,
      vital_signs: reportData.vitalSigns,
      medications_administered: reportData.medicationsAdministered,
      treatment_provided: reportData.treatmentProvided,
      outcome: reportData.outcome,
      fire_details: reportData.fireDetails,
      call_id: reportData.callId,
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

// Экспортируем экземпляр сервиса
export default new MDTService(); 