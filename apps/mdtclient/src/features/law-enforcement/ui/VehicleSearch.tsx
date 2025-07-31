// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useState } from 'react';
import { Card, CardHeader, Button, Input } from '../../../shared/ui/atoms';
import { DataTable } from '../../../shared/ui/molecules';
import { Search, Eye } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { MOCK_VEHICLES } from '../model/constants';
import { MOCK_CITIZENS_EXTENDED } from '@/shared';
import type { VehicleSearchResult, Vehicle } from '@/shared/types';
import { VehicleDetailsModal } from './VehicleDetailsModal';

export const VehicleSearch: React.FC = () => {
  const { t } = useLocale();
  const [searchData, setSearchData] = useState({
    plate: '',
    model: '',
    color: '',
    type: ''
  });
  const [searchResults, setSearchResults] = useState<VehicleSearchResult[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const handleSearch = () => {
    const results = MOCK_VEHICLES.filter(vehicle => {
      const matchesPlate = !searchData.plate || vehicle.plate.toLowerCase().includes(searchData.plate.toLowerCase());
      const matchesModel = !searchData.model || vehicle.model.toLowerCase().includes(searchData.model.toLowerCase());
      const matchesColor = !searchData.color || vehicle.color.toLowerCase().includes(searchData.color.toLowerCase());
      const matchesType = !searchData.type || vehicle.model.toLowerCase().includes(searchData.type.toLowerCase());
      
      return matchesPlate && matchesModel && matchesColor && matchesType;
    }).map(vehicle => {
      const owner = MOCK_CITIZENS_EXTENDED.find(c => c.id === vehicle.ownerId);
      return {
        id: vehicle.id,
        plate: vehicle.plate,
        model: vehicle.model,
        color: vehicle.color,
        ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Неизвестно',
        ownerId: vehicle.ownerId,
        status: vehicle.registration
      };
    });
    setSearchResults(results);
  };

  const vehicleColumns = [
    { key: 'plate', header: t('lawControl.licensePlate'), render: (value: string, row: VehicleSearchResult) => (
      <button
        onClick={() => {
          const fullVehicle = MOCK_VEHICLES.find(v => v.id === row.id);
          if (fullVehicle) setSelectedVehicle(fullVehicle);
        }}
        className="text-primary-400 hover:text-primary-300 underline"
      >
        {value}
      </button>
    )},
    { key: 'model', header: t('lawControl.model') },
    { key: 'color', header: t('lawControl.color') },
    { key: 'ownerName', header: t('lawControl.owner'), render: (value: string, row: VehicleSearchResult) => (
      <button
        onClick={() => {
          const owner = MOCK_CITIZENS_EXTENDED.find(c => c.id === row.ownerId);
          if (owner) {
            console.log('Открыть информацию о владельце:', owner);
          }
        }}
        className="text-primary-400 hover:text-primary-300 underline"
      >
        {value}
      </button>
    )},
    { key: 'status', header: t('common.status'), render: (value: string) => (
      <span className={`px-2 py-1 rounded text-xs ${
        value === 'valid' ? 'bg-green-600' : 'bg-red-600'
      }`}>
        {value === 'valid' ? t('lawControl.valid') : t('lawControl.invalid')}
      </span>
    )},
    { key: 'actions', header: t('common.actions'), render: () => (
      <Button size="sm" variant="secondary">
        <Eye className="h-4 w-4" />
      </Button>
    )}
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>{t('lawControl.searchVehicle')}</CardHeader>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">{t('lawControl.licensePlate')}</label>
              <Input
                type="text"
                value={searchData.plate}
                onChange={(e) => setSearchData(prev => ({ ...prev, plate: e.target.value }))}
                placeholder={`Введите ${t('lawControl.licensePlate').toLowerCase()}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">{t('lawControl.model')}</label>
              <Input
                type="text"
                value={searchData.model}
                onChange={(e) => setSearchData(prev => ({ ...prev, model: e.target.value }))}
                placeholder={`Введите ${t('lawControl.model').toLowerCase()}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">{t('lawControl.color')}</label>
              <Input
                type="text"
                value={searchData.color}
                onChange={(e) => setSearchData(prev => ({ ...prev, color: e.target.value }))}
                placeholder={`Введите ${t('lawControl.color').toLowerCase()}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">{t('lawControl.vehicleType')}</label>
              <Input
                type="text"
                value={searchData.type}
                onChange={(e) => setSearchData(prev => ({ ...prev, type: e.target.value }))}
                placeholder={`Введите ${t('lawControl.vehicleType').toLowerCase()}`}
              />
            </div>
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
            <DataTable 
              columns={vehicleColumns}
              data={searchResults}
            />
          </div>
        </Card>
      )}

      {selectedVehicle && (
        <VehicleDetailsModal 
          vehicle={selectedVehicle} 
          onClose={() => setSelectedVehicle(null)} 
        />
      )}
    </div>
  );
};
