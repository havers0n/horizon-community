import { create } from 'zustand';
import { MOCK_WEAPONS } from '../../../model/constants';
import type { WeaponSearchState, WeaponSearchActions, WeaponSearchResult, WeaponSearchFilters } from './types';

type WeaponSearchStore = WeaponSearchState & WeaponSearchActions;

export const useWeaponSearchStore = create<WeaponSearchStore>((set, get) => ({
  // State
  searchFilters: {
    serialNumber: '',
    type: '',
    model: '',
    ownerName: ''
  },
  searchResults: [],
  selectedWeapon: null,
  isLoading: false,
  error: null,

  // Actions
  setSearchFilters: (filters: Partial<WeaponSearchFilters>) => {
    set(state => ({
      searchFilters: { ...state.searchFilters, ...filters }
    }));
  },

  searchWeapons: () => {
    const { searchFilters } = get();
    set({ isLoading: true, error: null });
    
    try {
      const results = MOCK_WEAPONS.filter(weapon => {
        const matchesSerial = !searchFilters.serialNumber || weapon.serialNumber.toLowerCase().includes(searchFilters.serialNumber.toLowerCase());
        const matchesType = !searchFilters.type || weapon.type.toLowerCase().includes(searchFilters.type.toLowerCase());
        const matchesModel = !searchFilters.model || weapon.model.toLowerCase().includes(searchFilters.model.toLowerCase());
        const matchesOwner = !searchFilters.ownerName || (() => {
          const owner = MOCK_CITIZENS_EXTENDED.find(c => c.id === weapon.ownerId);
          return owner ? `${owner.firstName} ${owner.lastName}`.toLowerCase().includes(searchFilters.ownerName.toLowerCase()) : false;
        })();
        
        return matchesSerial && matchesType && matchesModel && matchesOwner;
      }).map(weapon => {
        const owner = MOCK_CITIZENS_EXTENDED.find(c => c.id === weapon.ownerId);
        return {
          id: weapon.id,
          serialNumber: weapon.serialNumber,
          type: weapon.type,
          model: weapon.model,
          ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Неизвестно',
          ownerId: weapon.ownerId,
          status: weapon.registration
        };
      });
      
      set({ searchResults: results, isLoading: false });
    } catch (error) {
      set({ 
        error: 'Ошибка при поиске оружия', 
        isLoading: false 
      });
    }
  },

  selectWeapon: (weapon: WeaponSearchResult) => {
    const fullWeapon = MOCK_WEAPONS.find(w => w.id === weapon.id);
    if (fullWeapon) {
      set({ selectedWeapon: fullWeapon });
    }
  },

  clearSelection: () => {
    set({ selectedWeapon: null });
  },

  clearError: () => {
    set({ error: null });
  }
}));