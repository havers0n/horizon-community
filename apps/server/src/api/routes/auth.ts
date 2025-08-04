import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AuthService } from '../services/AuthService';
import { loginSchema, registerSchema } from '../types';

const router = Router();

// Инициализация сервиса
const authService = new AuthService();

// ===== РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ =====
router.post('/register', async (req, res) => {
  try {
    // ✅ Валидация входных данных
    const validatedData = registerSchema.parse(req.body);
    
    // ✅ Сервисный слой: вся бизнес-логика в сервисе
    const result = await authService.registerUser(validatedData);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
    res.status(201).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('[AuthRoutes] Registration error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid request data'
    });
  }
});

// ===== АВТОРИЗАЦИЯ ПОЛЬЗОВАТЕЛЯ =====
router.post('/login', async (req, res) => {
  try {
    // ✅ Валидация входных данных
    const validatedData = loginSchema.parse(req.body);
    
    // ✅ Сервисный слой: вся бизнес-логика в сервисе
    const result = await authService.loginUser(validatedData);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error
      });
    }
    
    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('[AuthRoutes] Login error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid request data'
    });
  }
});

// ===== ПОЛУЧЕНИЕ ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ =====
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId: string = req.user!.id; // ✅ UUID как string
    
    // ✅ Сервисный слой: вся бизнес-логика в сервисе
    const profile = await authService.getUserProfile(userId);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }
    
    res.json({
      success: true,
      data: { user: profile }
    });
  } catch (error) {
    console.error('[AuthRoutes] Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
});

// ===== ВЫХОД ИЗ СИСТЕМЫ =====
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // ✅ Сервисный слой: вся бизнес-логика в сервисе
    const result = await authService.logoutUser();
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('[AuthRoutes] Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

// ===== ВАЛИДАЦИЯ ТОКЕНА =====
router.post('/validate', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }
    
    // ✅ Сервисный слой: вся бизнес-логика в сервисе
    const profile = await authService.validateToken(token);
    
    if (!profile) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    
    res.json({
      success: true,
      data: { user: profile }
    });
  } catch (error) {
    console.error('[AuthRoutes] Token validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Token validation failed'
    });
  }
});

export default router;
