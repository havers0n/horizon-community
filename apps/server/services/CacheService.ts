

/**
 * Сервис кэширования для оптимизации производительности
 * Использует in-memory кэш с TTL (Time To Live)
 */
export class CacheService {
  private cache: Map<string, { data: any; expires: number }> = new Map();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 минут по умолчанию

  /**
   * Получить данные из кэша
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Проверка истечения срока действия
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Сохранить данные в кэш
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const expires = Date.now() + ttl;
    this.cache.set(key, { data, expires });
  }

  /**
   * Удалить данные из кэша
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Очистить весь кэш
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Получить размер кэша
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Очистить устаревшие записи
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Кэшировать результат функции
   */
  async cached<T>(
    key: string, 
    fn: () => Promise<T>, 
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    this.set(key, result, ttl);
    return result;
  }

  /**
   * Инвалидировать кэш по паттерну
   */
  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// Создаем глобальный экземпляр кэша
export const cacheService = new CacheService();

// Автоматическая очистка кэша каждые 10 минут
setInterval(() => {
  cacheService.cleanup();
}, 10 * 60 * 1000); 