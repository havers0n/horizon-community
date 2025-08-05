import { Router, Express } from 'express';
import { Server } from 'socket.io';
import { createServer, Server as HttpServer } from 'http';
import type { IncomingMessage, ServerResponse } from 'http';
import type { ServicesContainer } from '../../types/services';

// Импортируем фабричную функцию для v1 роутера
import { createV1Router } from './v1';

const mainRouter = Router();

// Health check для корневого API
mainRouter.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

export async function registerRoutes(app: Express, services: ServicesContainer): Promise<HttpServer> {
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Создаем v1 роутер с внедренными сервисами
  const v1Router = createV1Router(services);
  
  // Регистрируем все v1 маршруты
  mainRouter.use('/v1', v1Router);

  // Регистрируем наш новый API роутер
  app.use('/api', mainRouter);

  // Обработка 404 для всех остальных запросов к API (ПЕРЕМЕЩЕНО В КОНЕЦ)
  app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
  });

  return server;
}
