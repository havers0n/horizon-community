// API functions for settings
import { apiClient } from '@/shared/api/api-client'

export interface ApiUserSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  darkMode: boolean
  language: 'ru' | 'en'
}

export const getSettings = async (): Promise<ApiUserSettings> => {
  return apiClient.get<ApiUserSettings>('/settings')
}

export const updateSettings = async (settings: Partial<ApiUserSettings>): Promise<ApiUserSettings> => {
  return apiClient.patch<ApiUserSettings>('/settings', settings)
} 