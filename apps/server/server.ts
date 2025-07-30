import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загрузка переменных окружения
config({ path: resolve(__dirname, '.env') });

// Импорт маршрутов
import databaseRoutes from './routes/database.js';
import mdtRoutes from './routes/mdt.js';
import authRoutes from './routes/auth.js';
import cadRoutes from './routes/cad.js';
import forumRoutes from './routes/forum.js';
import discordRoutes from './routes/discord.js';
import testsRoutes from './routes/tests.js';
import reportTemplatesRoutes from './routes/reportTemplates.js';
import filledReportsRoutes from './routes/filledReports.js';
import realtimeRoutes from './routes/realtime.js';
import adminRoutes from './routes/admin/index.js';

// Импорт middleware
import { 
  logRequest, 
  errorHandler, 
  corsMiddleware 
} from './middleware/auth.middleware.js';
import { initializeCADWebSocket } from './websocket.js';

const app = express();
const PORT = process.env.PORT || 5002;

// ===== MIDDLEWARE =====

// Безопасность
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(corsMiddleware);

// Сжатие
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Логирование запросов
app.use(logRequest);

// ===== МАРШРУТЫ =====

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    message: 'CAD/MDT Server is running!'
  });
});

// API маршруты
app.use('/api/database', databaseRoutes);
app.use('/api/mdt', mdtRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cad', cadRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/discord', discordRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/report-templates', reportTemplatesRoutes);
app.use('/api/filled-reports', filledReportsRoutes);
app.use('/api/realtime', realtimeRoutes);
app.use('/api/admin', adminRoutes);

// ===== ОБРАБОТКА ОШИБОК =====

// 404 - маршрут не найден
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl
  });
});

// Обработка ошибок
app.use(errorHandler);

// ===== ЗАПУСК СЕРВЕРА =====

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log('🚀 CAD/MDT Server started successfully!');
  console.log(`📍 Server running on http://127.0.0.1:${PORT}`);
  console.log(`📊 Health check: http://127.0.0.1:${PORT}/api/health`);
  console.log(`🔗 Database API: http://127.0.0.1:${PORT}/api/database`);
  console.log(`🎮 MDT API: http://127.0.0.1:${PORT}/api/mdt`);
  console.log(`🔐 Auth API: http://127.0.0.1:${PORT}/api/auth`);
  console.log(`🎯 CAD API: http://127.0.0.1:${PORT}/api/cad`);
  console.log(`💬 Forum API: http://127.0.0.1:${PORT}/api/forum`);
  console.log(`🎭 Tests API: http://127.0.0.1:${PORT}/api/tests`);
  console.log(`📋 Reports API: http://127.0.0.1:${PORT}/api/report-templates`);
  console.log(`⚡ Realtime API: http://127.0.0.1:${PORT}/api/realtime`);
  console.log(`👑 Admin API: http://127.0.0.1:${PORT}/api/admin`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Инициализация WebSocket сервера
const cadWebSocketServer = initializeCADWebSocket(server);
console.log('🔌 CAD WebSocket Server initialized');

// ===== GRACEFUL SHUTDOWN =====

process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Starting graceful shutdown...');
  if (cadWebSocketServer) {
    cadWebSocketServer.stop();
    console.log('🔌 WebSocket server stopped');
  }
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Starting graceful shutdown...');
  if (cadWebSocketServer) {
    cadWebSocketServer.stop();
    console.log('🔌 WebSocket server stopped');
  }
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

// Обработка необработанных ошибок
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app; 