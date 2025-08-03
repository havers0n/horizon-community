import { supabase } from '../lib/supabase.js';
import type { Database } from '../../../packages/db-types/src/index';

// ===== ТИПЫ ИЗ ЕДИНОГО ИСТОЧНИКА =====
type SupportTicket = Database['mdt']['Tables']['support_tickets']['Row'];
type SupportTicketInsert = Database['mdt']['Tables']['support_tickets']['Insert'];
type SupportTicketUpdate = Database['mdt']['Tables']['support_tickets']['Update'];

// ===== ИНТЕРФЕЙСЫ ДЛЯ ВАЛИДАЦИИ =====
export interface TicketMessage {
  senderId: string;
  content: string;
  senderRole: string;
  timestamp?: Date;
}

export interface TicketReplyData {
  senderId: string;
  content: string;
  senderRole: string;
}

// ===== СОВРЕМЕННЫЙ SUPPORT TICKET SERVICE =====
export class SupportTicketService {
  
  // ===== ПОЛУЧЕНИЕ ТИКЕТА ПО ID =====
  async getTicketById(ticketId: string): Promise<SupportTicket | null> {
    try {
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId) // ✅ UUID как string
        .single();

      if (error || !ticket) {
        return null;
      }

      return ticket;
    } catch (error) {
      console.error('[SupportTicketService] Error getting ticket:', error);
      return null;
    }
  }

  // ===== ПОЛУЧЕНИЕ ТИКЕТОВ ПОЛЬЗОВАТЕЛЯ =====
  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    try {
      const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('author_user_id', userId) // ✅ UUID как string
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SupportTicketService] Error getting user tickets:', error);
        return [];
      }

      return tickets || [];
    } catch (error) {
      console.error('[SupportTicketService] Error getting user tickets:', error);
      return [];
    }
  }

  // ===== ПОЛУЧЕНИЕ ВСЕХ ТИКЕТОВ (ДЛЯ АДМИНОВ) =====
  async getAllTickets(): Promise<SupportTicket[]> {
    try {
      const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SupportTicketService] Error getting all tickets:', error);
        return [];
      }

      return tickets || [];
    } catch (error) {
      console.error('[SupportTicketService] Error getting all tickets:', error);
      return [];
    }
  }

  // ===== СОЗДАНИЕ НОВОГО ТИКЕТА =====
  async createTicket(userId: string, title: string): Promise<SupportTicket | null> {
    try {
      const ticketData: SupportTicketInsert = {
        author_user_id: userId, // ✅ UUID как string
        title,
        status: 'open',
        messages: []
      };

      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .insert(ticketData)
        .select()
        .single();

      if (error || !ticket) {
        console.error('[SupportTicketService] Error creating ticket:', error);
        return null;
      }

      return ticket;
    } catch (error) {
      console.error('[SupportTicketService] Error creating ticket:', error);
      return null;
    }
  }

  // ===== ОТВЕТ НА ТИКЕТ =====
  async replyToTicket(ticketId: string, replyData: TicketReplyData): Promise<SupportTicket | null> {
    try {
      // Получаем текущий тикет
      const currentTicket = await this.getTicketById(ticketId);
      if (!currentTicket) {
        return null;
      }

      // Создаем новое сообщение
      const newMessage: TicketMessage = {
        senderId: replyData.senderId,
        content: replyData.content,
        senderRole: replyData.senderRole,
        timestamp: new Date()
      };

      // Обновляем сообщения тикета
      const currentMessages = Array.isArray(currentTicket.messages) 
        ? currentTicket.messages 
        : [];

      const updatedMessages = [...currentMessages, newMessage];

      // Определяем новый статус
      const newStatus = currentTicket.status === 'closed' ? 'open' : currentTicket.status;

      // Обновляем тикет
      const updateData: SupportTicketUpdate = {
        status: newStatus,
        messages: updatedMessages,
        updated_at: new Date().toISOString()
      };

      const { data: updatedTicket, error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId) // ✅ UUID как string
        .select()
        .single();

      if (error || !updatedTicket) {
        console.error('[SupportTicketService] Error updating ticket:', error);
        return null;
      }

      return updatedTicket;
    } catch (error) {
      console.error('[SupportTicketService] Error replying to ticket:', error);
      return null;
    }
  }

  // ===== ОБНОВЛЕНИЕ СТАТУСА ТИКЕТА =====
  async updateTicketStatus(ticketId: string, status: string): Promise<SupportTicket | null> {
    try {
      const updateData: SupportTicketUpdate = {
        status,
        updated_at: new Date().toISOString()
      };

      const { data: updatedTicket, error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId) // ✅ UUID как string
        .select()
        .single();

      if (error || !updatedTicket) {
        console.error('[SupportTicketService] Error updating ticket status:', error);
        return null;
      }

      return updatedTicket;
    } catch (error) {
      console.error('[SupportTicketService] Error updating ticket status:', error);
      return null;
    }
  }

  // ===== НАЗНАЧЕНИЕ ОБРАБОТЧИКА ТИКЕТА =====
  async assignTicketHandler(ticketId: string, handlerId: string): Promise<SupportTicket | null> {
    try {
      const updateData: SupportTicketUpdate = {
        handler_user_id: handlerId, // ✅ UUID как string
        updated_at: new Date().toISOString()
      };

      const { data: updatedTicket, error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId) // ✅ UUID как string
        .select()
        .single();

      if (error || !updatedTicket) {
        console.error('[SupportTicketService] Error assigning ticket handler:', error);
        return null;
      }

      return updatedTicket;
    } catch (error) {
      console.error('[SupportTicketService] Error assigning ticket handler:', error);
      return null;
    }
  }

  // ===== ПОЛУЧЕНИЕ ТИКЕТОВ ПО СТАТУСУ =====
  async getTicketsByStatus(status: string): Promise<SupportTicket[]> {
    try {
      const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SupportTicketService] Error getting tickets by status:', error);
        return [];
      }

      return tickets || [];
    } catch (error) {
      console.error('[SupportTicketService] Error getting tickets by status:', error);
      return [];
    }
  }

  // ===== ПОЛУЧЕНИЕ ТИКЕТОВ ОБРАБОТЧИКА =====
  async getHandlerTickets(handlerId: string): Promise<SupportTicket[]> {
    try {
      const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('handler_user_id', handlerId) // ✅ UUID как string
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SupportTicketService] Error getting handler tickets:', error);
        return [];
      }

      return tickets || [];
    } catch (error) {
      console.error('[SupportTicketService] Error getting handler tickets:', error);
      return [];
    }
  }

  // ===== УДАЛЕНИЕ ТИКЕТА =====
  async deleteTicket(ticketId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', ticketId); // ✅ UUID как string

      if (error) {
        console.error('[SupportTicketService] Error deleting ticket:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[SupportTicketService] Error deleting ticket:', error);
      return false;
    }
  }

  // ===== ПОЛУЧЕНИЕ СТАТИСТИКИ ТИКЕТОВ =====
  async getTicketStats(): Promise<{
    total: number;
    open: number;
    closed: number;
    assigned: number;
  }> {
    try {
      const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('status, handler_user_id');

      if (error) {
        console.error('[SupportTicketService] Error getting ticket stats:', error);
        return { total: 0, open: 0, closed: 0, assigned: 0 };
      }

      const total = tickets?.length || 0;
      const open = tickets?.filter(t => t.status === 'open').length || 0;
      const closed = tickets?.filter(t => t.status === 'closed').length || 0;
      const assigned = tickets?.filter(t => t.handler_user_id).length || 0;

      return { total, open, closed, assigned };
    } catch (error) {
      console.error('[SupportTicketService] Error getting ticket stats:', error);
      return { total: 0, open: 0, closed: 0, assigned: 0 };
    }
  }
} 