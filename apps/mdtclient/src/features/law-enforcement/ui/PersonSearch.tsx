// @ts-expect-error - TODO: Fix after major refactoring. Suppressing all type errors temporarily
// @ts-nocheck - TODO: Remove after major refactoring is complete

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Button } from '../../../shared/ui/atoms';
import { SearchInput } from '../../../shared/ui/molecules';
import { Search, User } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { MOCK_CITIZENS_EXTENDED } from '@/shared';
import type { Citizen } from '@/shared/types';
import type { CitizenSearchResult } from '../model/types';
import { PersonDetails } from './PersonDetails';

export const PersonSearch: React.FC = () => {
  const { t } = useLocale();
  const [suggestions, setSuggestions] = useState<CitizenSearchResult[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Citizen | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (searchTerm: string) => {
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
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handlePersonSelect = (person: CitizenSearchResult) => {
    const fullPerson = MOCK_CITIZENS_EXTENDED.find(c => c.id === person.id);
    if (fullPerson) {
      setSelectedPerson(fullPerson);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>{t('lawControl.searchPerson')}</CardHeader>
        <div className="p-6 space-y-4">
          <SearchInput
            placeholder={`Введите ${t('lawControl.fullName').toLowerCase()} или ${t('lawControl.socialSecurityNumber').toLowerCase()}`}
            onSearch={handleSearch}
            suggestions={suggestions}
            onSuggestionSelect={handlePersonSelect}
            showSuggestions={showSuggestions}
          />
          <Button className="w-full">
            <Search className="mr-2 h-4 w-4" />
            {t('common.search')}
          </Button>
        </div>
      </Card>

      {selectedPerson && (
        <PersonDetails person={selectedPerson} />
      )}
    </div>
  );
};
