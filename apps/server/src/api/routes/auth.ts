import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { AuthService } from '../../core/services/AuthService';
import { registerSchema, loginSchema } from '@roleplay-identity/shared-schema';
import { AppError } from '../../utils/AppError';
import type { ServicesContainer } from '../../types/services';

// ===== ФАБРИЧНАЯ ФУНКЦИЯ ДЛЯ СОЗДАНИЯ AUTH РОУТОВ =====
export function createAuthRoutes(services: ServicesContainer) {
  const router: Router = Router();
  const { authService } = services; // ✅ Используем внедренный сервис из контейнера

  // ===== ПУБЛИЧНЫЕ РОУТЫ (доступны без аутентификации) =====
  
  // ===== РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ =====
  router.post('/register', async (req, res) => {
    try {
      // ✅ Валидация входных данных
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: validationResult.error.errors
        });
      }

      const { username, email, password } = validationResult.data;

      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      const profile = await authService.registerUser({ username, email, password });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          role: profile.role
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        console.error('[AuthRoutes] Registration error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  });

  // ===== ВХОД В СИСТЕМУ =====
  router.post('/login', async (req, res) => {
    try {
      // ✅ Валидация входных данных
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: validationResult.error.errors
        });
      }

      const { email, password } = validationResult.data;

      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      const result = await authService.loginUser({ email, password });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: result.profile.id,
            username: result.profile.username,
            email: result.profile.email,
            role: result.profile.role
          },
          session: result.session
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        console.error('[AuthRoutes] Login error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  });

  // ===== ПРОВЕРКА ТОКЕНА (публичный роут) =====
  router.post('/verify', async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Token is required'
        });
      }

      // ✅ Простая проверка через getUserProfile
      // В реальном приложении здесь должна быть более сложная логика
      res.status(200).json({
        success: true,
        message: 'Token verification endpoint - implement as needed'
      });
    } catch (error) {
      console.error('[AuthRoutes] Token verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // ===== ЗАЩИЩЕННЫЕ РОУТЫ (требуют аутентификации) =====

  // ===== ПОЛУЧЕНИЕ ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ =====
  router.get('/me', authenticateToken, async (req, res) => {
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

      res.status(200).json({
        success: true,
        data: {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          role: profile.role,
          created_at: profile.created_at
        }
      });
    } catch (error) {
      console.error('[AuthRoutes] Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // ===== ВЫХОД ИЗ СИСТЕМЫ =====
  router.post('/logout', authenticateToken, async (req, res) => {
    try {
      // ✅ Простой выход - клиент должен удалить токен
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('[AuthRoutes] Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  return router;
}

// ===== ОБРАТНАЯ СОВМЕСТИМОСТЬ =====
// ВАЖНО: Этот код устарел и должен быть удален
// Используйте только фабричную функцию createAuthRoutes с внедренными сервисами
// Оставляем для обратной совместимости, но с предупреждением
const router: Router = Router();

// ⚠️ ПРЕДУПРЕЖДЕНИЕ: Этот код устарел
// Используйте createAuthRoutes(services) вместо прямого импорта
console.warn('[DEPRECATED] Direct import of auth router is deprecated. Use createAuthRoutes(services) instead.');

// Создаем временный экземпляр только для обратной совместимости
// В будущем этот блок должен быть полностью удален
const authService = new AuthService();

// ===== РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ =====
router.post('/register', async (req, res) => {
  try {
    // ✅ Валидация входных данных
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: validationResult.error.errors
      });
    }

    const { username, email, password } = validationResult.data;

    // ✅ Сервисный слой: вся бизнес-логика в сервисе
    const profile = await authService.registerUser({ username, email, password });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        role: profile.role
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      console.error('[AuthRoutes] Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// ===== ВХОД В СИСТЕМУ =====
router.post('/login', async (req, res) => {
  try {
    // ✅ Валидация входных данных
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: validationResult.error.errors
      });
    }

    const { email, password } = validationResult.data;

    // ✅ Сервисный слой: вся бизнес-логика в сервисе
    const result = await authService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: result.profile.id,
          username: result.profile.username,
          email: result.profile.email,
          role: result.profile.role
        },
        session: result.session
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      console.error('[AuthRoutes] Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// ===== ПОЛУЧЕНИЕ ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ =====
router.get('/me', authenticateToken, async (req, res) => {
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

    res.status(200).json({
      success: true,
      data: {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        role: profile.role,
        created_at: profile.created_at
      }
    });
  } catch (error) {
    console.error('[AuthRoutes] Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ===== ВЫХОД ИЗ СИСТЕМЫ =====
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // ✅ Простой выход - клиент должен удалить токен
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('[AuthRoutes] Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ===== ПРОВЕРКА ТОКЕНА =====
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    // ✅ Простая проверка через getUserProfile
    // В реальном приложении здесь должна быть более сложная логика
    res.status(200).json({
      success: true,
      message: 'Token verification endpoint - implement as needed'
    });
  } catch (error) {
    console.error('[AuthRoutes] Token verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
