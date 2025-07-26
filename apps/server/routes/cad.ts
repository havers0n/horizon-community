import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { characterService } from '../services/CharacterService.js';
import { userService } from '../services/UserService.js';

const router: import('express').Router = Router();

// Middleware для проверки CAD токена (для игровой интеграции)
const authenticateCadToken = async (req: any, res: any, next: any) => {
  const token = req.headers['x-cad-token'] || req.query.token;
  if (!token) {
    return res.status(401).json({ error: 'CAD token required' });
  }
  try {
    // Используем новый сервис для поиска пользователя по CAD токену
    const user = await userService.getUserByCadToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid CAD token' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Интерфейс пользователя (User)
 */
interface User {
  id: number;
  email: string;
  passwordHash: string;
  siteRole: string;
  discordId?: string;
  apiToken?: string;
  cadToken?: string;
}

/**
 * Интерфейс персонажа (Character)
 */
interface Character {
  id: number;
  ownerId: number;
  firstName: string;
  lastName: string;
  departmentId: number;
  rank?: string;
  status: string;
  insuranceNumber?: string;
  address?: string;
  createdAt: Date;
}

// ===== ПЕРСОНАЖИ =====

// Создать нового персонажа
router.post('/characters', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Простая валидация данных
    const { firstName, lastName, departmentId, rank, status, insuranceNumber, address } = req.body;
    
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }
    
    // Используем новый сервис для создания персонажа
    const newCharacter = await characterService.createCharacter(req.user.id, {
      firstName,
      lastName,
      departmentId: departmentId || 1,
      rank,
      status: status || 'active',
      insuranceNumber,
      address
    });
    
    res.status(201).json(newCharacter);
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
});

// Получить список персонажей пользователя
router.get('/characters', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Используем новый сервис для получения персонажей
    const userCharacters = await characterService.getCharactersByOwner(req.user.id);
    res.json(userCharacters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

// Получить персонажа по ID
router.get('/characters/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const characterId = parseInt(req.params.id);
    if (isNaN(characterId)) {
      return res.status(400).json({ error: 'Invalid character ID' });
    }
    
    // Используем новый сервис для получения персонажа
    const character = await characterService.getCharacterById(characterId, req.user.id);
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ error: 'Failed to fetch character' });
  }
});

// Обновить персонажа
router.put('/characters/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const characterId = parseInt(req.params.id);
    if (isNaN(characterId)) {
      return res.status(400).json({ error: 'Invalid character ID' });
    }
    
    const { firstName, lastName, departmentId, rank, status, insuranceNumber, address } = req.body;
    
    // Используем новый сервис для обновления персонажа
    const updatedCharacter = await characterService.updateCharacter(characterId, req.user.id, {
      firstName,
      lastName,
      departmentId,
      rank,
      status,
      insuranceNumber,
      address
    });
    
    res.json(updatedCharacter);
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ error: 'Failed to update character' });
  }
});

// Удалить персонажа
router.delete('/characters/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const characterId = parseInt(req.params.id);
    if (isNaN(characterId)) {
      return res.status(400).json({ error: 'Invalid character ID' });
    }
    
    // Используем новый сервис для удаления персонажа
    const deleted = await characterService.deleteCharacter(characterId, req.user.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
});

// Поиск персонажей
router.get('/characters/search/:query', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const query = req.params.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Используем новый сервис для поиска персонажей
    const characters = await characterService.searchCharacters(query, req.user.id);
    res.json(characters);
  } catch (error) {
    console.error('Error searching characters:', error);
    res.status(500).json({ error: 'Failed to search characters' });
  }
});

// Получить статистику персонажей
router.get('/characters/stats', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Используем новый сервис для получения статистики
    const stats = await characterService.getCharacterStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching character stats:', error);
    res.status(500).json({ error: 'Failed to fetch character stats' });
  }
});

// ===== ДЕПАРТАМЕНТЫ =====

// Получить все департаменты
router.get('/departments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departments ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Получить департамент по ID
router.get('/departments/:id', async (req, res) => {
  try {
    const departmentId = parseInt(req.params.id);
    if (isNaN(departmentId)) {
      return res.status(400).json({ error: 'Invalid department ID' });
    }
    
    const result = await pool.query('SELECT * FROM departments WHERE id = $1', [departmentId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
});

export default router; 