import React from 'react';
import { Card, CardHeader, Button, Input } from '@/shared/ui/atoms';
import { DataTable } from '@/shared/ui/molecules';
import { Search, MapPin } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { useAddressSearchStore } from '../model/store';

export const AddressSearchWidget: React.FC = () => {
  const { t } = useLocale();
  const { 
    searchFilters, 
    searchResults, 
    selectedAddress, 
    isLoading, 
    error,
    setSearchFilters, 
    searchAddresses, 
    selectAddress, 
    clearError 
  } = useAddressSearchStore();

  const handleSearch = () => {
    searchAddresses();
  };

  const addressColumns = [
    { 
      key: 'address', 
      header: t('lawControl.address'), 
      render: (value: string, row: any) => (
        <button
          onClick={() => selectAddress(row)}
          className="text-primary-400 hover:text-primary-300 underline"
        >
          {value}
        </button>
      )
    },
    { key: 'city', header: t('lawControl.city') },
    { key: 'state', header: t('lawControl.state') },
    { key: 'zipCode', header: t('lawControl.zipCode') },
    { key: 'type', header: t('lawControl.type') },
    { 
      key: 'residents', 
      header: t('lawControl.residents'), 
      render: (value: string[]) => (
        <div className="text-sm">
          {value.slice(0, 2).join(', ')}
          {value.length > 2 && ` +${value.length - 2}`}
        </div>
      )
    },
    { 
      key: 'actions', 
      header: t('common.actions'), 
      render: (value: string, row: any) => (
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => selectAddress(row)}
        >
          <MapPin className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>{t('lawControl.searchAddress')}</CardHeader>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">
                {t('lawControl.address')}
              </label>
              <Input
                type="text"
                value={searchFilters.address}
                onChange={(e) => setSearchFilters({ address: e.target.value })}
                placeholder={`Введите ${t('lawControl.address').toLowerCase()}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">
                {t('lawControl.city')}
              </label>
              <Input
                type="text"
                value={searchFilters.city}
                onChange={(e) => setSearchFilters({ city: e.target.value })}
                placeholder={`Введите ${t('lawControl.city').toLowerCase()}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">
                {t('lawControl.zipCode')}
              </label>
              <Input
                type="text"
                value={searchFilters.zipCode}
                onChange={(e) => setSearchFilters({ zipCode: e.target.value })}
                placeholder={`Введите ${t('lawControl.zipCode').toLowerCase()}`}
              />
            </div>
          </div>

          <Button 
            onClick={handleSearch} 
            className="w-full" 
            disabled={isLoading}
          >
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? 'Поиск...' : t('common.search')}
          </Button>
        </div>
      </Card>

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>Результаты поиска ({searchResults.length})</CardHeader>
          <div className="p-6">
            <DataTable
              data={searchResults}
              columns={addressColumns}
              className="w-full"
            />
          </div>
        </Card>
      )}

      {selectedAddress && (
        <Card>
          <CardHeader>Детали адреса</CardHeader>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">
                  {t('lawControl.address')}
                </label>
                <p className="text-white">{selectedAddress.address}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">
                  {t('lawControl.city')}
                </label>
                <p className="text-white">{selectedAddress.city}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">
                  {t('lawControl.state')}
                </label>
                <p className="text-white">{selectedAddress.state}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">
                  {t('lawControl.zipCode')}
                </label>
                <p className="text-white">{selectedAddress.zipCode}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">
                  {t('lawControl.type')}
                </label>
                <p className="text-white">{selectedAddress.type}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">
                {t('lawControl.residents')}
              </label>
              <div className="space-y-1">
                {selectedAddress.residents.map((resident, index) => (
                  <p key={index} className="text-white">{resident}</p>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
