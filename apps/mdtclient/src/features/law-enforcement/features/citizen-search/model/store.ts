import { create } from 'zustand';
import { MOCK_CITIZENS_EXTENDED } from '../../../model/constants';
import type { CitizenSearchState, CitizenSearchActions, CitizenSearchResult } from './types';

type CitizenSearchStore = CitizenSearchState & CitizenSearchActions;

export const useCitizenSearchStore = create<CitizenSearchStore>((set, get) => ({
  // State
  suggestions: [],
  selectedPerson: null,
  showSuggestions: false,
  isLoading: false,
  error: null,

  // Actions
  searchCitizens: (searchTerm: string) => {
    set({ isLoading: true, error: null });
    
    try {
      if (searchTerm.length >= 2) {
        const filtered = MOCK_CITIZENS_EXTENDED.filter(citizen => {
          const fullName = `${citizen.firstName} ${citizen.lastName}`.toLowerCase();
          const ssn = citizen.ssn?.toLowerCase() || '';
          return fullName.includes(searchTerm.toLowerCase()) || 
                 ssn.includes(searchTerm.toLowerCase());
        }).map(citizen => ({
          id: citizen.id,
          fullName: `${citizen.firstName} ${citizen.lastName}`,
          ssn: citizen.ssn,
          address: citizen.address,
          dateOfBirth: citizen.dateOfBirth,
          imageUrl: citizen.imageUrl
        }));
        
        set({ 
          suggestions: filtered, 
          showSuggestions: true, 
          isLoading: false 
        });
      } else {
        set({ 
          suggestions: [], 
          showSuggestions: false, 
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: 'Ошибка при поиске граждан', 
        isLoading: false 
      });
    }
  },

  selectPerson: (person: CitizenSearchResult) => {
    const fullPerson = MOCK_CITIZENS_EXTENDED.find(c => c.id === person.id);
    if (fullPerson) {
      set({ 
        selectedPerson: fullPerson, 
        showSuggestions: false 
      });
    }
  },

  clearSelection: () => {
    set({ selectedPerson: null });
  },

  setShowSuggestions: (show: boolean) => {
    set({ showSuggestions: show });
  },

  clearError: () => {
    set({ error: null });
  }
}));