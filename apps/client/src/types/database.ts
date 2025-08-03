/**
 * Типы для фронтенда из packages/db-types
 * Автоматически сгенерировано
 */

// Импорт типов из packages/db-types
export type { Database, Tables } from '../../../packages/db-types/src/index';

// Алиасы для удобства
export type User = Tables['users'];
export type Character = Tables['characters'];
export type Department = Tables['departments'];
export type Application = Tables['applications'];
export type Report = Tables['filled_reports'];
export type Test = Tables['tests'];
export type TestResult = Tables['test_results'];
export type Notification = Tables['notifications'];
export type SupportTicket = Tables['support_tickets'];
export type ReportTemplate = Tables['report_templates'];

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

// Типы для форм
export interface CreateUserForm {
  username: string;
  email: string;
  password: string;
  departmentId?: string;
}

export interface CreateCharacterForm {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone_number?: string;
  address?: string;
  occupation?: string;
}

export interface CreateApplicationForm {
  type: string;
  data?: Record<string, any>;
}

// Типы для фильтров
export interface CharacterFilters {
  ownerId?: string;
  gender?: string;
  occupation?: string;
  departmentId?: number;
  isUnit?: boolean;
  limit?: number;
  offset?: number;
}

export interface TestFilters {
  category?: string;
  difficulty?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

// Типы для статистики
export interface TestStatistics {
  total_tests: number;
  total_attempts: number;
  total_passed: number;
  avg_score: number;
}

export interface ReportStatistics {
  total_reports: number;
  draft_reports: number;
  submitted_reports: number;
  approved_reports: number;
  rejected_reports: number;
}

export interface ApplicationStatistics {
  total_applications: number;
  pending_applications: number;
  approved_applications: number;
  rejected_applications: number;
}