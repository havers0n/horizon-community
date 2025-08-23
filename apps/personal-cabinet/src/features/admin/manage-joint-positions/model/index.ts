// Model types and interfaces for admin joint position management
export interface JointPositionRequest {
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

export interface AdminJointPositionRequestFilters {
  status?: string
  department_id?: string
  page?: number
  limit?: number
}

// Helper functions for formatting
export const formatEmployeeName = (request: JointPositionRequest): string => {
  // Use the new flat field as primary source
  if (request.requester_full_name) {
    return request.requester_full_name
  }
  
  // Fallback to nested structure for backward compatibility
  const user = request.users
  if (!user) return 'Unknown User'
  
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`
  }
  
  return user.username
}

export const formatMainDepartmentName = (request: JointPositionRequest): string => {
  return request.primary_department_name || request.main_department?.name || 'Unknown Department'
}

export const formatJointDepartmentName = (request: JointPositionRequest): string => {
  return request.secondary_department_name || request.joint_department?.name || 'Unknown Department'
}

export const formatApproverName = (request: JointPositionRequest): string => {
  // Use the new flat field as primary source
  if (request.approver_full_name) {
    return request.approver_full_name
  }
  
  // Fallback to nested structure for backward compatibility
  const approver = request.approver
  if (!approver) return '—'
  
  if (approver.first_name && approver.last_name) {
    return `${approver.first_name} ${approver.last_name}`
  }
  
  return approver.username
}

export const formatCreatedAt = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getStatusVariant = (status: string): 'default' | 'warning' | 'success' | 'destructive' => {
  switch (status.toLowerCase()) {
    case 'in_review':
    case 'pending':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'destructive'
    default:
      return 'default'
  }
}

export const getStatusText = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'in_review':
    case 'pending':
      return 'На рассмотрении'
    case 'approved':
      return 'Одобрено'
    case 'rejected':
      return 'Отклонено'
    default:
      return status
  }
}