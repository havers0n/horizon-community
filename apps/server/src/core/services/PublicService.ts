import { createClient } from '@supabase/supabase-js';

export interface PublicDepartment {
  id: string; // UUID в виде строки
  name: string;
  full_name: string;
  logo_url?: string;
  description?: string;
  gallery?: string[];
}

export class PublicService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Получает список всех департаментов через безопасную RPC функцию
   * Эта функция не требует аутентификации и безопасно обращается к схеме common
   */
  async getAllDepartments(): Promise<PublicDepartment[]> {
    try {
      console.log('[PublicService] 🔍 Запрос списка департаментов через RPC функцию...');
      
      const { data, error } = await this.supabase
        .rpc('get_all_departments');

      if (error) {
        console.error('[PublicService] ❌ Ошибка при получении департаментов:', error);
        throw new Error(`Failed to fetch departments: ${error.message}`);
      }

      console.log(`[PublicService] ✅ Получено ${data?.length || 0} департаментов`);
      return data || [];
      
    } catch (error) {
      console.error('[PublicService] ❌ Исключение при получении департаментов:', error);
      throw error;
    }
  }

  /**
   * Получает департамент по ID через безопасную RPC функцию
   */
  async getDepartmentById(id: string): Promise<PublicDepartment | null> {
    try {
      console.log(`[PublicService] 🔍 Запрос департамента с ID ${id}...`);
      
      const { data, error } = await this.supabase
        .rpc('get_all_departments');

      if (error) {
        console.error('[PublicService] ❌ Ошибка при получении департамента:', error);
        throw new Error(`Failed to fetch department: ${error.message}`);
      }

      const department = data?.find((dept: PublicDepartment) => dept.id === id);
      console.log(`[PublicService] ✅ Департамент ${id} ${department ? 'найден' : 'не найден'}`);
      
      return department || null;
      
    } catch (error) {
      console.error('[PublicService] ❌ Исключение при получении департамента:', error);
      throw error;
    }
  }

  /**
   * Проверяет доступность сервиса
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; departmentsCount: number }> {
    try {
      const departments = await this.getAllDepartments();
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        departmentsCount: departments.length
      };
    } catch (error) {
      console.error('[PublicService] ❌ Health check failed:', error);
      throw error;
    }
  }
}

// Экспортируем единственный экземпляр
export const publicService = new PublicService(); 