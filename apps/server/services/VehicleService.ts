import { SupabaseStorage } from './SupabaseStorage';
import { 
  Vehicle, 
  InsertVehicle, 
  UpdateVehicle,
  Character
} from '@roleplay-identity/shared-types';

export class VehicleService {
  private storage: SupabaseStorage;

  constructor(storage: SupabaseStorage) {
    this.storage = storage;
  }

  // ===========================================
  // ОСНОВНЫЕ ОПЕРАЦИИ
  // ===========================================

  async createVehicle(data: InsertVehicle): Promise<Vehicle> {
    return this.storage.insert('vehicles', data);
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    return this.storage.getById('vehicles', id);
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return this.storage.list('vehicles');
  }

  async getVehiclesByCharacter(characterId: string): Promise<Vehicle[]> {
    return this.storage.list('vehicles', { characterId, isActive: true });
  }

  async getVehiclesByPlate(plate: string): Promise<Vehicle[]> {
    return this.storage.list('vehicles', { plate });
  }

  async getVehiclesByVin(vin: string): Promise<Vehicle[]> {
    return this.storage.list('vehicles', { vin });
  }

  async updateVehicle(id: string, data: UpdateVehicle): Promise<Vehicle> {
    return this.storage.update('vehicles', id, data);
  }

  async deleteVehicle(id: string): Promise<void> {
    await this.storage.update('vehicles', id, { isActive: false });
  }

  // ===========================================
  // БИЗНЕС-ЛОГИКА
  // ===========================================

  async registerVehicle(data: InsertVehicle): Promise<Vehicle> {
    // Проверяем уникальность номера и VIN
    const [existingPlate, existingVin] = await Promise.all([
      this.storage.list('vehicles', { plate: data.plate }),
      this.storage.list('vehicles', { vin: data.vin })
    ]);

    if (existingPlate.length > 0) {
      throw new Error('Транспортное средство с таким номером уже зарегистрировано');
    }

    if (existingVin.length > 0) {
      throw new Error('Транспортное средство с таким VIN уже зарегистрировано');
    }

    // Проверяем, что персонаж существует
    const character = await this.storage.getById('characters', data.characterId);
    if (!character || !character.isActive) {
      throw new Error('Персонаж не найден или неактивен');
    }

    return this.createVehicle(data);
  }

  async transferVehicle(vehicleId: string, newCharacterId: string): Promise<Vehicle> {
    const vehicle = await this.getVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error('Транспортное средство не найдено');
    }

    // Проверяем нового владельца
    const newCharacter = await this.storage.getById('characters', newCharacterId);
    if (!newCharacter || !newCharacter.isActive) {
      throw new Error('Новый владелец не найден или неактивен');
    }

    return this.updateVehicle(vehicleId, { characterId: newCharacterId });
  }

  async updateRegistration(vehicleId: string, newExpiry: string): Promise<Vehicle> {
    const vehicle = await this.getVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error('Транспортное средство не найдено');
    }

    return this.updateVehicle(vehicleId, { registrationExpiry: newExpiry });
  }

  async updateInsurance(vehicleId: string, newExpiry: string): Promise<Vehicle> {
    const vehicle = await this.getVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error('Транспортное средство не найдено');
    }

    return this.updateVehicle(vehicleId, { insuranceExpiry: newExpiry });
  }

  async checkExpiryStatus(vehicleId: string): Promise<{
    registrationExpired: boolean;
    insuranceExpired: boolean;
    registrationDaysLeft: number;
    insuranceDaysLeft: number;
  }> {
    const vehicle = await this.getVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error('Транспортное средство не найдено');
    }

    const now = new Date();
    const registrationDate = new Date(vehicle.registrationExpiry);
    const insuranceDate = new Date(vehicle.insuranceExpiry);

    const registrationDaysLeft = Math.ceil((registrationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const insuranceDaysLeft = Math.ceil((insuranceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      registrationExpired: registrationDaysLeft < 0,
      insuranceExpired: insuranceDaysLeft < 0,
      registrationDaysLeft,
      insuranceDaysLeft
    };
  }

  async getExpiringVehicles(days: number = 30): Promise<Vehicle[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const vehicles = await this.getAllVehicles();
    
    return vehicles.filter(vehicle => {
      const registrationDate = new Date(vehicle.registrationExpiry);
      const insuranceDate = new Date(vehicle.insuranceExpiry);
      
      return (registrationDate <= cutoffDate || insuranceDate <= cutoffDate) && vehicle.isActive;
    });
  }

  // ===========================================
  // ПОИСК И ФИЛЬТРАЦИЯ
  // ===========================================

  async searchVehicles(query: string): Promise<Vehicle[]> {
    return this.storage.search('vehicles', query, ['plate', 'vin', 'make', 'model']);
  }

  async getVehiclesByMake(make: string): Promise<Vehicle[]> {
    return this.storage.list('vehicles', { make, isActive: true });
  }

  async getVehiclesByModel(model: string): Promise<Vehicle[]> {
    return this.storage.list('vehicles', { model, isActive: true });
  }

  async getVehiclesByYear(year: number): Promise<Vehicle[]> {
    return this.storage.list('vehicles', { year, isActive: true });
  }

  async getVehiclesByColor(color: string): Promise<Vehicle[]> {
    return this.storage.list('vehicles', { color, isActive: true });
  }

  async getVehiclesWithDetails(): Promise<(Vehicle & {
    character: Character;
  })[]> {
    const vehicles = await this.getAllVehicles();
    
    const vehiclesWithDetails = await Promise.all(
      vehicles.map(async (vehicle) => {
        const character = await this.storage.getById('characters', vehicle.characterId);
        return {
          ...vehicle,
          character: character!
        };
      })
    );

    return vehiclesWithDetails;
  }

  async getVehicleWithDetails(id: string): Promise<(Vehicle & {
    character: Character;
  }) | null> {
    const vehicle = await this.getVehicleById(id);
    if (!vehicle) return null;

    const character = await this.storage.getById('characters', vehicle.characterId);
    return {
      ...vehicle,
      character: character!
    };
  }

  // ===========================================
  // СТАТИСТИКА
  // ===========================================

  async getVehicleStats(): Promise<{
    total: number;
    active: number;
    byMake: Record<string, number>;
    byYear: Record<number, number>;
    byColor: Record<string, number>;
    expiringSoon: number;
  }> {
    const [total, active] = await Promise.all([
      this.storage.count('vehicles'),
      this.storage.count('vehicles', { isActive: true })
    ]);

    const vehicles = await this.getAllVehicles();
    
    const byMake: Record<string, number> = {};
    const byYear: Record<number, number> = {};
    const byColor: Record<string, number> = {};

    vehicles.forEach(vehicle => {
      if (vehicle.isActive) {
        byMake[vehicle.make] = (byMake[vehicle.make] || 0) + 1;
        byYear[vehicle.year] = (byYear[vehicle.year] || 0) + 1;
        byColor[vehicle.color] = (byColor[vehicle.color] || 0) + 1;
      }
    });

    const expiringVehicles = await this.getExpiringVehicles(30);

    return {
      total,
      active,
      byMake,
      byYear,
      byColor,
      expiringSoon: expiringVehicles.length
    };
  }

  async getCharacterVehicleStats(characterId: string): Promise<{
    total: number;
    active: number;
    byMake: Record<string, number>;
    expiringSoon: number;
  }> {
    const vehicles = await this.getVehiclesByCharacter(characterId);
    
    const byMake: Record<string, number> = {};
    vehicles.forEach(vehicle => {
      byMake[vehicle.make] = (byMake[vehicle.make] || 0) + 1;
    });

    const expiringVehicles = vehicles.filter(vehicle => {
      const registrationDate = new Date(vehicle.registrationExpiry);
      const insuranceDate = new Date(vehicle.insuranceExpiry);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + 30);
      
      return registrationDate <= cutoffDate || insuranceDate <= cutoffDate;
    });

    return {
      total: vehicles.length,
      active: vehicles.length,
      byMake,
      expiringSoon: expiringVehicles.length
    };
  }

  async getVehicleActivity(days: number = 30): Promise<{
    registered: number;
    transferred: number;
    byMake: Record<string, number>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const vehicles = await this.storage.list('vehicles', {
      createdAt: { gte: startDate.toISOString() }
    });

    const byMake: Record<string, number> = {};
    vehicles.forEach(vehicle => {
      byMake[vehicle.make] = (byMake[vehicle.make] || 0) + 1;
    });

    return {
      registered: vehicles.length,
      transferred: 0, // Можно добавить логику отслеживания передач
      byMake
    };
  }

  // ===========================================
  // СПЕЦИАЛИЗИРОВАННЫЕ ЗАПРОСЫ
  // ===========================================

  async getStolenVehicles(): Promise<Vehicle[]> {
    // Здесь должна быть логика поиска украденных транспортных средств
    // Пока возвращаем пустой массив
    return [];
  }

  async getWantedVehicles(): Promise<Vehicle[]> {
    // Здесь должна быть логика поиска разыскиваемых транспортных средств
    // Пока возвращаем пустой массив
    return [];
  }

  async getVehiclesByLocation(location: string): Promise<Vehicle[]> {
    // Здесь должна быть логика поиска по локации
    // Пока возвращаем все активные транспортные средства
    return this.storage.list('vehicles', { isActive: true });
  }

  async getVehiclesByOwnerName(ownerName: string): Promise<Vehicle[]> {
    const vehicles = await this.getAllVehicles();
    const matchingVehicles: Vehicle[] = [];

    for (const vehicle of vehicles) {
      const character = await this.storage.getById('characters', vehicle.characterId);
      if (character) {
        const fullName = `${character.firstName} ${character.lastName}`.toLowerCase();
        if (fullName.includes(ownerName.toLowerCase())) {
          matchingVehicles.push(vehicle);
        }
      }
    }

    return matchingVehicles;
  }

  // ===========================================
  // ВАЛИДАЦИЯ
  // ===========================================

  async validatePlate(plate: string): Promise<{
    isValid: boolean;
    isAvailable: boolean;
    message?: string;
  }> {
    // Базовая валидация формата номера
    const plateRegex = /^[A-Z0-9]{1,8}$/;
    const isValid = plateRegex.test(plate);

    if (!isValid) {
      return {
        isValid: false,
        isAvailable: false,
        message: 'Неверный формат номера'
      };
    }

    // Проверяем доступность
    const existingVehicles = await this.getVehiclesByPlate(plate);
    const isAvailable = existingVehicles.length === 0;

    return {
      isValid: true,
      isAvailable,
      message: isAvailable ? undefined : 'Номер уже занят'
    };
  }

  async validateVin(vin: string): Promise<{
    isValid: boolean;
    isAvailable: boolean;
    message?: string;
  }> {
    // Базовая валидация VIN (17 символов)
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    const isValid = vinRegex.test(vin);

    if (!isValid) {
      return {
        isValid: false,
        isAvailable: false,
        message: 'VIN должен содержать 17 символов (буквы I, O, Q не используются)'
      };
    }

    // Проверяем доступность
    const existingVehicles = await this.getVehiclesByVin(vin);
    const isAvailable = existingVehicles.length === 0;

    return {
      isValid: true,
      isAvailable,
      message: isAvailable ? undefined : 'VIN уже зарегистрирован'
    };
  }

  // ===========================================
  // ЭКСПОРТ И ИМПОРТ
  // ===========================================

  async exportVehicleData(characterId?: string): Promise<Vehicle[]> {
    if (characterId) {
      return this.getVehiclesByCharacter(characterId);
    }
    return this.getAllVehicles();
  }

  async importVehicleData(vehicles: InsertVehicle[]): Promise<Vehicle[]> {
    const createdVehicles: Vehicle[] = [];

    for (const vehicleData of vehicles) {
      try {
        const vehicle = await this.registerVehicle(vehicleData);
        createdVehicles.push(vehicle);
      } catch (error) {
        console.error(`Ошибка при импорте транспортного средства: ${error}`);
      }
    }

    return createdVehicles;
  }
}

// Экспортируем единственный экземпляр
export const vehicleService = new VehicleService(new SupabaseStorage()); 