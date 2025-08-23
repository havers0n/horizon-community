import { apiClient } from './api-client';
import type { Database } from '@roleplay-identity/db-types';

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

// API ответы
export interface CabinetApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Cabinet API сервис
export const cabinetApi = {
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
}; 