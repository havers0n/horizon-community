// Интерфейс для департамента из API
export interface Department {
  id: string;
  name: string;
  full_name: string;
  logo_url?: string;
  description?: string;
  gallery?: string[];
}

// Интерфейс для ответа API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  timestamp: string;
}

// Интерфейс для ошибки API
interface ApiError {
  success: false;
  error: string;
  message: string;
  timestamp: string;
}

class DepartmentsService {
  private baseUrl: string;

  constructor() {
    // Используем переменную окружения Vite или fallback на localhost
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }

  /**
   * Получает список всех департаментов
   */
  async getAllDepartments(): Promise<Department[]> {
    try {
      console.log('[DepartmentsService] 🔍 Запрос списка департаментов...');
      
      const response = await fetch(`${this.baseUrl}/api/public/departments`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: ApiResponse<Department[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'API returned error');
      }
      
      console.log(`[DepartmentsService] ✅ Получено ${result.data.length} департаментов`);
      return result.data;
      
    } catch (error) {
      console.error('[DepartmentsService] ❌ Ошибка при получении департаментов:', error);
      throw error;
    }
  }

  /**
   * Получает департамент по ID
   */
  async getDepartmentById(id: string): Promise<Department | null> {
    try {
      console.log(`[DepartmentsService] 🔍 Запрос департамента с ID: ${id}`);
      
      const response = await fetch(`${this.baseUrl}/api/public/departments/${id}`);
      
      if (response.status === 404) {
        console.log(`[DepartmentsService] ❌ Департамент с ID ${id} не найден`);
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: ApiResponse<Department> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'API returned error');
      }
      
      console.log(`[DepartmentsService] ✅ Департамент ${id} найден`);
      return result.data;
      
    } catch (error) {
      console.error('[DepartmentsService] ❌ Ошибка при получении департамента:', error);
      throw error;
    }
  }

  /**
   * Проверяет доступность API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/health`);
      return response.ok;
    } catch (error) {
      console.error('[DepartmentsService] ❌ Health check failed:', error);
      return false;
    }
  }
}

// Экспортируем единственный экземпляр
export const departmentsService = new DepartmentsService(); 