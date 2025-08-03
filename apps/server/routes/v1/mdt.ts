import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireAnyRole, requireRole } from '../../middleware/auth.middleware';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { MDTService } from '../../services/MDTService';
import type { 
  CreateBoloData, 
  CreateSignalData, 
  CreateNotificationData,
  CreateApplicationData,
  CreateLawReportData,
  CreateEmsFdReportData
} from '../../services/MDTService';

const router = Router();

// Инициализация сервиса
const mdtService = new MDTService();

// ===== ZOD СХЕМЫ ВАЛИДАЦИИ =====

const IdParamSchema = z.object({
  id: z.string().uuid('Неверный формат ID'),
});

const BoloCreateSchema = z.object({
  type: z.string().min(1, 'Тип BOLO обязателен'),
  reason: z.string().min(1, 'Причина обязательна'),
  subjectName: z.string().optional(),
  subjectDescription: z.string().optional(),
  vehicleDescription: z.string().optional(),
  vehiclePlate: z.string().optional(),
  location: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'emergency']).optional(),
  authorCharacterId: z.string().uuid('Неверный формат ID персонажа'),
  status: z.enum(['active', 'resolved', 'expired']).optional(),
});

const BoloUpdateSchema = BoloCreateSchema.partial();

const SignalCreateSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен'),
  description: z.string().optional(),
  type: z.string().optional(),
  authorCharacterId: z.string().uuid('Неверный формат ID персонажа').optional(),
  priority: z.enum(['low', 'medium', 'high', 'emergency']).optional(),
  location: z.string().optional(),
  coordinates: z.any().optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().optional(),
});

const SignalUpdateSchema = SignalCreateSchema.partial();

const NotificationCreateSchema = z.object({
  content: z.string().min(1, 'Содержание обязательно'),
  recipientUserId: z.string().uuid('Неверный формат ID пользователя'),
  isRead: z.boolean().optional(),
  link: z.string().optional(),
});

const ApplicationCreateSchema = z.object({
  type: z.string().min(1, 'Тип заявки обязателен'),
  authorUserId: z.string().uuid('Неверный формат ID пользователя'),
  authorCharacterId: z.string().uuid('Неверный формат ID персонажа'),
  data: z.any().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  statusHistory: z.array(z.any()).optional(),
});

const ApplicationUpdateSchema = ApplicationCreateSchema.partial();

const LawReportCreateSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен'),
  description: z.string().min(1, 'Описание обязательно'),
  authorCharacterId: z.string().uuid('Неверный формат ID персонажа'),
  incidentLocation: z.string().min(1, 'Место инцидента обязательно'),
  incidentTime: z.string().min(1, 'Время инцидента обязательно'),
  incidentType: z.string().min(1, 'Тип инцидента обязателен'),
  participants: z.any().optional(),
  penalCodes: z.any().optional(),
  seizedItems: z.any().optional(),
  callId: z.string().uuid('Неверный формат ID вызова').optional(),
});

const EmsFdReportCreateSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен'),
  description: z.string().min(1, 'Описание обязательно'),
  authorCharacterId: z.string().uuid('Неверный формат ID персонажа'),
  incidentLocation: z.string().min(1, 'Место инцидента обязательно'),
  incidentTime: z.string().min(1, 'Время инцидента обязательно'),
  incidentType: z.string().min(1, 'Тип инцидента обязателен'),
  patients: z.any().optional(),
  vitalSigns: z.any().optional(),
  medicationsAdministered: z.any().optional(),
  treatmentProvided: z.string().optional(),
  outcome: z.string().optional(),
  fireDetails: z.any().optional(),
  callId: z.string().uuid('Неверный формат ID вызова').optional(),
});

// ===== MDT БАЗОВЫЙ ENDPOINT =====

/**
 * GET /api/v1/mdt
 * Базовый endpoint для проверки подключения MDT
 * Доступ: все аутентифицированные пользователи
 */
router.get('/', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({ 
    success: true, 
    message: 'MDT API v1 is working!',
    timestamp: new Date().toISOString(),
    version: 'v1',
    endpoints: {
      bolos: '/api/v1/mdt/bolos',
      signals: '/api/v1/mdt/signals',
      notifications: '/api/v1/mdt/notifications',
      applications: '/api/v1/mdt/applications',
      reports: '/api/v1/mdt/reports'
    }
  });
});

// ===== MDT МАРШРУТЫ - BOLO =====

/**
 * GET /api/v1/mdt/bolos
 * Получить все активные BOLO
 * Доступ: dispatch, leo, ems
 */
router.get(
  '/bolos',
  authenticateToken,
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const bolos = await mdtService.getBolos();
      res.json({
        success: true,
        data: bolos,
        count: bolos.length
      });
    } catch (error: any) {
      console.error('[MDT Routes] Error fetching bolos:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить BOLO' 
      });
    }
  }
);

/**
 * GET /api/v1/mdt/bolos/:id
 * Получить BOLO по ID
 * Доступ: dispatch, leo, ems
 */
router.get(
  '/bolos/:id',
  authenticateToken,
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      const bolo = await mdtService.getBoloById(id);
      
      if (!bolo) {
        return res.status(404).json({
          success: false,
          error: 'BOLO не найден'
        });
      }

      res.json({
        success: true,
        data: bolo
      });
    } catch (error: any) {
      console.error('[MDT Routes] Error fetching bolo:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверный формат ID BOLO'
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить BOLO' 
      });
    }
  }
);

/**
 * POST /api/v1/mdt/bolos
 * Создать новый BOLO
 * Доступ: dispatch, leo
 */
router.post(
  '/bolos',
  authenticateToken,
  requireAnyRole(['dispatch', 'leo']),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ Валидация входных данных
      const validatedData = BoloCreateSchema.parse(req.body);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      const bolo = await mdtService.createBolo(validatedData);
      
      res.status(201).json({
        success: true,
        data: bolo,
        message: 'BOLO успешно создан'
      });
    } catch (error: any) {
      console.error('[MDT Routes] Error creating bolo:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверные данные BOLO',
          details: error.errors
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось создать BOLO' 
      });
    }
  }
);

/**
 * PUT /api/v1/mdt/bolos/:id
 * Обновить BOLO
 * Доступ: dispatch, leo
 */
router.put(
  '/bolos/:id',
  authenticateToken,
  requireAnyRole(['dispatch', 'leo']),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      // ✅ Валидация входных данных
      const validatedData = BoloUpdateSchema.parse(req.body);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      const bolo = await mdtService.updateBolo(id, validatedData);
      
      res.json({
        success: true,
        data: bolo,
        message: 'BOLO успешно обновлен'
      });
    } catch (error: any) {
      console.error('[MDT Routes] Error updating bolo:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверные данные',
          details: error.errors
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось обновить BOLO' 
      });
    }
  }
);

/**
 * DELETE /api/v1/mdt/bolos/:id
 * Удалить BOLO
 * Доступ: dispatch, leo
 */
router.delete(
  '/bolos/:id',
  authenticateToken,
  requireAnyRole(['dispatch', 'leo']),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      await mdtService.deleteBolo(id);
      
      res.json({
        success: true,
        message: 'BOLO успешно удален'
      });
    } catch (error: any) {
      console.error('[MDT Routes] Error deleting bolo:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверный формат ID BOLO'
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось удалить BOLO' 
      });
    }
  }
);

// ===== MDT МАРШРУТЫ - СИГНАЛЫ =====

/**
 * GET /api/v1/mdt/signals
 * Получить все активные сигналы
 * Доступ: dispatch, leo, ems
 */
router.get(
  '/signals',
  authenticateToken,
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const signals = await mdtService.getActiveSignals();
      res.json({
        success: true,
        data: signals,
        count: signals.length
      });
    } catch (error: any) {
      console.error('[MDT Routes] Error fetching signals:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить сигналы' 
      });
    }
  }
);

/**
 * GET /api/v1/mdt/signals/:id
 * Получить сигнал по ID
 * Доступ: dispatch, leo, ems
 */
router.get(
  '/signals/:id',
  authenticateToken,
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      const signal = await mdtService.getSignalById(id);
      
      if (!signal) {
        return res.status(404).json({
          success: false,
          error: 'Сигнал не найден'
        });
      }

      res.json({
        success: true,
        data: signal
      });
    } catch (error: any) {
      console.error('[MDT Routes] Error fetching signal:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверный формат ID сигнала'
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить сигнал' 
      });
    }
  }
);

/**
 * POST /api/v1/mdt/signals
 * Создать новый сигнал
 * Доступ: dispatch, leo, ems
 */
router.post(
  '/signals',
  authenticateToken,
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ Валидация входных данных
      const validatedData = SignalCreateSchema.parse(req.body);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      const signal = await mdtService.createSignal(validatedData);
      
      res.status(201).json({
        success: true,
        data: signal,
        message: 'Сигнал успешно создан'
      });
    } catch (error: any) {
      console.error('[MDT Routes] Error creating signal:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверные данные сигнала',
          details: error.errors
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось создать сигнал' 
      });
    }
  }
);

/**
 * PUT /api/v1/mdt/signals/:id
 * Обновить сигнал
 * Доступ: dispatch, leo, ems
 */
router.put(
  '/signals/:id',
  authenticateToken,
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      // ✅ Валидация входных данных
      const validatedData = SignalUpdateSchema.parse(req.body);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      const signal = await mdtService.updateSignal(id, validatedData);
      
      res.json({
        success: true,
        data: signal,
        message: 'Сигнал успешно обновлен'
      });
    } catch (error: any) {
      console.error('[MDT Routes] Error updating signal:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверные данные',
          details: error.errors
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось обновить сигнал' 
      });
    }
  }
);

/**
 * DELETE /api/v1/mdt/signals/:id
 * Отозвать сигнал
 * Доступ: dispatch, leo, ems
 */
router.delete(
  '/signals/:id',
  authenticateToken,
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      await mdtService.revokeSignal(id);
      
      res.json({
        success: true,
        message: 'Сигнал успешно отозван'
      });
    } catch (error: any) {
      console.error('[MDT Routes] Error revoking signal:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверный формат ID сигнала'
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось отозвать сигнал' 
      });
    }
  }
);

/**
 * POST /api/v1/mdt/signals/:id/notify
 * Уведомить о сигнале
 * Доступ: dispatch
 */
router.post(
  '/signals/:id/notify',
  authenticateToken,
  requireRole('dispatch'),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      await mdtService.notifySignal(id);
      
      res.json({
        success: true,
        message: 'Уведомления о сигнале отправлены'
      });
    } catch (error: any) {
      console.error('[MDT Routes] Error notifying signal:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверный формат ID сигнала'
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось отправить уведомления' 
      });
    }
  }
);

// ===== MDT МАРШРУТЫ - УВЕДОМЛЕНИЯ =====

/**
 * GET /api/v1/mdt/notifications
 * Получить уведомления пользователя
 * Доступ: все аутентифицированные пользователи
 */
router.get(
  '/notifications',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId: string = req.user!.id; // ✅ UUID как string
      const notifications = await mdtService.getNotifications(userId);
      
      res.json({
        success: true,
        data: notifications,
        count: notifications.length
      });
    } catch (error: any) {
      console.error('[MDT Routes] Error fetching notifications:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить уведомления' 
      });
    }
  }
);

/**
 * GET /api/v1/mdt/notifications/unread
 * Получить непрочитанные уведомления
 * Доступ: все аутентифицированные пользователи
 */
router.get(
  '/notifications/unread',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId: string = req.user!.id; // ✅ UUID как string
      const notifications = await mdtService.getUnreadNotifications(userId);
      
      res.json({
        success: true,
        data: notifications,
        count: notifications.length
      });
    } catch (error: any) {
      console.error('[MDT Routes] Error fetching unread notifications:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить непрочитанные уведомления' 
      });
    }
  }
);

/**
 * POST /api/v1/mdt/notifications
 * Создать уведомление
 * Доступ: dispatch
 */
router.post(
  '/notifications',
  authenticateToken,
  requireRole('dispatch'),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ Валидация входных данных
      const validatedData = NotificationCreateSchema.parse(req.body);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      const notification = await mdtService.createNotification(validatedData);
      
      res.status(201).json({
        success: true,
        data: notification,
        message: 'Уведомление успешно создано'
      });
    } catch (error: any) {
      console.error('[MDT Routes] Error creating notification:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверные данные уведомления',
          details: error.errors
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось создать уведомление' 
      });
    }
  }
);

/**
 * PUT /api/v1/mdt/notifications/:id/read
 * Отметить уведомление как прочитанное
 * Доступ: все аутентифицированные пользователи
 */
router.put(
  '/notifications/:id/read',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      await mdtService.markNotificationAsRead(id);
      
      res.json({
        success: true,
        message: 'Уведомление отмечено как прочитанное'
      });
    } catch (error: any) {
      console.error('[MDT Routes] Error marking notification as read:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверный формат ID уведомления'
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось отметить уведомление как прочитанное' 
      });
    }
  }
);

// ===== MDT МАРШРУТЫ - ЗАЯВКИ =====

/**
 * POST /api/v1/mdt/applications
 * Создать заявку
 * Доступ: все аутентифицированные пользователи
 */
router.post(
  '/applications',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ Валидация входных данных
      const validatedData = ApplicationCreateSchema.parse(req.body);
      
      // ✅ Добавляем userId из аутентифицированного пользователя
      const applicationData: CreateApplicationData = {
        ...validatedData,
        authorUserId: req.user!.id // ✅ UUID как string
      };
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      const application = await mdtService.createApplication(applicationData);
      
      res.status(201).json({
        success: true,
        data: application,
        message: 'Заявка успешно создана'
      });
    } catch (error: any) {
      console.error('[MDT Routes] Error creating application:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверные данные заявки',
          details: error.errors
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось создать заявку' 
      });
    }
  }
);

/**
 * PUT /api/v1/mdt/applications/:id
 * Обновить заявку
 * Доступ: dispatch, supervisor
 */
router.put(
  '/applications/:id',
  authenticateToken,
  requireAnyRole(['dispatch', 'supervisor']),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      // ✅ Валидация входных данных
      const validatedData = ApplicationUpdateSchema.parse(req.body);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      const application = await mdtService.updateApplication(id, validatedData);
      
      res.json({
        success: true,
        data: application,
        message: 'Заявка успешно обновлена'
      });
    } catch (error: any) {
      console.error('[MDT Routes] Error updating application:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверные данные',
          details: error.errors
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось обновить заявку' 
      });
    }
  }
);

// ===== MDT МАРШРУТЫ - РАПОРТЫ =====

/**
 * POST /api/v1/mdt/reports/law
 * Создать рапорт правоохранительных органов
 * Доступ: leo
 */
router.post(
  '/reports/law',
  authenticateToken,
  requireRole('leo'),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ Валидация входных данных
      const validatedData = LawReportCreateSchema.parse(req.body);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      const report = await mdtService.createLawReport(validatedData);
      
      res.status(201).json({
        success: true,
        data: report,
        message: 'Рапорт успешно создан'
      });
    } catch (error: any) {
      console.error('[MDT Routes] Error creating law report:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверные данные рапорта',
          details: error.errors
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось создать рапорт' 
      });
    }
  }
);

/**
 * POST /api/v1/mdt/reports/ems-fd
 * Создать рапорт EMS/FD
 * Доступ: ems, fire
 */
router.post(
  '/reports/ems-fd',
  authenticateToken,
  requireAnyRole(['ems', 'fire']),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ Валидация входных данных
      const validatedData = EmsFdReportCreateSchema.parse(req.body);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      const report = await mdtService.createEmsFdReport(validatedData);
      
      res.status(201).json({
        success: true,
        data: report,
        message: 'Рапорт успешно создан'
      });
    } catch (error: any) {
      console.error('[MDT Routes] Error creating EMS/FD report:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверные данные рапорта',
          details: error.errors
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось создать рапорт' 
      });
    }
  }
);

export default router; 