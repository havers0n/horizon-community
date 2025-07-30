import React, { useState } from 'react';
import { Card, CardHeader, Button, Input } from '../../../shared/ui/atoms';
import { Search, Eye } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { MOCK_CITIZENS_EXTENDED } from '../model/constants';
import type { Citizen } from '../model/types';

export const AddressSearch: React.FC = () => {
  const { t } = useLocale();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Citizen[]>([]);

  const handleSearch = () => {
    const results = MOCK_CITIZENS_EXTENDED.filter(citizen => {
      return citizen.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
             citizen.address.includes(searchTerm);
    });
    setSearchResults(results);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>{t('lawControl.searchAddress')}</CardHeader>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-1">{t('lawControl.address')} или {t('lawControl.postalCode')}</label>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Введите ${t('lawControl.address').toLowerCase()} или ${t('lawControl.postalCode').toLowerCase()}`}
            />
          </div>
          <Button onClick={handleSearch} className="w-full">
            <Search className="mr-2 h-4 w-4" />
            {t('common.search')}
          </Button>
        </div>
      </Card>

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>{t('lawControl.searchResults')}</CardHeader>
          <div className="p-6">
            <div className="space-y-4">
              {searchResults.map((citizen) => (
                <div key={citizen.id} className="flex items-center gap-4 p-4 border border-secondary-700 rounded-lg hover:bg-secondary-800">
                  <img src={citizen.imageUrl} alt={`${citizen.firstName} ${citizen.lastName}`} className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <h3 className="font-medium">{citizen.firstName} {citizen.lastName}</h3>
                    <p className="text-sm text-secondary-400">{citizen.address}</p>
                  </div>
                  <Button size="sm" variant="secondary">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
