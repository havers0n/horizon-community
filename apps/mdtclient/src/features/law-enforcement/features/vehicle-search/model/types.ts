import type { Vehicle } from '@/shared';

export interface VehicleSearchResult {
  id: string;
  plate: string;
  model: string;
  color: string;
  ownerName: string;
  ownerId: string;
  status: string;
}

export interface VehicleSearchFilters {
  plate: string;
  model: string;
  color: string;
  type: string;
}

export interface VehicleSearchState {
  searchFilters: VehicleSearchFilters;
  searchResults: VehicleSearchResult[];
  selectedVehicle: Vehicle | null;
  isLoading: boolean;
  error: string | null;
}

export interface VehicleSearchActions {
  setSearchFilters: (filters: Partial<VehicleSearchFilters>) => void;
  searchVehicles: () => void;
  selectVehicle: (vehicle: VehicleSearchResult) => void;
  clearSelection: () => void;
  clearError: () => void;
}