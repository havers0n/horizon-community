import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireAnyRole, requireRole } from '../../middleware/auth.middleware';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { Call911Service } from '../../../core/services/Call911Service';
import type { CreateCallData, CreateUnitData } from '../../../core/services/Call911Service';

const router = Router();

// Инициализация сервиса
const call911Service = new Call911Service();

// ===== ZOD СХЕМЫ ВАЛИДАЦИИ =====

const IdParamSchema = z.object({
  id: z.string().uuid('Неверный формат ID'),
});

const CallCreateSchema = z.object({
  callerName: z.string().optional(),
  callerPhone: z.string().optional(),
  location: z.string().min(1, 'Местоположение обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  type: z.string().min(1, 'Тип вызова обязателен'),
  priority: z.enum(['low', 'medium', 'high', 'emergency']).optional(),
  status: z.enum(['pending', 'assigned', 'en_route', 'on_scene', 'completed', 'cancelled']).optional(),
  patientInfo: z.any().optional(),
  fireInfo: z.any().optional(),
  attachments: z.any().optional(),
  assignedUnits: z.array(z.string().uuid()).optional(),
});

const CallUpdateSchema = CallCreateSchema.partial();

const AssignUnitsSchema = z.object({
  unitIds: z.array(z.string().uuid()).min(1, 'Нужно указать хотя бы один юнит'),
});

const UnitCreateSchema = z.object({
  characterId: z.string().uuid('Неверный формат ID персонажа'),
  unitNumber: z.string().min(1, 'Номер юнита обязателен'),
  departmentId: z.string().uuid('Неверный формат ID департамента'),
  status: z.enum(['available', 'busy', 'en_route', 'on_scene', 'panic']).optional(),
  location: z.any().optional(),
  currentCallId: z.string().uuid().optional(),
});

const UnitUpdateSchema = UnitCreateSchema.partial();

const LocationUpdateSchema = z.object({
  location: z.any(),
});

// ===== CAD МАРШРУТЫ - ВЫЗОВЫ 911 =====

/**
 * GET /api/v1/cad/calls
 * Получить все активные вызовы 911
 * Доступ: dispatch, leo, ems
 */
router.get(
  '/calls',
  authenticateToken,
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const calls = await call911Service.getActiveCalls();
      res.json({
        success: true,
        data: calls,
        count: calls.length
      });
    } catch (error: any) {
      console.error('[CAD Routes] Error fetching active calls:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить активные вызовы' 
      });
    }
  }
);

/**
 * GET /api/v1/cad/calls/all
 * Получить все вызовы (включая завершенные)
 * Доступ: dispatch
 */
router.get(
  '/calls/all',
  authenticateToken,
  requireRole('dispatch'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const calls = await call911Service.getAllCalls();
      res.json({
        success: true,
        data: calls,
        count: calls.length
      });
    } catch (error: any) {
      console.error('[CAD Routes] Error fetching all calls:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить вызовы' 
      });
    }
  }
);

/**
 * GET /api/v1/cad/calls/:id
 * Получить вызов по ID
 * Доступ: dispatch, leo, ems
 */
router.get(
  '/calls/:id',
  authenticateToken,
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      const call = await call911Service.findCallById(id);
      
      if (!call) {
        return res.status(404).json({
          success: false,
          error: 'Вызов не найден'
        });
      }

      res.json({
        success: true,
        data: call
      });
    } catch (error: any) {
      console.error('[CAD Routes] Error fetching call:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверный формат ID вызова'
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить вызов' 
      });
    }
  }
);

/**
 * POST /api/v1/cad/calls
 * Создать новый вызов 911
 * Доступ: dispatch
 */
router.post(
  '/calls',
  authenticateToken,
  requireRole('dispatch'),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ Валидация входных данных
      const validatedData = CallCreateSchema.parse(req.body);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      const call = await call911Service.createCall(validatedData);
      
      res.status(201).json({
        success: true,
        data: call,
        message: 'Вызов успешно создан'
      });
    } catch (error: any) {
      console.error('[CAD Routes] Error creating call:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверные данные вызова',
          details: error.errors
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось создать вызов' 
      });
    }
  }
);

/**
 * PUT /api/v1/cad/calls/:id
 * Обновить вызов
 * Доступ: dispatch
 */
router.put(
  '/calls/:id',
  authenticateToken,
  requireRole('dispatch'),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      // ✅ Валидация входных данных
      const validatedData = CallUpdateSchema.parse(req.body);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      const call = await call911Service.updateCall(id, validatedData);
      
      res.json({
        success: true,
        data: call,
        message: 'Вызов успешно обновлен'
      });
    } catch (error: any) {
      console.error('[CAD Routes] Error updating call:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверные данные',
          details: error.errors
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось обновить вызов' 
      });
    }
  }
);

/**
 * DELETE /api/v1/cad/calls/:id
 * Удалить вызов
 * Доступ: dispatch
 */
router.delete(
  '/calls/:id',
  authenticateToken,
  requireRole('dispatch'),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      await call911Service.deleteCall(id);
      
      res.json({
        success: true,
        message: 'Вызов успешно удален'
      });
    } catch (error: any) {
      console.error('[CAD Routes] Error deleting call:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверный формат ID вызова'
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось удалить вызов' 
      });
    }
  }
);

/**
 * POST /api/v1/cad/calls/:id/assign
 * Назначить юниты на вызов
 * Доступ: dispatch
 */
router.post(
  '/calls/:id/assign',
  authenticateToken,
  requireRole('dispatch'),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      // ✅ Валидация входных данных
      const { unitIds } = AssignUnitsSchema.parse(req.body);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      await call911Service.assignUnits(id, unitIds);
      
      res.json({
        success: true,
        message: 'Юниты успешно назначены на вызов'
      });
    } catch (error: any) {
      console.error('[CAD Routes] Error assigning units:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверные данные',
          details: error.errors
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось назначить юниты' 
      });
    }
  }
);

/**
 * PUT /api/v1/cad/calls/:id/status
 * Обновить статус вызова
 * Доступ: dispatch, leo, ems
 */
router.put(
  '/calls/:id/status',
  authenticateToken,
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      const { status } = z.object({
        status: z.enum(['pending', 'assigned', 'en_route', 'on_scene', 'completed', 'cancelled'])
      }).parse(req.body);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      const call = await call911Service.updateCallStatus(id, status);
      
      res.json({
        success: true,
        data: call,
        message: 'Статус вызова успешно обновлен'
      });
    } catch (error: any) {
      console.error('[CAD Routes] Error updating call status:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверные данные',
          details: error.errors
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось обновить статус вызова' 
      });
    }
  }
);

// ===== CAD МАРШРУТЫ - ЮНИТЫ =====

/**
 * GET /api/v1/cad/units
 * Получить все активные юниты
 * Доступ: dispatch, leo, ems
 */
router.get(
  '/units',
  authenticateToken,
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const units = await call911Service.getActiveUnits();
      res.json({
        success: true,
        data: units,
        count: units.length
      });
    } catch (error: any) {
      console.error('[CAD Routes] Error fetching units:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить юниты' 
      });
    }
  }
);

/**
 * GET /api/v1/cad/units/available
 * Получить доступные юниты
 * Доступ: dispatch
 */
router.get(
  '/units/available',
  authenticateToken,
  requireRole('dispatch'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const units = await call911Service.getAvailableUnits();
      res.json({
        success: true,
        data: units,
        count: units.length
      });
    } catch (error: any) {
      console.error('[CAD Routes] Error fetching available units:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить доступные юниты' 
      });
    }
  }
);

/**
 * GET /api/v1/cad/units/:id
 * Получить юнит по ID
 * Доступ: dispatch, leo, ems
 */
router.get(
  '/units/:id',
  authenticateToken,
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      const unit = await call911Service.getUnitById(id);
      
      if (!unit) {
        return res.status(404).json({
          success: false,
          error: 'Юнит не найден'
        });
      }

      res.json({
        success: true,
        data: unit
      });
    } catch (error: any) {
      console.error('[CAD Routes] Error fetching unit:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверный формат ID юнита'
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить юнит' 
      });
    }
  }
);

/**
 * POST /api/v1/cad/units
 * Создать новый юнит
 * Доступ: dispatch
 */
router.post(
  '/units',
  authenticateToken,
  requireRole('dispatch'),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ Валидация входных данных
      const validatedData = UnitCreateSchema.parse(req.body);
      
      // ✅ Добавляем userId из аутентифицированного пользователя
      const unitData: CreateUnitData = {
        ...validatedData,
        userId: req.user!.id // ✅ UUID как string
      };
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      const unit = await call911Service.createUnit(unitData);
      
      res.status(201).json({
        success: true,
        data: unit,
        message: 'Юнит успешно создан'
      });
    } catch (error: any) {
      console.error('[CAD Routes] Error creating unit:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверные данные юнита',
          details: error.errors
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось создать юнит' 
      });
    }
  }
);

/**
 * PUT /api/v1/cad/units/:id
 * Обновить юнит
 * Доступ: dispatch
 */
router.put(
  '/units/:id',
  authenticateToken,
  requireRole('dispatch'),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      // ✅ Валидация входных данных
      const validatedData = UnitUpdateSchema.parse(req.body);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      const unit = await call911Service.updateUnit(id, validatedData);
      
      res.json({
        success: true,
        data: unit,
        message: 'Юнит успешно обновлен'
      });
    } catch (error: any) {
      console.error('[CAD Routes] Error updating unit:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверные данные',
          details: error.errors
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось обновить юнит' 
      });
    }
  }
);

/**
 * DELETE /api/v1/cad/units/:id
 * Удалить юнит
 * Доступ: dispatch
 */
router.delete(
  '/units/:id',
  authenticateToken,
  requireRole('dispatch'),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      await call911Service.deleteUnit(id);
      
      res.json({
        success: true,
        message: 'Юнит успешно удален'
      });
    } catch (error: any) {
      console.error('[CAD Routes] Error deleting unit:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверный формат ID юнита'
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось удалить юнит' 
      });
    }
  }
);

/**
 * PUT /api/v1/cad/units/:id/status
 * Обновить статус юнита
 * Доступ: dispatch, leo, ems
 */
router.put(
  '/units/:id/status',
  authenticateToken,
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      const { status } = z.object({
        status: z.enum(['available', 'busy', 'en_route', 'on_scene', 'panic'])
      }).parse(req.body);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      const unit = await call911Service.updateUnitStatus(id, status);
      
      res.json({
        success: true,
        data: unit,
        message: 'Статус юнита успешно обновлен'
      });
    } catch (error: any) {
      console.error('[CAD Routes] Error updating unit status:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверные данные',
          details: error.errors
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось обновить статус юнита' 
      });
    }
  }
);

/**
 * PUT /api/v1/cad/units/:id/location
 * Обновить местоположение юнита
 * Доступ: dispatch, leo, ems
 */
router.put(
  '/units/:id/location',
  authenticateToken,
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      // ✅ Валидация входных данных
      const { location } = LocationUpdateSchema.parse(req.body);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      const unit = await call911Service.updateUnitLocation(id, location);
      
      res.json({
        success: true,
        data: unit,
        message: 'Местоположение юнита успешно обновлено'
      });
    } catch (error: any) {
      console.error('[CAD Routes] Error updating unit location:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверные данные',
          details: error.errors
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось обновить местоположение юнита' 
      });
    }
  }
);

/**
 * POST /api/v1/cad/units/:id/panic
 * Активировать панику для юнита
 * Доступ: dispatch, leo, ems
 */
router.post(
  '/units/:id/panic',
  authenticateToken,
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      await call911Service.activatePanic(id);
      
      res.json({
        success: true,
        message: 'Паника активирована'
      });
    } catch (error: any) {
      console.error('[CAD Routes] Error activating panic:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверный формат ID юнита'
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось активировать панику' 
      });
    }
  }
);

/**
 * DELETE /api/v1/cad/units/:id/panic
 * Деактивировать панику для юнита
 * Доступ: dispatch, leo, ems
 */
router.delete(
  '/units/:id/panic',
  authenticateToken,
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ UUID правило: валидация параметра
      const { id } = IdParamSchema.parse(req.params);
      
      // ✅ Сервисный слой: вся бизнес-логика в сервисе
      await call911Service.deactivatePanic(id);
      
      res.json({
        success: true,
        message: 'Паника деактивирована'
      });
    } catch (error: any) {
      console.error('[CAD Routes] Error deactivating panic:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Неверный формат ID юнита'
        });
      }
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось деактивировать панику' 
      });
    }
  }
);

export default router; 