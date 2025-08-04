import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../routes';
import { storage } from '../../storage';
import { Server } from 'http';
import WebSocket from 'ws';

// Мокаем storage для тестов
jest.mock('../../storage', () => ({
  storage: {
    getUserByAuthId: jest.fn(),
    getCharactersByOwner: jest.fn(),
  }
}));

// Мокаем Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
  })),
}));

describe('WebSocket API Tests', () => {
  let app: express.Application;
  let server: Server;
  let wsServer: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
    
    // Создаем WebSocket сервер
    wsServer = new WebSocket.Server({ server });
  });

  afterAll(() => {
    wsServer?.close();
    server?.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('WebSocket Connection', () => {
    it('should establish WebSocket connection', (done) => {
      const ws = new WebSocket(`ws://localhost:${server.address()?.port}`);

      ws.on('open', () => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should handle connection with authentication', (done) => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'candidate',
        status: 'active'
      };

      (storage.getUserByAuthId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getCharactersByOwner as jest.Mock).mockResolvedValue([]);

      const ws = new WebSocket(`ws://localhost:${server.address()?.port}`, {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      ws.on('open', () => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should reject connection with invalid token', (done) => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });

      const ws = new WebSocket(`ws://localhost:${server.address()?.port}`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });

      ws.on('error', (error) => {
        expect(error.message).toContain('Authentication failed');
        done();
      });

      ws.on('open', () => {
        ws.close();
        done(new Error('Connection should have been rejected'));
      });
    });
  });

  describe('WebSocket Message Handling', () => {
    it('should handle ping message', (done) => {
      const ws = new WebSocket(`ws://localhost:${server.address()?.port}`);

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'ping' }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        expect(message.type).toBe('pong');
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should handle subscribe to channels', (done) => {
      const ws = new WebSocket(`ws://localhost:${server.address()?.port}`);

      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'subscribe',
          channels: ['notifications', 'applications']
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        expect(message.type).toBe('subscribed');
        expect(message.channels).toEqual(['notifications', 'applications']);
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should handle unsubscribe from channels', (done) => {
      const ws = new WebSocket(`ws://localhost:${server.address()?.port}`);

      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'unsubscribe',
          channels: ['notifications']
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        expect(message.type).toBe('unsubscribed');
        expect(message.channels).toEqual(['notifications']);
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should handle invalid message format', (done) => {
      const ws = new WebSocket(`ws://localhost:${server.address()?.port}`);

      ws.on('open', () => {
        ws.send('invalid json');
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        expect(message.type).toBe('error');
        expect(message.message).toBe('Invalid message format');
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should handle unknown message type', (done) => {
      const ws = new WebSocket(`ws://localhost:${server.address()?.port}`);

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'unknown' }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        expect(message.type).toBe('error');
        expect(message.message).toBe('Unknown message type');
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });
  });

  describe('WebSocket Broadcasting', () => {
    it('should broadcast messages to subscribed clients', (done) => {
      const ws1 = new WebSocket(`ws://localhost:${server.address()?.port}`);
      const ws2 = new WebSocket(`ws://localhost:${server.address()?.port}`);

      let ws1Subscribed = false;
      let ws2Subscribed = false;

      ws1.on('open', () => {
        ws1.send(JSON.stringify({
          type: 'subscribe',
          channels: ['notifications']
        }));
      });

      ws2.on('open', () => {
        ws2.send(JSON.stringify({
          type: 'subscribe',
          channels: ['notifications']
        }));
      });

      ws1.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'subscribed') {
          ws1Subscribed = true;
        } else if (message.type === 'notification') {
          expect(message.data).toEqual({ message: 'Test notification' });
          if (ws1Subscribed && ws2Subscribed) {
            ws1.close();
            ws2.close();
            done();
          }
        }
      });

      ws2.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'subscribed') {
          ws2Subscribed = true;
          // Отправляем тестовое уведомление
          wsServer.clients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'notification',
                data: { message: 'Test notification' }
              }));
            }
          });
        }
      });

      ws1.on('error', (error) => done(error));
      ws2.on('error', (error) => done(error));
    });

    it('should not broadcast to unsubscribed clients', (done) => {
      const ws1 = new WebSocket(`ws://localhost:${server.address()?.port}`);
      const ws2 = new WebSocket(`ws://localhost:${server.address()?.port}`);

      let ws1Subscribed = false;
      let ws2ReceivedMessage = false;

      ws1.on('open', () => {
        ws1.send(JSON.stringify({
          type: 'subscribe',
          channels: ['notifications']
        }));
      });

      ws2.on('open', () => {
        // ws2 не подписывается на канал
      });

      ws1.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'subscribed') {
          ws1Subscribed = true;
          // Отправляем тестовое уведомление
          wsServer.clients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'notification',
                data: { message: 'Test notification' }
              }));
            }
          });
        } else if (message.type === 'notification') {
          expect(message.data).toEqual({ message: 'Test notification' });
          setTimeout(() => {
            expect(ws2ReceivedMessage).toBe(false);
            ws1.close();
            ws2.close();
            done();
          }, 100);
        }
      });

      ws2.on('message', () => {
        ws2ReceivedMessage = true;
      });

      ws1.on('error', (error) => done(error));
      ws2.on('error', (error) => done(error));
    });
  });

  describe('WebSocket Error Handling', () => {
    it('should handle client disconnection gracefully', (done) => {
      const ws = new WebSocket(`ws://localhost:${server.address()?.port}`);

      ws.on('open', () => {
        ws.close();
      });

      ws.on('close', () => {
        // Проверяем что сервер не упал
        expect(wsServer.clients.size).toBe(0);
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should handle server shutdown gracefully', (done) => {
      const ws = new WebSocket(`ws://localhost:${server.address()?.port}`);

      ws.on('open', () => {
        wsServer.close();
      });

      ws.on('close', () => {
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should handle malformed messages', (done) => {
      const ws = new WebSocket(`ws://localhost:${server.address()?.port}`);

      ws.on('open', () => {
        ws.send(Buffer.from([0x00, 0x01, 0x02])); // Бинарные данные
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        expect(message.type).toBe('error');
        expect(message.message).toBe('Invalid message format');
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });
  });

  describe('WebSocket Performance', () => {
    it('should handle multiple concurrent connections', (done) => {
      const connections: WebSocket[] = [];
      const maxConnections = 10;
      let connectedCount = 0;

      for (let i = 0; i < maxConnections; i++) {
        const ws = new WebSocket(`ws://localhost:${server.address()?.port}`);
        connections.push(ws);

        ws.on('open', () => {
          connectedCount++;
          if (connectedCount === maxConnections) {
            expect(wsServer.clients.size).toBe(maxConnections);
            
            // Закрываем все соединения
            connections.forEach(conn => conn.close());
            done();
          }
        });

        ws.on('error', (error) => {
          done(error);
        });
      }
    });

    it('should handle rapid message sending', (done) => {
      const ws = new WebSocket(`ws://localhost:${server.address()?.port}`);
      const messages = Array(100).fill(null).map((_, i) => ({ type: 'ping', id: i }));
      let receivedCount = 0;

      ws.on('open', () => {
        // Отправляем много сообщений быстро
        messages.forEach(msg => {
          ws.send(JSON.stringify(msg));
        });
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'pong') {
          receivedCount++;
          if (receivedCount === messages.length) {
            ws.close();
            done();
          }
        }
      });

      ws.on('error', (error) => {
        done(error);
      });
    });
  });

  describe('WebSocket Authentication', () => {
    it('should authenticate users with valid tokens', (done) => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'candidate',
        status: 'active'
      };

      (storage.getUserByAuthId as jest.Mock).mockResolvedValue(mockUser);
      (storage.getCharactersByOwner as jest.Mock).mockResolvedValue([]);

      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'auth-123' } },
        error: null
      });

      const ws = new WebSocket(`ws://localhost:${server.address()?.port}`, {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      ws.on('open', () => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should reject connections with expired tokens', (done) => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Token expired' }
      });

      const ws = new WebSocket(`ws://localhost:${server.address()?.port}`, {
        headers: {
          'Authorization': 'Bearer expired-token'
        }
      });

      ws.on('error', (error) => {
        expect(error.message).toContain('Authentication failed');
        done();
      });

      ws.on('open', () => {
        ws.close();
        done(new Error('Connection should have been rejected'));
      });
    });
  });
}); 