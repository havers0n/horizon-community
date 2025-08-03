import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requireRole } from '../../middleware/auth.middleware';
import { validateRequest } from '../../utils/validation';
import characterService from '../../services/CharacterService';
import type { CharactersInsert } from '../../lib/supabase';

const router = Router();

// --- Zod Schemas ---
const IdParamSchema = z.object({ id: z.string().uuid() });

const CharacterCreateSchema = z.object({
  first_name: z.string().min(1, 'Имя обязательно'),
  last_name: z.string().min(1, 'Фамилия обязательна'),
  date_of_birth: z.string().date().optional().nullable(),
  gender: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  ssn: z.string().optional().nullable(),
  licenses: z.any().optional().nullable(),
  medical_info: z.any().optional().nullable(),
  mugshot_url: z.string().optional().nullable(),
  flags: z.array(z.string()).optional().nullable(),
});

const CharacterUpdateSchema = CharacterCreateSchema.partial();

const LeoProfileCreateSchema = z.object({
  department_id: z.string().uuid('Неверный формат ID департамента'),
  division_id: z.string().uuid('Неверный формат ID подразделения').optional().nullable(),
  rank_id: z.string().uuid('Неверный формат ID звания'),
  badge_number: z.string().optional().nullable(),
  callsign: z.string().optional().nullable(),
  callsign2: z.string().optional().nullable(),
  status: z.string().default('active'),
});

const LeoProfileUpdateSchema = LeoProfileCreateSchema.partial();

const EmsProfileCreateSchema = z.object({
  department_id: z.string().uuid('Неверный формат ID департамента'),
  division_id: z.string().uuid('Неверный формат ID подразделения').optional().nullable(),
  rank_id: z.string().uuid('Неверный формат ID звания'),
  status: z.string().default('active'),
});

const EmsProfileUpdateSchema = EmsProfileCreateSchema.partial();

const SearchQuerySchema = z.object({
  query: z.string().min(1, 'Поисковый запрос обязателен'),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(100)).optional(),
});

const PaginationQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(100)).optional(),
});

// === ОСНОВНЫЕ РОУТЫ ПЕРСОНАЖЕЙ ===

/**
 * POST /api/v1/characters
 * Создать нового персонажа
 */
router.post('/', 
  requireRole('citizen'), 
  validateRequest({ body: CharacterCreateSchema }), 
  async (req: AuthenticatedRequest, res) => {
    try {
      const data: CharactersInsert = {
        ...req.body,
        owner_id: req.user!.id,
      };
      const newCharacter = await characterService.create(data);
      res.status(201).json({
        success: true,
        data: newCharacter
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

/**
 * GET /api/v1/characters
 * Получить персонажей пользователя с пагинацией
 */
router.get('/', 
  requireRole('citizen'),
  validateRequest({ query: PaginationQuerySchema }),
  async (req: AuthenticatedRequest, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await characterService.getPaginated(page, limit);
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

/**
 * GET /api/v1/characters/my
 * Получить персонажей текущего пользователя
 */
router.get('/my', 
  requireRole('citizen'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const characters = await characterService.findByOwner(req.user!.id);
      res.json({
        success: true,
        data: characters
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

/**
 * GET /api/v1/characters/search
 * Поиск персонажей
 */
router.get('/search',
  validateRequest({ query: SearchQuerySchema }),
  async (req, res) => {
    try {
      const { query, limit = 10 } = req.query;
      const characters = await characterService.search(query as string, limit as number);
      res.json({
        success: true,
        data: characters
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

/**
 * GET /api/v1/characters/:id
 * Получить персонажа по ID
 */
router.get('/:id', 
  validateRequest({ params: IdParamSchema }), 
  async (req, res) => {
    try {
      const character = await characterService.findById(req.params.id);
      if (!character) {
        return res.status(404).json({ 
          success: false,
          error: 'Персонаж не найден' 
        });
      }
      res.json({
        success: true,
        data: character
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

/**
 * PUT /api/v1/characters/:id
 * Обновить персонажа
 */
router.put('/:id',
  requireRole('citizen'),
  validateRequest({ params: IdParamSchema, body: CharacterUpdateSchema }),
  async (req: AuthenticatedRequest, res) => {
    try {
      // Проверяем, что персонаж принадлежит пользователю
      const character = await characterService.findById(req.params.id);
      if (!character) {
        return res.status(404).json({ 
          success: false,
          error: 'Персонаж не найден' 
        });
      }
      
      if (character.owner_id !== req.user!.id) {
        return res.status(403).json({ 
          success: false,
          error: 'Доступ запрещен' 
        });
      }

      const updatedCharacter = await characterService.update(req.params.id, req.body);
      res.json({
        success: true,
        data: updatedCharacter
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

/**
 * DELETE /api/v1/characters/:id
 * Удалить персонажа
 */
router.delete('/:id',
  requireRole('citizen'),
  validateRequest({ params: IdParamSchema }),
  async (req: AuthenticatedRequest, res) => {
    try {
      // Проверяем, что персонаж принадлежит пользователю
      const character = await characterService.findById(req.params.id);
      if (!character) {
        return res.status(404).json({ 
          success: false,
          error: 'Персонаж не найден' 
        });
      }
      
      if (character.owner_id !== req.user!.id) {
        return res.status(403).json({ 
          success: false,
          error: 'Доступ запрещен' 
        });
      }

      await characterService.delete(req.params.id);
      res.json({
        success: true,
        message: 'Персонаж успешно удален'
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

// === РОУТЫ ДЛЯ LEO ПРОФИЛЕЙ ===

/**
 * POST /api/v1/characters/:id/profiles/leo
 * Создать LEO профиль для персонажа
 */
router.post('/:id/profiles/leo',
  requireRole('admin'),
  validateRequest({ params: IdParamSchema, body: LeoProfileCreateSchema }),
  async (req: AuthenticatedRequest, res) => {
    try {
      // Проверяем, что персонаж существует
      const character = await characterService.findById(req.params.id);
      if (!character) {
        return res.status(404).json({ 
          success: false,
          error: 'Персонаж не найден' 
        });
      }

      const data = {
        ...req.body,
        id: req.params.id, // ID персонажа становится ID профиля
      };
      const newProfile = await characterService.createLeoProfile(data);
      res.status(201).json({
        success: true,
        data: newProfile
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

/**
 * GET /api/v1/characters/:id/profiles/leo
 * Получить LEO профиль персонажа
 */
router.get('/:id/profiles/leo',
  validateRequest({ params: IdParamSchema }),
  async (req, res) => {
    try {
      const profile = await characterService.getLeoProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ 
          success: false,
          error: 'LEO профиль не найден' 
        });
      }
      res.json({
        success: true,
        data: profile
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

/**
 * PUT /api/v1/characters/:id/profiles/leo
 * Обновить LEO профиль персонажа
 */
router.put('/:id/profiles/leo',
  requireRole('admin'),
  validateRequest({ params: IdParamSchema, body: LeoProfileUpdateSchema }),
  async (req: AuthenticatedRequest, res) => {
    try {
      const updatedProfile = await characterService.updateLeoProfile(req.params.id, req.body);
      res.json({
        success: true,
        data: updatedProfile
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

/**
 * DELETE /api/v1/characters/:id/profiles/leo
 * Удалить LEO профиль персонажа
 */
router.delete('/:id/profiles/leo',
  requireRole('admin'),
  validateRequest({ params: IdParamSchema }),
  async (req: AuthenticatedRequest, res) => {
    try {
      await characterService.deleteLeoProfile(req.params.id);
      res.json({
        success: true,
        message: 'LEO профиль успешно удален'
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

// === РОУТЫ ДЛЯ EMS ПРОФИЛЕЙ ===

/**
 * POST /api/v1/characters/:id/profiles/ems
 * Создать EMS профиль для персонажа
 */
router.post('/:id/profiles/ems',
  requireRole('admin'),
  validateRequest({ params: IdParamSchema, body: EmsProfileCreateSchema }),
  async (req: AuthenticatedRequest, res) => {
    try {
      // Проверяем, что персонаж существует
      const character = await characterService.findById(req.params.id);
      if (!character) {
        return res.status(404).json({ 
          success: false,
          error: 'Персонаж не найден' 
        });
      }

      const data = {
        ...req.body,
        id: req.params.id, // ID персонажа становится ID профиля
      };
      const newProfile = await characterService.createEmsProfile(data);
      res.status(201).json({
        success: true,
        data: newProfile
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

/**
 * GET /api/v1/characters/:id/profiles/ems
 * Получить EMS профиль персонажа
 */
router.get('/:id/profiles/ems',
  validateRequest({ params: IdParamSchema }),
  async (req, res) => {
    try {
      const profile = await characterService.getEmsProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ 
          success: false,
          error: 'EMS профиль не найден' 
        });
      }
      res.json({
        success: true,
        data: profile
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

/**
 * PUT /api/v1/characters/:id/profiles/ems
 * Обновить EMS профиль персонажа
 */
router.put('/:id/profiles/ems',
  requireRole('admin'),
  validateRequest({ params: IdParamSchema, body: EmsProfileUpdateSchema }),
  async (req: AuthenticatedRequest, res) => {
    try {
      const updatedProfile = await characterService.updateEmsProfile(req.params.id, req.body);
      res.json({
        success: true,
        data: updatedProfile
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

/**
 * DELETE /api/v1/characters/:id/profiles/ems
 * Удалить EMS профиль персонажа
 */
router.delete('/:id/profiles/ems',
  requireRole('admin'),
  validateRequest({ params: IdParamSchema }),
  async (req: AuthenticatedRequest, res) => {
    try {
      await characterService.deleteEmsProfile(req.params.id);
      res.json({
        success: true,
        message: 'EMS профиль успешно удален'
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

export default router; 