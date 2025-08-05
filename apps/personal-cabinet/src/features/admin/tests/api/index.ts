// API functions for admin tests
import { apiClient } from '@/shared/api/api-client'

export interface ApiTestStats {
  totalTests: number
  activeTests: number
  totalAttempts: number
  averageScore: number
}

export const getTestStats = async (): Promise<ApiTestStats> => {
  return apiClient.get<ApiTestStats>('/admin/tests/stats')
} 