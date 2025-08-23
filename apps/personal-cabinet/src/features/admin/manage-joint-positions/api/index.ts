// API functions for admin joint position management
import { apiClient } from '@/shared/api/api-client'

export interface AdminJointPositionRequest {
  id: string
  user_id?: string
  main_department_id?: string
  primary_department_name: string
  joint_department_id?: string
  secondary_department_name: string
  reason: string
  status_code: string
  status_name: string
  created_at: string
  updated_at?: string
  approver_id?: string
  rejection_reason?: string | null
  review_comment?: string | null
  requester_full_name: string
  user_username?: string
  approver_full_name?: string | null
  users?: {
    username: string
    first_name?: string
    last_name?: string
  }
  main_department?: {
    name: string
  }
  joint_department?: {
    name: string
  }
  approver?: {
    username: string
    first_name?: string
    last_name?: string
  }
}

export interface AdminJointPositionRequestsResponse {
  success: boolean
  data: AdminJointPositionRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AdminJointPositionRequestFilters {
  status?: string
  department_id?: string
  page?: number
  limit?: number
}

export const getAllJointPositionRequests = async (filters?: AdminJointPositionRequestFilters): Promise<AdminJointPositionRequestsResponse> => {
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
  const url = `/admin/joint-positions/requests${queryString ? `?${queryString}` : ''}`
  
  return apiClient.get<AdminJointPositionRequestsResponse>(url)
}

export const getJointPositionRequestById = async (id: string): Promise<{ success: boolean; data: AdminJointPositionRequest }> => {
  return apiClient.get<{ success: boolean; data: AdminJointPositionRequest }>(`/admin/joint-positions/requests/${id}`)
}

export const approveJointPositionRequest = async (id: string): Promise<{ success: boolean; data: AdminJointPositionRequest }> => {
  return apiClient.patch<{ success: boolean; data: AdminJointPositionRequest }>(`/admin/joint-positions/requests/${id}/approve`)
}

export const rejectJointPositionRequest = async (id: string, reason?: string): Promise<{ success: boolean; data: AdminJointPositionRequest }> => {
  const body = reason ? { reason } : {}
  return apiClient.patch<{ success: boolean; data: AdminJointPositionRequest }>(`/admin/joint-positions/requests/${id}/reject`, body)
}