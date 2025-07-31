import type { Citizen } from '@/shared';

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
  selectedPerson: Citizen | null;
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