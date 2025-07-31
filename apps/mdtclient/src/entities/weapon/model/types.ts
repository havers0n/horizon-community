// @ts-nocheck - TODO: Remove after major refactoring is complete
// Типы данных для сущности Weapon
import type { Weapon } from '@/shared/types';

// Типы для создания и обновления
export interface CreateWeaponRequest {
  serialNumber: string;
  model: string;
  type: string;
  caliber: string;
  ownerId: string;
  licenseNumber?: string;
  notes?: string;
}

export interface UpdateWeaponRequest extends Partial<CreateWeaponRequest> {
  id: string;
}

// Типы для поиска и фильтрации
export interface WeaponSearchParams {
  query?: string;
  serialNumber?: string;
  model?: string;
  type?: string;
  caliber?: string;
  status?: 'registered' | 'stolen' | 'confiscated';
  ownerId?: string;
  limit?: number;
  offset?: number;
}

export interface WeaponSearchResult {
  weapons: Weapon[];
  total: number;
  hasMore: boolean;
}

// Типы для экспорта
export interface WeaponExportData {
  weapons: Weapon[];
  exportDate: string;
  exportedBy: string;
}

// Типы для статистики
export interface WeaponStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byCaliber: Record<string, number>;
  stolen: number;
  confiscated: number;
} 