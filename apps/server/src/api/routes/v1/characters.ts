// apps/server/src/api/routes/v1/characters.ts

import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
// Мы больше не импортируем готовый сервис. Роутер получит его как аргумент.
import { AppError } from '../../../utils/AppError';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { validateRequest } from '../../../utils/validation';
import type { ServicesContainer } from '../../../types/services';
import type { Database } from '@roleplay-identity/db-types';
import { CharacterService } from '../../../core/services/CharacterService';

// ✅ Полный импорт всех необходимых типов из db-types
type CharactersInsert = Database['common']['Tables']['characters']['Insert'];
type CharactersUpdate = Database['common']['Tables']['characters']['Update'];
// Примечание: таблицы leo_profiles/ems_profiles отсутствуют в актуальной схеме.
// Оставляем только базовые типы персонажей, профильные роуты ниже закомментируем до появления схем.
type LeoProfilesInsert = never;
type LeoProfilesUpdate = never;
type EmsProfilesInsert = never;
type EmsProfilesUpdate = never;

// ===== ENUM ТИПЫ ДЛЯ ВАЛИДАЦИИ =====
const UserRoleEnum = z.enum(['citizen', 'candidate', 'staff', 'admin']);
const ApplicationStatusEnum = z.enum(['awaiting_interview', 'awaiting_test', 'awaiting_practice', 'accepted', 'rejected', 'on_hold']);
const BoloTypeEnum = z.enum(['person', 'vehicle']);
const BoloPriorityEnum = z.enum(['low', 'normal', 'high']);
const BoloStatusEnum = z.enum(['active', 'inactive', 'resolved']);
const CallPriorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);
const CallStatusEnum = z.enum(['pending', 'assigned', 'on_scene', 'resolved', 'cancelled']);
const CallTypeEnum = z.enum(['911_police', '911_medical', '911_fire', 'non_emergency']);

// --- Zod Schemas ---
const IdParamSchema = z.object({
  id: z.string().uuid('Неверный формат ID'),
});

// Схема для создания персонажа. user_id теперь обязателен.
const CharacterCreateSchema = z.object({
  user_id: z.string().uuid(), // ✅ ИСПРАВЛЕНО: используем user_id из БД
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
export function createCharacterRoutes(services: ServicesContainer): Router {
  const router: Router = Router();

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
        if (req.user?.id !== req.body.user_id) { // ✅ ИСПРАВЛЕНО
          return res.status(403).json({ success: false, error: 'Доступ запрещен' });
        }
        const characterService = new CharacterService(req.supabase!.common, req.supabase!.public);
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
        const characterService = new CharacterService(req.supabase!.common, req.supabase!.public);
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
        const characterService = new CharacterService((req as AuthenticatedRequest).supabase!.common, (req as AuthenticatedRequest).supabase!.public);
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
        const characterService = new CharacterService(req.supabase!.common, req.supabase!.public);
        // Проверка на владение персонажем перед обновлением
        const character = await characterService.getCharacterById(req.params.id);
        if (!character || character.user_id !== req.user!.id) { // ✅ ИСПРАВЛЕНО
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
        const characterService = new CharacterService(req.supabase!.common, req.supabase!.public);
        // Проверка на владение персонажем перед удалением
        const character = await characterService.getCharacterById(req.params.id);
        if (!character || character.user_id !== req.user!.id) { // ✅ ИСПРАВЛЕНО
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
  // ПРИМЕЧАНИЕ: Эти роуты требуют, чтобы в CharacterService были реализованы
  // соответствующие методы (например, createLeoProfile, getLeoProfile и т.д.).

  /**
   * POST /api/v1/characters/:id/profiles/leo
   * Создать LEO профиль для персонажа.
   */
  // Профили LEO временно отключены до появления таблиц в схеме
  // router.post('/:id/profiles/leo',
  //   requireRole('admin'),
  //   validateRequest({ params: IdParamSchema, body: LeoProfileCreateSchema }),
  //   async (req, res, next) => {
  //     try {
  //       const data: LeoProfilesInsert = {
  //         ...req.body,
  //         id: req.params.id,
  //       };
  //       const newProfile = await characterService.createLeoProfile(data);
  //       res.status(201).json({ success: true, data: newProfile });
  //     } catch (error) {
  //       next(error);
  //     }
  //   }
  // );

  /**
   * PUT /api/v1/characters/:id/profiles/leo
   * Обновить LEO профиль персонажа.
   */
  // router.put('/:id/profiles/leo',
  //   requireRole('admin'),
  //   validateRequest({ params: IdParamSchema, body: LeoProfileUpdateSchema }),
  //   async (req, res, next) => {
  //     try {
  //       const updatedProfile = await characterService.updateLeoProfile(req.params.id, req.body as LeoProfilesUpdate);
  //       res.json({ success: true, data: updatedProfile });
  //     } catch (error) {
  //       next(error);
  //     }
  //   }
  // );

  // Аналогичные роуты для EMS временно отключены до появления таблиц в схеме

  return router;
}

// Оставляем экспорт по умолчанию для обратной совместимости
export default createCharacterRoutes;