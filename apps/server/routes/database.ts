import { Router } from 'express';
import { z } from 'zod';
import { Request, Response } from 'express';
import { authenticateAny, requireActiveStatus, requirePermission } from '../middleware/auth.middleware.js';
import { databaseService } from '../services/DatabaseService.js';
import type { CitizenFilters, VehicleFilters, WeaponFilters, ReportFilters, CallFilters, UnitFilters } from '../services/DatabaseService.js';

const router: import('express').Router = Router();

// ===== СХЕМЫ ВАЛИДАЦИИ =====

const citizenFiltersSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  insuranceNumber: z.string().optional(),
  type: z.string().optional(),
  departmentId: z.number().optional(),
  isUnit: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
});

const vehicleFiltersSchema = z.object({
  plate: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  ownerId: z.number().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
});

const weaponFiltersSchema = z.object({
  serialNumber: z.string().optional(),
  type: z.string().optional(),
  ownerId: z.number().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
});

const reportFiltersSchema = z.object({
  authorId: z.number().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
});

const callFiltersSchema = z.object({
  type: z.string().optional(),
  status: z.string().optional(),
  priority: z.number().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
});

const unitFiltersSchema = z.object({
  departmentId: z.number().optional(),
  status: z.string().optional(),
  isActive: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
});

const createCitizenSchema = z.object({
  ownerId: z.number(),
  type: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dob: z.string(),
  address: z.string().min(1),
  insuranceNumber: z.string().min(1),
  licenses: z.record(z.any()).optional(),
  medicalInfo: z.record(z.any()).optional(),
  mugshotUrl: z.string().optional(),
  isUnit: z.boolean().optional(),
  unitInfo: z.record(z.any()).optional(),
  departmentId: z.number().optional(),
  rankId: z.number().optional(),
  divisionId: z.number().optional(),
  badgeNumber: z.string().optional(),
  callsign: z.string().optional()
});

const createVehicleSchema = z.object({
  ownerId: z.number(),
  plate: z.string().min(1),
  model: z.string().min(1),
  color: z.string().min(1),
  year: z.number().optional(),
  vin: z.string().optional(),
  insuranceNumber: z.string().optional(),
  registrationStatus: z.string().optional(),
  stolen: z.boolean().optional()
});

const createWeaponSchema = z.object({
  ownerId: z.number(),
  type: z.string().min(1),
  model: z.string().min(1),
  serialNumber: z.string().min(1),
  caliber: z.string().optional(),
  licenseNumber: z.string().optional(),
  registrationStatus: z.string().optional(),
  stolen: z.boolean().optional()
});

const createReportSchema = z.object({
  authorId: z.number(),
  type: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  status: z.string().optional(),
  priority: z.string().optional(),
  location: z.string().optional(),
  coordinates: z.record(z.any()).optional()
});

const createCallSchema = z.object({
  callerName: z.string().optional(),
  callerPhone: z.string().optional(),
  location: z.string().min(1),
  description: z.string().min(1),
  type: z.string().min(1),
  priority: z.number().optional(),
  status: z.string().optional(),
  patientInfo: z.record(z.any()).optional(),
  fireInfo: z.record(z.any()).optional()
});

const createUnitSchema = z.object({
  characterId: z.number(),
  unitNumber: z.string().min(1),
  departmentId: z.number(),
  status: z.string().optional(),
  location: z.record(z.any()).optional(),
  vehicleId: z.number().optional()
});

// ===== API МАРШРУТЫ ДЛЯ ГРАЖДАН =====

/**
 * GET /api/database/citizens - Получить список граждан
 */
router.get('/citizens', authenticateAny, requireActiveStatus, async (req: Request, res: Response) => {
  try {
    const filters = citizenFiltersSchema.parse(req.query);
    
    // Преобразование строковых дат в объекты Date
    const processedFilters: CitizenFilters = {
      ...filters,
      limit: filters.limit ? Number(filters.limit) : undefined,
      offset: filters.offset ? Number(filters.offset) : undefined
    };

    const citizens = await databaseService.getCitizens(processedFilters);
    res.json({
      success: true,
      data: citizens,
      count: citizens.length
    });
  } catch (error) {
    console.error('Error getting citizens:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get citizens'
    });
  }
});

/**
 * GET /api/database/citizens/:id - Получить гражданина по ID
 */
router.get('/citizens/:id', authenticateAny, requireActiveStatus, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid citizen ID'
      });
    }

    const citizen = await databaseService.getCitizenById(id);
    if (!citizen) {
      return res.status(404).json({
        success: false,
        error: 'Citizen not found'
      });
    }

    res.json({
      success: true,
      data: citizen
    });
  } catch (error) {
    console.error('Error getting citizen:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get citizen'
    });
  }
});

/**
 * POST /api/database/citizens - Создать нового гражданина
 */
router.post('/citizens', authenticateAny, requireActiveStatus, requirePermission('write'), async (req: Request, res: Response) => {
  try {
    const data = createCitizenSchema.parse(req.body);
    const citizen = await databaseService.createCitizen(data);
    
    res.status(201).json({
      success: true,
      data: citizen
    });
  } catch (error) {
    console.error('Error creating citizen:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create citizen'
    });
  }
});

/**
 * PUT /api/database/citizens/:id - Обновить гражданина
 */
router.put('/citizens/:id', authenticateAny, requireActiveStatus, requirePermission('write'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid citizen ID'
      });
    }

    const data = createCitizenSchema.partial().parse(req.body);
    const citizen = await databaseService.updateCitizen(id, data);
    
    res.json({
      success: true,
      data: citizen
    });
  } catch (error) {
    console.error('Error updating citizen:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update citizen'
    });
  }
});

/**
 * DELETE /api/database/citizens/:id - Удалить гражданина
 */
router.delete('/citizens/:id', authenticateAny, requireActiveStatus, requirePermission('delete'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid citizen ID'
      });
    }

    await databaseService.deleteCitizen(id);
    
    res.json({
      success: true,
      message: 'Citizen deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting citizen:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete citizen'
    });
  }
});

// ===== API МАРШРУТЫ ДЛЯ ТРАНСПОРТА =====

/**
 * GET /api/database/vehicles - Получить список транспортных средств
 */
router.get('/vehicles', authenticateAny, requireActiveStatus, async (req: Request, res: Response) => {
  try {
    const filters = vehicleFiltersSchema.parse(req.query);
    
    const processedFilters: VehicleFilters = {
      ...filters,
      limit: filters.limit ? Number(filters.limit) : undefined,
      offset: filters.offset ? Number(filters.offset) : undefined
    };

    const vehicles = await databaseService.getVehicles(processedFilters);
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    console.error('Error getting vehicles:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get vehicles'
    });
  }
});

/**
 * GET /api/database/vehicles/:id - Получить транспортное средство по ID
 */
router.get('/vehicles/:id', authenticateAny, requireActiveStatus, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicle ID'
      });
    }

    const vehicle = await databaseService.getVehicleById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Error getting vehicle:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get vehicle'
    });
  }
});

/**
 * POST /api/database/vehicles - Создать новое транспортное средство
 */
router.post('/vehicles', authenticateAny, requireActiveStatus, requirePermission('write'), async (req: Request, res: Response) => {
  try {
    const data = createVehicleSchema.parse(req.body);
    const vehicle = await databaseService.createVehicle(data);
    
    res.status(201).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create vehicle'
    });
  }
});

/**
 * PUT /api/database/vehicles/:id - Обновить транспортное средство
 */
router.put('/vehicles/:id', authenticateAny, requireActiveStatus, requirePermission('write'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicle ID'
      });
    }

    const data = createVehicleSchema.partial().parse(req.body);
    const vehicle = await databaseService.updateVehicle(id, data);
    
    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update vehicle'
    });
  }
});

// ===== API МАРШРУТЫ ДЛЯ ОРУЖИЯ =====

/**
 * GET /api/database/weapons - Получить список оружия
 */
router.get('/weapons', authenticateAny, requireActiveStatus, async (req: Request, res: Response) => {
  try {
    const filters = weaponFiltersSchema.parse(req.query);
    
    const processedFilters: WeaponFilters = {
      ...filters,
      limit: filters.limit ? Number(filters.limit) : undefined,
      offset: filters.offset ? Number(filters.offset) : undefined
    };

    const weapons = await databaseService.getWeapons(processedFilters);
    res.json({
      success: true,
      data: weapons,
      count: weapons.length
    });
  } catch (error) {
    console.error('Error getting weapons:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get weapons'
    });
  }
});

/**
 * GET /api/database/weapons/:id - Получить оружие по ID
 */
router.get('/weapons/:id', authenticateAny, requireActiveStatus, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid weapon ID'
      });
    }

    const weapon = await databaseService.getWeaponById(id);
    if (!weapon) {
      return res.status(404).json({
        success: false,
        error: 'Weapon not found'
      });
    }

    res.json({
      success: true,
      data: weapon
    });
  } catch (error) {
    console.error('Error getting weapon:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get weapon'
    });
  }
});

/**
 * POST /api/database/weapons - Создать новое оружие
 */
router.post('/weapons', authenticateAny, requireActiveStatus, requirePermission('write'), async (req: Request, res: Response) => {
  try {
    const data = createWeaponSchema.parse(req.body);
    const weapon = await databaseService.createWeapon(data);
    
    res.status(201).json({
      success: true,
      data: weapon
    });
  } catch (error) {
    console.error('Error creating weapon:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create weapon'
    });
  }
});

/**
 * PUT /api/database/weapons/:id - Обновить оружие
 */
router.put('/weapons/:id', authenticateAny, requireActiveStatus, requirePermission('write'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid weapon ID'
      });
    }

    const data = createWeaponSchema.partial().parse(req.body);
    const weapon = await databaseService.updateWeapon(id, data);
    
    res.json({
      success: true,
      data: weapon
    });
  } catch (error) {
    console.error('Error updating weapon:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update weapon'
    });
  }
});

// ===== API МАРШРУТЫ ДЛЯ ОТЧЕТОВ =====

/**
 * GET /api/database/reports - Получить список отчетов
 */
router.get('/reports', authenticateAny, requireActiveStatus, async (req: Request, res: Response) => {
  try {
    const filters = reportFiltersSchema.parse(req.query);
    
    const processedFilters: ReportFilters = {
      ...filters,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      limit: filters.limit ? Number(filters.limit) : undefined,
      offset: filters.offset ? Number(filters.offset) : undefined
    };

    const reports = await databaseService.getReports(processedFilters);
    res.json({
      success: true,
      data: reports,
      count: reports.length
    });
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get reports'
    });
  }
});

/**
 * GET /api/database/reports/:id - Получить отчет по ID
 */
router.get('/reports/:id', authenticateAny, requireActiveStatus, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report ID'
      });
    }

    const report = await databaseService.getReportById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error getting report:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get report'
    });
  }
});

/**
 * POST /api/database/reports - Создать новый отчет
 */
router.post('/reports', authenticateAny, requireActiveStatus, requirePermission('write'), async (req: Request, res: Response) => {
  try {
    const data = createReportSchema.parse(req.body);
    const report = await databaseService.createReport(data);
    
    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create report'
    });
  }
});

/**
 * PUT /api/database/reports/:id - Обновить отчет
 */
router.put('/reports/:id', authenticateAny, requireActiveStatus, requirePermission('write'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report ID'
      });
    }

    const data = createReportSchema.partial().parse(req.body);
    const report = await databaseService.updateReport(id, data);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update report'
    });
  }
});

// ===== API МАРШРУТЫ ДЛЯ ВЫЗОВОВ 911 =====

/**
 * GET /api/database/calls - Получить список вызовов 911
 */
router.get('/calls', authenticateAny, requireActiveStatus, async (req: Request, res: Response) => {
  try {
    const filters = callFiltersSchema.parse(req.query);
    
    const processedFilters: CallFilters = {
      ...filters,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      limit: filters.limit ? Number(filters.limit) : undefined,
      offset: filters.offset ? Number(filters.offset) : undefined
    };

    const calls = await databaseService.getCalls(processedFilters);
    res.json({
      success: true,
      data: calls,
      count: calls.length
    });
  } catch (error) {
    console.error('Error getting calls:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get calls'
    });
  }
});

/**
 * GET /api/database/calls/:id - Получить вызов по ID
 */
router.get('/calls/:id', authenticateAny, requireActiveStatus, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid call ID'
      });
    }

    const call = await databaseService.getCallById(id);
    if (!call) {
      return res.status(404).json({
        success: false,
        error: 'Call not found'
      });
    }

    res.json({
      success: true,
      data: call
    });
  } catch (error) {
    console.error('Error getting call:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get call'
    });
  }
});

/**
 * POST /api/database/calls - Создать новый вызов 911
 */
router.post('/calls', authenticateAny, requireActiveStatus, requirePermission('write'), async (req: Request, res: Response) => {
  try {
    const data = createCallSchema.parse(req.body);
    const call = await databaseService.createCall(data);
    
    res.status(201).json({
      success: true,
      data: call
    });
  } catch (error) {
    console.error('Error creating call:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create call'
    });
  }
});

/**
 * PUT /api/database/calls/:id - Обновить вызов 911
 */
router.put('/calls/:id', authenticateAny, requireActiveStatus, requirePermission('write'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid call ID'
      });
    }

    const data = createCallSchema.partial().parse(req.body);
    const call = await databaseService.updateCall(id, data);
    
    res.json({
      success: true,
      data: call
    });
  } catch (error) {
    console.error('Error updating call:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update call'
    });
  }
});

// ===== API МАРШРУТЫ ДЛЯ ЮНИТОВ =====

/**
 * GET /api/database/units - Получить список юнитов
 */
router.get('/units', authenticateAny, requireActiveStatus, async (req: Request, res: Response) => {
  try {
    const filters = unitFiltersSchema.parse(req.query);
    
    const processedFilters: UnitFilters = {
      ...filters,
      limit: filters.limit ? Number(filters.limit) : undefined,
      offset: filters.offset ? Number(filters.offset) : undefined
    };

    const units = await databaseService.getUnits(processedFilters);
    res.json({
      success: true,
      data: units,
      count: units.length
    });
  } catch (error) {
    console.error('Error getting units:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get units'
    });
  }
});

/**
 * GET /api/database/units/:id - Получить юнит по ID
 */
router.get('/units/:id', authenticateAny, requireActiveStatus, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid unit ID'
      });
    }

    const unit = await databaseService.getUnitById(id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        error: 'Unit not found'
      });
    }

    res.json({
      success: true,
      data: unit
    });
  } catch (error) {
    console.error('Error getting unit:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get unit'
    });
  }
});

/**
 * POST /api/database/units - Создать новый юнит
 */
router.post('/units', authenticateAny, requireActiveStatus, requirePermission('write'), async (req: Request, res: Response) => {
  try {
    const data = createUnitSchema.parse(req.body);
    const unit = await databaseService.createUnit(data);
    
    res.status(201).json({
      success: true,
      data: unit
    });
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create unit'
    });
  }
});

/**
 * PUT /api/database/units/:id - Обновить юнит
 */
router.put('/units/:id', authenticateAny, requireActiveStatus, requirePermission('write'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid unit ID'
      });
    }

    const data = createUnitSchema.partial().parse(req.body);
    const unit = await databaseService.updateUnit(id, data);
    
    res.json({
      success: true,
      data: unit
    });
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update unit'
    });
  }
});

// ===== API МАРШРУТЫ ДЛЯ ПОИСКА =====

/**
 * GET /api/database/search/citizens - Поиск граждан
 */
router.get('/search/citizens', authenticateAny, requireActiveStatus, async (req: Request, res: Response) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const citizens = await databaseService.searchCitizens(query, Number(limit));
    res.json({
      success: true,
      data: citizens,
      count: citizens.length
    });
  } catch (error) {
    console.error('Error searching citizens:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search citizens'
    });
  }
});

/**
 * GET /api/database/search/vehicles - Поиск транспортных средств
 */
router.get('/search/vehicles', authenticateAny, requireActiveStatus, async (req: Request, res: Response) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const vehicles = await databaseService.searchVehicles(query, Number(limit));
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    console.error('Error searching vehicles:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search vehicles'
    });
  }
});

/**
 * GET /api/database/search/weapons - Поиск оружия
 */
router.get('/search/weapons', authenticateAny, requireActiveStatus, async (req: Request, res: Response) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const weapons = await databaseService.searchWeapons(query, Number(limit));
    res.json({
      success: true,
      data: weapons,
      count: weapons.length
    });
  } catch (error) {
    console.error('Error searching weapons:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search weapons'
    });
  }
});

// ===== API МАРШРУТЫ ДЛЯ ДЕПАРТАМЕНТОВ =====

/**
 * GET /api/database/departments - Получить список департаментов
 */
router.get('/departments', authenticateAny, requireActiveStatus, async (req: Request, res: Response) => {
  try {
    const departments = await databaseService.getDepartments();
    res.json({
      success: true,
      data: departments,
      count: departments.length
    });
  } catch (error) {
    console.error('Error getting departments:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get departments'
    });
  }
});

/**
 * GET /api/database/departments/:id - Получить департамент по ID
 */
router.get('/departments/:id', authenticateAny, requireActiveStatus, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid department ID'
      });
    }

    const department = await databaseService.getDepartmentById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('Error getting department:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get department'
    });
  }
});

// ===== API МАРШРУТЫ ДЛЯ СТАТИСТИКИ =====

/**
 * GET /api/database/stats - Получить статистику системы
 */
router.get('/stats', authenticateAny, requireActiveStatus, async (req: Request, res: Response) => {
  try {
    const stats = await databaseService.getSystemStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting system stats:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get system stats'
    });
  }
});

export default router; 