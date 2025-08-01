import express from 'express';
import { z } from 'zod';
import { normalizedCharacterService } from '../services/NormalizedCharacterService.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// ===== ZOD СХЕМЫ ДЛЯ ВАЛИДАЦИИ =====

// Схема для создания персонажа
const createCharacterSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  occupation: z.string().optional(),
  photoUrl: z.string().optional(),
  ssn: z.string().optional(),
  licenses: z.any().optional(),
  medicalInfo: z.any().optional(),
  flags: z.array(z.string()).optional(),
  addressFlags: z.array(z.string()).optional()
});

// Схема для обновления персонажа
const updateCharacterSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required').optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  occupation: z.string().optional(),
  photoUrl: z.string().optional(),
  ssn: z.string().optional(),
  licenses: z.any().optional(),
  medicalInfo: z.any().optional(),
  flags: z.array(z.string()).optional(),
  addressFlags: z.array(z.string()).optional()
});

// Схема для создания профиля LEO
const createLeoProfileSchema = z.object({
  characterId: z.string().min(1, 'Character ID is required'),
  badgeNumber: z.string().optional(),
  rankId: z.number().optional(),
  divisionId: z.number().optional(),
  departmentId: z.number().optional(),
  callsign: z.string().optional(),
  callsign2: z.string().optional(),
  status: z.string().optional(),
  hireDate: z.string().optional(),
  terminationDate: z.string().optional(),
  isActive: z.boolean().optional(),
  suspended: z.boolean().optional(),
  whitelistStatus: z.string().optional(),
  radioChannelId: z.string().optional()
});

// Схема для обновления профиля LEO
const updateLeoProfileSchema = z.object({
  badgeNumber: z.string().optional(),
  rankId: z.number().optional(),
  divisionId: z.number().optional(),
  departmentId: z.number().optional(),
  callsign: z.string().optional(),
  callsign2: z.string().optional(),
  status: z.string().optional(),
  hireDate: z.string().optional(),
  terminationDate: z.string().optional(),
  isActive: z.boolean().optional(),
  suspended: z.boolean().optional(),
  whitelistStatus: z.string().optional(),
  radioChannelId: z.string().optional()
});

// Схема для создания профиля EMS
const createEmsProfileSchema = z.object({
  characterId: z.string().min(1, 'Character ID is required'),
  badgeNumber: z.string().optional(),
  rankId: z.number().optional(),
  divisionId: z.number().optional(),
  departmentId: z.number().optional(),
  callsign: z.string().optional(),
  callsign2: z.string().optional(),
  status: z.string().optional(),
  hireDate: z.string().optional(),
  terminationDate: z.string().optional(),
  isActive: z.boolean().optional(),
  suspended: z.boolean().optional(),
  whitelistStatus: z.string().optional(),
  radioChannelId: z.string().optional()
});

// Схема для обновления профиля EMS
const updateEmsProfileSchema = z.object({
  badgeNumber: z.string().optional(),
  rankId: z.number().optional(),
  divisionId: z.number().optional(),
  departmentId: z.number().optional(),
  callsign: z.string().optional(),
  callsign2: z.string().optional(),
  status: z.string().optional(),
  hireDate: z.string().optional(),
  terminationDate: z.string().optional(),
  isActive: z.boolean().optional(),
  suspended: z.boolean().optional(),
  whitelistStatus: z.string().optional(),
  radioChannelId: z.string().optional()
});

// Схема для создания профиля FIRE
const createFireProfileSchema = z.object({
  characterId: z.string().min(1, 'Character ID is required'),
  badgeNumber: z.string().optional(),
  rankId: z.number().optional(),
  divisionId: z.number().optional(),
  departmentId: z.number().optional(),
  callsign: z.string().optional(),
  callsign2: z.string().optional(),
  status: z.string().optional(),
  hireDate: z.string().optional(),
  terminationDate: z.string().optional(),
  isActive: z.boolean().optional(),
  suspended: z.boolean().optional(),
  whitelistStatus: z.string().optional(),
  radioChannelId: z.string().optional()
});

// Схема для обновления профиля FIRE
const updateFireProfileSchema = z.object({
  badgeNumber: z.string().optional(),
  rankId: z.number().optional(),
  divisionId: z.number().optional(),
  departmentId: z.number().optional(),
  callsign: z.string().optional(),
  callsign2: z.string().optional(),
  status: z.string().optional(),
  hireDate: z.string().optional(),
  terminationDate: z.string().optional(),
  isActive: z.boolean().optional(),
  suspended: z.boolean().optional(),
  whitelistStatus: z.string().optional(),
  radioChannelId: z.string().optional()
});

// Схема для поиска
const searchParamsSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  limit: z.number().min(1).max(100).optional().default(10)
});

// Схема для фильтров
const filterParamsSchema = z.object({
  ownerId: z.string().optional(),
  gender: z.string().optional(),
  occupation: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0)
});

// ===== API ЭНДПОИНТЫ ДЛЯ ПЕРСОНАЖЕЙ =====

// GET /api/characters - Получить всех персонажей
router.get('/', authenticateToken, async (req, res) => {
  try {
    const characters = await normalizedCharacterService.getAllCharacters();
    res.json({
      success: true,
      data: characters,
      total: characters.length
    });
  } catch (error) {
    console.error('Error getting all characters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get characters'
    });
  }
});

// GET /api/characters/my - Получить персонажей текущего пользователя
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const characters = await normalizedCharacterService.getCharactersByOwner(userId);
    res.json({
      success: true,
      data: characters,
      total: characters.length
    });
  } catch (error) {
    console.error('Error getting user characters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user characters'
    });
  }
});

// POST /api/characters - Создать нового персонажа
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Валидация входных данных
    const validationResult = createCharacterSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const characterData = validationResult.data;

    // Дополнительная валидация данных
    const dataValidation = await normalizedCharacterService.validateCharacterData(characterData);
    if (!dataValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Data validation failed',
        details: dataValidation.errors
      });
    }

    const newCharacter = await normalizedCharacterService.createCharacter(userId, characterData);
    
    res.status(201).json({
      success: true,
      data: newCharacter,
      message: 'Character created successfully'
    });
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create character'
    });
  }
});

// GET /api/characters/:id - Получить персонажа по ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const character = await normalizedCharacterService.getCharacter(id);
    
    if (!character) {
      return res.status(404).json({
        success: false,
        error: 'Character not found'
      });
    }

    res.json({
      success: true,
      data: character
    });
  } catch (error) {
    console.error('Error getting character:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get character'
    });
  }
});

// GET /api/characters/:id/full - Получить полную информацию о персонаже с профилями
router.get('/:id/full', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const fullCharacter = await normalizedCharacterService.getFullCharacter(id);
    
    if (!fullCharacter) {
      return res.status(404).json({
        success: false,
        error: 'Character not found'
      });
    }

    res.json({
      success: true,
      data: fullCharacter
    });
  } catch (error) {
    console.error('Error getting full character:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get full character'
    });
  }
});

// PUT /api/characters/:id - Обновить персонажа
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Валидация входных данных
    const validationResult = updateCharacterSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const updateData = validationResult.data;
    const updatedCharacter = await normalizedCharacterService.updateCharacter(id, userId, updateData);
    
    if (!updatedCharacter) {
      return res.status(404).json({
        success: false,
        error: 'Character not found or access denied'
      });
    }

    res.json({
      success: true,
      data: updatedCharacter,
      message: 'Character updated successfully'
    });
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update character'
    });
  }
});

// DELETE /api/characters/:id - Удалить персонажа
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const deleted = await normalizedCharacterService.deleteCharacter(id, userId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Character not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Character deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete character'
    });
  }
});

// GET /api/characters/search/:query - Поиск персонажей
router.get('/search/:query', authenticateToken, async (req, res) => {
  try {
    const { query } = req.params;
    const { limit } = searchParamsSchema.parse({
      query,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    });

    const characters = await normalizedCharacterService.searchCharacters(query, limit);
    
    res.json({
      success: true,
      data: characters,
      total: characters.length,
      query
    });
  } catch (error) {
    console.error('Error searching characters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search characters'
    });
  }
});

// GET /api/characters/filter - Фильтрация персонажей
router.get('/filter', authenticateToken, async (req, res) => {
  try {
    const filters = filterParamsSchema.parse({
      ownerId: req.query.ownerId as string,
      gender: req.query.gender as string,
      occupation: req.query.occupation as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    });

    const characters = await normalizedCharacterService.getCharactersWithFilters(filters);
    
    res.json({
      success: true,
      data: characters,
      total: characters.length,
      filters
    });
  } catch (error) {
    console.error('Error filtering characters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to filter characters'
    });
  }
});

// GET /api/characters/:id/legacy - Получить персонажа в старом формате (для обратной совместимости)
router.get('/:id/legacy', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const character = await normalizedCharacterService.getCharacterLegacyFormat(id);
    
    if (!character) {
      return res.status(404).json({
        success: false,
        error: 'Character not found'
      });
    }

    res.json({
      success: true,
      data: character
    });
  } catch (error) {
    console.error('Error getting character in legacy format:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get character in legacy format'
    });
  }
});

// GET /api/characters/:id/full-name - Получить полное имя персонажа
router.get('/:id/full-name', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const fullName = await normalizedCharacterService.getCharacterFullName(id);
    
    if (!fullName) {
      return res.status(404).json({
        success: false,
        error: 'Character not found'
      });
    }

    res.json({
      success: true,
      data: { fullName }
    });
  } catch (error) {
    console.error('Error getting character full name:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get character full name'
    });
  }
});

// GET /api/characters/:id/age - Получить возраст персонажа
router.get('/:id/age', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const age = await normalizedCharacterService.getCharacterAge(id);
    
    if (age === undefined) {
      return res.status(404).json({
        success: false,
        error: 'Character not found or age cannot be calculated'
      });
    }

    const isAdult = await normalizedCharacterService.isCharacterAdult(id);

    res.json({
      success: true,
      data: { age, isAdult }
    });
  } catch (error) {
    console.error('Error getting character age:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get character age'
    });
  }
});

// ===== API ЭНДПОИНТЫ ДЛЯ ПРОФИЛЕЙ LEO =====

// GET /api/characters/:id/leo-profile - Получить профиль LEO персонажа
router.get('/:id/leo-profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const profile = await normalizedCharacterService.getLeoProfileByCharacterId(id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'LEO profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error getting LEO profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get LEO profile'
    });
  }
});

// POST /api/characters/:id/leo-profile - Создать профиль LEO для персонажа
router.post('/:id/leo-profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    
    // Валидация входных данных
    const validationResult = createLeoProfileSchema.safeParse({
      characterId: id,
      ...req.body
    });
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const profileData = validationResult.data;
    const newProfile = await normalizedCharacterService.createLeoProfile(profileData);
    
    res.status(201).json({
      success: true,
      data: newProfile,
      message: 'LEO profile created successfully'
    });
  } catch (error) {
    console.error('Error creating LEO profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create LEO profile'
    });
  }
});

// PUT /api/characters/:id/leo-profile - Обновить профиль LEO персонажа
router.put('/:id/leo-profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    
    // Валидация входных данных
    const validationResult = updateLeoProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const updateData = validationResult.data;
    const updatedProfile = await normalizedCharacterService.updateLeoProfile(id, updateData);
    
    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        error: 'LEO profile not found'
      });
    }

    res.json({
      success: true,
      data: updatedProfile,
      message: 'LEO profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating LEO profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update LEO profile'
    });
  }
});

// DELETE /api/characters/:id/leo-profile - Удалить профиль LEO персонажа
router.delete('/:id/leo-profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const deleted = await normalizedCharacterService.deleteLeoProfile(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'LEO profile not found'
      });
    }

    res.json({
      success: true,
      message: 'LEO profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting LEO profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete LEO profile'
    });
  }
});

// ===== API ЭНДПОИНТЫ ДЛЯ ПРОФИЛЕЙ EMS =====

// GET /api/characters/:id/ems-profile - Получить профиль EMS персонажа
router.get('/:id/ems-profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const profile = await normalizedCharacterService.getEmsProfileByCharacterId(id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'EMS profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error getting EMS profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get EMS profile'
    });
  }
});

// POST /api/characters/:id/ems-profile - Создать профиль EMS для персонажа
router.post('/:id/ems-profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    
    // Валидация входных данных
    const validationResult = createEmsProfileSchema.safeParse({
      characterId: id,
      ...req.body
    });
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const profileData = validationResult.data;
    const newProfile = await normalizedCharacterService.createEmsProfile(profileData);
    
    res.status(201).json({
      success: true,
      data: newProfile,
      message: 'EMS profile created successfully'
    });
  } catch (error) {
    console.error('Error creating EMS profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create EMS profile'
    });
  }
});

// PUT /api/characters/:id/ems-profile - Обновить профиль EMS персонажа
router.put('/:id/ems-profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    
    // Валидация входных данных
    const validationResult = updateEmsProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const updateData = validationResult.data;
    const updatedProfile = await normalizedCharacterService.updateEmsProfile(id, updateData);
    
    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        error: 'EMS profile not found'
      });
    }

    res.json({
      success: true,
      data: updatedProfile,
      message: 'EMS profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating EMS profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update EMS profile'
    });
  }
});

// DELETE /api/characters/:id/ems-profile - Удалить профиль EMS персонажа
router.delete('/:id/ems-profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const deleted = await normalizedCharacterService.deleteEmsProfile(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'EMS profile not found'
      });
    }

    res.json({
      success: true,
      message: 'EMS profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting EMS profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete EMS profile'
    });
  }
});

// ===== API ЭНДПОИНТЫ ДЛЯ ПРОФИЛЕЙ FIRE =====

// GET /api/characters/:id/fire-profile - Получить профиль FIRE персонажа
router.get('/:id/fire-profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const profile = await normalizedCharacterService.getFireProfileByCharacterId(id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'FIRE profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error getting FIRE profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get FIRE profile'
    });
  }
});

// POST /api/characters/:id/fire-profile - Создать профиль FIRE для персонажа
router.post('/:id/fire-profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    
    // Валидация входных данных
    const validationResult = createFireProfileSchema.safeParse({
      characterId: id,
      ...req.body
    });
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const profileData = validationResult.data;
    const newProfile = await normalizedCharacterService.createFireProfile(profileData);
    
    res.status(201).json({
      success: true,
      data: newProfile,
      message: 'FIRE profile created successfully'
    });
  } catch (error) {
    console.error('Error creating FIRE profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create FIRE profile'
    });
  }
});

// PUT /api/characters/:id/fire-profile - Обновить профиль FIRE персонажа
router.put('/:id/fire-profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    
    // Валидация входных данных
    const validationResult = updateFireProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const updateData = validationResult.data;
    const updatedProfile = await normalizedCharacterService.updateFireProfile(id, updateData);
    
    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        error: 'FIRE profile not found'
      });
    }

    res.json({
      success: true,
      data: updatedProfile,
      message: 'FIRE profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating FIRE profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update FIRE profile'
    });
  }
});

// DELETE /api/characters/:id/fire-profile - Удалить профиль FIRE персонажа
router.delete('/:id/fire-profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const deleted = await normalizedCharacterService.deleteFireProfile(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'FIRE profile not found'
      });
    }

    res.json({
      success: true,
      message: 'FIRE profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting FIRE profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete FIRE profile'
    });
  }
});

// ===== СТАТИСТИКА =====

// GET /api/characters/stats - Получить статистику
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalCharacters = await normalizedCharacterService.getCharacterCount();
    const userCharacters = req.user?.id ? 
      await normalizedCharacterService.getCharacterCountByOwner(req.user.id) : 0;

    res.json({
      success: true,
      data: {
        totalCharacters,
        userCharacters,
        globalStats: {
          totalCharacters
        }
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stats'
    });
  }
});

export default router; 