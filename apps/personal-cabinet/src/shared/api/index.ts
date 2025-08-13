import { publicApi } from './public-service';
import { cabinetApi } from './cabinet-service';

// API Client
export { apiClient } from './api-client';
export type { ApiResponse, PaginatedResponse } from './api-client';

// Auth Service
export * from './auth-service';

// Applications Service
export * from './applications-service';

// Cabinet Service
export * from './cabinet-service';

// Public Service
export * from './public-service';

export const api = {
public: publicApi,
cabinet: cabinetApi,
};