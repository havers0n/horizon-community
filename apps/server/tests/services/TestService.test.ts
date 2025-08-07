import { TestService } from '../../src/core/services/TestService';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@roleplay-identity/db-types';

// Мокаем импорт mdtSupabase
jest.mock('../../src/core/lib/supabase', () => ({
  mdtSupabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  }
}));

// Импортируем мок после его создания
import { mdtSupabase } from '../../src/core/lib/supabase';

describe('TestService', () => {
  let testService: TestService;

  beforeEach(() => {
    jest.clearAllMocks();
    testService = new TestService();
  });

  describe('getAvailableTestsForUser', () => {
    it('should use mdtSupabase for both applications and tests', async () => {
      // Мокаем ответы
      const mockApplications = [
        { type: 'police', status: 'accepted' }
      ];
      
      const mockTests = [
        { 
          id: '1', 
          title: 'Police Test', 
          is_active: true, 
          required_application_type: 'police',
          created_at: '2024-01-01'
        }
      ];

      // Настраиваем моки для последовательных вызовов
      (mdtSupabase.from as jest.Mock) = jest.fn()
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: mockApplications,
                error: null
              })
            })
          })
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockTests,
                error: null
              })
            })
          })
        });

      // Вызываем метод
      const result = await testService.getAvailableTestsForUser('user123');

      // Проверяем, что использовался правильный клиент для обеих таблиц
      expect(mdtSupabase.from).toHaveBeenCalledWith('applications');
      expect(mdtSupabase.from).toHaveBeenCalledWith('tests');
      
      // Проверяем результат
      expect(result).toEqual(mockTests);
    });

    it('should handle errors correctly', async () => {
      // Мокаем ошибку при получении заявок
      (mdtSupabase.from as jest.Mock) = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      });

      // Ожидаем, что метод выбросит ошибку
      await expect(testService.getAvailableTestsForUser('user123'))
        .rejects
        .toThrow('Не удалось получить данные о заявках пользователя');
    });
  });

  describe('createTest', () => {
    it('should use mdtSupabase for creating tests', async () => {
      const testData = {
        title: 'Test Title',
        description: 'Test Description',
        questions: [],
        is_active: true
      };

      const mockCreatedTest = { id: '1', ...testData };

      (mdtSupabase.from as jest.Mock) = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCreatedTest,
              error: null
            })
          })
        })
      });

      const result = await testService.createTest(testData);

      expect(mdtSupabase.from).toHaveBeenCalledWith('tests');
      expect(result).toEqual(mockCreatedTest);
    });
  });
}); 