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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// API functions
export const getAllSupportTickets = async (): Promise<ApiResponse<SupportTicket[]>> => {
  return apiClient.get<ApiResponse<SupportTicket[]>>('/admin/support/tickets')
}

export const getSupportTicketDetails = async (ticketId: string): Promise<SupportTicketDetails> => {
  console.log('[SupportAPI] getSupportTicketDetails: Запрос деталей тикета:', ticketId);
  
  const response = await apiClient.get<ApiResponse<any>>(`/admin/support/tickets/${ticketId}`);
  
  console.log('[SupportAPI] getSupportTicketDetails: Ответ сервера:', {
    success: response.success,
    hasData: !!response.data,
    hasTicket: !!response.data?.ticket,
    hasMessages: !!response.data?.messages,
    messagesLength: response.data?.messages?.length || 0
  });
  
  // Проверяем структуру ответа
  if (!response.success) {
    console.error('[SupportAPI] getSupportTicketDetails: Ошибка в ответе:', response);
    throw new Error(response.error || 'Ошибка получения деталей тикета');
  }
  
  if (!response.data) {
    console.error('[SupportAPI] getSupportTicketDetails: Данные отсутствуют в ответе');
    throw new Error('Данные тикета не найдены');
  }

  // RPC функция возвращает структуру { ticket: {...}, messages: [...] }
  // Преобразуем её в плоскую структуру для фронтенда
  const rpcData = response.data;
  
  if (!rpcData.ticket) {
    console.error('[SupportAPI] getSupportTicketDetails: Тикет отсутствует в данных RPC');
    throw new Error('Тикет не найден');
  }

  // Нормализуем данные для фронтенда
  const normalizedData: SupportTicketDetails = {
    id: rpcData.ticket.id || ticketId,
    title: rpcData.ticket.title || 'Без названия',
    author_username: rpcData.ticket.author_username || 'Неизвестный пользователь',
    author_user_id: rpcData.ticket.author_user_id || '',
    status_code: rpcData.ticket.status_code || 'unknown',
    status_name: rpcData.ticket.status_name || 'Неизвестный статус',
    created_at: rpcData.ticket.created_at || new Date().toISOString(),
    updated_at: rpcData.ticket.updated_at || new Date().toISOString(),
    priority: rpcData.ticket.priority || 'normal',
    messages: Array.isArray(rpcData.messages) ? rpcData.messages.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      author_type: msg.author_type || 'user',
      author_username: msg.author_username,
      created_at: msg.created_at
    })) : []
  };
  
  console.log('[SupportAPI] getSupportTicketDetails: Нормализованные данные:', normalizedData);
  
  return normalizedData;
}

export const addMessageToSupportTicket = async (
  ticketId: string, 
  dto: AddMessageDto
): Promise<SupportTicketDetails> => {
  console.log('[SupportAPI] addMessageToSupportTicket: Отправляем сообщение:', { ticketId, dto });
  
  const response = await apiClient.post<ApiResponse<SupportTicketDetails>>(`/admin/support/tickets/${ticketId}/messages`, dto);
  
  console.log('[SupportAPI] addMessageToSupportTicket: Ответ сервера:', {
    success: response.success,
    hasData: !!response.data,
    hasTicket: !!response.data?.ticket,
    hasMessages: !!response.data?.messages,
    messagesCount: response.data?.messages?.length || 0
  });
  
  // Проверяем структуру ответа
  if (!response.success) {
    console.error('[SupportAPI] addMessageToSupportTicket: Ошибка в ответе:', response);
    throw new Error(response.error || 'Ошибка добавления сообщения');
  }
  
  if (!response.data) {
    console.error('[SupportAPI] addMessageToSupportTicket: Данные отсутствуют в ответе');
    throw new Error('Данные тикета не найдены');
  }

  // Бэкенд теперь возвращает полные данные тикета
  const rpcData = response.data;
  
  if (!rpcData.ticket) {
    console.error('[SupportAPI] addMessageToSupportTicket: Тикет отсутствует в данных RPC');
    throw new Error('Тикет не найден');
  }

  // Нормализуем данные для фронтенда
  const normalizedData: SupportTicketDetails = {
    id: rpcData.ticket.id || ticketId,
    title: rpcData.ticket.title || 'Без названия',
    author_username: rpcData.ticket.author_username || 'Неизвестный пользователь',
    author_user_id: rpcData.ticket.author_user_id || '',
    status_code: rpcData.ticket.status_code || 'unknown',
    status_name: rpcData.ticket.status_name || 'Неизвестный статус',
    created_at: rpcData.ticket.created_at || new Date().toISOString(),
    updated_at: rpcData.ticket.updated_at || new Date().toISOString(),
    priority: rpcData.ticket.priority || 'normal',
    messages: Array.isArray(rpcData.messages) ? rpcData.messages.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      author_type: msg.author_type || 'user',
      author_username: msg.author_username,
      created_at: msg.created_at
    })) : []
  };
  
  console.log('[SupportAPI] addMessageToSupportTicket: Нормализованные данные:', normalizedData);
  
  return normalizedData;
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