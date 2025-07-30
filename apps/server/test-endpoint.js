/**
 * Простой тестовый endpoint без аутентификации
 */

import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3002; // Изменен порт

app.use(express.json());

// Тестовый endpoint без аутентификации
app.get('/test', (req, res) => {
  res.json({
    message: 'Сервер работает!',
    timestamp: new Date().toISOString(),
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL ? '✅' : '❌',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌',
      JWT_SECRET: process.env.JWT_SECRET ? '✅' : '❌'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 Тестовый сервер запущен на порту ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${port}/test`);
}); 