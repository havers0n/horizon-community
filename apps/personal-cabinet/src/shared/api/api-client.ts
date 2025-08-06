// src/shared/api/api-client.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { QueryClient } from '@tanstack/react-query';

// Типы для API ответов
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Типизированный API клиент
interface TypedApiClient {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}

// Утилита для получения токена из localStorage
const getAccessToken = (): string | null => {
  // Проверяем все возможные ключи токенов для совместимости
  return localStorage.getItem('accessToken') || 
         localStorage.getItem('access_token') || 
         localStorage.getItem('authToken');
};

// Утилита для очистки сессии
const clearSession = (): void => {
  // Очищаем все возможные ключи токенов для совместимости
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
};

// Создание axios инстанса с правильной базовой URL
const getBaseUrl = (): string => {
  let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  // Если VITE_API_URL не содержит /api, добавляем его
  if (baseUrl && !baseUrl.includes('/api')) {
    baseUrl = `${baseUrl}/api`;
  }
  
  // Логирование API конфигурации
  console.log('🔧 [Personal Cabinet] API конфигурация:')
  console.log('🔧 [Personal Cabinet] VITE_API_URL:', import.meta.env.VITE_API_URL ? '✅ Установлен' : '❌ Отсутствует')
  console.log('🔧 [Personal Cabinet] Итоговый baseURL:', baseUrl)
  
  return baseUrl;
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 секунд таймаут
});

// Request Interceptor - автоматическое добавление токена
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor - обработка ошибок и автоматическое обновление токена
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Возвращаем только data из ответа
    return response.data;
  },
  async (error: AxiosError) => {
    if (!error.isAxiosError) {
      return Promise.reject(error);
    }
    
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Логика обновления токена при 401 ошибке
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Попытка обновления токена
        const refreshToken = localStorage.getItem('refreshToken') || 
                           localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${getBaseUrl()}/auth/refresh`, {
            refreshToken
          });
          
          const { accessToken } = response.data;
          if (accessToken) {
            // Сохраняем токен во все возможные ключи для совместимости
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('authToken', accessToken);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        // Если обновление не удалось, очищаем сессию
        clearSession();
        window.dispatchEvent(new Event('unauthorized'));
        return Promise.reject(refreshError);
      }
    }
    
    // Возвращаем ошибку в стандартном формате
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject(error);
  }
);

// Экспорт типизированного API клиента
export const apiClient: TypedApiClient = axiosInstance;

// QueryClient для TanStack Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      gcTime: 10 * 60 * 1000, // 10 минут
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Утилита для создания query функций с обработкой 401 ошибок
type QueryFunction<T> = ({ queryKey }: { queryKey: string[] }) => Promise<T>;
type UnauthorizedBehavior = "returnNull" | "throw";

export const createQueryFn = <T>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> => {
  return async ({ queryKey }) => {
    const [_, url] = queryKey;
    
    try {
      const response = await apiClient.get<T>(url);
      return response;
    } catch (error: any) {
      if (error.status === 401 || error.statusCode === 401) {
        if (options.on401 === "returnNull") return null as T;
        throw new Error("Unauthorized");
      }
      throw error;
    }
  };
};

// Утилита для загрузки файлов с прогрессом
export const uploadFileWithProgress = (
  file: File, 
  onProgress?: (progressEvent: { loaded: number; total: number }) => void
) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiClient.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        onProgress({
          loaded: progressEvent.loaded,
          total: progressEvent.total
        });
      }
    },
  });
};

// Универсальная функция для API запросов (для обратной совместимости)
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  const config: AxiosRequestConfig = {
    method: method.toLowerCase() as any,
    url,
    data: data ? JSON.stringify(data) : undefined,
  };

  try {
    const response = await axiosInstance(config);
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Network error');
  }
}