import { apiClient } from '@/shared/api/api-client'

export interface AdminApplication {
  id: string
  author_user_id: string
  target_department_id?: string | null
  status_id: string
  type: string
  created_at?: string
  data?: any
  // Обогащённые, человеко-читаемые поля из бэкенда
  author_name?: string | null
  department_name?: string | null
  status_name?: string | null
}

export interface AdminApplicationsFilters {
  status?: string
  department?: string
  page?: number
  limit?: number
}

export const listAdminApplications = async (filters: AdminApplicationsFilters = {}): Promise<{ items: AdminApplication[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
  const params: any = {}
  if (filters.status) params.status = filters.status
  if (filters.department) params.department = filters.department
  if (filters.page) params.page = String(filters.page)
  if (filters.limit) params.limit = String(filters.limit)

  const res = await apiClient.get<{ success: boolean; data: AdminApplication[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/admin/applications`, { params })
  return { items: (res as any).data ?? (res as any), pagination: (res as any).pagination ?? { page: filters.page || 1, limit: filters.limit || 20, total: (res as any).length || 0, totalPages: 1 } }
}

export const getAdminApplicationById = async (id: string): Promise<AdminApplication> => {
  const res = await apiClient.get<{ success: boolean; data: AdminApplication }>(`/admin/applications/${id}`)
  return (res as any).data ?? (res as any)
}

export const updateAdminApplicationStatus = async (id: string, body: { status: string; review_comment?: string } | { new_status_code: string; review_comment?: string }): Promise<AdminApplication> => {
  const res = await apiClient.put<{ success: boolean; data: AdminApplication }>(`/admin/applications/${id}/status`, body as any)
  return (res as any).data ?? (res as any)
}
