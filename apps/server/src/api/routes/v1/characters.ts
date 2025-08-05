// apps/server/src/api/routes/v1/characters.ts

import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { characterService } from '../../../core/services/index.js';
import { AppError } from '../../../utils/AppError';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { validateRequest } from '../../../utils/validation';
import type { ServicesContainer } from '../../../types/services';

// ✅ Полный импорт всех необходимых типов из db-types
import type {
  CharactersInsert,
  CharactersUpdate,
  LeoProfilesInsert,
  LeoProfilesUpdate,
  EmsProfilesInsert,
  EmsProfilesUpdate,
} from '@roleplay-identity/db-types';

// --- Zod Schemas ---
const IdParamSchema = z.object({
  id: z.string().uuid('Неверный формат ID'),
});

// Схема для создания персонажа. owner_id теперь обязателен.
const CharacterCreateSchema = z.object({
  owner_id: z.string().uuid(), // ✅ ИСПРАВЛЕНО
  first_name: z.string().min(1, 'Имя обязательно'),
  last_name: z.string().min(1, 'Фамилия обязательна'),
  date_of_birth: z.string().datetime({ message: 'Неверный формат даты' }).optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  phone_number: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  mugshot_url: z.string().url('Неверный URL-адрес для фото').optional().nullable(),
});

const CharacterUpdateSchema = CharacterCreateSchema.omit({ owner_id: true }).partial(); // ✅ ИСПРАВЛЕНО

const LeoProfileCreateSchema = z.object({
  department_id: z.string().uuid('Неверный формат ID департамента'),
  rank_id: z.string().uuid('Неверный формат ID звания'),
  callsign: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
});

const LeoProfileUpdateSchema = LeoProfileCreateSchema.partial();

const EmsProfileCreateSchema = z.object({
  department_id: z.string().uuid('Неверный формат ID департамента'),
  rank_id: z.string().uuid('Неверный формат ID звания'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
});

const EmsProfileUpdateSchema = EmsProfileCreateSchema.partial();

/**
 * Фабричная функция для создания роутера персонажей с внедренными сервисами
 */
export function createCharacterRoutes(services: ServicesContainer) {
  const router = Router();
  const { characterService } = services;

  // === ОСНОВНЫЕ РОУТЫ ПЕРСОНАЖЕЙ ===

  /**
   * POST /api/v1/characters
   * Создать нового персонажа.
   */
  router.post('/',
    requireRole('citizen'),
    validateRequest({ body: CharacterCreateSchema }),
    async (req: AuthenticatedRequest, res, next) => {
      try {
        // Проверка, что пользователь создает персонажа для себя, а не для кого-то другого
        if (req.user?.id !== req.body.owner_id) { // ✅ ИСПРАВЛЕНО
          return res.status(403).json({ success: false, error: 'Доступ запрещен' });
        }

        const newCharacter = await characterService.createCharacter(req.body as CharactersInsert);
        res.status(201).json({ success: true, data: newCharacter });
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * GET /api/v1/characters/my
   * Получить всех персонажей текущего аутентифицированного пользователя.
   */
  router.get('/my',
    requireRole('citizen'),
    async (req: AuthenticatedRequest, res, next) => {
      try {
        const characters = await characterService.getCharactersByUserId(req.user!.id);
        res.json({ success: true, data: characters });
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * GET /api/v1/characters/:id
   * Получить одного персонажа по его ID.
   */
  router.get('/:id',
    validateRequest({ params: IdParamSchema }),
    async (req, res, next) => {
      try {
        const character = await characterService.getCharacterById(req.params.id);
        if (!character) {
          return res.status(404).json({ success: false, error: 'Персонаж не найден' });
        }
        res.json({ success: true, data: character });
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * PUT /api/v1/characters/:id
   * Обновить персонажа.
   */
  router.put('/:id',
    requireRole('citizen'),
    validateRequest({ params: IdParamSchema, body: CharacterUpdateSchema }),
    async (req: AuthenticatedRequest, res, next) => {
      try {
        // Проверка на владение персонажем перед обновлением
        const character = await characterService.getCharacterById(req.params.id);
        if (!character || character.owner_id !== req.user!.id) { // ✅ ИСПРАВЛЕНО
          return res.status(403).json({ success: false, error: 'Доступ запрещен' });
        }

        const updatedCharacter = await characterService.updateCharacter(req.params.id, req.body as CharactersUpdate);
        res.json({ success: true, data: updatedCharacter });
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * DELETE /api/v1/characters/:id
   * Удалить персонажа.
   * 
   * ПРИМЕЧАНИЕ: Требует наличия метода `deleteCharacter(id)` в CharacterService.
   */
  router.delete('/:id',
    requireRole('citizen'),
    validateRequest({ params: IdParamSchema }),
    async (req: AuthenticatedRequest, res, next) => {
      try {
        // Проверка на владение персонажем перед удалением
        const character = await characterService.getCharacterById(req.params.id);
        if (!character || character.owner_id !== req.user!.id) { // ✅ ИСПРАВЛЕНО
          return res.status(403).json({ success: false, error: 'Доступ запрещен' });
        }
        
        // await characterService.deleteCharacter(req.params.id);
        res.status(200).json({ success: true, message: 'Персонаж успешно удален (метод не реализован)' });
      } catch (error) {
        next(error);
      }
    }
  );


  // === РОУТЫ ДЛЯ ПРОФИЛЕЙ ===
  // ПРИМЕЧАНИЕ: Эти роуты требуют, чтобы в CharacterService были реализованы
  // соответствующие методы (например, createLeoProfile, getLeoProfile и т.д.).

  /**
   * POST /api/v1/characters/:id/profiles/leo
   * Создать LEO профиль для персонажа.
   */
  router.post('/:id/profiles/leo',
    requireRole('admin'),
    validateRequest({ params: IdParamSchema, body: LeoProfileCreateSchema }),
    async (req, res, next) => {
      try {
        const data: LeoProfilesInsert = {
          ...req.body,
          character_id: req.params.id,
        };
        // const newProfile = await characterService.createLeoProfile(data);
        res.status(201).json({ success: true, message: 'Профиль LEO создан (метод не реализован)', data });
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * PUT /api/v1/characters/:id/profiles/leo
   * Обновить LEO профиль персонажа.
   */
  router.put('/:id/profiles/leo',
    requireRole('admin'),
    validateRequest({ params: IdParamSchema, body: LeoProfileUpdateSchema }),
    async (req, res, next) => {
      try {
        // const updatedProfile = await characterService.updateLeoProfile(req.params.id, req.body as LeoProfilesUpdate);
        res.json({ success: true, message: 'Профиль LEO обновлен (метод не реализован)', data: req.body });
      } catch (error) {
        next(error);
      }
    }
  );

  // ... Аналогичные роуты для EMS
  // POST, PUT, DELETE для /:id/profiles/ems

  return router;
}

// Оставляем экспорт по умолчанию для обратной совместимости
export default createCharacterRoutes;