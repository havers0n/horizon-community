// @ts-nocheck - TODO: Remove after major refactoring is complete
import { create } from 'zustand';
import { MOCK_VEHICLES } from '../../../model/constants';
import type { VehicleSearchState, VehicleSearchActions, VehicleSearchResult, VehicleSearchFilters } from './types';

type VehicleSearchStore = VehicleSearchState & VehicleSearchActions;

export const useVehicleSearchStore = create<VehicleSearchStore>((set, get) => ({
  // State
  searchFilters: {
    plate: '',
    model: '',
    color: '',
    type: ''
  },
  searchResults: [],
  selectedVehicle: null,
  isLoading: false,
  error: null,

  // Actions
  setSearchFilters: (filters: Partial<VehicleSearchFilters>) => {
    set(state => ({
      searchFilters: { ...state.searchFilters, ...filters }
    }));
  },

  searchVehicles: () => {
    const { searchFilters } = get();
    set({ isLoading: true, error: null });
    
    try {
      const results = MOCK_VEHICLES.filter(vehicle => {
        const matchesPlate = !searchFilters.plate || vehicle.plate.toLowerCase().includes(searchFilters.plate.toLowerCase());
        const matchesModel = !searchFilters.model || vehicle.model.toLowerCase().includes(searchFilters.model.toLowerCase());
        const matchesColor = !searchFilters.color || vehicle.color.toLowerCase().includes(searchFilters.color.toLowerCase());
        const matchesType = !searchFilters.type || vehicle.model.toLowerCase().includes(searchFilters.type.toLowerCase());
        
        return matchesPlate && matchesModel && matchesColor && matchesType;
      }).map(vehicle => {
        const owner = MOCK_CITIZENS_EXTENDED.find(c => c.id === vehicle.ownerId);
        return {
          id: vehicle.id,
          plate: vehicle.plate,
          model: vehicle.model,
          color: vehicle.color,
          ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Неизвестно',
          ownerId: vehicle.ownerId,
          status: vehicle.registration
        };
      });
      
      set({ searchResults: results, isLoading: false });
    } catch (error) {
      set({ 
        error: 'Ошибка при поиске транспортных средств', 
        isLoading: false 
      });
    }
  },

  selectVehicle: (vehicle: VehicleSearchResult) => {
    const fullVehicle = MOCK_VEHICLES.find(v => v.id === vehicle.id);
    if (fullVehicle) {
      set({ selectedVehicle: fullVehicle });
    }
  },

  clearSelection: () => {
    set({ selectedVehicle: null });
  },

  clearError: () => {
    set({ error: null });
  }
}));