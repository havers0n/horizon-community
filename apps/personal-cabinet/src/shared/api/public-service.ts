import { apiClient } from './api-client';
import type { Database } from '@roleplay-identity/db-types';

export type Department = Database['public']['Functions']['get_all_departments']['Returns'][number];

export async function getPublicDepartments(): Promise<Department[]> {
	const response = await apiClient.get<Department[]>('/departments');
	return response;
}

export const publicApi = {
getDepartments: getPublicDepartments,
};