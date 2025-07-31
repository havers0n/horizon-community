import React from 'react';
import { Card, CardHeader, Button, Input } from '@/shared/ui/atoms';
import { DataTable } from '@/shared/ui/molecules';
import { Search, Eye } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { useVehicleSearchStore } from '../model/store';
import { VehicleDetailsModal } from '../../../ui/VehicleDetailsModal';

export const VehicleSearchWidget: React.FC = () => {
  const { t } = useLocale();
  const { 
    searchFilters, 
    searchResults, 
    selectedVehicle, 
    isLoading, 
    error,
    setSearchFilters, 
    searchVehicles, 
    selectVehicle, 
    clearError 
  } = useVehicleSearchStore();

  const handleSearch = () => {
    searchVehicles();
  };

  const vehicleColumns = [
    { 
      key: 'plate', 
      header: t('lawControl.licensePlate'), 
      render: (value: string, row: any) => (
        <button
          onClick={() => selectVehicle(row)}
          className="text-primary-400 hover:text-primary-300 underline"
        >
          {value}
        </button>
      )
    },
    { key: 'model', header: t('lawControl.model') },
    { key: 'color', header: t('lawControl.color') },
    { 
      key: 'ownerName', 
      header: t('lawControl.owner'), 
      render: (value: string, row: any) => (
        <button
          onClick={() => {
            // TODO: Открыть информацию о владельце
            console.log('Открыть информацию о владельце:', row.ownerId);
          }}
          className="text-primary-400 hover:text-primary-300 underline"
        >
          {value}
        </button>
      )
    },
    { 
      key: 'status', 
      header: t('common.status'), 
      render: (value: string) => (
        <span className={`px-2 py-1 rounded text-xs ${
          value === 'valid' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {value === 'valid' ? t('lawControl.valid') : t('lawControl.invalid')}
        </span>
      )
    },
    { 
      key: 'actions', 
      header: t('common.actions'), 
      render: (value: string, row: any) => (
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => selectVehicle(row)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>{t('lawControl.searchVehicle')}</CardHeader>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">
                {t('lawControl.licensePlate')}
              </label>
              <Input
                type="text"
                value={searchFilters.plate}
                onChange={(e) => setSearchFilters({ plate: e.target.value })}
                placeholder={`Введите ${t('lawControl.licensePlate').toLowerCase()}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">
                {t('lawControl.model')}
              </label>
              <Input
                type="text"
                value={searchFilters.model}
                onChange={(e) => setSearchFilters({ model: e.target.value })}
                placeholder={`Введите ${t('lawControl.model').toLowerCase()}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">
                {t('lawControl.color')}
              </label>
              <Input
                type="text"
                value={searchFilters.color}
                onChange={(e) => setSearchFilters({ color: e.target.value })}
                placeholder={`Введите ${t('lawControl.color').toLowerCase()}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">
                {t('lawControl.type')}
              </label>
              <Input
                type="text"
                value={searchFilters.type}
                onChange={(e) => setSearchFilters({ type: e.target.value })}
                placeholder={`Введите ${t('lawControl.type').toLowerCase()}`}
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
              columns={vehicleColumns}
              className="w-full"
            />
          </div>
        </Card>
      )}

      {selectedVehicle && (
        <VehicleDetailsModal
          vehicle={selectedVehicle}
          onClose={() => selectVehicle({} as any)}
        />
      )}
    </div>
  );
};
