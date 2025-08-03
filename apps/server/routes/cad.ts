import { Router } from 'express';
import { z } from 'zod';
import { MDTCallsInsert, MDTCallsUpdate } from '../../../packages/db-types/src/index';
import { AuthenticatedRequest, requireAnyRole, requireRole } from '../middleware/auth.middleware';
import { call911Service } from '../services/Call911Service';
import { validateRequest } from '../utils/validation';

const router = Router();

// ===========================================
// ZOD СХЕМЫ ВАЛИДАЦИИ
// ===========================================

const IdParamSchema = z.object({
  id: z.string().uuid('Неверный формат ID вызова'),
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
  assignedUnits: z.array(z.string()).optional(),
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

// ===========================================
// CAD МАРШРУТЫ - ВЫЗОВЫ 911
// ===========================================

/**
 * GET /api/v1/cad/calls
 * Получить все активные вызовы 911
 * Доступ: dispatch, leo, ems
 */
router.get(
  '/calls',
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
      console.error('Error fetching active calls:', error);
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
      console.error('Error fetching all calls:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить вызовы' 
      });
    }
  }
);

/**
 * GET /api/v1/cad/calls/status/:status
 * Получить вызовы по статусу
 * Доступ: dispatch, leo, ems
 */
router.get(
  '/calls/status/:status',
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { status } = req.params;
      const calls = await call911Service.getCallsByStatus(status);
      res.json({
        success: true,
        data: calls,
        count: calls.length
      });
    } catch (error: any) {
      console.error('Error fetching calls by status:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить вызовы по статусу' 
      });
    }
  }
);

/**
 * GET /api/v1/cad/calls/type/:type
 * Получить вызовы по типу
 * Доступ: dispatch, leo, ems
 */
router.get(
  '/calls/type/:type',
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { type } = req.params;
      const calls = await call911Service.getCallsByType(type);
      res.json({
        success: true,
        data: calls,
        count: calls.length
      });
    } catch (error: any) {
      console.error('Error fetching calls by type:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить вызовы по типу' 
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
  requireAnyRole(['dispatch', 'leo', 'ems']),
  validateRequest({ params: IdParamSchema }),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const call = await call911Service.findById(id);
      
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
      console.error('Error fetching call by ID:', error);
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
  requireRole('dispatch'),
  validateRequest({ body: CallCreateSchema }),
  async (req: AuthenticatedRequest, res) => {
    try {
      const callData = {
        ...req.body,
        status: req.body.status || 'pending',
        priority: req.body.priority || 'medium'
      };
      
      const newCall = await call911Service.createCall(callData);
      
      res.status(201).json({
        success: true,
        data: newCall,
        message: 'Вызов успешно создан'
      });
    } catch (error: any) {
      console.error('Error creating call:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось создать вызов' 
      });
    }
  }
);

/**
 * PUT /api/v1/cad/calls/:id
 * Обновить вызов 911
 * Доступ: dispatch
 */
router.put(
  '/calls/:id',
  requireRole('dispatch'),
  validateRequest({ params: IdParamSchema, body: CallUpdateSchema }),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const callData = req.body;
      
      const updatedCall = await call911Service.updateCall(id, callData);
      
      res.json({
        success: true,
        data: updatedCall,
        message: 'Вызов успешно обновлен'
      });
    } catch (error: any) {
      console.error('Error updating call:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось обновить вызов' 
      });
    }
  }
);

/**
 * DELETE /api/v1/cad/calls/:id
 * Удалить вызов 911
 * Доступ: dispatch
 */
router.delete(
  '/calls/:id',
  requireRole('dispatch'),
  validateRequest({ params: IdParamSchema }),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      await call911Service.deleteCall(id);
      
      res.json({
        success: true,
        message: 'Вызов успешно удален'
      });
    } catch (error: any) {
      console.error('Error deleting call:', error);
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
  requireRole('dispatch'),
  validateRequest({ params: IdParamSchema, body: AssignUnitsSchema }),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { unitIds } = req.body;
      
      await call911Service.assignUnits(id, unitIds);
      
      res.json({
        success: true,
        message: 'Юниты успешно назначены на вызов'
      });
    } catch (error: any) {
      console.error('Error assigning units to call:', error);
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
 * Доступ: dispatch
 */
router.put(
  '/calls/:id/status',
  requireRole('dispatch'),
  validateRequest({ 
    params: IdParamSchema, 
    body: z.object({ status: z.enum(['pending', 'assigned', 'en_route', 'on_scene', 'completed', 'cancelled']) })
  }),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const updatedCall = await call911Service.updateCallStatus(id, status);
      
      res.json({
        success: true,
        data: updatedCall,
        message: 'Статус вызова успешно обновлен'
      });
    } catch (error: any) {
      console.error('Error updating call status:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось обновить статус вызова' 
      });
    }
  }
);

// ===========================================
// CAD МАРШРУТЫ - АКТИВНЫЕ ЮНИТЫ
// ===========================================

/**
 * GET /api/v1/cad/units
 * Получить все активные юниты
 * Доступ: dispatch, leo, ems
 */
router.get(
  '/units',
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
      console.error('Error fetching active units:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить активные юниты' 
      });
    }
  }
);

/**
 * GET /api/v1/cad/units/available
 * Получить доступные юниты
 * Доступ: dispatch, leo, ems
 */
router.get(
  '/units/available',
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const units = await call911Service.getAvailableUnits();
      res.json({
        success: true,
        data: units,
        count: units.length
      });
    } catch (error: any) {
      console.error('Error fetching available units:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить доступные юниты' 
      });
    }
  }
);

/**
 * GET /api/v1/cad/units/department/:departmentId
 * Получить юниты по департаменту
 * Доступ: dispatch, leo, ems
 */
router.get(
  '/units/department/:departmentId',
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { departmentId } = req.params;
      const units = await call911Service.getUnitsByDepartment(departmentId);
      res.json({
        success: true,
        data: units,
        count: units.length
      });
    } catch (error: any) {
      console.error('Error fetching units by department:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить юниты по департаменту' 
      });
    }
  }
);

/**
 * GET /api/v1/cad/units/status/:status
 * Получить юниты по статусу
 * Доступ: dispatch, leo, ems
 */
router.get(
  '/units/status/:status',
  requireAnyRole(['dispatch', 'leo', 'ems']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { status } = req.params;
      const units = await call911Service.getUnitsByStatus(status);
      res.json({
        success: true,
        data: units,
        count: units.length
      });
    } catch (error: any) {
      console.error('Error fetching units by status:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить юниты по статусу' 
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
  requireAnyRole(['dispatch', 'leo', 'ems']),
  validateRequest({ params: z.object({ id: z.string().uuid() }) }),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
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
      console.error('Error fetching unit by ID:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось получить юнит' 
      });
    }
  }
);

/**
 * POST /api/v1/cad/units
 * Создать активный юнит
 * Доступ: dispatch
 */
router.post(
  '/units',
  requireRole('dispatch'),
  validateRequest({ body: UnitCreateSchema }),
  async (req: AuthenticatedRequest, res) => {
    try {
      const unitData = {
        ...req.body,
        userId: req.user!.id
      };
      
      const newUnit = await call911Service.createUnit(unitData);
      
      res.status(201).json({
        success: true,
        data: newUnit,
        message: 'Активный юнит успешно создан'
      });
    } catch (error: any) {
      console.error('Error creating unit:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось создать активный юнит' 
      });
    }
  }
);

/**
 * PUT /api/v1/cad/units/:id
 * Обновить активный юнит
 * Доступ: dispatch
 */
router.put(
  '/units/:id',
  requireRole('dispatch'),
  validateRequest({ 
    params: z.object({ id: z.string().uuid() }), 
    body: UnitUpdateSchema 
  }),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const unitData = req.body;
      
      const updatedUnit = await call911Service.updateUnit(id, unitData);
      
      res.json({
        success: true,
        data: updatedUnit,
        message: 'Активный юнит успешно обновлен'
      });
    } catch (error: any) {
      console.error('Error updating unit:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось обновить активный юнит' 
      });
    }
  }
);

/**
 * DELETE /api/v1/cad/units/:id
 * Удалить активный юнит
 * Доступ: dispatch
 */
router.delete(
  '/units/:id',
  requireRole('dispatch'),
  validateRequest({ params: z.object({ id: z.string().uuid() }) }),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      await call911Service.deleteUnit(id);
      
      res.json({
        success: true,
        message: 'Активный юнит успешно удален'
      });
    } catch (error: any) {
      console.error('Error deleting unit:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось удалить активный юнит' 
      });
    }
  }
);

/**
 * PUT /api/v1/cad/units/:id/status
 * Обновить статус юнита
 * Доступ: dispatch
 */
router.put(
  '/units/:id/status',
  requireRole('dispatch'),
  validateRequest({ 
    params: z.object({ id: z.string().uuid() }), 
    body: z.object({ status: z.enum(['available', 'busy', 'en_route', 'on_scene', 'panic']) })
  }),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const updatedUnit = await call911Service.updateUnitStatus(id, status);
      
      res.json({
        success: true,
        data: updatedUnit,
        message: 'Статус юнита успешно обновлен'
      });
    } catch (error: any) {
      console.error('Error updating unit status:', error);
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
 * Доступ: dispatch
 */
router.put(
  '/units/:id/location',
  requireRole('dispatch'),
  validateRequest({ 
    params: z.object({ id: z.string().uuid() }), 
    body: z.object({ location: z.any() })
  }),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { location } = req.body;
      
      const updatedUnit = await call911Service.updateUnitLocation(id, location);
      
      res.json({
        success: true,
        data: updatedUnit,
        message: 'Местоположение юнита успешно обновлено'
      });
    } catch (error: any) {
      console.error('Error updating unit location:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось обновить местоположение юнита' 
      });
    }
  }
);

// ===========================================
// CAD МАРШРУТЫ - ЭКСТРЕННЫЕ ОПЕРАЦИИ
// ===========================================

/**
 * POST /api/v1/cad/units/:id/panic
 * Активировать сигнал паники
 * Доступ: dispatch
 */
router.post(
  '/units/:id/panic',
  requireRole('dispatch'),
  validateRequest({ params: z.object({ id: z.string().uuid() }) }),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      await call911Service.activatePanic(id);
      
      res.json({
        success: true,
        message: 'Сигнал паники активирован'
      });
    } catch (error: any) {
      console.error('Error activating panic:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось активировать сигнал паники' 
      });
    }
  }
);

/**
 * DELETE /api/v1/cad/units/:id/panic
 * Деактивировать сигнал паники
 * Доступ: dispatch
 */
router.delete(
  '/units/:id/panic',
  requireRole('dispatch'),
  validateRequest({ params: z.object({ id: z.string().uuid() }) }),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      await call911Service.deactivatePanic(id);
      
      res.json({
        success: true,
        message: 'Сигнал паники деактивирован'
      });
    } catch (error: any) {
      console.error('Error deactivating panic:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Не удалось деактивировать сигнал паники' 
      });
    }
  }
);

export default router; 