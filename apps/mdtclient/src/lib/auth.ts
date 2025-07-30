/**
 * Утилиты для работы с авторизацией
 */

const TOKEN_KEY = 'auth_token';

export const authUtils = {
  /**
   * Получить токен авторизации
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Установить токен авторизации
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    
    // Синхронизируем с apiService если он доступен
    // ИСПРАВЛЕНО: Используем правильное имя метода setAuthToken
    if (typeof window !== 'undefined' && (window as any).apiService && typeof (window as any).apiService.setAuthToken === 'function') {
      (window as any).apiService.setAuthToken(token);
    }
  },

  /**
   * Удалить токен авторизации
   */
  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    
    // Синхронизируем с apiService если он доступен
    // ИСПРАВЛЕНО: Используем правильное имя метода removeAuthToken
    if (typeof window !== 'undefined' && (window as any).apiService && typeof (window as any).apiService.removeAuthToken === 'function') {
      (window as any).apiService.removeAuthToken();
    }
  },

  /**
   * Проверить, авторизован ли пользователь
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /**
   * Получить заголовки авторизации для API запросов
   */
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  },

  /**
   * Создать заголовки для API запроса с дополнительными заголовками
   */
  createHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      ...this.getAuthHeaders(),
      ...additionalHeaders
    };
  }
};

/**
 * Хук для работы с авторизацией в компонентах
 */
export const useAuth = () => {
  return {
    getToken: authUtils.getToken,
    setToken: authUtils.setToken,
    removeToken: authUtils.removeToken,
    isAuthenticated: authUtils.isAuthenticated,
    getAuthHeaders: authUtils.getAuthHeaders,
    createHeaders: authUtils.createHeaders
  };
}; 