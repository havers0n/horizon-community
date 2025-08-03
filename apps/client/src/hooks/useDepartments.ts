import { useState, useEffect } from 'react';
import { departmentsService, Department } from '../services/departmentsService';

interface UseDepartmentsReturn {
  departments: Department[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseDepartmentReturn {
  department: Department | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Хук для получения списка всех департаментов
 */
export function useDepartments(): UseDepartmentsReturn {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await departmentsService.getAllDepartments();
      setDepartments(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error('[useDepartments] Ошибка при получении департаментов:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return {
    departments,
    loading,
    error,
    refetch: fetchDepartments
  };
}

/**
 * Хук для получения конкретного департамента по ID
 */
export function useDepartment(id: string): UseDepartmentReturn {
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartment = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await departmentsService.getDepartmentById(id);
      setDepartment(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error(`[useDepartment] Ошибка при получении департамента ${id}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartment();
  }, [id]);

  return {
    department,
    loading,
    error,
    refetch: fetchDepartment
  };
}

/**
 * Хук для проверки доступности API департаментов
 */
export function useDepartmentsHealth(): { isHealthy: boolean; loading: boolean } {
  const [isHealthy, setIsHealthy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const healthy = await departmentsService.healthCheck();
        setIsHealthy(healthy);
      } catch (error) {
        setIsHealthy(false);
        console.error('[useDepartmentsHealth] Health check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return { isHealthy, loading };
} 