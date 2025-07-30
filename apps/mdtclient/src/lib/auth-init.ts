/**
 * Инициализация и синхронизация систем аутентификации
 */

import { authUtils } from './auth';
import { apiService } from '../services/api';

/**
 * Инициализирует глобальные объекты для синхронизации токенов
 */
export const initializeAuthSync = () => {
  if (typeof window !== 'undefined') {
    // Делаем authUtils доступным глобально для синхронизации
    (window as any).authUtils = authUtils;
    
    // Делаем apiService доступным глобально для синхронизации
    (window as any).apiService = apiService;
    
    // Синхронизируем токены при инициализации
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Устанавливаем токен в обе системы
      authUtils.setToken(token);
      if (apiService && typeof apiService.setAuthToken === 'function') {
        apiService.setAuthToken(token);
      }
    }
  }
};

/**
 * Получить текущий токен из любой доступной системы
 */
export const getCurrentToken = (): string | null => {
  return authUtils.getToken() || (apiService && typeof apiService.getAuthToken === 'function' ? apiService.getAuthToken() : null);
};

/**
 * Установить токен во все системы
 */
export const setTokenGlobally = (token: string): void => {
  authUtils.setToken(token);
  if (apiService && typeof apiService.setAuthToken === 'function') {
    apiService.setAuthToken(token);
  }
};

/**
 * Очистить токен из всех систем
 */
export const clearTokenGlobally = (): void => {
  authUtils.removeToken();
  if (apiService && typeof apiService.removeAuthToken === 'function') {
    apiService.removeAuthToken();
  }
}; 