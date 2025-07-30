import React, { useState, useMemo } from 'react';
import { Vehicle, VehicleSearchParams } from '../model/types';
import { VehicleCard } from './VehicleCard';
import { DataTable } from '@/shared/ui/organisms';
import { SearchBar, StatusBadge } from '@/shared/ui/molecules';
import { Button, Badge } from '@/shared/ui/atoms';
import { Car, Grid, List, Filter, Download } from 'lucide-react';

interface VehicleListProps {
  vehicles: Vehicle[];
  loading?: boolean;
  onSearch?: (params: VehicleSearchParams) => void;
  onViewDetails?: (vehicle: Vehicle) => void;
  onEdit?: (vehicle: Vehicle) => void;
  onExport?: () => void;
  viewMode?: 'table' | 'cards';
  onViewModeChange?: (mode: 'table' | 'cards') => void;
}

export const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  loading = false,
  onSearch,
  onViewDetails,
  onEdit,
  onExport,
  viewMode = 'table',
  onViewModeChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Partial<VehicleSearchParams>>({});

  // Колонки для таблицы
  const columns = useMemo(() => [
    {
      key: 'plateNumber',
      header: 'Номер',
      render: (vehicle: Vehicle) => (
        <div className="flex items-center space-x-2">
          <Car className="h-4 w-4 text-blue-600" />
          <span className="font-medium">{vehicle.plateNumber}</span>
        </div>
      )
    },
    {
      key: 'make',
      header: 'Марка/Модель',
      render: (vehicle: Vehicle) => (
        <div>
          <div className="font-medium">{vehicle.make}</div>
          <div className="text-sm text-gray-600">{vehicle.model}</div>
        </div>
      )
    },
    {
      key: 'year',
      header: 'Год',
      render: (vehicle: Vehicle) => vehicle.year
    },
    {
      key: 'owner',
      header: 'Владелец',
      render: (vehicle: Vehicle) => (
        <div>
          <div className="font-medium">{vehicle.owner.name}</div>
          <div className="text-sm text-gray-600">{vehicle.owner.phone}</div>
        </div>
      )
    },
    {
      key: 'registrationStatus',
      header: 'Статус регистрации',
      render: (vehicle: Vehicle) => (
        <StatusBadge 
          status={vehicle.registrationStatus}
          variant="status"
        />
      )
    },
    {
      key: 'insuranceStatus',
      header: 'Страховка',
      render: (vehicle: Vehicle) => (
        <StatusBadge 
          status={vehicle.insuranceStatus}
          variant="status"
        />
      )
    },
    {
      key: 'stolen',
      header: 'Статус',
      render: (vehicle: Vehicle) => (
        <div className="flex items-center space-x-2">
          {vehicle.stolen && (
            <Badge variant="destructive" size="sm">
              Украдено
            </Badge>
          )}
          <span className="text-sm text-gray-600">
            {vehicle.mileage.toLocaleString()} км
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Действия',
      render: (vehicle: Vehicle) => (
        <div className="flex space-x-2">
          {onViewDetails && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewDetails(vehicle)}
            >
              Подробности
            </Button>
          )}
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(vehicle)}
            >
              Редактировать
            </Button>
          )}
        </div>
      )
    }
  ], [onViewDetails, onEdit]);

  // Фильтры
  const filterOptions = [
    { value: 'active', label: 'Активная регистрация' },
    { value: 'expired', label: 'Истекшая регистрация' },
    { value: 'suspended', label: 'Приостановлена' },
    { value: 'revoked', label: 'Отозвана' },
    { value: 'stolen', label: 'Украдено' }
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch({ ...activeFilters, query });
    }
  };

  const handleFilterChange = (filter: string, value: any) => {
    const newFilters = { ...activeFilters, [filter]: value };
    setActiveFilters(newFilters);
    if (onSearch) {
      onSearch({ ...newFilters, query: searchQuery });
    }
  };

  const handleViewModeChange = (mode: 'table' | 'cards') => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Car className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Транспортные средства</h2>
          <Badge variant="secondary">{vehicles.length}</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
          )}
          
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('table')}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('cards')}
              className="rounded-l-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Поиск и фильтры */}
      <div className="space-y-4">
        <SearchBar 
          placeholder="Поиск по номеру, VIN, марке..."
          onSearch={handleSearch}
          loading={loading}
        />
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Фильтры:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={activeFilters.registrationStatus === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('registrationStatus', 
                  activeFilters.registrationStatus === option.value ? undefined : option.value
                )}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Контент */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Транспортные средства не найдены
          </h3>
          <p className="text-gray-600">
            Попробуйте изменить параметры поиска или фильтры
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <DataTable
          data={vehicles}
          columns={columns}
          searchable={false}
          sortable={true}
          pagination={true}
          pageSize={10}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onViewDetails={onViewDetails}
              onEdit={onEdit}
              variant="default"
            />
          ))}
        </div>
      )}
    </div>
  );
}; 
