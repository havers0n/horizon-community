// API functions for admin leave management
import { apiClient } from '@/shared/api/api-client'

export interface ApiLeaveRequest {
  id: string
  user_id: string
  start_date: string
  end_date: string
  reason: string
  status_code: string
  status_name: string
  created_at: string
  updated_at: string
  approver_id?: string
  rejection_reason?: string
  requester_full_name: string
  approver_full_name?: string
  users?: {
    username: string
    first_name?: string
    last_name?: string
  }
  departments?: {
    name: string
  }
  approver?: {
    username: string
    first_name?: string
    last_name?: string
  }
}

export interface AdminLeaveRequestsResponse {
  success: boolean
  data: ApiLeaveRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AdminLeaveRequestFilters {
  status?: string
  department_id?: string
  page?: number
  limit?: number
}

export const getLeaveRequests = async (filters?: AdminLeaveRequestFilters): Promise<AdminLeaveRequestsResponse> => {
  const params = new URLSearchParams()
  
  if (filters?.status && filters.status !== 'all') {
    params.append('status', filters.status)
  }
  if (filters?.department_id && filters.department_id !== 'all') {
    params.append('department_id', filters.department_id)
  }
  if (filters?.page) {
    params.append('page', filters.page.toString())
  }
  if (filters?.limit) {
    params.append('limit', filters.limit.toString())
  }

  const queryString = params.toString()
  const url = `/admin/leave-requests${queryString ? `?${queryString}` : ''}`
  
  return apiClient.get<AdminLeaveRequestsResponse>(url)
}

export const getLeaveRequestById = async (id: string): Promise<{ success: boolean; data: ApiLeaveRequest }> => {
  return apiClient.get<{ success: boolean; data: ApiLeaveRequest }>(`/admin/leave-requests/${id}`)
}

export const approveLeaveRequest = async (id: string): Promise<{ success: boolean; data: ApiLeaveRequest }> => {
  return apiClient.patch<{ success: boolean; data: ApiLeaveRequest }>(`/admin/leave-requests/${id}/approve`)
}

export const rejectLeaveRequest = async (id: string, reason?: string): Promise<{ success: boolean; data: ApiLeaveRequest }> => {
  const body = reason ? { reason } : {}
  return apiClient.patch<{ success: boolean; data: ApiLeaveRequest }>(`/admin/leave-requests/${id}/reject`, body)
} 