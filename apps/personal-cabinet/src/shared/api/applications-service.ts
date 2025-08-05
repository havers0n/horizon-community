// src/shared/api/applications-service.ts

import { apiClient } from './api-client';
import type { PaginatedResponse } from './api-client';
import type { Database } from '@roleplay-identity/db-types';
import { v4 as uuidv4 } from 'uuid';

// --- ПРАВИЛЬНЫЕ ПСЕВДОНИМЫ ---
type Applications = Database['mdt']['Tables']['applications']['Row'];
type ApplicationsInsert = Database['mdt']['Tables']['applications']['Insert'];
type ApplicationsUpdate = Partial<Database['mdt']['Tables']['applications']['Update']>;

// --- ТИПЫ ДЛЯ КОММЕНТАРИЕВ ---
interface Comments {
  id: string;
  application_id: string;
  author_user_id: string;
  content: string;
  created_at: string;
}

interface CommentsInsert {
  application_id: string;
  author_user_id: string;
  content: string;
}

// --- ТИПЫ ДЛЯ API ---
export type CreateApplicationPayload = Omit<ApplicationsInsert, 'id' | 'created_at' | 'updated_at'> & {
  attachments_files?: File[];
};

export type UpdateApplicationData = ApplicationsUpdate;

export interface ApplicationFilters {
  type?: Applications['type'];
  status?: Applications['status'];
  search?: string;
}

const BASE_URL = '/applications';

// --- ИДЕАЛЬНЫЕ МЕТОДЫ API ---
export const getApplications = (
  filters?: ApplicationFilters
): Promise<PaginatedResponse<Applications>> => {
  return apiClient.get<PaginatedResponse<Applications>>(BASE_URL, { params: filters });
};

export const getApplicationById = (id: string): Promise<Applications> => {
  return apiClient.get<Applications>(`${BASE_URL}/${id}`);
};

export const createApplication = (
  data: CreateApplicationPayload
): Promise<Applications> => {
  const formData = new FormData();
  const { attachments_files, ...applicationData } = data;
  
  // Создаем полную запись для вставки
  const fullApplicationData: ApplicationsInsert = {
    ...applicationData,
    id: uuidv4(), // Генерируем ID
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  Object.entries(fullApplicationData).forEach(([key, value]) => {
    if (value != null) {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
  });
  
  if (attachments_files) {
    attachments_files.forEach((file: File) => formData.append('attachments', file));
  }
  
  return apiClient.post<Applications>(BASE_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateApplication = (
  id: string,
  data: UpdateApplicationData
): Promise<Applications> => {
  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  };
  return apiClient.put<Applications>(`${BASE_URL}/${id}`, updateData);
};

export const deleteApplication = (id: string): Promise<void> => {
  return apiClient.delete<void>(`${BASE_URL}/${id}`);
};

export const approveApplication = (
  id: string,
  comment?: string
): Promise<Applications> => {
  return apiClient.post<Applications>(`${BASE_URL}/${id}/approve`, { comment });
};

export const rejectApplication = (
  id: string,
  reason: string
): Promise<Applications> => {
  return apiClient.post<Applications>(`${BASE_URL}/${id}/reject`, { reason });
};

export const addCommentToApplication = (
  id: string,
  commentData: CommentsInsert
): Promise<Comments> => {
  const fullCommentData = {
    ...commentData,
    id: uuidv4(),
    created_at: new Date().toISOString(),
  };
  return apiClient.post<Comments>(`${BASE_URL}/${id}/comments`, fullCommentData);
};