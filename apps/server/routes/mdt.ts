import { Router } from 'express';
import { z } from 'zod';
import { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { mdtService } from '../services/MDTService';

const router: import('express').Router = Router();

// ===== СХЕМЫ ВАЛИДАЦИИ =====

const createUnitSchema = z.object({
  characterId: z.number().min(1),
  unitNumber: z.string().min(1).max(10),
  departmentId: z.number().min(1),
  status: z.string().optional(),
  location: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  }).optional(),
  vehicleId: z.number().optional()
});

const updateUnitStatusSchema = z.object({
  status: z.string().min(1)
});

const updateUnitLocationSchema = z.object({
  location: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  })
});

const createCallSchema = z.object({
  callerName: z.string().optional(),
  callerPhone: z.string().optional(),
  location: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['police', 'fire', 'ems']),
  priority: z.number().min(1).max(5).optional(),
  status: z.string().optional(),
  patientInfo: z.record(z.any()).optional(),
  fireInfo: z.record(z.any()).optional()
});

const updateCallSchema = z.object({
  callerName: z.string().optional(),
  callerPhone: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['police', 'fire', 'ems']).optional(),
  priority: z.number().min(1).max(5).optional(),
  status: z.string().optional(),
  patientInfo: z.record(z.any()).optional(),
  fireInfo: z.record(z.any()).optional()
});

const assignUnitsSchema = z.object({
  unitIds: z.array(z.number().min(1))
});

const createSignalSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  type: z.enum(['LEO', 'EMS_FD']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  location: z.string().optional(),
  coordinates: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  }).optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().optional()
});

const updateSignalSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  type: z.enum(['LEO', 'EMS_FD']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  location: z.string().optional(),
  coordinates: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  }).optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().optional()
});

// ===== BOLO SCHEMAS =====

const createBoloSchema = z.object({
  type: z.enum(['vehicle', 'person', 'general']),
  description: z.string().min(1).max(500),
  vehicle: z.string().optional(),
  plate: z.string().optional(),
  reason: z.string().min(1).max(500),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  location: z.string().optional(),
  additionalInfo: z.string().optional(),
  expiresAt: z.string().optional()
});

const updateBoloSchema = z.object({
  type: z.enum(['vehicle', 'person', 'general']).optional(),
  description: z.string().min(1).max(500).optional(),
  vehicle: z.string().optional(),
  plate: z.string().optional(),
  reason: z.string().min(1).max(500).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  location: z.string().optional(),
  additionalInfo: z.string().optional(),
  status: z.enum(['active', 'resolved', 'expired']).optional(),
  expiresAt: z.string().optional()
});

// ===== MDT UNITS API =====

/**
 * GET /api/mdt/units - Получить все активные юниты
 */
router.get('/units', authenticateToken, async (req: Request, res: Response) => {
  try {
    const units = await mdtService.getActiveUnits();
    res.json({ success: true, data: units });
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch units' 
    });
  }
});

/**
 * POST /api/mdt/units - Создать новый юнит
 */
router.post('/units', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validatedData = createUnitSchema.parse(req.body);
    
    const unit = await mdtService.createUnit({
      ...validatedData,
      authorId: req.user!.id
    });

    res.status(201).json({ success: true, data: unit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    console.error('Error creating unit:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create unit' 
    });
  }
});

/**
 * PUT /api/mdt/units/:id/status - Обновить статус юнита
 */
router.put('/units/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const unitId = parseInt(req.params.id);
    if (isNaN(unitId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid unit ID' 
      });
    }

    const validatedData = updateUnitStatusSchema.parse(req.body);
    
    const unit = await mdtService.updateUnitStatus(unitId, validatedData.status);
    res.json({ success: true, data: unit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    console.error('Error updating unit status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update unit status' 
    });
  }
});

/**
 * PUT /api/mdt/units/:id/location - Обновить местоположение юнита
 */
router.put('/units/:id/location', authenticateToken, async (req: Request, res: Response) => {
  try {
    const unitId = parseInt(req.params.id);
    if (isNaN(unitId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid unit ID' 
      });
    }

    const validatedData = updateUnitLocationSchema.parse(req.body);
    
    const unit = await mdtService.updateUnitLocation(unitId, validatedData.location);
    res.json({ success: true, data: unit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    console.error('Error updating unit location:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update unit location' 
    });
  }
});

/**
 * POST /api/mdt/units/:id/panic - Активировать панику для юнита
 */
router.post('/units/:id/panic', authenticateToken, async (req: Request, res: Response) => {
  try {
    const unitId = parseInt(req.params.id);
    if (isNaN(unitId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid unit ID' 
      });
    }

    await mdtService.activatePanic(unitId);
    res.json({ success: true, message: 'Panic activated' });
  } catch (error) {
    console.error('Error activating panic:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to activate panic' 
    });
  }
});

/**
 * DELETE /api/mdt/units/:id/panic - Деактивировать панику для юнита
 */
router.delete('/units/:id/panic', authenticateToken, async (req: Request, res: Response) => {
  try {
    const unitId = parseInt(req.params.id);
    if (isNaN(unitId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid unit ID' 
      });
    }

    await mdtService.deactivatePanic(unitId);
    res.json({ success: true, message: 'Panic deactivated' });
  } catch (error) {
    console.error('Error deactivating panic:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to deactivate panic' 
    });
  }
});

// ===== MDT CALLS 911 API =====

/**
 * GET /api/mdt/calls - Получить все вызовы 911
 */
router.get('/calls', authenticateToken, async (req: Request, res: Response) => {
  try {
    const calls = await mdtService.getCalls();
    res.json({ success: true, data: calls });
  } catch (error) {
    console.error('Error fetching calls:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch calls' 
    });
  }
});

/**
 * POST /api/mdt/calls - Создать новый вызов 911
 */
router.post('/calls', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validatedData = createCallSchema.parse(req.body);
    
    const call = await mdtService.createCall({
      ...validatedData,
      authorId: req.user!.id
    });

    res.status(201).json({ success: true, data: call });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    console.error('Error creating call:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create call' 
    });
  }
});

/**
 * PUT /api/mdt/calls/:id - Обновить вызов 911
 */
router.put('/calls/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const callId = parseInt(req.params.id);
    if (isNaN(callId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid call ID' 
      });
    }

    const validatedData = updateCallSchema.parse(req.body);
    
    const call = await mdtService.updateCall(callId, validatedData);
    res.json({ success: true, data: call });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    console.error('Error updating call:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update call' 
    });
  }
});

/**
 * POST /api/mdt/calls/:id/assign - Назначить юниты на вызов
 */
router.post('/calls/:id/assign', authenticateToken, async (req: Request, res: Response) => {
  try {
    const callId = parseInt(req.params.id);
    if (isNaN(callId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid call ID' 
      });
    }

    const validatedData = assignUnitsSchema.parse(req.body);
    
    await mdtService.assignUnitsToCall(callId, validatedData.unitIds);
    res.json({ success: true, message: 'Units assigned to call' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    console.error('Error assigning units to call:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to assign units to call' 
    });
  }
});

/**
 * PUT /api/mdt/calls/:id/status - Обновить статус вызова
 */
router.put('/calls/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const callId = parseInt(req.params.id);
    if (isNaN(callId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid call ID' 
      });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Status is required' 
      });
    }

    const call = await mdtService.updateCallStatus(callId, status);
    res.json({ success: true, data: call });
  } catch (error) {
    console.error('Error updating call status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update call status' 
    });
  }
});

// ===== MDT SIGNALS API =====

/**
 * GET /api/mdt/signals - Получить активные сигналы
 */
router.get('/signals', authenticateToken, async (req: Request, res: Response) => {
  try {
    const signals = await mdtService.getActiveSignals();
    res.json({ success: true, data: signals });
  } catch (error) {
    console.error('Error fetching signals:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch signals' 
    });
  }
});

/**
 * POST /api/mdt/signals - Создать новый сигнал
 */
router.post('/signals', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validatedData = createSignalSchema.parse(req.body);
    
    const signal = await mdtService.createSignal({
      ...validatedData,
      authorId: req.user!.id
    });

    res.status(201).json({ success: true, data: signal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    console.error('Error creating signal:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create signal' 
    });
  }
});

/**
 * PUT /api/mdt/signals/:id - Обновить сигнал
 */
router.put('/signals/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const signalId = parseInt(req.params.id);
    if (isNaN(signalId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid signal ID' 
      });
    }

    const validatedData = updateSignalSchema.parse(req.body);
    
    const signal = await mdtService.updateSignal(signalId, validatedData);
    res.json({ success: true, data: signal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    console.error('Error updating signal:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update signal' 
    });
  }
});

/**
 * DELETE /api/mdt/signals/:id - Отозвать сигнал
 */
router.delete('/signals/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const signalId = parseInt(req.params.id);
    if (isNaN(signalId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid signal ID' 
      });
    }

    await mdtService.revokeSignal(signalId);
    res.json({ success: true, message: 'Signal revoked' });
  } catch (error) {
    console.error('Error revoking signal:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to revoke signal' 
    });
  }
});

/**
 * POST /api/mdt/signals/:id/notify - Отправить уведомления о сигнале
 */
router.post('/signals/:id/notify', authenticateToken, async (req: Request, res: Response) => {
  try {
    const signalId = parseInt(req.params.id);
    if (isNaN(signalId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid signal ID' 
      });
    }

    await mdtService.notifySignal(signalId);
    res.json({ success: true, message: 'Notifications sent' });
  } catch (error) {
    console.error('Error notifying signal:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to notify signal' 
    });
  }
});

// ===== ДОПОЛНИТЕЛЬНЫЕ ЭНДПОИНТЫ =====

/**
 * GET /api/mdt/dashboard - Получить данные для дашборда MDT
 */
router.get('/dashboard', authenticateToken, async (req: Request, res: Response) => {
  try {
    const [units, calls, signals] = await Promise.all([
      mdtService.getActiveUnits(),
      mdtService.getCalls(),
      mdtService.getActiveSignals()
    ]);

    // Статистика
    const stats = {
      totalUnits: units.length,
      availableUnits: units.filter(u => u.status === 'available').length,
      busyUnits: units.filter(u => u.status !== 'available').length,
      panicUnits: units.filter(u => u.isPanic).length,
      totalCalls: calls.length,
      activeCalls: calls.filter(c => c.status === 'active').length,
      pendingCalls: calls.filter(c => c.status === 'pending').length,
      totalSignals: signals.length,
      criticalSignals: signals.filter(s => s.priority === 'critical').length
    };

    res.json({ 
      success: true, 
      data: {
        units,
        calls,
        signals,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard data' 
    });
  }
});

/**
 * GET /api/mdt/notifications - Получить уведомления пользователя
 */
router.get('/notifications', authenticateToken, async (req: Request, res: Response) => {
  try {
    const notifications = await mdtService.getNotifications(req.user!.id);
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch notifications' 
    });
  }
});

/**
 * PUT /api/mdt/notifications/:id/read - Отметить уведомление как прочитанное
 */
router.put('/notifications/:id/read', authenticateToken, async (req: Request, res: Response) => {
  try {
    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid notification ID' 
      });
    }

    await mdtService.markNotificationAsRead(notificationId, req.user!.id);

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to mark notification as read' 
    });
  }
});

// ===== BOLO API =====

/**
 * GET /api/mdt/bolos - Получить все BOLO
 */
router.get('/bolos', authenticateToken, async (req: Request, res: Response) => {
  try {
    console.log('BOLO endpoint вызван');
    console.log('mdtService:', mdtService);
    
    const bolos = await mdtService.getBolos();
    console.log('BOLO получены:', bolos);
    
    res.json({ success: true, data: bolos });
  } catch (error) {
    console.error('Error fetching BOLOs:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch BOLOs',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/mdt/bolos - Создать новый BOLO
 */
router.post('/bolos', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validatedData = createBoloSchema.parse(req.body);
    
    const newBolo = await mdtService.createBolo({
      ...validatedData,
      issuedBy: req.user!.id
    });

    res.status(201).json({ 
      success: true, 
      data: newBolo
    });
  } catch (error) {
    console.error('Error creating BOLO:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create BOLO' 
    });
  }
});

/**
 * PUT /api/mdt/bolos/:id - Обновить BOLO
 */
router.put('/bolos/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const boloId = parseInt(req.params.id);
    if (isNaN(boloId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid BOLO ID' 
      });
    }

    const validatedData = updateBoloSchema.parse(req.body);
    const updatedBolo = await mdtService.updateBolo(boloId, validatedData);

    res.json({ success: true, data: updatedBolo });
  } catch (error) {
    console.error('Error updating BOLO:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update BOLO' 
    });
  }
});

/**
 * DELETE /api/mdt/bolos/:id - Удалить BOLO (soft delete)
 */
router.delete('/bolos/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const boloId = parseInt(req.params.id);
    if (isNaN(boloId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid BOLO ID' 
      });
    }

    await mdtService.deleteBolo(boloId);

    res.json({ success: true, message: 'BOLO deleted successfully' });
  } catch (error) {
    console.error('Error deleting BOLO:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete BOLO' 
    });
  }
});

export default router; 