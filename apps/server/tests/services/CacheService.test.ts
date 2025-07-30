import { CacheService } from '../../services/CacheService.js';

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
  });

  afterEach(() => {
    cacheService.clear();
  });

  describe('set and get', () => {
    it('should set and get data correctly', () => {
      const key = 'test-key';
      const data = { name: 'test', value: 123 };

      cacheService.set(key, data);
      const result = cacheService.get(key);

      expect(result).toEqual(data);
    });

    it('should return null for non-existent key', () => {
      const result = cacheService.get('non-existent');
      expect(result).toBeNull();
    });

    it('should handle different data types', () => {
      const stringData = 'test string';
      const numberData = 42;
      const objectData = { test: true };
      const arrayData = [1, 2, 3];

      cacheService.set('string', stringData);
      cacheService.set('number', numberData);
      cacheService.set('object', objectData);
      cacheService.set('array', arrayData);

      expect(cacheService.get('string')).toBe(stringData);
      expect(cacheService.get('number')).toBe(numberData);
      expect(cacheService.get('object')).toEqual(objectData);
      expect(cacheService.get('array')).toEqual(arrayData);
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire data after TTL', async () => {
      const key = 'expire-test';
      const data = 'test data';
      const shortTTL = 10; // 10ms

      cacheService.set(key, data, shortTTL);
      
      // Данные должны быть доступны сразу
      expect(cacheService.get(key)).toBe(data);

      // Ждем истечения TTL
      await new Promise(resolve => setTimeout(resolve, 20));

      // Данные должны истечь
      expect(cacheService.get(key)).toBeNull();
    });

    it('should use default TTL when not specified', () => {
      const key = 'default-ttl';
      const data = 'test data';

      cacheService.set(key, data);
      
      // Данные должны быть доступны
      expect(cacheService.get(key)).toBe(data);
    });
  });

  describe('delete', () => {
    it('should delete existing key', () => {
      const key = 'delete-test';
      const data = 'test data';

      cacheService.set(key, data);
      expect(cacheService.get(key)).toBe(data);

      const deleted = cacheService.delete(key);
      expect(deleted).toBe(true);
      expect(cacheService.get(key)).toBeNull();
    });

    it('should return false for non-existent key', () => {
      const deleted = cacheService.delete('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all data', () => {
      cacheService.set('key1', 'data1');
      cacheService.set('key2', 'data2');
      cacheService.set('key3', 'data3');

      expect(cacheService.size()).toBe(3);

      cacheService.clear();

      expect(cacheService.size()).toBe(0);
      expect(cacheService.get('key1')).toBeNull();
      expect(cacheService.get('key2')).toBeNull();
      expect(cacheService.get('key3')).toBeNull();
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      expect(cacheService.size()).toBe(0);

      cacheService.set('key1', 'data1');
      expect(cacheService.size()).toBe(1);

      cacheService.set('key2', 'data2');
      expect(cacheService.size()).toBe(2);

      cacheService.delete('key1');
      expect(cacheService.size()).toBe(1);
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      const shortTTL = 10; // 10ms
      const longTTL = 1000; // 1 second

      cacheService.set('expired', 'expired data', shortTTL);
      cacheService.set('valid', 'valid data', longTTL);

      expect(cacheService.size()).toBe(2);

      // Ждем истечения короткого TTL
      await new Promise(resolve => setTimeout(resolve, 20));

      cacheService.cleanup();

      expect(cacheService.size()).toBe(1);
      expect(cacheService.get('expired')).toBeNull();
      expect(cacheService.get('valid')).toBe('valid data');
    });
  });

  describe('cached', () => {
    it('should return cached data if available', async () => {
      const key = 'cached-test';
      const data = 'cached data';

      cacheService.set(key, data);

      const result = await cacheService.cached(key, async () => {
        throw new Error('Function should not be called');
      });

      expect(result).toBe(data);
    });

    it('should call function and cache result if not cached', async () => {
      const key = 'cached-fn-test';
      let callCount = 0;

      const fn = async () => {
        callCount++;
        return `result-${callCount}`;
      };

      // Первый вызов - функция должна выполниться
      const result1 = await cacheService.cached(key, fn);
      expect(result1).toBe('result-1');
      expect(callCount).toBe(1);

      // Второй вызов - результат должен быть из кэша
      const result2 = await cacheService.cached(key, fn);
      expect(result2).toBe('result-1');
      expect(callCount).toBe(1); // Функция не должна вызываться снова
    });

    it('should handle async function errors', async () => {
      const key = 'cached-error-test';
      const errorMessage = 'Test error';

      const fn = async () => {
        throw new Error(errorMessage);
      };

      await expect(cacheService.cached(key, fn)).rejects.toThrow(errorMessage);
    });
  });

  describe('invalidatePattern', () => {
    it('should invalidate keys matching pattern', () => {
      cacheService.set('user:1', 'user1 data');
      cacheService.set('user:2', 'user2 data');
      cacheService.set('post:1', 'post1 data');
      cacheService.set('comment:1', 'comment1 data');

      expect(cacheService.size()).toBe(4);

      // Инвалидируем все ключи с 'user:'
      cacheService.invalidatePattern('user:');

      expect(cacheService.size()).toBe(2);
      expect(cacheService.get('user:1')).toBeNull();
      expect(cacheService.get('user:2')).toBeNull();
      expect(cacheService.get('post:1')).toBe('post1 data');
      expect(cacheService.get('comment:1')).toBe('comment1 data');
    });

    it('should handle pattern with no matches', () => {
      cacheService.set('user:1', 'user1 data');
      cacheService.set('post:1', 'post1 data');

      const initialSize = cacheService.size();

      cacheService.invalidatePattern('nonexistent');

      expect(cacheService.size()).toBe(initialSize);
    });
  });
}); 