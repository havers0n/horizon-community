// @ts-expect-error - TODO: Fix after major refactoring. Suppressing all type errors temporarily
// @ts-nocheck - TODO: Remove after major refactoring is complete

// UI компонент для отображения списка граждан

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/shared/ui/organisms';
import { SearchBar } from '@/shared/ui/molecules';
import { Button } from '@/shared/ui/atoms';
import { Citizen, CitizenSearchParams } from '@/shared/types';
import { CitizenApi } from '../api/citizenApi';
import { CitizenCard } from './CitizenCard';
import { cn } from '@/shared/lib/utils';

interface CitizenListProps {
  className?: string;
  onCitizenSelect?: (citizen: Citizen) => void;
  onCitizenEdit?: (citizen: Citizen) => void;
  onCitizenDelete?: (citizen: Citizen) => void;
  viewMode?: 'table' | 'cards';
  showActions?: boolean;
}

export const CitizenList: React.FC<CitizenListProps> = ({
  className,
  onCitizenSelect,
  onCitizenEdit,
  onCitizenDelete,
  viewMode = 'table',
  showActions = true,
}) => {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<CitizenSearchParams>({
    limit: 20,
    offset: 0,
  });
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Загрузка граждан
  const loadCitizens = async (params: CitizenSearchParams = searchParams) => {
    setLoading(true);
    try {
      const result = await CitizenApi.searchCitizens(params);
      setCitizens(result.citizens);
      setTotal(result.total);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Failed to load citizens:', error);
    } finally {
      setLoading(false);
    }
  };

  // Поиск граждан
  const handleSearch = (query: string) => {
    const newParams = { ...searchParams, query, offset: 0 };
    setSearchParams(newParams);
    loadCitizens(newParams);
  };

  // Изменение страницы
  const handlePageChange = (page: number) => {
    const newParams = { 
      ...searchParams, 
      offset: (page - 1) * (searchParams.limit || 20) 
    };
    setSearchParams(newParams);
    loadCitizens(newParams);
  };

  // Удаление гражданина
  const handleDelete = async (citizen: Citizen) => {
    if (window.confirm(`Вы уверены, что хотите удалить гражданина ${citizen.firstName} ${citizen.lastName}?`)) {
      try {
        await CitizenApi.deleteCitizen(citizen.id);
        loadCitizens(); // Перезагружаем список
        onCitizenDelete?.(citizen);
      } catch (error) {
        console.error('Failed to delete citizen:', error);
        alert('Ошибка при удалении гражданина');
      }
    }
  };

  // Загрузка при монтировании
  useEffect(() => {
    loadCitizens();
  }, []);

  // Колонки для таблицы
  const columns = [
    {
      key: 'name' as keyof Citizen,
      header: 'ФИО',
      sortable: true,
      render: (value: any, row: Citizen) => (
        <div className="flex items-center space-x-2">
          <div className="text-lg">
            {row.gender === 'male' ? '👨' : row.gender === 'female' ? '👩' : '👤'}
          </div>
          <div>
            <div className="font-medium">
              {row.lastName} {row.firstName} {row.middleName}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(row.dateOfBirth).toLocaleDateString('ru-RU')}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'phone' as keyof Citizen,
      header: 'Телефон',
      sortable: true,
      render: (value: string) => (
        <a href={`tel:${value}`} className="text-blue-600 hover:underline">
          {value}
        </a>
      ),
    },
    {
      key: 'address' as keyof Citizen,
      header: 'Адрес',
      sortable: false,
      render: (value: any) => (
        <div className="text-sm">
          {value.city}, {value.street}
        </div>
      ),
    },
    {
      key: 'licenseStatus' as keyof Citizen,
      header: 'Лицензия',
      sortable: true,
      render: (value: string, row: Citizen) => (
        <div className="flex items-center space-x-2">
          {row.licenseNumber && (
            <span className={`px-2 py-1 text-xs rounded ${
              value === 'valid' ? 'bg-green-100 text-green-800' :
              value === 'expired' ? 'bg-yellow-100 text-yellow-800' :
              value === 'suspended' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {value === 'valid' ? '✅' : '❌'} {row.licenseNumber}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'criminalRecord' as keyof Citizen,
      header: 'Криминальная запись',
      sortable: false,
      render: (value: any[]) => (
        <div>
          {value.length > 0 ? (
            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
              ⚠️ {value.length} записей
            </span>
          ) : (
            <span className="text-gray-400 text-sm">Нет</span>
          )}
        </div>
      ),
    },
  ];

  if (showActions) {
    columns.push({
      key: 'actions' as keyof Citizen,
      header: 'Действия',
      sortable: false,
      render: (value: any, row: Citizen) => (
        <div className="flex space-x-2">
          {onCitizenSelect && (
            <button
              onClick={() => onCitizenSelect(row)}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Просмотр
            </button>
          )}
          {onCitizenEdit && (
            <button
              onClick={() => onCitizenEdit(row)}
              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
            >
              Редактировать
            </button>
          )}
          {onCitizenDelete && (
            <button
              onClick={() => handleDelete(row)}
              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              Удалить
            </button>
          )}
        </div>
      ),
    });
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Поиск и фильтры */}
      <div className="flex items-center justify-between">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Поиск по имени, телефону, адресу..."
          className="flex-1 max-w-md"
        />
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
          >
            {viewMode === 'table' ? '📋 Карточки' : '📊 Таблица'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onCitizenEdit?.({} as Citizen)}
          >
            ➕ Добавить гражданина
          </Button>
        </div>
      </div>

      {/* Содержимое */}
      {viewMode === 'table' ? (
        <DataTable
          data={citizens}
          columns={columns}
          loading={loading}
          pagination={true}
          pageSize={searchParams.limit || 20}
          onPageChange={handlePageChange}
          emptyMessage="Граждане не найдены"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Загрузка граждан...</p>
            </div>
          ) : citizens.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600">Граждане не найдены</p>
            </div>
          ) : (
            citizens.map((citizen) => (
              <CitizenCard
                key={citizen.id}
                citizen={citizen}
                onClick={onCitizenSelect}
                onEdit={onCitizenEdit}
                onDelete={onCitizenDelete}
                showActions={showActions}
              />
            ))
          )}
        </div>
      )}

      {/* Пагинация для карточек */}
      {viewMode === 'cards' && hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => {
              const newParams = { 
                ...searchParams, 
                offset: (searchParams.offset || 0) + (searchParams.limit || 20) 
              };
              setSearchParams(newParams);
              loadCitizens(newParams);
            }}
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Загрузить еще'}
          </Button>
        </div>
      )}
    </div>
  );
}; 
