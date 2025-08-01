import { SupabaseStorage } from './SupabaseStorage';
import { 
  Weapon, 
  InsertWeapon, 
  UpdateWeapon,
  Character
} from '@roleplay-identity/shared-types';

export class WeaponService {
  private storage: SupabaseStorage;

  constructor(storage: SupabaseStorage) {
    this.storage = storage;
  }

  // ===========================================
  // ОСНОВНЫЕ ОПЕРАЦИИ
  // ===========================================

  async createWeapon(data: InsertWeapon): Promise<Weapon> {
    return this.storage.insert('weapons', data);
  }

  async getWeaponById(id: string): Promise<Weapon | null> {
    return this.storage.getById('weapons', id);
  }

  async getAllWeapons(): Promise<Weapon[]> {
    return this.storage.list('weapons');
  }

  async getWeaponsByCharacter(characterId: string): Promise<Weapon[]> {
    return this.storage.list('weapons', { characterId, isActive: true });
  }

  async getWeaponsBySerialNumber(serialNumber: string): Promise<Weapon[]> {
    return this.storage.list('weapons', { serialNumber });
  }

  async getWeaponsByType(type: string): Promise<Weapon[]> {
    return this.storage.list('weapons', { type, isActive: true });
  }

  async updateWeapon(id: string, data: UpdateWeapon): Promise<Weapon> {
    return this.storage.update('weapons', id, data);
  }

  async deleteWeapon(id: string): Promise<void> {
    await this.storage.update('weapons', id, { isActive: false });
  }

  // ===========================================
  // БИЗНЕС-ЛОГИКА
  // ===========================================

  async registerWeapon(data: InsertWeapon): Promise<Weapon> {
    // Проверяем уникальность серийного номера
    const existingWeapons = await this.getWeaponsBySerialNumber(data.serialNumber);
    if (existingWeapons.length > 0) {
      throw new Error('Оружие с таким серийным номером уже зарегистрировано');
    }

    // Проверяем, что персонаж существует
    const character = await this.storage.getById('characters', data.characterId);
    if (!character || !character.isActive) {
      throw new Error('Персонаж не найден или неактивен');
    }

    return this.createWeapon(data);
  }

  async transferWeapon(weaponId: string, newCharacterId: string): Promise<Weapon> {
    const weapon = await this.getWeaponById(weaponId);
    if (!weapon) {
      throw new Error('Оружие не найдено');
    }

    // Проверяем нового владельца
    const newCharacter = await this.storage.getById('characters', newCharacterId);
    if (!newCharacter || !newCharacter.isActive) {
      throw new Error('Новый владелец не найден или неактивен');
    }

    return this.updateWeapon(weaponId, { characterId: newCharacterId });
  }

  async updateLicense(weaponId: string, newExpiry: string): Promise<Weapon> {
    const weapon = await this.getWeaponById(weaponId);
    if (!weapon) {
      throw new Error('Оружие не найдено');
    }

    return this.updateWeapon(weaponId, { licenseExpiry: newExpiry });
  }

  async checkLicenseExpiry(weaponId: string): Promise<{
    isExpired: boolean;
    daysLeft: number;
  }> {
    const weapon = await this.getWeaponById(weaponId);
    if (!weapon) {
      throw new Error('Оружие не найдено');
    }

    const now = new Date();
    const licenseDate = new Date(weapon.licenseExpiry);
    const daysLeft = Math.ceil((licenseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      isExpired: daysLeft < 0,
      daysLeft
    };
  }

  async getExpiringLicenses(days: number = 30): Promise<Weapon[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const weapons = await this.getAllWeapons();
    
    return weapons.filter(weapon => {
      const licenseDate = new Date(weapon.licenseExpiry);
      return licenseDate <= cutoffDate && weapon.isActive;
    });
  }

  async revokeWeapon(weaponId: string, reason?: string): Promise<Weapon> {
    const weapon = await this.getWeaponById(weaponId);
    if (!weapon) {
      throw new Error('Оружие не найдено');
    }

    return this.updateWeapon(weaponId, { 
      isActive: false,
      // Можно добавить поле для причины отзыва
    });
  }

  // ===========================================
  // ПОИСК И ФИЛЬТРАЦИЯ
  // ===========================================

  async searchWeapons(query: string): Promise<Weapon[]> {
    return this.storage.search('weapons', query, ['serialNumber', 'type', 'make', 'model']);
  }

  async getWeaponsByMake(make: string): Promise<Weapon[]> {
    return this.storage.list('weapons', { make, isActive: true });
  }

  async getWeaponsByModel(model: string): Promise<Weapon[]> {
    return this.storage.list('weapons', { model, isActive: true });
  }

  async getWeaponsByCaliber(caliber: string): Promise<Weapon[]> {
    return this.storage.list('weapons', { caliber, isActive: true });
  }

  async getWeaponsWithDetails(): Promise<(Weapon & {
    character: Character;
  })[]> {
    const weapons = await this.getAllWeapons();
    
    const weaponsWithDetails = await Promise.all(
      weapons.map(async (weapon) => {
        const character = await this.storage.getById('characters', weapon.characterId);
        return {
          ...weapon,
          character: character!
        };
      })
    );

    return weaponsWithDetails;
  }

  async getWeaponWithDetails(id: string): Promise<(Weapon & {
    character: Character;
  }) | null> {
    const weapon = await this.getWeaponById(id);
    if (!weapon) return null;

    const character = await this.storage.getById('characters', weapon.characterId);
    return {
      ...weapon,
      character: character!
    };
  }

  // ===========================================
  // СТАТИСТИКА
  // ===========================================

  async getWeaponStats(): Promise<{
    total: number;
    active: number;
    byType: Record<string, number>;
    byMake: Record<string, number>;
    byCaliber: Record<string, number>;
    expiringSoon: number;
  }> {
    const [total, active] = await Promise.all([
      this.storage.count('weapons'),
      this.storage.count('weapons', { isActive: true })
    ]);

    const weapons = await this.getAllWeapons();
    
    const byType: Record<string, number> = {};
    const byMake: Record<string, number> = {};
    const byCaliber: Record<string, number> = {};

    weapons.forEach(weapon => {
      if (weapon.isActive) {
        byType[weapon.type] = (byType[weapon.type] || 0) + 1;
        byMake[weapon.make] = (byMake[weapon.make] || 0) + 1;
        if (weapon.caliber) {
          byCaliber[weapon.caliber] = (byCaliber[weapon.caliber] || 0) + 1;
        }
      }
    });

    const expiringWeapons = await this.getExpiringLicenses(30);

    return {
      total,
      active,
      byType,
      byMake,
      byCaliber,
      expiringSoon: expiringWeapons.length
    };
  }

  async getCharacterWeaponStats(characterId: string): Promise<{
    total: number;
    active: number;
    byType: Record<string, number>;
    expiringSoon: number;
  }> {
    const weapons = await this.getWeaponsByCharacter(characterId);
    
    const byType: Record<string, number> = {};
    weapons.forEach(weapon => {
      byType[weapon.type] = (byType[weapon.type] || 0) + 1;
    });

    const expiringWeapons = weapons.filter(weapon => {
      const licenseDate = new Date(weapon.licenseExpiry);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + 30);
      
      return licenseDate <= cutoffDate;
    });

    return {
      total: weapons.length,
      active: weapons.length,
      byType,
      expiringSoon: expiringWeapons.length
    };
  }

  async getWeaponActivity(days: number = 30): Promise<{
    registered: number;
    transferred: number;
    revoked: number;
    byType: Record<string, number>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const weapons = await this.storage.list('weapons', {
      createdAt: { gte: startDate.toISOString() }
    });

    const byType: Record<string, number> = {};
    weapons.forEach(weapon => {
      byType[weapon.type] = (byType[weapon.type] || 0) + 1;
    });

    return {
      registered: weapons.length,
      transferred: 0, // Можно добавить логику отслеживания передач
      revoked: 0, // Можно добавить логику отслеживания отзывов
      byType
    };
  }

  // ===========================================
  // СПЕЦИАЛИЗИРОВАННЫЕ ЗАПРОСЫ
  // ===========================================

  async getStolenWeapons(): Promise<Weapon[]> {
    // Здесь должна быть логика поиска украденного оружия
    // Пока возвращаем пустой массив
    return [];
  }

  async getWantedWeapons(): Promise<Weapon[]> {
    // Здесь должна быть логика поиска разыскиваемого оружия
    // Пока возвращаем пустой массив
    return [];
  }

  async getWeaponsByOwnerName(ownerName: string): Promise<Weapon[]> {
    const weapons = await this.getAllWeapons();
    const matchingWeapons: Weapon[] = [];

    for (const weapon of weapons) {
      const character = await this.storage.getById('characters', weapon.characterId);
      if (character) {
        const fullName = `${character.firstName} ${character.lastName}`.toLowerCase();
        if (fullName.includes(ownerName.toLowerCase())) {
          matchingWeapons.push(weapon);
        }
      }
    }

    return matchingWeapons;
  }

  async getWeaponsByLocation(location: string): Promise<Weapon[]> {
    // Здесь должна быть логика поиска по локации
    // Пока возвращаем все активное оружие
    return this.storage.list('weapons', { isActive: true });
  }

  // ===========================================
  // ВАЛИДАЦИЯ
  // ===========================================

  async validateSerialNumber(serialNumber: string): Promise<{
    isValid: boolean;
    isAvailable: boolean;
    message?: string;
  }> {
    // Базовая валидация серийного номера
    const serialRegex = /^[A-Z0-9]{4,20}$/;
    const isValid = serialRegex.test(serialNumber);

    if (!isValid) {
      return {
        isValid: false,
        isAvailable: false,
        message: 'Неверный формат серийного номера'
      };
    }

    // Проверяем доступность
    const existingWeapons = await this.getWeaponsBySerialNumber(serialNumber);
    const isAvailable = existingWeapons.length === 0;

    return {
      isValid: true,
      isAvailable,
      message: isAvailable ? undefined : 'Серийный номер уже зарегистрирован'
    };
  }

  async validateWeaponType(type: string): Promise<{
    isValid: boolean;
    message?: string;
  }> {
    // Список разрешенных типов оружия
    const allowedTypes = [
      'Pistol',
      'Revolver',
      'Rifle',
      'Shotgun',
      'SMG',
      'Assault Rifle',
      'Sniper Rifle',
      'Machine Gun',
      'Other'
    ];

    const isValid = allowedTypes.includes(type);

    return {
      isValid,
      message: isValid ? undefined : 'Недопустимый тип оружия'
    };
  }

  async validateCaliber(caliber: string): Promise<{
    isValid: boolean;
    message?: string;
  }> {
    // Список распространенных калибров
    const allowedCalibers = [
      '.22 LR',
      '.380 ACP',
      '.38 Special',
      '.357 Magnum',
      '.40 S&W',
      '.45 ACP',
      '9mm',
      '.223 Remington',
      '.308 Winchester',
      '.30-06 Springfield',
      '12 Gauge',
      '20 Gauge',
      'Other'
    ];

    const isValid = allowedCalibers.includes(caliber);

    return {
      isValid,
      message: isValid ? undefined : 'Недопустимый калибр'
    };
  }

  // ===========================================
  // ЭКСПОРТ И ИМПОРТ
  // ===========================================

  async exportWeaponData(characterId?: string): Promise<Weapon[]> {
    if (characterId) {
      return this.getWeaponsByCharacter(characterId);
    }
    return this.getAllWeapons();
  }

  async importWeaponData(weapons: InsertWeapon[]): Promise<Weapon[]> {
    const createdWeapons: Weapon[] = [];

    for (const weaponData of weapons) {
      try {
        const weapon = await this.registerWeapon(weaponData);
        createdWeapons.push(weapon);
      } catch (error) {
        console.error(`Ошибка при импорте оружия: ${error}`);
      }
    }

    return createdWeapons;
  }

  // ===========================================
  // БЕЗОПАСНОСТЬ
  // ===========================================

  async checkWeaponRestrictions(characterId: string, weaponType: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    // Здесь должна быть логика проверки ограничений
    // Например, проверка возраста, судимости, лицензий и т.д.
    
    const character = await this.storage.getById('characters', characterId);
    if (!character) {
      return {
        allowed: false,
        reason: 'Персонаж не найден'
      };
    }

    // Проверяем возраст (для некоторых типов оружия)
    const birthDate = new Date(character.dateOfBirth);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    
    if (age < 18) {
      return {
        allowed: false,
        reason: 'Недостаточный возраст'
      };
    }

    // Проверяем количество оружия у персонажа
    const existingWeapons = await this.getWeaponsByCharacter(characterId);
    if (existingWeapons.length >= 10) {
      return {
        allowed: false,
        reason: 'Превышен лимит оружия'
      };
    }

    return {
      allowed: true
    };
  }

  async getWeaponHistory(weaponId: string): Promise<any[]> {
    // Здесь должна быть логика получения истории оружия
    // Пока возвращаем пустой массив
    return [];
  }
}

// Экспортируем единственный экземпляр
export const weaponService = new WeaponService(new SupabaseStorage()); 