import { DatabaseService } from '../../services/DatabaseService.js';
import { cacheService } from '../../services/CacheService.js';

// Мокаем базу данных
jest.mock('../../db/index.js', () => ({
  db: {
    query: {
      characters: {
        findMany: jest.fn()
      },
      departments: {
        findMany: jest.fn()
      }
    }
  }
}));

describe('DatabaseService Integration Tests', () => {
  let databaseService: DatabaseService;
  let mockDb: any;

  beforeEach(() => {
    // Очищаем кэш перед каждым тестом
    cacheService.clear();
    
    // Получаем мок базы данных
    mockDb = require('../../db/index.js').db;
    
    // Создаем экземпляр сервиса
    databaseService = new DatabaseService();
  });

  afterEach(() => {
    cacheService.clear();
    jest.clearAllMocks();
  });

  describe('getCitizens with caching', () => {
    it('should cache results and not call database on second request', async () => {
      const mockCitizens = [
        { id: 1, name: 'John Doe', isUnit: true },
        { id: 2, name: 'Jane Smith', isUnit: false }
      ];

      // Настраиваем мок для первого вызова
      mockDb.query.characters.findMany.mockResolvedValueOnce(mockCitizens);

      // Первый вызов - должен обратиться к базе данных
      const result1 = await databaseService.getCitizens({ isUnit: true });
      
      expect(mockDb.query.characters.findMany).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(mockCitizens);

      // Второй вызов с теми же параметрами - должен использовать кэш
      const result2 = await databaseService.getCitizens({ isUnit: true });
      
      // База данных не должна вызываться снова
      expect(mockDb.query.characters.findMany).toHaveBeenCalledTimes(1);
      expect(result2).toEqual(mockCitizens);
    });

    it('should use different cache keys for different filters', async () => {
      const mockCitizens1 = [{ id: 1, name: 'John Doe', isUnit: true }];
      const mockCitizens2 = [{ id: 2, name: 'Jane Smith', isUnit: false }];

      // Настраиваем моки для разных вызовов
      mockDb.query.characters.findMany
        .mockResolvedValueOnce(mockCitizens1)
        .mockResolvedValueOnce(mockCitizens2);

      // Первый вызов с фильтром isUnit: true
      const result1 = await databaseService.getCitizens({ isUnit: true });
      expect(mockDb.query.characters.findMany).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(mockCitizens1);

      // Второй вызов с фильтром isUnit: false
      const result2 = await databaseService.getCitizens({ isUnit: false });
      expect(mockDb.query.characters.findMany).toHaveBeenCalledTimes(2);
      expect(result2).toEqual(mockCitizens2);

      // Третий вызов с теми же фильтрами - должен использовать кэш
      const result3 = await databaseService.getCitizens({ isUnit: true });
      const result4 = await databaseService.getCitizens({ isUnit: false });
      
      // База данных не должна вызываться снова
      expect(mockDb.query.characters.findMany).toHaveBeenCalledTimes(2);
      expect(result3).toEqual(mockCitizens1);
      expect(result4).toEqual(mockCitizens2);
    });
  });

  describe('cache invalidation', () => {
    it('should invalidate citizens cache when updateCitizen is called', async () => {
      const mockCitizens = [
        { id: 1, name: 'John Doe', isUnit: true },
        { id: 2, name: 'Jane Smith', isUnit: false }
      ];

      // Настраиваем мок
      mockDb.query.characters.findMany.mockResolvedValue(mockCitizens);

      // Первый вызов - кэшируем результат
      await databaseService.getCitizens({ isUnit: true });
      expect(mockDb.query.characters.findMany).toHaveBeenCalledTimes(1);

      // Второй вызов - используем кэш
      await databaseService.getCitizens({ isUnit: true });
      expect(mockDb.query.characters.findMany).toHaveBeenCalledTimes(1);

      // Инвалидируем кэш
      await databaseService.invalidateCitizensCache();

      // Третий вызов - должен снова обратиться к базе данных
      await databaseService.getCitizens({ isUnit: true });
      expect(mockDb.query.characters.findMany).toHaveBeenCalledTimes(2);
    });

    it('should invalidate all cache when invalidateAllCache is called', async () => {
      const mockCitizens = [{ id: 1, name: 'John Doe' }];
      const mockDepartments = [{ id: 1, name: 'Police' }];

      // Настраиваем моки
      mockDb.query.characters.findMany.mockResolvedValue(mockCitizens);
      mockDb.query.departments.findMany.mockResolvedValue(mockDepartments);

      // Кэшируем данные
      await databaseService.getCitizens();
      await databaseService.getDepartments();

      expect(mockDb.query.characters.findMany).toHaveBeenCalledTimes(1);
      expect(mockDb.query.departments.findMany).toHaveBeenCalledTimes(1);

      // Используем кэш
      await databaseService.getCitizens();
      await databaseService.getDepartments();

      expect(mockDb.query.characters.findMany).toHaveBeenCalledTimes(1);
      expect(mockDb.query.departments.findMany).toHaveBeenCalledTimes(1);

      // Инвалидируем весь кэш
      await databaseService.invalidateAllCache();

      // Должны снова обратиться к базе данных
      await databaseService.getCitizens();
      await databaseService.getDepartments();

      expect(mockDb.query.characters.findMany).toHaveBeenCalledTimes(2);
      expect(mockDb.query.departments.findMany).toHaveBeenCalledTimes(2);
    });
  });

  describe('cache information', () => {
    it('should return cache information', async () => {
      const mockCitizens = [{ id: 1, name: 'John Doe' }];
      mockDb.query.characters.findMany.mockResolvedValue(mockCitizens);

      // Кэшируем данные
      await databaseService.getCitizens();

      const cacheInfo = await databaseService.getCacheInfo();

      expect(cacheInfo).toHaveProperty('size');
      expect(cacheInfo).toHaveProperty('keys');
      expect(cacheInfo.size).toBeGreaterThan(0);
      expect(cacheInfo.keys).toContain(expect.stringContaining('citizens:'));
    });
  });
}); 