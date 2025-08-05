import type { Characters } from '@roleplay-identity/db-types';

export interface CitizenSearchResult {
  id: string;
  fullName: string;
  ssn?: string;
  address?: string;
  dateOfBirth?: string;
  imageUrl?: string;
}

export interface CitizenSearchState {
  suggestions: CitizenSearchResult[];
  selectedPerson: Characters | null;
  showSuggestions: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CitizenSearchActions {
  searchCitizens: (searchTerm: string) => void;
  selectPerson: (person: CitizenSearchResult) => void;
  clearSelection: () => void;
  setShowSuggestions: (show: boolean) => void;
  clearError: () => void;
}