import 'dotenv/config';

import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import { BusinessLogic } from "./businessLogic";
import { Scheduler } from "./scheduler";
import { log, serveStatic } from "./production";
import { 
  loggingMiddleware, 
  errorLoggingMiddleware, 
  performanceMiddleware, 
  securityLoggingMiddleware 
} from "./middleware/logging.middleware.js";
import { logger } from "./services/LoggerService.js";

const app = express();

// Оптимизированные middleware для логирования и производительности
app.use(loggingMiddleware);
app.use(performanceMiddleware);
app.use(securityLoggingMiddleware);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

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

  app.use(errorLoggingMiddleware);
  
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Production static file serving
  console.log(`🌍 Environment: production`);
  console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`);
  console.log("📦 Setting up static file serving for production...");
  serveStatic(app);

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
    logger.info('Server started successfully', {
      host,
      port,
      environment: process.env.NODE_ENV,
      nodeVersion: process.version
    });
  });
})(); 