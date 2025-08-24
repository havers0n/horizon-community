// API functions for admin support ticket management
import { apiClient } from '@/shared/api/api-client'

// Support ticket interfaces
export interface SupportTicket {
  id: string
  title: string
  author_username: string
  author_user_id: string
  status_code: string
  status_name: string
  created_at: string
  updated_at: string
  priority?: 'low' | 'normal' | 'high'
}

export interface SupportTicketDetails {
  id: string
  title: string
  author_username: string
  author_user_id: string
  status_code: string
  status_name: string
  created_at: string
  updated_at: string
  priority?: 'low' | 'normal' | 'high'
  messages: SupportMessage[]
}

export interface SupportMessage {
  id: string
  content: string
  author_type: 'user' | 'admin'
  author_username: string
  created_at: string
}

export interface AddMessageDto {
  content: string
}

export interface ChangeStatusDto {
  status_code: string
}

// API functions
export const getAllSupportTickets = async (): Promise<SupportTicket[]> => {
  return apiClient.get<SupportTicket[]>('/admin/support/tickets')
}

export const getSupportTicketDetails = async (ticketId: string): Promise<SupportTicketDetails> => {
  return apiClient.get<SupportTicketDetails>(`/admin/support/tickets/${ticketId}`)
}

export const addMessageToSupportTicket = async (
  ticketId: string, 
  dto: AddMessageDto
): Promise<SupportMessage> => {
  return apiClient.post<SupportMessage>(`/admin/support/tickets/${ticketId}/messages`, dto)
}

export const changeSupportTicketStatus = async (
  ticketId: string, 
  dto: ChangeStatusDto
): Promise<SupportTicket> => {
  return apiClient.patch<SupportTicket>(`/admin/support/tickets/${ticketId}/status`, dto)
}

// Status constants
export const SUPPORT_TICKET_STATUSES = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress', 
  CLOSED: 'closed',
  PENDING: 'pending'
} as const

export type SupportTicketStatus = typeof SUPPORT_TICKET_STATUSES[keyof typeof SUPPORT_TICKET_STATUSES]