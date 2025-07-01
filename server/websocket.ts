import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { verifyToken } from './auth';
import { IStorage } from './storage';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  userRole?: string;
}

interface ChatMessage {
  id: string;
  ticketId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
}

interface OnlineUser {
  userId: number;
  username: string;
  role: string;
  lastSeen: Date;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private storage: IStorage;
  private clients: Map<number, AuthenticatedWebSocket> = new Map();
  private onlineUsers: Map<number, OnlineUser> = new Map();
  private chatHistory: Map<number, ChatMessage[]> = new Map(); // ticketId -> messages

  constructor(server: Server, storage: IStorage) {
    this.storage = storage;
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });

    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', (ws: AuthenticatedWebSocket, request) => {
      console.log('WebSocket connection attempt');
      
      // Extract token from query params or headers
      const url = new URL(request.url!, `http://${request.headers.host}`);
      const token = url.searchParams.get('token') || request.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }

      // Verify JWT token
      this.authenticateConnection(ws, token);
    });

    // Cleanup inactive connections every 30 seconds
    setInterval(() => this.cleanupInactiveConnections(), 30000);
  }

  private async authenticateConnection(ws: AuthenticatedWebSocket, token: string) {
    try {
      // In real implementation, verify JWT token
      // const decoded = verifyToken(token);
      // const user = await this.storage.getUser(decoded.userId);
      
      // Mock authentication for demonstration
      const mockUserId = 1; // Would come from JWT
      const user = await this.storage.getUser(mockUserId);
      
      if (!user) {
        ws.close(1008, 'Invalid user');
        return;
      }

      ws.userId = user.id;
      ws.userRole = user.role;
      
      this.clients.set(user.id, ws);
      this.onlineUsers.set(user.id, {
        userId: user.id,
        username: user.username,
        role: user.role,
        lastSeen: new Date()
      });

      console.log(`User ${user.username} connected via WebSocket`);

      // Send connection success
      this.sendToUser(user.id, {
        type: 'connection',
        data: { status: 'connected', userId: user.id }
      });

      // Broadcast online users update
      this.broadcastOnlineUsers();

      // Setup message handlers
      this.setupMessageHandlers(ws);

    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      ws.close(1008, 'Authentication failed');
    }
  }

  private setupMessageHandlers(ws: AuthenticatedWebSocket) {
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await this.handleMessage(ws, message);
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        this.sendToUser(ws.userId!, {
          type: 'error',
          data: { message: 'Invalid message format' }
        });
      }
    });

    ws.on('close', () => {
      if (ws.userId) {
        console.log(`User ${ws.userId} disconnected`);
        this.clients.delete(ws.userId);
        this.onlineUsers.delete(ws.userId);
        this.broadcastOnlineUsers();
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Heartbeat to detect broken connections
    ws.on('pong', () => {
      if (ws.userId) {
        const onlineUser = this.onlineUsers.get(ws.userId);
        if (onlineUser) {
          onlineUser.lastSeen = new Date();
        }
      }
    });
  }

  private async handleMessage(ws: AuthenticatedWebSocket, message: any) {
    const { type, data } = message;

    switch (type) {
      case 'chat_message':
        await this.handleChatMessage(ws, data);
        break;
      
      case 'join_ticket':
        await this.handleJoinTicket(ws, data);
        break;
      
      case 'leave_ticket':
        await this.handleLeaveTicket(ws, data);
        break;
      
      case 'typing':
        await this.handleTyping(ws, data);
        break;
      
      case 'heartbeat':
        this.sendToUser(ws.userId!, { type: 'heartbeat', data: { timestamp: new Date() } });
        break;
      
      default:
        console.log('Unknown message type:', type);
    }
  }

  private async handleChatMessage(ws: AuthenticatedWebSocket, data: any) {
    const { ticketId, message, type = 'text', fileUrl, fileName } = data;
    
    if (!ws.userId || !ticketId || !message) {
      return;
    }

    // Verify user has access to this ticket
    const ticket = await this.storage.getSupportTicket(ticketId);
    if (!ticket) {
      this.sendToUser(ws.userId, {
        type: 'error',
        data: { message: 'Ticket not found' }
      });
      return;
    }

    // Check if user is ticket author or has admin/supervisor role
    const canAccess = ticket.authorId === ws.userId || 
                     ['admin', 'supervisor'].includes(ws.userRole!);
    
    if (!canAccess) {
      this.sendToUser(ws.userId, {
        type: 'error',
        data: { message: 'Access denied' }
      });
      return;
    }

    const user = await this.storage.getUser(ws.userId);
    if (!user) return;

    // Create chat message
    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ticketId,
      senderId: user.id,
      senderName: user.username,
      senderRole: user.role,
      message,
      timestamp: new Date(),
      type,
      fileUrl,
      fileName
    };

    // Store message in memory (in real implementation, store in database)
    if (!this.chatHistory.has(ticketId)) {
      this.chatHistory.set(ticketId, []);
    }
    this.chatHistory.get(ticketId)!.push(chatMessage);

    // Update ticket messages in storage
    const existingMessages = ticket.messages as ChatMessage[] || [];
    const updatedMessages = [...existingMessages, chatMessage];
    
    await this.storage.updateSupportTicket(ticketId, {
      messages: updatedMessages as any
    });

    // Broadcast message to all users with access to this ticket
    this.broadcastToTicket(ticketId, {
      type: 'chat_message',
      data: chatMessage
    });

    // Create notification for other participants
    if (ticket.handlerId && ticket.handlerId !== user.id) {
      await this.storage.createNotification({
        recipientId: ticket.handlerId,
        content: `New message in support ticket #${ticketId}`,
        link: `/support/tickets/${ticketId}`,
        isRead: false
      });
    }

    if (ticket.authorId !== user.id) {
      await this.storage.createNotification({
        recipientId: ticket.authorId,
        content: `New message in your support ticket #${ticketId}`,
        link: `/support/tickets/${ticketId}`,
        isRead: false
      });
    }
  }

  private async handleJoinTicket(ws: AuthenticatedWebSocket, data: any) {
    const { ticketId } = data;
    
    if (!ws.userId || !ticketId) return;

    // Verify access and send chat history
    const ticket = await this.storage.getSupportTicket(ticketId);
    if (!ticket) return;

    const canAccess = ticket.authorId === ws.userId || 
                     ['admin', 'supervisor'].includes(ws.userRole!);
    
    if (!canAccess) return;

    // Send chat history
    const messages = this.chatHistory.get(ticketId) || [];
    this.sendToUser(ws.userId, {
      type: 'chat_history',
      data: { ticketId, messages }
    });

    // Notify others that user joined
    this.broadcastToTicket(ticketId, {
      type: 'user_joined',
      data: { userId: ws.userId, ticketId }
    }, ws.userId);
  }

  private async handleLeaveTicket(ws: AuthenticatedWebSocket, data: any) {
    const { ticketId } = data;
    
    if (!ws.userId || !ticketId) return;

    // Notify others that user left
    this.broadcastToTicket(ticketId, {
      type: 'user_left',
      data: { userId: ws.userId, ticketId }
    }, ws.userId);
  }

  private async handleTyping(ws: AuthenticatedWebSocket, data: any) {
    const { ticketId, isTyping } = data;
    
    if (!ws.userId || !ticketId) return;

    // Broadcast typing indicator to other users in ticket
    this.broadcastToTicket(ticketId, {
      type: 'typing',
      data: { userId: ws.userId, ticketId, isTyping }
    }, ws.userId);
  }

  private async broadcastToTicket(ticketId: number, message: any, excludeUserId?: number) {
    const ticket = await this.storage.getSupportTicket(ticketId);
    if (!ticket) return;

    // Send to ticket author
    if (ticket.authorId !== excludeUserId) {
      this.sendToUser(ticket.authorId, message);
    }

    // Send to handler
    if (ticket.handlerId && ticket.handlerId !== excludeUserId) {
      this.sendToUser(ticket.handlerId, message);
    }

    // Send to all supervisors/admins
    const users = await this.storage.getAllUsers();
    users
      .filter(user => 
        ['admin', 'supervisor'].includes(user.role) && 
        user.id !== excludeUserId &&
        user.id !== ticket.authorId &&
        user.id !== ticket.handlerId
      )
      .forEach(user => this.sendToUser(user.id, message));
  }

  private sendToUser(userId: number, message: any) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  private broadcastOnlineUsers() {
    const onlineUsersList = Array.from(this.onlineUsers.values());
    const message = {
      type: 'online_users',
      data: { users: onlineUsersList }
    };

    this.clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  private cleanupInactiveConnections() {
    const now = new Date();
    const timeout = 5 * 60 * 1000; // 5 minutes

    // Ping all connections to check if they're alive
    this.clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.ping();
        
        // Check if user has been inactive too long
        const onlineUser = this.onlineUsers.get(userId);
        if (onlineUser && (now.getTime() - onlineUser.lastSeen.getTime()) > timeout) {
          console.log(`Cleaning up inactive connection for user ${userId}`);
          client.terminate();
          this.clients.delete(userId);
          this.onlineUsers.delete(userId);
        }
      } else {
        // Remove dead connections
        this.clients.delete(userId);
        this.onlineUsers.delete(userId);
      }
    });

    this.broadcastOnlineUsers();
  }

  /**
   * Get online users count
   */
  getOnlineUsersCount(): number {
    return this.onlineUsers.size;
  }

  /**
   * Get chat history for a ticket
   */
  getChatHistory(ticketId: number): ChatMessage[] {
    return this.chatHistory.get(ticketId) || [];
  }

  /**
   * Send system message to ticket
   */
  async sendSystemMessage(ticketId: number, message: string) {
    const systemMessage: ChatMessage = {
      id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ticketId,
      senderId: 0, // System user
      senderName: 'System',
      senderRole: 'system',
      message,
      timestamp: new Date(),
      type: 'system'
    };

    if (!this.chatHistory.has(ticketId)) {
      this.chatHistory.set(ticketId, []);
    }
    this.chatHistory.get(ticketId)!.push(systemMessage);

    this.broadcastToTicket(ticketId, {
      type: 'chat_message',
      data: systemMessage
    });
  }
}

// Export singleton instance (would be initialized in main server file)
export let wsManager: WebSocketManager;

export function initializeWebSocket(server: Server, storage: IStorage) {
  wsManager = new WebSocketManager(server, storage);
  return wsManager;
}