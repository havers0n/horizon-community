import { create } from 'zustand';
import { MOCK_CITIZENS_EXTENDED } from '../../model/constants';
import type { AddressSearchState, AddressSearchActions, AddressSearchResult, AddressSearchFilters } from './types';

type AddressSearchStore = AddressSearchState & AddressSearchActions;

// Моковые данные для адресов
const MOCK_ADDRESSES: AddressSearchResult[] = [
  {
    id: '1',
    address: '123 Main St',
    city: 'Los Santos',
    state: 'CA',
    zipCode: '90210',
    type: 'Residential',
    residents: ['John Doe', 'Jane Doe']
  },
  {
    id: '2',
    address: '456 Oak Ave',
    city: 'Los Santos',
    state: 'CA',
    zipCode: '90211',
    type: 'Commercial',
    residents: ['Business Corp']
  },
  {
    id: '3',
    address: '789 Pine Rd',
    city: 'Los Santos',
    state: 'CA',
    zipCode: '90212',
    type: 'Residential',
    residents: ['Bob Smith', 'Alice Johnson']
  }
];

export const useAddressSearchStore = create<AddressSearchStore>((set, get) => ({
  // State
  searchFilters: {
    address: '',
    city: '',
    zipCode: ''
  },
  searchResults: [],
  selectedAddress: null,
  isLoading: false,
  error: null,

  // Actions
  setSearchFilters: (filters: Partial<AddressSearchFilters>) => {
    set(state => ({
      searchFilters: { ...state.searchFilters, ...filters }
    }));
  },

  searchAddresses: () => {
    const { searchFilters } = get();
    set({ isLoading: true, error: null });
    
    try {
      const results = MOCK_ADDRESSES.filter(address => {
        const matchesAddress = !searchFilters.address || address.address.toLowerCase().includes(searchFilters.address.toLowerCase());
        const matchesCity = !searchFilters.city || address.city.toLowerCase().includes(searchFilters.city.toLowerCase());
        const matchesZip = !searchFilters.zipCode || address.zipCode.includes(searchFilters.zipCode);
        
        return matchesAddress && matchesCity && matchesZip;
      });
      
      set({ searchResults: results, isLoading: false });
    } catch (error) {
      set({ 
        error: 'Ошибка при поиске адресов', 
        isLoading: false 
      });
    }
  },

  selectAddress: (address: AddressSearchResult) => {
    set({ selectedAddress: address });
  },

  clearSelection: () => {
    set({ selectedAddress: null });
  },

  clearError: () => {
    set({ error: null });
  }
}));