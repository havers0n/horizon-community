import { db } from '../db/index.js';
import { eq, and, or, like, desc, asc } from 'drizzle-orm';
import {
  users,
  characters,
  vehicles,
  weapons,
  call911,
  activeUnits,
  departments,
  reports,
  applications,
  supportTickets,
  ranks,
  type User,
  type Character,
  type Vehicle,
  type Weapon,
  type Call911,
  type ActiveUnit,
  type Department,
  type Report,
  type Application,
  type SupportTicket,
  type Rank
} from '../db/index.js';
import { sql } from 'drizzle-orm';
import { cacheService } from './CacheService.js';
import { logger } from './LoggerService.js';

// ===== ТИПЫ ФИЛЬТРОВ =====

export interface CitizenFilters {
  firstName?: string;
  lastName?: string;
  insuranceNumber?: string;
  type?: string;
  departmentId?: number;
  isUnit?: boolean;
  limit?: number;
  offset?: number;
}

export interface VehicleFilters {
  plate?: string;
  model?: string;
  color?: string;
  ownerId?: number;
  limit?: number;
  offset?: number;
}

export interface WeaponFilters {
  serialNumber?: string;
  type?: string;
  ownerId?: number;
  limit?: number;
  offset?: number;
}

export interface ReportFilters {
  authorId?: number;
  type?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface CallFilters {
  type?: string;
  status?: string;
  priority?: number;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface UnitFilters {
  departmentId?: number;
  status?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

// ===== DATABASE SERVICE =====

export class DatabaseService {
  constructor() {}

  // ===== УПРАВЛЕНИЕ ГРАЖДАНАМИ =====

  async getCitizens(filters: CitizenFilters = {}): Promise<Character[]> {
    const cacheKey = `citizens:${JSON.stringify(filters)}`;
    
    return cacheService.cached(cacheKey, async () => {
      return logger.timeOperation('getCitizens', async () => {
        try {
          const conditions = [];
          
          if (filters.firstName) {
            conditions.push(like(characters.firstName, `%${filters.firstName}%`));
          }
          
          if (filters.lastName) {
            conditions.push(like(characters.lastName, `%${filters.lastName}%`));
          }
          
          if (filters.insuranceNumber) {
            conditions.push(like(characters.insuranceNumber, `%${filters.insuranceNumber}%`));
          }
          
          if (filters.type) {
            conditions.push(eq(characters.type, filters.type));
          }
          
          if (filters.departmentId) {
            conditions.push(eq(characters.departmentId, filters.departmentId));
          }
          
          if (filters.isUnit !== undefined) {
            conditions.push(eq(characters.isUnit, filters.isUnit));
          }

          const query = db.query.characters.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            with: {
              owner: true,
              department: true,
              qualifications: {
                with: {
                  qualification: true
                }
              },
              careerHistory: {
                with: {
                  department: true,
                  rank: true,
                  division: true
                }
              }
            },
            limit: filters.limit || 50,
            offset: filters.offset || 0,
            orderBy: [desc(characters.createdAt)]
          });

          const result = await query;
          logger.debug('getCitizens query executed', { filters, count: result.length });
          return result;
        } catch (error) {
          logger.error('Error getting citizens', { error, filters });
          throw new Error('Failed to get citizens');
        }
      });
    }, 2 * 60 * 1000); // 2 минуты кэш для списка граждан
  }

  async getCitizenById(id: number): Promise<Character | null> {
    try {
      const result = await db.query.characters.findFirst({
        where: eq(characters.id, id),
        with: {
          owner: true,
          department: true,
          qualifications: {
            with: {
              qualification: true
            }
          },
          careerHistory: {
            with: {
              department: true,
              rank: true,
              division: true
            }
          },
          vehicles: true,
          weapons: true,
          pets: true,
          records: {
            with: {
              author: true
            }
          }
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting citizen by id:', error);
      throw new Error('Failed to get citizen');
    }
  }

  async createCitizen(data: any): Promise<Character> {
    try {
      const result = await db.insert(characters).values({
        ownerId: data.ownerId,
        type: data.type,
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob,
        address: data.address,
        insuranceNumber: data.insuranceNumber,
        licenses: data.licenses || {},
        medicalInfo: data.medicalInfo || {},
        mugshotUrl: data.mugshotUrl,
        isUnit: data.isUnit || false,
        unitInfo: data.unitInfo,
        departmentId: data.departmentId,
        rankId: data.rankId,
        divisionId: data.divisionId,
        badgeNumber: data.badgeNumber,
        callsign: data.callsign,
        createdAt: new Date()
      }).returning();

      return result[0];
    } catch (error) {
      console.error('Error creating citizen:', error);
      throw new Error('Failed to create citizen');
    }
  }

  async updateCitizen(id: number, data: any): Promise<Character> {
    try {
      const result = await db.update(characters)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(characters.id, id))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error updating citizen:', error);
      throw new Error('Failed to update citizen');
    }
  }

  async deleteCitizen(id: number): Promise<void> {
    try {
      await db.delete(characters).where(eq(characters.id, id));
    } catch (error) {
      console.error('Error deleting citizen:', error);
      throw new Error('Failed to delete citizen');
    }
  }

  // ===== УПРАВЛЕНИЕ ТРАНСПОРТОМ =====

  async getVehicles(filters: VehicleFilters = {}): Promise<Vehicle[]> {
    try {
      const conditions = [];
      
      if (filters.plate) {
        conditions.push(like(vehicles.plate, `%${filters.plate}%`));
      }
      
      if (filters.model) {
        conditions.push(like(vehicles.model, `%${filters.model}%`));
      }
      
      if (filters.color) {
        conditions.push(like(vehicles.color, `%${filters.color}%`));
      }
      
      if (filters.ownerId) {
        conditions.push(eq(vehicles.ownerId, filters.ownerId));
      }

      const query = db.query.vehicles.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        with: {
          owner: true,
          violations: {
            with: {
              author: true
            }
          }
        },
        limit: filters.limit || 50,
        offset: filters.offset || 0,
        orderBy: [desc(vehicles.createdAt)]
      });

      return await query;
    } catch (error) {
      console.error('Error getting vehicles:', error);
      throw new Error('Failed to get vehicles');
    }
  }

  async getVehicleById(id: number): Promise<Vehicle | null> {
    try {
      const result = await db.query.vehicles.findFirst({
        where: eq(vehicles.id, id),
        with: {
          owner: true,
          violations: {
            with: {
              author: true
            }
          }
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting vehicle by id:', error);
      throw new Error('Failed to get vehicle');
    }
  }

  async createVehicle(data: any): Promise<Vehicle> {
    try {
      const result = await db.insert(vehicles).values({
        ownerId: data.ownerId,
        plate: data.plate,
        model: data.model,
        color: data.color,
        year: data.year,
        vin: data.vin,
        insuranceNumber: data.insuranceNumber,
        registrationStatus: data.registrationStatus || 'active',
        stolen: data.stolen || false,
        createdAt: new Date()
      }).returning();

      return result[0];
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw new Error('Failed to create vehicle');
    }
  }

  async updateVehicle(id: number, data: any): Promise<Vehicle> {
    try {
      const result = await db.update(vehicles)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(vehicles.id, id))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw new Error('Failed to update vehicle');
    }
  }

  // ===== УПРАВЛЕНИЕ ОРУЖИЕМ =====

  async getWeapons(filters: WeaponFilters = {}): Promise<Weapon[]> {
    try {
      const conditions = [];
      
      if (filters.serialNumber) {
        conditions.push(like(weapons.serialNumber, `%${filters.serialNumber}%`));
      }
      
      if (filters.type) {
        conditions.push(eq(weapons.type, filters.type));
      }
      
      if (filters.ownerId) {
        conditions.push(eq(weapons.ownerId, filters.ownerId));
      }

      const query = db.query.weapons.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        with: {
          owner: true
        },
        limit: filters.limit || 50,
        offset: filters.offset || 0,
        orderBy: [desc(weapons.createdAt)]
      });

      return await query;
    } catch (error) {
      console.error('Error getting weapons:', error);
      throw new Error('Failed to get weapons');
    }
  }

  async getWeaponById(id: number): Promise<Weapon | null> {
    try {
      const result = await db.query.weapons.findFirst({
        where: eq(weapons.id, id),
        with: {
          owner: true
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting weapon by id:', error);
      throw new Error('Failed to get weapon');
    }
  }

  async createWeapon(data: any): Promise<Weapon> {
    try {
      const result = await db.insert(weapons).values({
        ownerId: data.ownerId,
        type: data.type,
        model: data.model,
        serialNumber: data.serialNumber,
        caliber: data.caliber,
        licenseNumber: data.licenseNumber,
        registrationStatus: data.registrationStatus || 'active',
        stolen: data.stolen || false,
        createdAt: new Date()
      }).returning();

      return result[0];
    } catch (error) {
      console.error('Error creating weapon:', error);
      throw new Error('Failed to create weapon');
    }
  }

  async updateWeapon(id: number, data: any): Promise<Weapon> {
    try {
      const result = await db.update(weapons)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(weapons.id, id))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error updating weapon:', error);
      throw new Error('Failed to update weapon');
    }
  }

  // ===== УПРАВЛЕНИЕ ОТЧЕТАМИ =====

  async getReports(filters: ReportFilters = {}): Promise<Report[]> {
    try {
      const conditions = [];
      
      if (filters.authorId) {
        conditions.push(eq(reports.authorId, filters.authorId));
      }
      
      if (filters.type) {
        conditions.push(eq(reports.type, filters.type));
      }
      
      if (filters.status) {
        conditions.push(eq(reports.status, filters.status));
      }
      
      if (filters.dateFrom) {
        conditions.push(reports.createdAt >= filters.dateFrom);
      }
      
      if (filters.dateTo) {
        conditions.push(reports.createdAt <= filters.dateTo);
      }

      const query = db.query.reports.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        with: {
          author: true,
          suspects: {
            with: {
              character: true
            }
          },
          witnesses: {
            with: {
              character: true
            }
          },
          evidence: true
        },
        limit: filters.limit || 50,
        offset: filters.offset || 0,
        orderBy: [desc(reports.createdAt)]
      });

      return await query;
    } catch (error) {
      console.error('Error getting reports:', error);
      throw new Error('Failed to get reports');
    }
  }

  async getReportById(id: number): Promise<Report | null> {
    try {
      const result = await db.query.reports.findFirst({
        where: eq(reports.id, id),
        with: {
          author: true,
          suspects: {
            with: {
              character: true
            }
          },
          witnesses: {
            with: {
              character: true
            }
          },
          evidence: true
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting report by id:', error);
      throw new Error('Failed to get report');
    }
  }

  async createReport(data: any): Promise<Report> {
    try {
      const result = await db.insert(reports).values({
        authorId: data.authorId,
        type: data.type,
        title: data.title,
        content: data.content,
        status: data.status || 'draft',
        priority: data.priority || 'medium',
        location: data.location,
        coordinates: data.coordinates,
        createdAt: new Date()
      }).returning();

      return result[0];
    } catch (error) {
      console.error('Error creating report:', error);
      throw new Error('Failed to create report');
    }
  }

  async updateReport(id: number, data: any): Promise<Report> {
    try {
      const result = await db.update(reports)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(reports.id, id))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error updating report:', error);
      throw new Error('Failed to update report');
    }
  }

  // ===== УПРАВЛЕНИЕ ВЫЗОВАМИ 911 =====

  async getCalls(filters: CallFilters = {}): Promise<Call911[]> {
    try {
      const conditions = [];
      
      if (filters.type) {
        conditions.push(eq(call911.type, filters.type));
      }
      
      if (filters.status) {
        conditions.push(eq(call911.status, filters.status));
      }
      
      if (filters.priority) {
        conditions.push(eq(call911.priority, filters.priority));
      }
      
      if (filters.dateFrom) {
        conditions.push(call911.createdAt >= filters.dateFrom);
      }
      
      if (filters.dateTo) {
        conditions.push(call911.createdAt <= filters.dateTo);
      }

      const query = db.query.call911.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        with: {
          assignedUnits: {
            with: {
              unit: {
                with: {
                  character: true
                }
              }
            }
          },
          attachments: true
        },
        limit: filters.limit || 50,
        offset: filters.offset || 0,
        orderBy: [desc(call911.createdAt)]
      });

      return await query;
    } catch (error) {
      console.error('Error getting calls:', error);
      throw new Error('Failed to get calls');
    }
  }

  async getCallById(id: number): Promise<Call911 | null> {
    try {
      const result = await db.query.call911.findFirst({
        where: eq(call911.id, id),
        with: {
          assignedUnits: {
            with: {
              unit: {
                with: {
                  character: true
                }
              }
            }
          },
          attachments: true
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting call by id:', error);
      throw new Error('Failed to get call');
    }
  }

  async createCall(data: any): Promise<Call911> {
    try {
      const result = await db.insert(call911).values({
        callerName: data.callerName,
        callerPhone: data.callerPhone,
        location: data.location,
        description: data.description,
        type: data.type,
        priority: data.priority || 3,
        status: data.status || 'pending',
        patientInfo: data.patientInfo,
        fireInfo: data.fireInfo,
        createdAt: new Date()
      }).returning();

      return result[0];
    } catch (error) {
      console.error('Error creating call:', error);
      throw new Error('Failed to create call');
    }
  }

  async updateCall(id: number, data: any): Promise<Call911> {
    try {
      const result = await db.update(call911)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(call911.id, id))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error updating call:', error);
      throw new Error('Failed to update call');
    }
  }

  // ===== УПРАВЛЕНИЕ ЮНИТАМИ =====

  async getUnits(filters: UnitFilters = {}): Promise<ActiveUnit[]> {
    try {
      const conditions = [];
      
      if (filters.departmentId) {
        conditions.push(eq(activeUnits.departmentId, filters.departmentId));
      }
      
      if (filters.status) {
        conditions.push(eq(activeUnits.status, filters.status));
      }
      
      if (filters.isActive !== undefined) {
        conditions.push(eq(activeUnits.isActive, filters.isActive));
      }

      const query = db.query.activeUnits.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        with: {
          character: true,
          department: true,
          vehicle: true,
          currentCall: true
        },
        limit: filters.limit || 50,
        offset: filters.offset || 0,
        orderBy: [desc(activeUnits.lastUpdate)]
      });

      return await query;
    } catch (error) {
      console.error('Error getting units:', error);
      throw new Error('Failed to get units');
    }
  }

  async getUnitById(id: number): Promise<ActiveUnit | null> {
    try {
      const result = await db.query.activeUnits.findFirst({
        where: eq(activeUnits.id, id),
        with: {
          character: true,
          department: true,
          vehicle: true,
          currentCall: true
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting unit by id:', error);
      throw new Error('Failed to get unit');
    }
  }

  async createUnit(data: any): Promise<ActiveUnit> {
    try {
      const result = await db.insert(activeUnits).values({
        characterId: data.characterId,
        unitNumber: data.unitNumber,
        departmentId: data.departmentId,
        status: data.status || 'available',
        location: data.location,
        vehicleId: data.vehicleId,
        isActive: true,
        isPanic: false,
        lastUpdate: new Date(),
        createdAt: new Date()
      }).returning();

      return result[0];
    } catch (error) {
      console.error('Error creating unit:', error);
      throw new Error('Failed to create unit');
    }
  }

  async updateUnit(id: number, data: any): Promise<ActiveUnit> {
    try {
      const result = await db.update(activeUnits)
        .set({
          ...data,
          lastUpdate: new Date()
        })
        .where(eq(activeUnits.id, id))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error updating unit:', error);
      throw new Error('Failed to update unit');
    }
  }

  // ===== УПРАВЛЕНИЕ ДЕПАРТАМЕНТАМИ =====

  async getDepartments(): Promise<Department[]> {
    const cacheKey = 'departments:all';
    
    return cacheService.cached(cacheKey, async () => {
      return logger.timeOperation('getDepartments', async () => {
        try {
          const result = await db.query.departments.findMany({
            with: {
              ranks: {
                orderBy: [asc(ranks.orderIndex)]
              },
              divisions: true,
              units: true
            }
          });

          logger.debug('getDepartments query executed', { count: result.length });
          return result;
        } catch (error) {
          logger.error('Error getting departments', { error });
          throw new Error('Failed to get departments');
        }
      });
    }, 10 * 60 * 1000); // 10 минут кэш для департаментов (редко изменяются)
  }

  async getDepartmentById(id: number): Promise<Department | null> {
    try {
      const result = await db.query.departments.findFirst({
        where: eq(departments.id, id),
        with: {
          ranks: {
            orderBy: [asc(ranks.orderIndex)]
          },
          divisions: true,
          units: true
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting department by id:', error);
      throw new Error('Failed to get department');
    }
  }

  // ===== ПОИСК И АГРЕГАЦИЯ =====

  async searchCitizens(query: string, limit: number = 10): Promise<Character[]> {
    try {
      const searchConditions = or(
        like(characters.firstName, `%${query}%`),
        like(characters.lastName, `%${query}%`),
        like(characters.insuranceNumber, `%${query}%`),
        like(characters.badgeNumber, `%${query}%`)
      );

      const result = await db.query.characters.findMany({
        where: searchConditions,
        with: {
          owner: true,
          department: true
        },
        limit,
        orderBy: [desc(characters.createdAt)]
      });

      return result;
    } catch (error) {
      console.error('Error searching citizens:', error);
      throw new Error('Failed to search citizens');
    }
  }

  async searchVehicles(query: string, limit: number = 10): Promise<Vehicle[]> {
    try {
      const searchConditions = or(
        like(vehicles.plate, `%${query}%`),
        like(vehicles.model, `%${query}%`),
        like(vehicles.vin, `%${query}%`)
      );

      const result = await db.query.vehicles.findMany({
        where: searchConditions,
        with: {
          owner: true
        },
        limit,
        orderBy: [desc(vehicles.createdAt)]
      });

      return result;
    } catch (error) {
      console.error('Error searching vehicles:', error);
      throw new Error('Failed to search vehicles');
    }
  }

  async searchWeapons(query: string, limit: number = 10): Promise<Weapon[]> {
    try {
      const searchConditions = or(
        like(weapons.serialNumber, `%${query}%`),
        like(weapons.model, `%${query}%`),
        like(weapons.licenseNumber, `%${query}%`)
      );

      const result = await db.query.weapons.findMany({
        where: searchConditions,
        with: {
          owner: true
        },
        limit,
        orderBy: [desc(weapons.createdAt)]
      });

      return result;
    } catch (error) {
      console.error('Error searching weapons:', error);
      throw new Error('Failed to search weapons');
    }
  }

  // ===== СТАТИСТИКА =====

  async getSystemStats(): Promise<any> {
    const cacheKey = 'system:stats';
    
    return cacheService.cached(cacheKey, async () => {
      return logger.timeOperation('getSystemStats', async () => {
        try {
          const [
            totalCitizens,
            totalVehicles,
            totalWeapons,
            totalReports,
            totalCalls,
            activeUnitsCount
          ] = await Promise.all([
            db.select({ count: sql`count(*)` }).from(characters),
            db.select({ count: sql`count(*)` }).from(vehicles),
            db.select({ count: sql`count(*)` }).from(weapons),
            db.select({ count: sql`count(*)` }).from(reports),
            db.select({ count: sql`count(*)` }).from(call911),
            db.select({ count: sql`count(*)` }).from(activeUnits).where(eq(activeUnits.isActive, true))
          ]);

          const stats = {
            citizens: totalCitizens[0].count,
            vehicles: totalVehicles[0].count,
            weapons: totalWeapons[0].count,
            reports: totalReports[0].count,
            calls: totalCalls[0].count,
            activeUnits: activeUnitsCount[0].count
          };

          logger.debug('getSystemStats query executed', stats);
          return stats;
        } catch (error) {
          logger.error('Error getting system stats', { error });
          throw new Error('Failed to get system stats');
        }
      });
    }, 5 * 60 * 1000); // 5 минут кэш для статистики
  }

  // ===== УПРАВЛЕНИЕ КЭШЕМ =====

  /**
   * Инвалидировать кэш граждан
   */
  invalidateCitizensCache(): void {
    cacheService.invalidatePattern('citizens:');
    logger.debug('Citizens cache invalidated');
  }

  /**
   * Инвалидировать кэш департаментов
   */
  invalidateDepartmentsCache(): void {
    cacheService.delete('departments:all');
    logger.debug('Departments cache invalidated');
  }

  /**
   * Инвалидировать кэш статистики
   */
  invalidateStatsCache(): void {
    cacheService.delete('system:stats');
    logger.debug('System stats cache invalidated');
  }

  /**
   * Инвалидировать весь кэш
   */
  invalidateAllCache(): void {
    cacheService.clear();
    logger.info('All cache invalidated');
  }

  /**
   * Получить информацию о кэше
   */
  getCacheInfo(): { size: number; keys: string[] } {
    return {
      size: cacheService.size(),
      keys: Array.from(cacheService['cache'].keys())
    };
  }
}

// Экспорт экземпляра сервиса
export const databaseService = new DatabaseService(); 