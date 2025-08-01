import express from 'express';
import { z } from 'zod';
import { characterServiceUpdated } from '../services/CharacterServiceUpdated.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// ===== ZOD СХЕМЫ ДЛЯ ВАЛИДАЦИИ =====

const createCharacterSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().optional(),
  ethnicity: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  hairColor: z.string().optional(),
  eyeColor: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  postal: z.string().optional(),
  occupation: z.string().optional(),
  mugshotUrl: z.string().optional(),
  licenses: z.any().optional(),
  medicalInfo: z.any().optional(),
  flags: z.array(z.string()).optional(),
  addressFlags: z.array(z.string()).optional(),
  dead: z.boolean().optional(),
  missing: z.boolean().optional(),
  arrested: z.boolean().optional(),
  isUnit: z.boolean().optional(),
  badgeNumber: z.string().optional(),
  callsign: z.string().optional(),
  callsign2: z.string().optional(),
  departmentId: z.number().optional(),
  divisionId: z.number().optional(),
  rankId: z.number().optional(),
  hireDate: z.string().optional(),
  terminationDate: z.string().optional(),
  isActive: z.boolean().optional(),
  suspended: z.boolean().optional(),
  whitelistStatus: z.string().optional(),
  radioChannelId: z.string().optional()
});

const updateCharacterSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required').optional(),
  gender: z.string().optional(),
  ethnicity: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  hairColor: z.string().optional(),
  eyeColor: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  postal: z.string().optional(),
  occupation: z.string().optional(),
  mugshotUrl: z.string().optional(),
  licenses: z.any().optional(),
  medicalInfo: z.any().optional(),
  flags: z.array(z.string()).optional(),
  addressFlags: z.array(z.string()).optional(),
  dead: z.boolean().optional(),
  missing: z.boolean().optional(),
  arrested: z.boolean().optional(),
  isUnit: z.boolean().optional(),
  badgeNumber: z.string().optional(),
  callsign: z.string().optional(),
  callsign2: z.string().optional(),
  departmentId: z.number().optional(),
  divisionId: z.number().optional(),
  rankId: z.number().optional(),
  hireDate: z.string().optional(),
  terminationDate: z.string().optional(),
  isActive: z.boolean().optional(),
  suspended: z.boolean().optional(),
  whitelistStatus: z.string().optional(),
  radioChannelId: z.string().optional()
});

const searchParamsSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  limit: z.number().min(1).max(100).optional().default(10)
});

const filterParamsSchema = z.object({
  ownerId: z.string().optional(),
  gender: z.string().optional(),
  occupation: z.string().optional(),
  departmentId: z.number().optional(),
  isUnit: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0)
});

// ===== API ЭНДПОИНТЫ =====

// GET /api/cad/citizens - Получить всех персонажей
router.get('/citizens', authenticateToken, async (req, res) => {
  try {
    const characters = await characterServiceUpdated.getAllCharacters();
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

// GET /api/cad/citizens/my - Получить персонажей текущего пользователя
router.get('/citizens/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const characters = await characterServiceUpdated.getCharactersByOwner(userId);
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

// POST /api/cad/citizens - Создать нового персонажа
router.post('/citizens', authenticateToken, async (req, res) => {
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
    const dataValidation = await characterServiceUpdated.validateCharacterData(characterData);
    if (!dataValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Data validation failed',
        details: dataValidation.errors
      });
    }

    const newCharacter = await characterServiceUpdated.createCharacter(userId, characterData);
    
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

// GET /api/cad/citizens/:id - Получить персонажа по ID
router.get('/citizens/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const character = await characterServiceUpdated.getCharacter(id);
    
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

// PUT /api/cad/citizens/:id - Обновить персонажа
router.put('/citizens/:id', authenticateToken, async (req, res) => {
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
    const updatedCharacter = await characterServiceUpdated.updateCharacter(id, userId, updateData);
    
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

// DELETE /api/cad/citizens/:id - Удалить персонажа
router.delete('/citizens/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const deleted = await characterServiceUpdated.deleteCharacter(id, userId);
    
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

// GET /api/cad/citizens/search/:query - Поиск персонажей
router.get('/citizens/search/:query', authenticateToken, async (req, res) => {
  try {
    const { query } = req.params;
    const { limit } = searchParamsSchema.parse({
      query,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    });

    const characters = await characterServiceUpdated.searchCharacters(query, limit);
    
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

// GET /api/cad/citizens/filter - Фильтрация персонажей
router.get('/citizens/filter', authenticateToken, async (req, res) => {
  try {
    const filters = filterParamsSchema.parse({
      ownerId: req.query.ownerId as string,
      gender: req.query.gender as string,
      occupation: req.query.occupation as string,
      departmentId: req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined,
      isUnit: req.query.isUnit ? req.query.isUnit === 'true' : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    });

    const characters = await characterServiceUpdated.getCharactersWithFilters(filters);
    
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

// GET /api/cad/citizens/:id/legacy - Получить персонажа в старом формате (для обратной совместимости)
router.get('/citizens/:id/legacy', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const character = await characterServiceUpdated.getCharacterLegacyFormat(id);
    
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

// GET /api/cad/citizens/:id/full-name - Получить полное имя персонажа
router.get('/citizens/:id/full-name', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const fullName = await characterServiceUpdated.getCharacterFullName(id);
    
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

// GET /api/cad/citizens/:id/age - Получить возраст персонажа
router.get('/citizens/:id/age', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const age = await characterServiceUpdated.getCharacterAge(id);
    
    if (age === undefined) {
      return res.status(404).json({
        success: false,
        error: 'Character not found or age cannot be calculated'
      });
    }

    const isAdult = await characterServiceUpdated.isCharacterAdult(id);

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

// GET /api/cad/stats - Получить статистику
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalCharacters = await characterServiceUpdated.getCharacterCount();
    const userCharacters = req.user?.id ? 
      await characterServiceUpdated.getCharacterCountByOwner(req.user.id) : 0;

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

// ===== ДЕПАРТАМЕНТЫ (ОСТАВЛЯЕМ СУЩЕСТВУЮЩИЕ) =====

// GET /api/cad/departments - Получить все департаменты
router.get('/departments', authenticateToken, async (req, res) => {
  try {
    // Здесь можно добавить логику для получения департаментов
    const departments = [
      { id: 1, name: 'LSPD', code: 'LSPD', modules: [] },
      { id: 2, name: 'BCSO', code: 'BCSO', modules: [] },
      { id: 3, name: 'LSFD', code: 'LSFD', modules: [] },
      { id: 4, name: 'SAMS', code: 'SAMS', modules: [] }
    ];

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Error getting departments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get departments'
    });
  }
});

export default router; 