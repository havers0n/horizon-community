// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useState } from 'react';
import { Card, CardHeader, Button, Input } from '../../../shared/ui/atoms';
import { DataTable } from '../../../shared/ui/molecules';
import { Search, Eye } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { MOCK_WEAPONS } from '../model/constants';
import { MOCK_CITIZENS_EXTENDED } from '@/shared';
import type { Weapon } from '@/shared/types';
import type { WeaponSearchResult } from '../model/types';
import { WeaponDetailsModal } from './WeaponDetailsModal';

export const WeaponSearch: React.FC = () => {
  const { t } = useLocale();
  const [searchData, setSearchData] = useState({
    serialNumber: '',
    model: ''
  });
  const [searchResults, setSearchResults] = useState<WeaponSearchResult[]>([]);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);

  const handleSearch = () => {
    const results = MOCK_WEAPONS.filter(weapon => {
      const matchesSerial = !searchData.serialNumber || weapon.serialNumber.toLowerCase().includes(searchData.serialNumber.toLowerCase());
      const matchesModel = !searchData.model || weapon.model.toLowerCase().includes(searchData.model.toLowerCase());
      
      return matchesSerial && matchesModel;
    }).map(weapon => {
      const owner = MOCK_CITIZENS_EXTENDED.find(c => c.id === weapon.ownerId);
      return {
        id: weapon.id,
        serialNumber: weapon.serialNumber,
        model: weapon.model,
        ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Неизвестно',
        ownerId: weapon.ownerId,
        status: weapon.status
      };
    });
    setSearchResults(results);
  };

  const weaponColumns = [
    { key: 'serialNumber', header: t('lawControl.serialNumber'), render: (value: string, row: WeaponSearchResult) => (
      <button
        onClick={() => {
          const fullWeapon = MOCK_WEAPONS.find(w => w.id === row.id);
          if (fullWeapon) setSelectedWeapon(fullWeapon);
        }}
        className="text-primary-400 hover:text-primary-300 underline"
      >
        {value}
      </button>
    )},
    { key: 'model', header: t('lawControl.model') },
    { key: 'ownerName', header: t('lawControl.owner'), render: (value: string, row: WeaponSearchResult) => (
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
        value === 'registered' ? 'bg-green-600' :
        value === 'stolen' ? 'bg-red-600' : 'bg-yellow-600'
      }`}>
        {value === 'registered' ? t('lawControl.registered') :
         value === 'stolen' ? t('lawControl.stolen') : t('lawControl.confiscated')}
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
        <CardHeader>{t('lawControl.searchWeapon')}</CardHeader>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">{t('lawControl.serialNumber')}</label>
              <Input
                type="text"
                value={searchData.serialNumber}
                onChange={(e) => setSearchData(prev => ({ ...prev, serialNumber: e.target.value }))}
                placeholder={`Введите ${t('lawControl.serialNumber').toLowerCase()}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">{t('lawControl.weaponModel')}</label>
              <Input
                type="text"
                value={searchData.model}
                onChange={(e) => setSearchData(prev => ({ ...prev, model: e.target.value }))}
                placeholder={`Введите ${t('lawControl.weaponModel').toLowerCase()}`}
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
              columns={weaponColumns}
              data={searchResults}
            />
          </div>
        </Card>
      )}

      {selectedWeapon && (
        <WeaponDetailsModal 
          weapon={selectedWeapon} 
          onClose={() => setSelectedWeapon(null)} 
        />
      )}
    </div>
  );
};
