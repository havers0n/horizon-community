// src/shared/api/api-client.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Для управления сессией мы будем использовать специальный модуль, а не localStorage напрямую.
// Это может быть простой объект или хук из entities/session.
// Пока предположим, что у него есть такие методы.
import { sessionApi } from '@/entities/session'; 

// Эти типы лучше вынести в отдельный файл, например, src/shared/api/types.ts,
// чтобы этот файл оставался чистым.
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

// Создаем типизированный API клиент
interface TypedApiClient {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}

// 1. Убираем класс. Создаем простой инстанс axios.
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Настраиваем интерцепторы на этом инстансе.
// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Декуплируем логику получения токена. Клиент не должен знать про localStorage.
    const token = sessionApi.getAccessToken(); 
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  // 3. ВОТ ГЛАВНОЕ УЛУЧШЕНИЕ:
  // При успешном ответе мы сразу возвращаем `response.data`.
  // Теперь в useQuery и useMutation нам не нужно будет писать `res.data`. Мы сразу получим полезную нагрузку.
  (response: AxiosResponse) => {
    return response.data;
  },
  // Обработка ошибок
  async (error: AxiosError) => {
    // Если это не ошибка от axios (например, ошибка в коде выше), просто пробрасываем ее
    if (!error.isAxiosError) {
      return Promise.reject(error);
    }
    
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Логика обновления токена
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Логику обновления токена тоже делегируем sessionApi
        const newAccessToken = await sessionApi.refreshToken();
        if (newAccessToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          // Повторяем оригинальный запрос с новым токеном.
          // Важно! Мы возвращаем результат вызова, а не просто вызываем.
          // И мы используем apiClient, а не axios, чтобы снова пройти через интерцепторы.
          return axiosInstance(originalRequest);
        }
      } catch (refreshError: unknown) {
        // Если обновление токена не удалось, выходим из системы.
        sessionApi.clearSession();
        // 4. ДЕКУПЛИРУЕМ РЕДИРЕКТ:
        // Вместо window.location.href, мы отправляем кастомное событие.
        // В корневом компоненте (App.tsx) можно повесить слушатель и сделать редирект там.
        // Это позволяет API-слою не знать о роутинге.
        window.dispatchEvent(new Event('unauthorized'));
        return Promise.reject(refreshError);
      }
    }
    
    // 5. УЛУЧШЕНИЕ ОБРАБОТКИ ОШИБОК:
    // Если у бэкенда есть стандартный формат ошибок, извлекаем его.
    // TanStack Query получит чистый объект ошибки, а не весь AxiosError.
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject(error);
  }
);

// Создаем типизированный API клиент
export const apiClient: TypedApiClient = axiosInstance;

// Функция для загрузки файлов с типизированным прогрессом
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

/*
  ЧТО ДЕЛАТЬ С ОСТАЛЬНЫМИ МЕТОДАМИ? (uploadFile, downloadFile)

  Они больше не являются частью клиента. Они становятся отдельными функциями
  в своих собственных файлах, которые используют наш apiClient.

  Пример: src/shared/api/file-api.ts

  import { apiClient } from './api-client';

  export const uploadFile = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
*/