// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useState, useMemo } from 'react';
import { Company, CompanySearchParams } from '@/shared/types';
import { CompanyCard } from './CompanyCard';
import { DataTable } from '@/shared/ui/organisms';
import { SearchBar, StatusBadge } from '@/shared/ui/molecules';
import { Button, Badge } from '@/shared/ui/atoms';
import { Building2, Grid, List, Filter, Download, Users, DollarSign } from 'lucide-react';

interface CompanyListProps {
  companies: Company[];
  loading?: boolean;
  onSearch?: (params: CompanySearchParams) => void;
  onViewDetails?: (company: Company) => void;
  onEdit?: (company: Company) => void;
  onExport?: () => void;
  viewMode?: 'table' | 'cards';
  onViewModeChange?: (mode: 'table' | 'cards') => void;
}

export const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  loading = false,
  onSearch,
  onViewDetails,
  onEdit,
  onExport,
  viewMode = 'table',
  onViewModeChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Partial<CompanySearchParams>>({});

  // Колонки для таблицы
  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Название',
      render: (company: Company) => (
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-blue-600" />
          <div>
            <div className="font-medium">{company.name}</div>
            <div className="text-sm text-gray-600">{company.legalName}</div>
          </div>
        </div>
      )
    },
    {
      key: 'industry',
      header: 'Отрасль',
      render: (company: Company) => {
        const labels = {
          technology: 'Технологии',
          healthcare: 'Здравоохранение',
          finance: 'Финансы',
          retail: 'Розничная торговля',
          manufacturing: 'Производство',
          construction: 'Строительство',
          transportation: 'Транспорт',
          education: 'Образование',
          other: 'Другое'
        };
        return labels[company.industry as keyof typeof labels] || company.industry;
      }
    },
    {
      key: 'type',
      header: 'Тип',
      render: (company: Company) => {
        const labels = {
          corporation: 'Корпорация',
          llc: 'ООО',
          partnership: 'Партнерство',
          sole_proprietorship: 'ИП',
          non_profit: 'НКО',
          government: 'Госучреждение'
        };
        return labels[company.type as keyof typeof labels] || company.type;
      }
    },
    {
      key: 'location',
      header: 'Местоположение',
      render: (company: Company) => (
        <div>
          <div className="font-medium">{company.address.city}</div>
          <div className="text-sm text-gray-600">{company.address.state}</div>
        </div>
      )
    },
    {
      key: 'financial',
      header: 'Финансы',
      render: (company: Company) => (
        <div>
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3 text-gray-500" />
            <span className="text-sm">{company.financial.employeeCount.toLocaleString()}</span>
          </div>
          {company.financial.annualRevenue && (
            <div className="flex items-center space-x-1">
              <DollarSign className="h-3 w-3 text-green-500" />
              <span className="text-sm text-green-600">
                {new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(company.financial.annualRevenue)}
              </span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Статус',
      render: (company: Company) => (
        <div className="flex items-center space-x-2">
          <StatusBadge 
            status={company.status}
            variant="status"
          />
          {company.violations.some(v => v.status === 'pending') && (
            <Badge variant="destructive" size="sm">
              Нарушения
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Действия',
      render: (company: Company) => (
        <div className="flex space-x-2">
          {onViewDetails && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewDetails(company)}
            >
              Подробности
            </Button>
          )}
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(company)}
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
    { value: 'active', label: 'Активные' },
    { value: 'inactive', label: 'Неактивные' },
    { value: 'suspended', label: 'Приостановленные' },
    { value: 'dissolved', label: 'Ликвидированные' },
    { value: 'pending', label: 'Ожидающие' }
  ];

  const industryOptions = [
    { value: 'technology', label: 'Технологии' },
    { value: 'healthcare', label: 'Здравоохранение' },
    { value: 'finance', label: 'Финансы' },
    { value: 'retail', label: 'Розничная торговля' },
    { value: 'manufacturing', label: 'Производство' },
    { value: 'construction', label: 'Строительство' },
    { value: 'transportation', label: 'Транспорт' },
    { value: 'education', label: 'Образование' },
    { value: 'other', label: 'Другое' }
  ];

  const typeOptions = [
    { value: 'corporation', label: 'Корпорация' },
    { value: 'llc', label: 'ООО' },
    { value: 'partnership', label: 'Партнерство' },
    { value: 'sole_proprietorship', label: 'ИП' },
    { value: 'non_profit', label: 'НКО' },
    { value: 'government', label: 'Госучреждение' }
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
          <Building2 className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Компании</h2>
          <Badge variant="secondary">{companies.length}</Badge>
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
          placeholder="Поиск по названию, ИНН, адресу..."
          onSearch={handleSearch}
          loading={loading}
        />
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Фильтры:</span>
            </div>
          </div>
          
          {/* Статус */}
          <div>
            <span className="text-sm font-medium text-gray-700 mb-2 block">Статус:</span>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={activeFilters.status === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('status', 
                    activeFilters.status === option.value ? undefined : option.value
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Отрасль */}
          <div>
            <span className="text-sm font-medium text-gray-700 mb-2 block">Отрасль:</span>
            <div className="flex flex-wrap gap-2">
              {industryOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={activeFilters.industry === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('industry', 
                    activeFilters.industry === option.value ? undefined : option.value
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Тип компании */}
          <div>
            <span className="text-sm font-medium text-gray-700 mb-2 block">Тип:</span>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={activeFilters.type === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('type', 
                    activeFilters.type === option.value ? undefined : option.value
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Контент */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Компании не найдены
          </h3>
          <p className="text-gray-600">
            Попробуйте изменить параметры поиска или фильтры
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <DataTable
          data={companies}
          columns={columns}
          searchable={false}
          sortable={true}
          pagination={true}
          pageSize={10}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
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
