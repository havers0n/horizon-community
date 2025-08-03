// Адаптеры для совместимости типов данных между фронтендом и бэкендом
import type { User, Application, Notification } from '../types/database';

// Новые адаптеры с правильными UUID типами
export const adaptBackendUserToFrontend = (backendUser: User): User => ({
  ...backendUser,
  // Все поля уже имеют правильные типы UUID
});

export const adaptBackendApplicationToFrontend = (backendApp: Application): Application => ({
  ...backendApp,
  // Все поля уже имеют правильные типы UUID
});

export const adaptBackendNotificationToFrontend = (backendNotif: Notification): Notification => ({
  ...backendNotif,
  // Все поля уже имеют правильные типы UUID
});

// Адаптеры для массивов
export const adaptBackendUsersToFrontend = (backendUsers: User[]): User[] => 
  backendUsers.map(adaptBackendUserToFrontend);

export const adaptBackendApplicationsToFrontend = (backendApps: Application[]): Application[] => 
  backendApps.map(adaptBackendApplicationToFrontend);

export const adaptBackendNotificationsToFrontend = (backendNotifs: Notification[]): Notification[] => 
  backendNotifs.map(adaptBackendNotificationToFrontend);

// Обратные адаптеры (если понадобятся)
export const adaptFrontendUserToBackend = (frontendUser: User): Partial<User> => ({
  username: frontendUser.username,
  department_id: frontendUser.department_id || undefined,
  role: frontendUser.role
});

export const adaptFrontendApplicationToBackend = (frontendApp: Application): Partial<Application> => ({
  type: frontendApp.type,
  status: frontendApp.status,
  data: frontendApp.data
});

// Утилиты для работы с UUID (больше не нужны, но оставляем для совместимости)
export const generateFrontendId = (backendId: string): string => {
  return backendId; // Просто возвращаем UUID как есть
};

export const generateBackendId = (frontendId: string): string => {
  return frontendId; // Просто возвращаем UUID как есть
};

// Типы для API ответов
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 