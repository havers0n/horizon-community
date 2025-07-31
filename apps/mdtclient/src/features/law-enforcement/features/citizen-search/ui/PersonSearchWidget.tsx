import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Hash, X, Loader2 } from 'lucide-react';
import { useCitizenSearchStore } from '../model/store';
import { Button, Card, CardHeader } from '@/shared/ui/atoms';
import { SearchInput } from '@/shared/ui/molecules';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { PersonCard } from './PersonCard';

export const PersonSearchWidget: React.FC = () => {
  const { t } = useLocale();
  const { 
    suggestions, 
    selectedPerson, 
    showSuggestions, 
    isLoading, 
    error,
    searchCitizens, 
    selectPerson, 
    clearError,
    clearSelection
  } = useCitizenSearchStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isLiveSearch, setIsLiveSearch] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Live search с debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.length >= 2) {
      setIsLiveSearch(true);
      searchTimeoutRef.current = setTimeout(() => {
        searchCitizens(searchTerm);
        setIsLiveSearch(false);
      }, 300);
    } else {
      setIsLiveSearch(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, searchCitizens]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handlePersonSelect = (person: any) => {
    selectPerson(person);
    setSearchTerm('');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    clearSelection();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {t('lawControl.searchPerson')}
            </h2>
            {selectedPerson && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearSearch}
                className="text-secondary-400 hover:text-white"
              >
                <X className="mr-2 h-4 w-4" />
                Очистить
              </Button>
            )}
          </div>
        </CardHeader>
        
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-600/20 border border-red-600/50 text-red-300 p-3 rounded-md flex items-center justify-between">
              <span>{error}</span>
              <button 
                onClick={clearError}
                className="text-red-400 hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <div className="relative">
            <SearchInput
              value={searchTerm}
              placeholder={`Введите ${t('lawControl.fullName').toLowerCase()} или ${t('lawControl.socialSecurityNumber').toLowerCase()}`}
              onSearch={handleSearch}
              suggestions={suggestions}
              onSuggestionSelect={handlePersonSelect}
              showSuggestions={showSuggestions && suggestions.length > 0}
              isLoading={isLiveSearch}
            />
            
            {isLiveSearch && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-secondary-400" />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-secondary-400">
            <User className="h-4 w-4" />
            <span>Поиск по имени/фамилии</span>
            <span className="mx-2">•</span>
            <Hash className="h-4 w-4" />
            <span>Поиск по SSN</span>
          </div>
        </div>
      </Card>

      {selectedPerson && (
        <PersonCard person={selectedPerson} />
      )}
    </div>
  );
};
