// Адаптеры для совместимости типов данных между фронтендом и бэкендом

// Типы фронтенда (как ожидает клиент)
export interface FrontendUser {
  id: number;
  name: string;
  department: string;
  isSupervisor: boolean;
}

export interface FrontendApplication {
  id: number;
  type: string;
  status: string;
  authorId: number;
  data?: any;
  createdAt: string;
  updatedAt: string;
}

export interface FrontendNotification {
  id: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// Типы бэкенда (как возвращает сервер)
export interface BackendUser {
  id: string; // UUID
  username: string;
  email: string;
  role: string;
  departmentId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendApplication {
  id: string; // UUID
  type: string;
  status: string;
  authorId: string; // UUID
  data?: any;
  createdAt: string;
  updatedAt: string;
}

export interface BackendNotification {
  id: string; // UUID
  content: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// Адаптеры для преобразования типов

export const adaptBackendUserToFrontend = (backendUser: BackendUser): FrontendUser => ({
  id: parseInt(backendUser.id.replace(/-/g, '').substring(0, 8), 16), // Временное решение для совместимости
  name: backendUser.username,
  department: backendUser.departmentId || '',
  isSupervisor: ['supervisor', 'admin'].includes(backendUser.role)
});

export const adaptBackendApplicationToFrontend = (backendApp: BackendApplication): FrontendApplication => ({
  id: parseInt(backendApp.id.replace(/-/g, '').substring(0, 8), 16), // Временное решение
  type: backendApp.type,
  status: backendApp.status,
  authorId: parseInt(backendApp.authorId.replace(/-/g, '').substring(0, 8), 16), // Временное решение
  data: backendApp.data,
  createdAt: backendApp.createdAt,
  updatedAt: backendApp.updatedAt
});

export const adaptBackendNotificationToFrontend = (backendNotif: BackendNotification): FrontendNotification => ({
  id: parseInt(backendNotif.id.replace(/-/g, '').substring(0, 8), 16), // Временное решение
  content: backendNotif.content,
  isRead: backendNotif.isRead,
  createdAt: backendNotif.createdAt,
  link: backendNotif.link
});

// Адаптеры для массивов
export const adaptBackendUsersToFrontend = (backendUsers: BackendUser[]): FrontendUser[] => 
  backendUsers.map(adaptBackendUserToFrontend);

export const adaptBackendApplicationsToFrontend = (backendApps: BackendApplication[]): FrontendApplication[] => 
  backendApps.map(adaptBackendApplicationToFrontend);

export const adaptBackendNotificationsToFrontend = (backendNotifs: BackendNotification[]): FrontendNotification[] => 
  backendNotifs.map(adaptBackendNotificationToFrontend);

// Обратные адаптеры (если понадобятся)
export const adaptFrontendUserToBackend = (frontendUser: FrontendUser): Partial<BackendUser> => ({
  username: frontendUser.name,
  departmentId: frontendUser.department || undefined,
  role: frontendUser.isSupervisor ? 'supervisor' : 'candidate'
});

export const adaptFrontendApplicationToBackend = (frontendApp: FrontendApplication): Partial<BackendApplication> => ({
  type: frontendApp.type,
  status: frontendApp.status,
  data: frontendApp.data
});

// Утилиты для работы с ID
export const generateFrontendId = (backendId: string): number => {
  return parseInt(backendId.replace(/-/g, '').substring(0, 8), 16);
};

export const generateBackendId = (frontendId: number): string => {
  // Это временное решение - в реальности нужно хранить маппинг ID
  return frontendId.toString(16).padStart(32, '0');
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