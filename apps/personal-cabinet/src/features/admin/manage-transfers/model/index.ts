// Model types and interfaces for admin transfer request management
import type { AdminTransferRequest } from '../api'

export type { AdminTransferRequest } from '../api'

// Helper functions for formatting
export const formatEmployeeName = (request: AdminTransferRequest): string => {
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

export const formatSourceDepartmentName = (request: AdminTransferRequest): string => {
  return request.source_department_name || request.source_department?.name || 'Unknown Department'
}

export const formatTargetDepartmentName = (request: AdminTransferRequest): string => {
  return request.target_department_name || request.target_department?.name || 'Unknown Department'
}

export const formatApproverName = (request: AdminTransferRequest): string => {
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