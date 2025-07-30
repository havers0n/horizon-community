// Настройка тестового окружения
import { config } from 'dotenv';

// Загружаем переменные окружения для тестов
config({ path: '.env.test' });

// Глобальные настройки для тестов
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';

// Увеличиваем таймаут для тестов
jest.setTimeout(10000);

// Глобальные моки
global.console = {
  ...console,
  // Отключаем логи в тестах для чистоты вывода
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Очистка после каждого теста
afterEach(() => {
  jest.clearAllMocks();
}); 