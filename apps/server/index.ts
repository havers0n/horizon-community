import 'dotenv/config'; // Убедись, что эта строка есть и она первая

import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import { BusinessLogic } from "./businessLogic";
import { Scheduler } from "./scheduler";
import { log, serveStatic } from "./production";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

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
  const server = await registerRoutes(app);

  // Инициализация планировщика
  const businessLogic = new BusinessLogic(storage);
  const scheduler = new Scheduler(businessLogic, storage, {
    resetLimitsCron: "0 0 1 * *", // 1 число каждого месяца в 00:00
    leaveProcessingCron: "0 9 * * *", // каждый день в 9:00
    timezone: "Europe/Moscow"
  });

  // Запуск планировщика
  scheduler.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down gracefully...');
    scheduler.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('🛑 Shutting down gracefully...');
    scheduler.stop();
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
