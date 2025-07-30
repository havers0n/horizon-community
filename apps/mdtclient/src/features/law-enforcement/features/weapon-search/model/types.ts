import type { Weapon } from '../../model/types';

export interface WeaponSearchResult {
  id: string;
  serialNumber: string;
  type: string;
  model: string;
  ownerName: string;
  ownerId: string;
  status: string;
}

export interface WeaponSearchFilters {
  serialNumber: string;
  type: string;
  model: string;
  ownerName: string;
}

export interface WeaponSearchState {
  searchFilters: WeaponSearchFilters;
  searchResults: WeaponSearchResult[];
  selectedWeapon: Weapon | null;
  isLoading: boolean;
  error: string | null;
}

export interface WeaponSearchActions {
  setSearchFilters: (filters: Partial<WeaponSearchFilters>) => void;
  searchWeapons: () => void;
  selectWeapon: (weapon: WeaponSearchResult) => void;
  clearSelection: () => void;
  clearError: () => void;
}