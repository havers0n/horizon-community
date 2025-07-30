export interface AddressSearchResult {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: string;
  residents: string[];
}

export interface AddressSearchFilters {
  address: string;
  city: string;
  zipCode: string;
}

export interface AddressSearchState {
  searchFilters: AddressSearchFilters;
  searchResults: AddressSearchResult[];
  selectedAddress: AddressSearchResult | null;
  isLoading: boolean;
  error: string | null;
}

export interface AddressSearchActions {
  setSearchFilters: (filters: Partial<AddressSearchFilters>) => void;
  searchAddresses: () => void;
  selectAddress: (address: AddressSearchResult) => void;
  clearSelection: () => void;
  clearError: () => void;
}