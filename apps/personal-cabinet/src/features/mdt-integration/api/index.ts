// API functions for MDT integration
import { apiClient } from '@/shared/api/api-client'

export interface ApiMDTData {
  characters: any[]
  vehicles: any[]
  reports: any[]
}

export const getMDTData = async (): Promise<ApiMDTData> => {
  return apiClient.get<ApiMDTData>('/mdt/data')
} 