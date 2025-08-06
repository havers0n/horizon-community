// src/shared/api/auth-service.ts

import { apiClient } from './api-client';
import type { Database } from '@roleplay-identity/db-types';
import { v4 as uuidv4 } from 'uuid';

// --- ПРАВИЛЬНЫЕ ПСЕВДОНИМЫ ---
type Profiles = Database['public']['Tables']['profiles']['Row'];
type ProfilesInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfilesUpdate = Partial<Database['public']['Tables']['profiles']['Update']>;

// --- ТИПЫ ДЛЯ API ---
export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  username?: string;
  first_name?: string;
  last_name?: string;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: Profiles;
};

const BASE_URL = '/auth';

// --- ИДЕАЛЬНЫЕ МЕТОДЫ ---
export const login = (credentials: LoginCredentials): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>(`${BASE_URL}/login`, credentials);
};

export const register = (data: RegisterPayload): Promise<AuthResponse> => {
  const newProfile: ProfilesInsert = {
    id: uuidv4(), // Генерируем ID здесь
    email: data.email,
    username: data.username || `${data.first_name || 'User'} ${data.last_name || ''}`.trim(),
    role: 'citizen', // Устанавливаем роль по умолчанию
  };
  return apiClient.post<AuthResponse>(`${BASE_URL}/register`, newProfile);
};

export const logout = (): Promise<void> => {
  return apiClient.post<void>(`${BASE_URL}/logout`);
};

export const refreshToken = (
  refresh_token: string
): Promise<{ access_token: string }> => {
  return apiClient.post<{ access_token: string }>(`${BASE_URL}/refresh`, { refresh_token });
};

export const getCurrentUser = (): Promise<Profiles> => {
  return apiClient.get<Profiles>(`${BASE_URL}/me`);
};

export const updateProfile = (data: ProfilesUpdate): Promise<Profiles> => {
  return apiClient.put<Profiles>(`${BASE_URL}/profile`, data);
};

// --- ХЕЛПЕРЫ ДЛЯ TOKEN MANAGEMENT ---
export const setTokens = (access_token: string, refresh_token: string): void => {
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

export const clearTokens = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};