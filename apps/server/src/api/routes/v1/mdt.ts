// apps/server/src/api/routes/v1/mdt.ts

import { Router } from 'express';
import { z } from 'zod';
import { requireAnyRole, requireRole } from '../../middleware/auth.middleware';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { validateRequest } from '../../../utils/validation';
import mdtService from '../../../core/services/MDTService';

// ✅ Полный и правильный импорт всех необходимых типов из @roleplay-identity/db-types
import type {
  BolosInsert,
  BolosUpdate,
  MdtSignalsInsert,
  MdtSignalsUpdate,
  MdtSignalNotificationsInsert,
  ApplicationsInsert,
  ApplicationsUpdate,
  LawReportsInsert,
  EmsFdReportsInsert,
} from '@roleplay-identity/db-types';

const router = Router();

// ===== ZOD СХЕМЫ ВАЛИДАЦИИ =====

const IdParamSchema = z.object({
  id: z.string().uuid('Неверный формат ID'),
});

const BoloCreateSchema = z.object({
  type: z.string().min(1),
  reason: z.string().min(1),
  author_character_id: z.string().uuid(),
}).passthrough();
const BoloUpdateSchema = BoloCreateSchema.partial();

const SignalCreateSchema = z.object({
  title: z.string().min(1),
}).passthrough();
const SignalUpdateSchema = SignalCreateSchema.partial();

const NotificationCreateSchema = z.object({
  content: z.string().min(1),
  recipient_user_id: z.string().uuid(),
}).passthrough();

const ApplicationCreateSchema = z.object({
  type: z.string().min(1),
  author_character_id: z.string().uuid(),
  data: z.any(),
}).passthrough();
const ApplicationUpdateSchema = ApplicationCreateSchema.partial();

const LawReportCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  author_character_id: z.string().uuid(),
  incident_type: z.string().min(1),
}).passthrough();

const EmsFdReportCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  author_character_id: z.string().uuid(),
  incident_type: z.string().min(1),
}).passthrough();


// ===== MDT МАРШРУТЫ - BOLO =====

router.get('/bolos', requireAnyRole(['dispatch', 'leo', 'ems']), async (req, res, next) => {
  try {
    const bolos = await mdtService.getActiveBolos();
    res.json(bolos);
  } catch (error) {
    next(error);
  }
});

router.get('/bolos/:id', requireAnyRole(['dispatch', 'leo', 'ems']), validateRequest({ params: IdParamSchema }), async (req, res, next) => {
  try {
    const bolo = await mdtService.getBoloById(req.params.id);
    if (!bolo) {
      return res.status(404).json({ error: 'BOLO не найден' });
    }
    res.json(bolo);
  } catch (error) {
    next(error);
  }
});

router.post('/bolos', requireAnyRole(['dispatch', 'leo']), validateRequest({ body: BoloCreateSchema }), async (req, res, next) => {
  try {
    const newBolo = await mdtService.createBolo(req.body as BolosInsert);
    res.status(201).json(newBolo);
  } catch (error) {
    next(error);
  }
});

router.put('/bolos/:id', requireAnyRole(['dispatch', 'leo']), validateRequest({ params: IdParamSchema, body: BoloUpdateSchema }), async (req, res, next) => {
  try {
    const updatedBolo = await mdtService.updateBolo(req.params.id, req.body as BolosUpdate);
    res.json(updatedBolo);
  } catch (error) {
    next(error);
  }
});

router.delete('/bolos/:id', requireAnyRole(['dispatch', 'leo']), validateRequest({ params: IdParamSchema }), async (req, res, next) => {
  try {
    await mdtService.deleteBolo(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});


// ===== MDT МАРШРУТЫ - СИГНАЛЫ =====

router.get('/signals', requireAnyRole(['dispatch', 'leo', 'ems']), async (req, res, next) => {
  try {
    const signals = await mdtService.getActiveSignals();
    res.json(signals);
  } catch (error) {
    next(error);
  }
});

router.get('/signals/:id', requireAnyRole(['dispatch', 'leo', 'ems']), validateRequest({ params: IdParamSchema }), async (req, res, next) => {
  try {
    const signal = await mdtService.getSignalById(req.params.id);
    if (!signal) {
      return res.status(404).json({ error: 'Сигнал не найден' });
    }
    res.json(signal);
  } catch (error) {
    next(error);
  }
});

router.post('/signals', requireAnyRole(['dispatch', 'leo', 'ems']), validateRequest({ body: SignalCreateSchema }), async (req: AuthenticatedRequest, res, next) => {
  try {
    const data: Partial<MdtSignalsInsert> = { ...req.body };
    if (!data.author_character_id) {
        data.author_character_id = req.character?.id;
    }
    const newSignal = await mdtService.createSignal(data as MdtSignalsInsert);
    res.status(201).json(newSignal);
  } catch (error) {
    next(error);
  }
});

router.put('/signals/:id', requireAnyRole(['dispatch', 'leo', 'ems']), validateRequest({ params: IdParamSchema, body: SignalUpdateSchema }), async (req, res, next) => {
  try {
    const updatedSignal = await mdtService.updateSignal(req.params.id, req.body as MdtSignalsUpdate);
    res.json(updatedSignal);
  } catch (error) {
    next(error);
  }
});

router.delete('/signals/:id', requireAnyRole(['dispatch', 'leo', 'ems']), validateRequest({ params: IdParamSchema }), async (req, res, next) => {
  try {
    await mdtService.revokeSignal(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});


// ===== MDT МАРШРУТЫ - УВЕДОМЛЕНИЯ =====

router.get('/notifications', async (req: AuthenticatedRequest, res, next) => {
  try {
    const notifications = await mdtService.getNotifications(req.user!.id);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

router.post('/notifications', requireRole('dispatch'), validateRequest({ body: NotificationCreateSchema }), async (req, res, next) => {
  try {
    const newNotification = await mdtService.createNotification(req.body as MdtSignalNotificationsInsert);
    res.status(201).json(newNotification);
  } catch (error) {
    next(error);
  }
});

router.put('/notifications/:id/read', validateRequest({ params: IdParamSchema }), async (req, res, next) => {
  try {
    await mdtService.markNotificationAsRead(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});


// ===== MDT МАРШРУТЫ - ЗАЯВКИ =====

router.post('/applications', validateRequest({ body: ApplicationCreateSchema }), async (req: AuthenticatedRequest, res, next) => {
  try {
    const applicationData: Partial<ApplicationsInsert> = {
      ...req.body,
      author_user_id: req.user!.id,
    };
    const application = await mdtService.createApplication(applicationData as ApplicationsInsert);
    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
});

router.put('/applications/:id', requireAnyRole(['dispatch', 'supervisor']), validateRequest({ params: IdParamSchema, body: ApplicationUpdateSchema }), async (req, res, next) => {
  try {
    const application = await mdtService.updateApplication(req.params.id, req.body as ApplicationsUpdate);
    res.json(application);
  } catch (error) {
    next(error);
  }
});


// ===== MDT МАРШРУТЫ - РАПОРТЫ =====

router.post('/reports/law', requireRole('leo'), validateRequest({ body: LawReportCreateSchema }), async (req, res, next) => {
  try {
    const report = await mdtService.createLawReport(req.body as LawReportsInsert);
    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
});

router.post('/reports/ems-fd', requireAnyRole(['ems', 'fire']), validateRequest({ body: EmsFdReportCreateSchema }), async (req, res, next) => {
  try {
    const report = await mdtService.createEmsFdReport(req.body as EmsFdReportsInsert);
    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
});

export default router;