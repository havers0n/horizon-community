// API functions for admin transfer request management
import { apiClient } from '@/shared/api/api-client'

export interface AdminTransferRequest {
  id: string
  user_id: string
  source_department_id: string
  source_department_name: string
  target_department_id: string
  target_department_name: string
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
  source_department?: {
    name: string
  }
  target_department?: {
    name: string
  }
  approver?: {
    username: string
    first_name?: string
    last_name?: string
  }
}

export interface AdminTransferRequestsResponse {
  success: boolean
  data: AdminTransferRequest[]
}

export interface AdminTransferRequestFilters {
  status?: string
  department_id?: string
  page?: number
  limit?: number
}

export const getAllTransferRequests = async (filters?: AdminTransferRequestFilters): Promise<AdminTransferRequestsResponse> => {
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
  const url = `/admin/transfers/requests${queryString ? `?${queryString}` : ''}`
  
  return apiClient.get<AdminTransferRequestsResponse>(url)
}

export const getTransferRequestById = async (id: string): Promise<{ success: boolean; data: AdminTransferRequest }> => {
  return apiClient.get<{ success: boolean; data: AdminTransferRequest }>(`/admin/transfers/requests/${id}`)
}

export const approveTransferRequest = async (id: string): Promise<{ success: boolean; message: string }> => {
  return apiClient.patch<{ success: boolean; message: string }>(`/admin/transfers/requests/${id}/approve`)
}

export const rejectTransferRequest = async (id: string, reason: string): Promise<{ success: boolean; message: string }> => {
  return apiClient.patch<{ success: boolean; message: string }>(`/admin/transfers/requests/${id}/reject`, { reason })
}