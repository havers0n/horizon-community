import React, { useState, useEffect, useRef } from 'react';
import { Search, User, MapPin, Calendar, Hash, X } from 'lucide-react';
import { useCitizenSearchStore } from '../model/store';
import { Button, Card, CardHeader } from '@/shared/ui/atoms';
import { SearchInput } from '@/shared/ui/molecules';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { PersonCard } from './PersonCard';

export const CitizenSearchWidget: React.FC = () => {
  const { t } = useLocale();
  const { 
    suggestions, 
    selectedPerson, 
    showSuggestions, 
    isLoading, 
    error,
    searchCitizens, 
    selectPerson, 
    clearError 
  } = useCitizenSearchStore();

  const handleSearch = (searchTerm: string) => {
    searchCitizens(searchTerm);
  };

  const handlePersonSelect = (person: any) => {
    selectPerson(person);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>{t('lawControl.searchPerson')}</CardHeader>
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-600/20 border border-red-600/50 text-red-300 p-3 rounded-md">
              {error}
              <button 
                onClick={clearError}
                className="ml-2 text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          )}
          
          <SearchInput
            placeholder={`Введите ${t('lawControl.fullName').toLowerCase()} или ${t('lawControl.socialSecurityNumber').toLowerCase()}`}
            onSearch={handleSearch}
            suggestions={suggestions}
            onSuggestionSelect={handlePersonSelect}
            showSuggestions={showSuggestions}
          />
          
          <Button className="w-full" disabled={isLoading}>
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? 'Поиск...' : t('common.search')}
          </Button>
        </div>
      </Card>

      {selectedPerson && (
        <PersonCard person={selectedPerson} />
      )}
    </div>
  );
};
