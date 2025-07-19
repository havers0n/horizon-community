import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { 
  characters, vehicles, weapons, pets, records, call911, activeUnits, callAttachments,
  createCharacterSchema, updateCharacterSchema, createVehicleSchema, createWeaponSchema,
  createCall911Schema, goOnDutySchema, updateUnitStatusSchema
} from '../../shared/schema.js';
import { eq, and, or, like, desc, asc } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { nanoid } from 'nanoid';

const router = Router();

// Middleware для проверки CAD токена (для игровой интеграции)
const authenticateCadToken = async (req: any, res: any, next: any) => {
  const token = req.headers['x-cad-token'] || req.query.token;
  
  if (!token) {
    return res.status(401).json({ error: 'CAD token required' });
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(db.query.users.cadToken, token)
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid CAD token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// ===== ПЕРСОНАЖИ =====

// Создать нового персонажа
router.post('/characters', authenticateToken, async (req, res) => {
  try {
    const validatedData = createCharacterSchema.parse(req.body);
    
    // Генерируем уникальный номер страховки
    const insuranceNumber = await db.execute(
      'SELECT generate_insurance_number() as insurance_number'
    );
    
    const newCharacter = await db.insert(characters).values({
      ownerId: req.user.id,
      insuranceNumber: insuranceNumber[0].insurance_number,
      ...validatedData
    }).returning();

    res.status(201).json(newCharacter[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create character' });
  }
});

// Получить список персонажей пользователя
router.get('/characters', authenticateToken, async (req, res) => {
  try {
    const userCharacters = await db.query.characters.findMany({
      where: eq(characters.ownerId, req.user.id),
      orderBy: [desc(characters.createdAt)]
    });

    res.json(userCharacters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

// Получить персонажа по ID
router.get('/characters/:id', authenticateToken, async (req, res) => {
  try {
    const character = await db.query.characters.findFirst({
      where: and(
        eq(characters.id, parseInt(req.params.id)),
        eq(characters.ownerId, req.user.id)
      ),
      with: {
        vehicles: true,
        weapons: true,
        pets: true,
        records: {
          with: {
            officer: true
          }
        }
      }
    });

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    res.json(character);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch character' });
  }
});

// Обновить персонажа
router.put('/characters/:id', authenticateToken, async (req, res) => {
  try {
    const validatedData = updateCharacterSchema.parse(req.body);
    
    const updatedCharacter = await db.update(characters)
      .set(validatedData)
      .where(and(
        eq(characters.id, parseInt(req.params.id)),
        eq(characters.ownerId, req.user.id)
      ))
      .returning();

    if (updatedCharacter.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }

    res.json(updatedCharacter[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to update character' });
  }
});

// Поиск персонажей (для LEO/EMS)
router.get('/characters/search/:query', authenticateToken, async (req, res) => {
  try {
    const query = req.params.query;
    
    const searchResults = await db.query.characters.findMany({
      where: or(
        like(characters.firstName, `%${query}%`),
        like(characters.lastName, `%${query}%`),
        like(characters.insuranceNumber, `%${query}%`)
      ),
      limit: 20
    });

    res.json(searchResults);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// ===== ТРАНСПОРТНЫЕ СРЕДСТВА =====

// Создать транспортное средство
router.post('/vehicles', authenticateToken, async (req, res) => {
  try {
    const validatedData = createVehicleSchema.parse(req.body);
    
    // Проверяем, что персонаж принадлежит пользователю
    const character = await db.query.characters.findFirst({
      where: and(
        eq(characters.id, validatedData.ownerId),
        eq(characters.ownerId, req.user.id)
      )
    });

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Генерируем уникальный VIN
    const vin = await db.execute('SELECT generate_vin() as vin');
    
    const newVehicle = await db.insert(vehicles).values({
      ...validatedData,
      vin: vin[0].vin
    }).returning();

    res.status(201).json(newVehicle[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

// Поиск ТС по номеру
router.get('/vehicles/plate/:plate', authenticateToken, async (req, res) => {
  try {
    const vehicle = await db.query.vehicles.findFirst({
      where: eq(vehicles.plate, req.params.plate.toUpperCase()),
      with: {
        owner: true
      }
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// ===== ОРУЖИЕ =====

// Создать оружие
router.post('/weapons', authenticateToken, async (req, res) => {
  try {
    const validatedData = createWeaponSchema.parse(req.body);
    
    // Проверяем, что персонаж принадлежит пользователю
    const character = await db.query.characters.findFirst({
      where: and(
        eq(characters.id, validatedData.ownerId),
        eq(characters.ownerId, req.user.id)
      )
    });

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Генерируем уникальный серийный номер
    const serialNumber = await db.execute('SELECT generate_weapon_serial() as serial_number');
    
    const newWeapon = await db.insert(weapons).values({
      ...validatedData,
      serialNumber: serialNumber[0].serial_number
    }).returning();

    res.status(201).json(newWeapon[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create weapon' });
  }
});

// Поиск оружия по серийному номеру
router.get('/weapons/serial/:serial', authenticateToken, async (req, res) => {
  try {
    const weapon = await db.query.weapons.findFirst({
      where: eq(weapons.serialNumber, req.params.serial.toUpperCase()),
      with: {
        owner: true
      }
    });

    if (!weapon) {
      return res.status(404).json({ error: 'Weapon not found' });
    }

    res.json(weapon);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// ===== АКТИВНЫЕ ЮНИТЫ =====

// Выйти на смену
router.post('/onduty', authenticateToken, async (req, res) => {
  try {
    const validatedData = goOnDutySchema.parse(req.body);
    
    // Проверяем, что персонаж принадлежит пользователю
    const character = await db.query.characters.findFirst({
      where: and(
        eq(characters.id, validatedData.characterId),
        eq(characters.ownerId, req.user.id)
      )
    });

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Проверяем, что персонаж уже не на смене
    const existingUnit = await db.query.activeUnits.findFirst({
      where: eq(activeUnits.characterId, validatedData.characterId)
    });

    if (existingUnit) {
      return res.status(400).json({ error: 'Character is already on duty' });
    }

    // Получаем информацию о департаменте для генерации позывного
    const department = await db.query.departments.findFirst({
      where: eq(db.query.departments.id, validatedData.departmentId)
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Генерируем позывной
    const callsign = await db.execute(
      'SELECT generate_callsign($1) as callsign',
      [department.name]
    );

    const newUnit = await db.insert(activeUnits).values({
      characterId: validatedData.characterId,
      callsign: callsign[0].callsign,
      location: { x: 0, y: 0, z: 0 },
      partnerId: validatedData.partnerId,
      vehicleId: validatedData.vehicleId,
      departmentId: validatedData.departmentId
    }).returning();

    res.status(201).json(newUnit[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to go on duty' });
  }
});

// Изменить статус юнита
router.put('/status', authenticateToken, async (req, res) => {
  try {
    const validatedData = updateUnitStatusSchema.parse(req.body);
    
    const updatedUnit = await db.update(activeUnits)
      .set({
        status: validatedData.status,
        location: validatedData.location,
        lastUpdate: new Date()
      })
      .where(eq(activeUnits.characterId, req.user.id))
      .returning();

    if (updatedUnit.length === 0) {
      return res.status(404).json({ error: 'Active unit not found' });
    }

    res.json(updatedUnit[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Закончить смену
router.post('/offduty', authenticateToken, async (req, res) => {
  try {
    const deletedUnit = await db.delete(activeUnits)
      .where(eq(activeUnits.characterId, req.user.id))
      .returning();

    if (deletedUnit.length === 0) {
      return res.status(404).json({ error: 'Active unit not found' });
    }

    res.json({ message: 'Successfully went off duty' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to go off duty' });
  }
});

// Получить список активных юнитов
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const activeUnitsList = await db.query.activeUnits.findMany({
      with: {
        character: true,
        vehicle: true,
        department: true
      },
      orderBy: [asc(activeUnits.callsign)]
    });

    res.json(activeUnitsList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active units' });
  }
});

// Активировать кнопку паники
router.post('/panic', authenticateToken, async (req, res) => {
  try {
    const updatedUnit = await db.update(activeUnits)
      .set({ isPanic: true, lastUpdate: new Date() })
      .where(eq(activeUnits.characterId, req.user.id))
      .returning();

    if (updatedUnit.length === 0) {
      return res.status(404).json({ error: 'Active unit not found' });
    }

    res.json(updatedUnit[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to activate panic button' });
  }
});

// ===== ВЫЗОВЫ 911 =====

// Создать вызов 911
router.post('/calls', authenticateToken, async (req, res) => {
  try {
    const validatedData = createCall911Schema.parse(req.body);
    
    const newCall = await db.insert(call911).values(validatedData).returning();

    res.status(201).json(newCall[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create call' });
  }
});

// Получить список вызовов
router.get('/calls', authenticateToken, async (req, res) => {
  try {
    const status = req.query.status as string;
    const type = req.query.type as string;
    
    let whereClause = undefined;
    
    if (status) {
      whereClause = eq(call911.status, status);
    }
    
    if (type) {
      whereClause = whereClause 
        ? and(whereClause, eq(call911.type, type))
        : eq(call911.type, type);
    }

    const calls = await db.query.call911.findMany({
      where: whereClause,
      with: {
        attachments: {
          with: {
            unit: {
              with: {
                character: true
              }
            }
          }
        }
      },
      orderBy: [desc(call911.createdAt)]
    });

    res.json(calls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calls' });
  }
});

// Прикрепить юнит к вызову
router.put('/calls/:id/attach', authenticateToken, async (req, res) => {
  try {
    const callId = parseInt(req.params.id);
    const { unitId } = req.body;

    if (!unitId) {
      return res.status(400).json({ error: 'Unit ID required' });
    }

    // Проверяем, что юнит существует и активен
    const unit = await db.query.activeUnits.findFirst({
      where: eq(activeUnits.id, unitId)
    });

    if (!unit) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    // Проверяем, что юнит еще не прикреплен к этому вызову
    const existingAttachment = await db.query.callAttachments.findFirst({
      where: and(
        eq(callAttachments.callId, callId),
        eq(callAttachments.unitId, unitId)
      )
    });

    if (existingAttachment) {
      return res.status(400).json({ error: 'Unit already attached to this call' });
    }

    const newAttachment = await db.insert(callAttachments).values({
      callId,
      unitId
    }).returning();

    res.json(newAttachment[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to attach unit' });
  }
});

// Изменить статус вызова
router.put('/calls/:id/status', authenticateToken, async (req, res) => {
  try {
    const callId = parseInt(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

    const updatedCall = await db.update(call911)
      .set({ status, updatedAt: new Date() })
      .where(eq(call911.id, callId))
      .returning();

    if (updatedCall.length === 0) {
      return res.status(404).json({ error: 'Call not found' });
    }

    res.json(updatedCall[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update call status' });
  }
});

// ===== ОТЧЕТЫ =====

// Создать отчет (арест, штраф)
router.post('/records', authenticateToken, async (req, res) => {
  try {
    const { characterId, type, charges, description, date } = req.body;

    if (!characterId || !type || !charges || !description || !date) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // Получаем активный юнит пользователя
    const activeUnit = await db.query.activeUnits.findFirst({
      where: eq(activeUnits.characterId, req.user.id),
      with: {
        character: true
      }
    });

    if (!activeUnit) {
      return res.status(400).json({ error: 'Must be on duty to create records' });
    }

    const newRecord = await db.insert(records).values({
      characterId,
      officerId: activeUnit.character.id,
      type,
      charges,
      description,
      date: new Date(date)
    }).returning();

    res.status(201).json(newRecord[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// ===== ИГРОВАЯ ИНТЕГРАЦИЯ =====

// Генерация CAD токена для пользователя
router.post('/generate-token', authenticateToken, async (req, res) => {
  try {
    const token = nanoid(32);
    
    await db.update(db.query.users)
      .set({ cadToken: token })
      .where(eq(db.query.users.id, req.user.id));

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Получить данные пользователя по CAD токену
router.get('/me', authenticateCadToken, async (req, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(db.query.users.id, req.user.id),
      with: {
        characters: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

export default router; 