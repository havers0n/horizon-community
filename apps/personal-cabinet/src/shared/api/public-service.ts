import { apiClient, type ApiResponse } from './api-client';
import type { Database } from '@roleplay-identity/db-types';

export type Department = Database['public']['Functions']['get_all_departments']['Returns'][number];

export async function getPublicDepartments(): Promise<Department[]> {
const response = await apiClient.get<ApiResponse<Department[]>>('/public/departments');
if (!response.success) {
throw new Error(response.message || 'Не удалось загрузить департаменты');
}
return response.data;
}

export const publicApi = {
getDepartments: getPublicDepartments,
};