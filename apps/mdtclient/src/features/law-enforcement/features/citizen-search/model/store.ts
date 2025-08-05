import { create } from 'zustand';
import { MOCK_CITIZENS_EXTENDED } from '@/shared';
import type { Characters } from '@roleplay-identity/db-types';
import type { CitizenSearchState, CitizenSearchActions, CitizenSearchResult } from './types';

type CitizenSearchStore = CitizenSearchState & CitizenSearchActions;

// Адаптер для преобразования старых моковых данных в новый формат Characters
const adaptMockCitizenToCharacters = (mockCitizen: any): Characters => ({
  id: mockCitizen.id,
  first_name: mockCitizen.firstName,
  last_name: mockCitizen.lastName,
  date_of_birth: mockCitizen.dateOfBirth,
  address: mockCitizen.address,
  mugshot_url: mockCitizen.imageUrl,
  gender: mockCitizen.gender,
  occupation: mockCitizen.occupation,
  ssn: mockCitizen.ssn,
  flags: mockCitizen.flags,
  phone_number: null,
  licenses: null,
  medical_info: null,
  owner_id: 'mock_owner',
  created_at: null,
  updated_at: null
});

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
      // Преобразуем в новый формат Characters
      const adaptedPerson = adaptMockCitizenToCharacters(fullPerson);
      set({ 
        selectedPerson: adaptedPerson, 
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