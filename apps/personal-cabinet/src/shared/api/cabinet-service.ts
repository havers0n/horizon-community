import { apiClient } from './api-client';
import type { Database } from '@roleplay-identity/db-types';

// Типы из БД - исправленные схемы
type UserProfile = Database['public']['Tables']['profiles']['Row'];
type UserSettings = Database['public']['Tables']['user_settings']['Row'];
type Application = Database['mdt']['Tables']['applications']['Row']; // Исправлено: mdt схема
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

// API ответы
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Cabinet API сервис
export const cabinetApi = {
  // Профиль пользователя
  getProfile: () => 
    apiClient.get<ApiResponse<UserProfile>>('/cabinet/profile'),

  updateProfile: (data: UpdateProfileData) => 
    apiClient.put<ApiResponse<UserProfile>>('/cabinet/profile', data),

  // Заявки пользователя
  getApplications: () => 
    apiClient.get<ApiResponse<Application[]>>('/cabinet/applications'),

  // Департаменты пользователя
  getDepartments: () => 
    apiClient.get<ApiResponse<Department[]>>('/cabinet/departments'),

  // Настройки пользователя
  getSettings: () => 
    apiClient.get<ApiResponse<UserSettings>>('/cabinet/settings'),

  updateSettings: (settings: UpdateSettingsData) => 
    apiClient.put<ApiResponse<UserSettings>>('/cabinet/settings', settings),

  // Статистика пользователя
  getStats: () => 
    apiClient.get<ApiResponse<{
      applicationsCount: number;
      departmentsCount: number;
      lastActivity: string | null;
    }>>('/cabinet/stats'),
}; 