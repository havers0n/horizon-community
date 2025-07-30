import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { Request, Response } from 'express';

const router = Router();

// Простой тестовый endpoint без аутентификации
router.get('/test', (req, res) => {
  res.json({
    message: 'Сервер работает!',
    timestamp: new Date().toISOString(),
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL ? '✅' : '❌',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌'
    }
  });
});

// Health check без аутентификации
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Сервер работает без аутентификации'
  });
});

// Тестовый endpoint с аутентификацией
router.get('/auth-test', authenticateToken, (req: any, res) => {
  res.json({
    message: 'Аутентификация успешна!',
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    },
    timestamp: new Date().toISOString()
  });
});

// Тестовый endpoint без аутентификации для получения токена
router.get('/get-token', async (req: Request, res: Response) => {
  try {
    // Создаем тестовый токен для демонстрации
    const testToken = {
      access_token: 'test_token_' + Date.now(),
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'test'
      }
    };
    
    res.json({
      success: true,
      message: 'Тестовый токен создан',
      token: testToken.access_token,
      user: testToken.user,
      usage: 'Authorization: Bearer ' + testToken.access_token
    });
  } catch (error) {
    console.error('Error creating test token:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create test token' 
    });
  }
});

export default router; 