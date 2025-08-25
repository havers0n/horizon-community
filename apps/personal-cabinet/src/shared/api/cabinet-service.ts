import { apiClient } from './api-client';
import type { Database } from '@roleplay-identity/db-types';
import { createClient } from '@supabase/supabase-js'

// Типы из БД - исправленные схемы
type UserProfile = Database['public']['Tables']['profiles']['Row'];
type UserSettings = Database['public']['Tables']['user_settings']['Row'];
type Application = Database['system']['Tables']['applications']['Row']; // Исправлено: system схема
type Department = Database['common']['Tables']['departments']['Row']; // Исправлено: common схема

// Типы для обновления
export interface UpdateProfileData {
  username?: string;
  bio?: string;
  avatar_url?: string;
}

export interface UpdateSettingsData {
  theme?: 'light' | 'dark' | 'system';
  language?: 'en' | 'ru';
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy?: {
    profile_visible: boolean;
    show_email: boolean;
    show_phone: boolean;
  };
}

// Типы для заявок на отпуск
export interface LeaveRequest {
  id: string; // uuid
  start_date: string; // date string 'YYYY-MM-DD'
  end_date: string; // date string 'YYYY-MM-DD'
  reason: string;
  created_at: string; // timestamp string
  status_name: string; // e.g., 'На рассмотрении', 'Одобрен', 'Отклонен'
  status_code: string; // e.g., 'in_review', 'approved', 'rejected'
  approver_full_name: string | null;
}

export interface CreateLeaveRequestDto {
  p_start_date: string; // date string 'YYYY-MM-DD'
  p_end_date: string; // date string 'YYYY-MM-DD'
  p_reason: string;
}

// Типы для заявок на совмещение должностей
export interface JointPositionRequest {
  id: string;
  start_date: string;
  reason: string;
  created_at: string;
  status_name: string;
  status_code: string;
  primary_department_name: string;
  secondary_department_name: string;
  approver_full_name: string | null;
}

export interface AvailableDepartment {
  id: string;
  name: string;
}

export interface CreateJointPositionRequestDto {
  p_secondary_department_id: string;
  p_reason: string;
}

// Типы для заявок на перевод
export interface TransferRequest {
  id: string;
  reason: string;
  created_at: string;
  status_name: string;
  status_code: string;
  current_department_name: string;
  target_department_name: string;
  approver_full_name: string | null;
}

export interface AvailableTransferDepartment {
  id: string;
  name: string;
}

export interface CreateTransferRequestDto {
  p_target_department_id: string;
  p_reason: string;
}

// Типы для тикетов службы поддержки
export interface SupportTicket {
  id: string;
  title: string;
  initial_message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  content: string;
  createdAt: string;
  isFromUser: boolean;
}

export interface SupportTicketDetails {
  ticket: SupportTicket;
  messages: SupportMessage[];
}

export interface CreateSupportTicketDto {
  p_title: string;
  p_initial_message: string;
}

// Типы для жалоб
export interface Complaint {
  id: string;
  incident_date: string;
  title: string;
  type: string;
  participants: string[];
  description: string;
  evidence?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateComplaintDto {
  p_incident_date: string; // timestamptz format
  p_title: string;
  p_type: string;
  p_participants: string[]; // Will be converted to JSONB
  p_description: string;
  p_evidence?: string;
}

// API ответы
export interface CabinetApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Cabinet API сервис
export const cabinetApi = {
  // Supabase клиент для прямых запросов
  supabase: (() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }
    
    return createClient(supabaseUrl, supabaseAnonKey)
  })(),

  // Профиль пользователя
  getProfile: () => 
    apiClient.get<CabinetApiResponse<UserProfile>>('/cabinet/profile'),

  updateProfile: (data: UpdateProfileData) => 
    apiClient.put<CabinetApiResponse<UserProfile>>('/cabinet/profile', data),

  // Заявки пользователя
  getApplications: () => 
    apiClient.get<CabinetApiResponse<Application[]>>('/applications/my'),

  // Департаменты пользователя
  getDepartments: () => 
    apiClient.get<CabinetApiResponse<Department[]>>('/cabinet/departments'),

  // Настройки пользователя
  getSettings: () => 
    apiClient.get<CabinetApiResponse<UserSettings>>('/cabinet/settings'),

  updateSettings: (settings: UpdateSettingsData) => 
    apiClient.put<CabinetApiResponse<UserSettings>>('/cabinet/settings', settings),

  // Статистика пользователя
  getStats: () => 
    apiClient.get<CabinetApiResponse<{
      applicationsCount: number;
      departmentsCount: number;
      lastActivity: string | null;
    }>>('/cabinet/stats'),

  // Заявки на отпуск
  createLeaveRequest: async (data: CreateLeaveRequestDto): Promise<LeaveRequest> => {
    const response = await apiClient.post('/cabinet/rpc/create_leave_request', data);
    return response.data || response;
  },

  getMyLeaves: async (): Promise<LeaveRequest[]> => {
    const response = await apiClient.post('/cabinet/rpc/get_my_leaves', {});
    return response.data || response;
  },

  // Заявки на совмещение должностей
  getAvailableJointDepartments: async (): Promise<AvailableDepartment[]> => {
    const response = await apiClient.get<CabinetApiResponse<AvailableDepartment[]>>('/cabinet/joint-positions/available-departments');
    return response.data || response;
  },

  createJointPositionRequest: async (data: CreateJointPositionRequestDto): Promise<JointPositionRequest> => {
    const response = await apiClient.post<CabinetApiResponse<JointPositionRequest>>('/cabinet/joint-positions/requests', data);
    return response.data || response;
  },

  getMyJointPositionRequests: async (): Promise<JointPositionRequest[]> => {
    const response = await apiClient.get<CabinetApiResponse<JointPositionRequest[]>>('/cabinet/joint-positions/my-requests');
    return response.data || response;
  },

  // Тикеты службы поддержки
  createSupportTicket: async (data: CreateSupportTicketDto): Promise<{ id: string }> => {
    const response = await apiClient.post<CabinetApiResponse<{ id: string }>>('/support/tickets', data);
    return response.data || response;
  },

  // Новые методы для работы с тикетами поддержки
  getSupportTicketById: async (ticketId: string): Promise<SupportTicketDetails> => {
    const response = await apiClient.get<CabinetApiResponse<SupportTicketDetails>>(`/support/tickets/${ticketId}`);
    return response.data || response;
  },

  addSupportMessage: async (ticketId: string, data: { message: string }): Promise<SupportTicketDetails> => {
    const response = await apiClient.post<CabinetApiResponse<SupportTicketDetails>>(`/support/tickets/${ticketId}/messages`, {
      content: data.message // Преобразуем message в content для соответствия API
    });
    return response.data || response;
  },

  getMySupportTickets: async (): Promise<SupportTicket[]> => {
    const response = await apiClient.get<CabinetApiResponse<SupportTicket[]>>('/support/tickets/my');
    return response.data || response;
  },

  // Жалобы
  createComplaint: async (data: CreateComplaintDto): Promise<{ id: string }> => {
    // Convert participants array to JSONB format for the RPC function
    const rpcData = {
      p_incident_date: data.p_incident_date,
      p_title: data.p_title,
      p_type: data.p_type,
      p_participants: data.p_participants, // Will be automatically converted to JSONB by API
      p_description: data.p_description,
      p_evidence: data.p_evidence || ''
    };
    const response = await apiClient.post<CabinetApiResponse<{ id: string }>>('/support/complaints', rpcData);
    return response.data || response;
  },

  // Заявки на перевод
  getAvailableTransferDepartments: async (): Promise<AvailableTransferDepartment[]> => {
    const response = await apiClient.get<CabinetApiResponse<AvailableTransferDepartment[]>>('/cabinet/transfers/available-departments');
    return response.data || response;
  },

  createTransferRequest: async (data: CreateTransferRequestDto): Promise<TransferRequest> => {
    const response = await apiClient.post<CabinetApiResponse<TransferRequest>>('/cabinet/transfers/requests', data);
    return response.data || response;
  },

  getMyTransferRequests: async (): Promise<TransferRequest[]> => {
    const response = await apiClient.get<CabinetApiResponse<TransferRequest[]>>('/cabinet/transfers/my-requests');
    return response.data || response;
  },
}; 