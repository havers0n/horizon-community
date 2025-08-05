// API functions for profile
import { apiClient } from '@/shared/api/api-client'

export interface ApiProfileData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
}

export const getProfile = async (): Promise<ApiProfileData> => {
  return apiClient.get<ApiProfileData>('/profile')
}

export const updateProfile = async (data: Partial<ApiProfileData>): Promise<ApiProfileData> => {
  return apiClient.patch<ApiProfileData>('/profile', data)
} 