/**
 * Типы для mdtclient из packages/db-types
 * Автоматически сгенерировано
 */

// Импорт типов из packages/db-types
export type { Database, Tables } from '../../../packages/db-types/src/index';

// Алиасы для удобства
export type User = Tables['users'];
export type Character = Tables['characters'];
export type Department = Tables['departments'];
export type Bolo = Tables['bolos'];
export type MDTUnit = Tables['mdt_units'];
export type MDTCall = Tables['mdt_calls_911'];
export type Vehicle = Tables['vehicles'];

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

// Типы для MDT специфичных данных
export interface BoloWithAuthor extends Bolo {
  author: {
    id: string;
    username: string;
  };
}

export interface MDTUnitWithCharacter extends MDTUnit {
  character: Character;
  department: Department;
}

export interface MDTCallWithDetails extends MDTCall {
  units: MDTUnitWithCharacter[];
  location: {
    address: string;
    coordinates?: [number, number];
  };
}

// Типы для форм
export interface CreateBoloForm {
  title: string;
  description: string;
  character_id?: string;
  vehicle_id?: string;
  priority: 'low' | 'medium' | 'high';
  expires_at?: string;
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

export interface CreateVehicleForm {
  plate: string;
  model: string;
  color: string;
  owner_id?: string;
  stolen?: boolean;
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

export interface BoloFilters {
  priority?: 'low' | 'medium' | 'high';
  active?: boolean;
  character_id?: string;
  vehicle_id?: string;
  limit?: number;
  offset?: number;
}

export interface VehicleFilters {
  plate?: string;
  model?: string;
  color?: string;
  stolen?: boolean;
  owner_id?: string;
  limit?: number;
  offset?: number;
}

// Типы для статистики
export interface MDTStatistics {
  total_characters: number;
  total_vehicles: number;
  active_bolos: number;
  active_units: number;
  pending_calls: number;
}

export interface DepartmentStatistics {
  department_id: string;
  department_name: string;
  total_units: number;
  active_units: number;
  total_calls: number;
  pending_calls: number;
}