// apps/server/src/api/routes/v1/characters.ts

import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { characterService } from '../../../core/services/index.js';
import { AppError } from '../../../utils/AppError';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { validateRequest } from '../../../utils/validation';
import type { ServicesContainer } from '../../../types/services';

// ✅ ПРАВИЛЬНЫЕ импорты типов из обновленной схемы БД
import type {
  TablesInsert,
  TablesUpdate,
} from '@roleplay-identity/db-types';

// ✅ Определяем типы на основе обновленной схемы
type CharactersInsert = TablesInsert<'characters'>;
type CharactersUpdate = TablesUpdate<'characters'>;
type LeoProfilesInsert = TablesInsert<'leo_profiles'>;
type LeoProfilesUpdate = TablesUpdate<'leo_profiles'>;
type EmsProfilesInsert = TablesInsert<'ems_profiles'>;
type EmsProfilesUpdate = TablesUpdate<'ems_profiles'>;

// --- Zod Schemas ---
const IdParamSchema = z.object({
  id: z.string().uuid('Неверный формат ID'),
});

// ✅ ИСПРАВЛЕНО: Схема для создания персонажа. user_id теперь обязателен.
const CharacterCreateSchema = z.object({
  user_id: z.string().uuid(), // ✅ ИСПРАВЛЕНО: user_id вместо owner_id
  first_name: z.string().min(1, 'Имя обязательно'),
  last_name: z.string().min(1, 'Фамилия обязательна'),
  date_of_birth: z.string().datetime({ message: 'Неверный формат даты' }).optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  phone_number: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  mugshot_url: z.string().url('Неверный URL-адрес для фото').optional().nullable(),
});

const CharacterUpdateSchema = CharacterCreateSchema.omit({ user_id: true }).partial(); // ✅ ИСПРАВЛЕНО

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
        // ✅ ИСПРАВЛЕНО: Проверка, что пользователь создает персонажа для себя
        if (req.user?.id !== req.body.user_id) { // ✅ user_id вместо owner_id
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
        // ✅ ИСПРАВЛЕНО: Проверка на владение персонажем перед обновлением
        const character = await characterService.getCharacterById(req.params.id);
        if (!character || character.user_id !== req.user!.id) { // ✅ user_id вместо owner_id
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
   */
  router.delete('/:id',
    requireRole('citizen'),
    validateRequest({ params: IdParamSchema }),
    async (req: AuthenticatedRequest, res, next) => {
      try {
        // ✅ ИСПРАВЛЕНО: Проверка на владение персонажем перед удалением
        const character = await characterService.getCharacterById(req.params.id);
        if (!character || character.user_id !== req.user!.id) { // ✅ user_id вместо owner_id
          return res.status(403).json({ success: false, error: 'Доступ запрещен' });
        }
        
        await characterService.deleteCharacter(req.params.id);
        res.status(200).json({ success: true, message: 'Персонаж успешно удален' });
      } catch (error) {
        next(error);
      }
    }
  );

  // === РОУТЫ ДЛЯ ПРОФИЛЕЙ ===

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
          id: req.params.id, // ✅ ИСПРАВЛЕНО: id вместо character_id
        };
        const newProfile = await characterService.createLeoProfile(data);
        res.status(201).json({ success: true, data: newProfile });
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
        const updatedProfile = await characterService.updateLeoProfile(req.params.id, req.body as LeoProfilesUpdate);
        res.json({ success: true, data: updatedProfile });
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * POST /api/v1/characters/:id/profiles/ems
   * Создать EMS профиль для персонажа.
   */
  router.post('/:id/profiles/ems',
    requireRole('admin'),
    validateRequest({ params: IdParamSchema, body: EmsProfileCreateSchema }),
    async (req, res, next) => {
      try {
        const data: EmsProfilesInsert = {
          ...req.body,
          id: req.params.id, // ✅ ИСПРАВЛЕНО: id вместо character_id
        };
        const newProfile = await characterService.createEmsProfile(data);
        res.status(201).json({ success: true, data: newProfile });
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * PUT /api/v1/characters/:id/profiles/ems
   * Обновить EMS профиль персонажа.
   */
  router.put('/:id/profiles/ems',
    requireRole('admin'),
    validateRequest({ params: IdParamSchema, body: EmsProfileUpdateSchema }),
    async (req, res, next) => {
      try {
        const updatedProfile = await characterService.updateEmsProfile(req.params.id, req.body as EmsProfilesUpdate);
        res.json({ success: true, data: updatedProfile });
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}

// Оставляем экспорт по умолчанию для обратной совместимости
export default createCharacterRoutes;