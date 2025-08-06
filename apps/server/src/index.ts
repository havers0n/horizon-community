import 'dotenv/config'; // Убедись, что эта строка есть и она первая

import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./api/routes";
import { log, serveStatic } from "./production";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

// Импортируем типы для DI
import type { ServicesContainer } from './types/services';

// --- СОЗДАЕМ ВСЕ СЕРВИСЫ В ОДНОМ МЕСТЕ ---
import { AuthService } from './core/services/AuthService';
import { CharacterService } from './core/services/CharacterService';
import { ApplicationService } from './core/services/ApplicationService';
import { SupportTicketService } from './core/services/SupportTicketService';
import { Call911Service } from './core/services/Call911Service';
import { ReportService } from './core/services/ReportService';
import { ReportTemplateService } from './core/services/ReportTemplateService';
import { MDTService } from './core/services/MDTService';
import { RealTimeService } from './core/services/RealTimeService';
import { TestService } from './core/services/TestService';
import { PublicService } from './core/services/PublicService';
import { LoggerService } from './core/services/LoggerService';
import { CacheService } from './core/services/CacheService';
import { FilledReportService } from './core/services/FilledReportService';
import { CabinetService } from './core/services/CabinetService';
import { supabase } from './core/lib/supabase';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: import('express').Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - стандартная реализация с помощью библиотеки cors
app.use(cors({
  origin: "*", // Разрешаем запросы от всех источников (включая FiveM)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization", "X-CAD-Token"],
  credentials: true, // Специальные заголовки для FiveM
  maxAge: 86400 // Access-Control-Max-Age: 86400
}));

(async () => {
  // ===== ЭТАП 1: СОЗДАНИЕ КОНТЕЙНЕРА СЕРВИСОВ =====
  
  // Создаем экземпляры всех сервисов
  const authService = new AuthService();
  const characterService = new CharacterService();
  const applicationService = new ApplicationService();
  const supportTicketService = new SupportTicketService();
  const call911Service = new Call911Service();
  const reportService = new ReportService();
  const reportTemplateService = new ReportTemplateService();
  const mdtService = new MDTService();
  const realTimeService = new RealTimeService();
  const testService = new TestService();
  const publicService = new PublicService();
  const logger = new LoggerService();
  const cacheService = new CacheService();

  // Создаем FilledReportService с зависимостями
  const filledReportService = new FilledReportService(
    reportService,
    reportTemplateService
  );

  // Создаем CabinetService с зависимостями
  const cabinetService = new CabinetService(
    supabase, // Передаем клиент Supabase
    applicationService,
    reportService
  );

  // Собираем их в контейнер
  const services: ServicesContainer = {
    authService,
    characterService,
    applicationService,
    supportTicketService,
    call911Service,
    reportService,
    reportTemplateService,
    mdtService,
    realTimeService,
    testService,
    publicService,
    loggerService: logger,
    cacheService,
    filledReportService,
    cabinetService,
  };

  // Передаем контейнер сервисов в registerRoutes
  const server = await registerRoutes(app, services);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down gracefully...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('🛑 Shutting down gracefully...');
    process.exit(0);
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  console.log(`🌍 Environment: ${app.get("env")}`);
  console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`);
  
  if (process.env.NODE_ENV === "development" || app.get("env") === "development") {
    console.log("🚀 Setting up Vite for development...");
    const { setupVite } = await import("./development");
    await setupVite(app, server);
  } else {
    console.log("📦 Setting up static file serving for production...");
    serveStatic(app);
  }

  // Catch-all route для SPA - должен быть ПОСЛЕ всех API роутов
  app.get('*', (req, res, next) => {
    // Пропускаем API запросы
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Для development
    if (process.env.NODE_ENV === "development" || app.get("env") === "development") {
      const clientTemplate = path.resolve(__dirname, "..", "client", "dist", "index.html");
      if (fs.existsSync(clientTemplate)) {
        return res.sendFile(clientTemplate);
      }
    }
    
    // Для production
    const publicPath = path.resolve(__dirname, "..", "..", "dist", "apps", "client");
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    
    // Если файл не найден
    res.status(404).json({ error: "Client not built or not found" });
  });

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || 5000;
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
  
  server.listen({
    port,
    host,
  }, () => {
    log(`serving on ${host}:${port}`);
  });
})();

export { app };
