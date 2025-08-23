// Model types and interfaces for admin leave management
export interface LeaveRequest {
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

export interface AdminLeaveRequestFilters {
  status?: string
  department_id?: string
  page?: number
  limit?: number
}

// Helper functions for formatting
export const formatEmployeeName = (leaveRequest: LeaveRequest): string => {
  // Use the new flat field as primary source
  if (leaveRequest.requester_full_name) {
    return leaveRequest.requester_full_name
  }
  
  // Fallback to nested structure for backward compatibility
  const user = leaveRequest.users
  if (!user) return 'Unknown User'
  
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`
  }
  
  return user.username
}

export const formatDepartmentName = (leaveRequest: LeaveRequest): string => {
  return leaveRequest.departments?.name || 'Unknown Department'
}

export const formatApproverName = (leaveRequest: LeaveRequest): string => {
  // Use the new flat field as primary source
  if (leaveRequest.approver_full_name) {
    return leaveRequest.approver_full_name
  }
  
  // Fallback to nested structure for backward compatibility
  const approver = leaveRequest.approver
  if (!approver) return '—'
  
  if (approver.first_name && approver.last_name) {
    return `${approver.first_name} ${approver.last_name}`
  }
  
  return approver.username
}

export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate).toLocaleDateString('ru-RU')
  const end = new Date(endDate).toLocaleDateString('ru-RU')
  return `${start} - ${end}`
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