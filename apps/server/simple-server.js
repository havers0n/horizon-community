/**
 * Простой сервер для тестирования без аутентификации
 */

import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 5000;

app.use(express.json());

// Простой тестовый endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Сервер работает без аутентификации!',
    timestamp: new Date().toISOString(),
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL ? '✅' : '❌',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌',
      JWT_SECRET: process.env.JWT_SECRET ? '✅' : '❌'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Сервер работает без аутентификации'
  });
});

app.listen(port, () => {
  console.log(`🚀 Простой сервер запущен на порту ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${port}/api/test`);
}); 