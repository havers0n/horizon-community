// API functions for admin leave management
import { apiClient } from '@/shared/api/api-client'

export interface ApiLeaveRequest {
  id: string
  employeeName: string
  employeeId: string
  department: string
  leaveType: 'vacation' | 'sick' | 'personal' | 'other'
  startDate: Date
  endDate: Date
  status: 'pending' | 'approved' | 'rejected'
  reason: string
  submittedAt: Date
}

export const getLeaveRequests = async (): Promise<ApiLeaveRequest[]> => {
  return apiClient.get<ApiLeaveRequest[]>('/admin/leave-requests')
}

export const approveLeaveRequest = async (id: string): Promise<ApiLeaveRequest> => {
  return apiClient.patch<ApiLeaveRequest>(`/admin/leave-requests/${id}/approve`)
}

export const rejectLeaveRequest = async (id: string, reason: string): Promise<ApiLeaveRequest> => {
  return apiClient.patch<ApiLeaveRequest>(`/admin/leave-requests/${id}/reject`, { reason })
} 