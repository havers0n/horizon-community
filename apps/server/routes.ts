import { Router, Express } from 'express';
import { Server } from 'socket.io';
import { createServer, Server as HttpServer } from 'http';
import type { IncomingMessage, ServerResponse } from 'http';
import v1Router from './routes/v1'; // Импортируем наш новый v1 роутер

const mainRouter = Router();

// Регистрируем все v1 маршруты
mainRouter.use('/v1', v1Router);

// Health check для корневого API
mainRouter.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Обработка 404 для всех остальных запросов к API
mainRouter.use('*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

export async function registerRoutes(app: Express): Promise<HttpServer> {
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Регистрируем наш новый API роутер
  app.use('/api', mainRouter);

  return server;
}
