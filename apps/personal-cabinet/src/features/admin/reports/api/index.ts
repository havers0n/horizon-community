// API functions for admin reports
import { apiClient } from '@/shared/api/api-client'

export interface ApiReportStats {
  totalReports: number
  pendingReports: number
  approvedReports: number
  rejectedReports: number
  averageProcessingTime: number
}

export const getReportStats = async (): Promise<ApiReportStats> => {
  return apiClient.get<ApiReportStats>('/admin/reports/stats')
} 