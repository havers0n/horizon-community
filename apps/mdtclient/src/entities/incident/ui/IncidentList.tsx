// UI компонент для отображения списка инцидентов
// Поддерживает табличный и карточный вид

import React, { useState, useMemo } from 'react';
import { 
  Grid, 
  List, 
  Filter, 
  Search, 
  Download, 
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

import { Button } from '@/shared/ui/atoms/Button';
import { Input } from '@/shared/ui/atoms/Input';
import { SearchBar } from '@/shared/ui/molecules/SearchBar';
import { DataTable } from '@/shared/ui/organisms/DataTable';
import { IncidentCard } from './IncidentCard';

import { 
  Incident, 
  IncidentSearchFilters,
  IncidentType,
  IncidentStatus,
  IncidentPriority,
  IncidentSeverity,
  IncidentCategory,
  Department
} from '../model';

export interface IncidentListProps {
  incidents: Incident[];
  loading?: boolean;
  viewMode?: 'table' | 'cards';
  onIncidentClick?: (incident: Incident) => void;
  onIncidentEdit?: (incident: Incident) => void;
  onIncidentDelete?: (incident: Incident) => void;
  onSearch?: (filters: IncidentSearchFilters) => void;
  onExport?: (format: 'csv' | 'json' | 'pdf' | 'excel') => void;
  onCreateNew?: () => void;
  className?: string;
}

// Утилиты для отображения
const getStatusLabel = (status: IncidentStatus) => {
  const labels = {
    [IncidentStatus.REPORTED]: 'Заявлен',
    [IncidentStatus.DISPATCHED]: 'Отправлен',
    [IncidentStatus.EN_ROUTE]: 'В пути',
    [IncidentStatus.ON_SCENE]: 'На месте',
    [IncidentStatus.IN_PROGRESS]: 'В работе',
    [IncidentStatus.RESOLVED]: 'Решен',
    [IncidentStatus.CLOSED]: 'Закрыт',
    [IncidentStatus.CANCELLED]: 'Отменен',
  };
  return labels[status] || status;
};

const getPriorityLabel = (priority: IncidentPriority) => {
  const labels = {
    [IncidentPriority.LOW]: 'Низкий',
    [IncidentPriority.MEDIUM]: 'Средний',
    [IncidentPriority.HIGH]: 'Высокий',
    [IncidentPriority.CRITICAL]: 'Критический',
    [IncidentPriority.EMERGENCY]: 'Экстренный',
  };
  return labels[priority] || priority;
};

const getTypeLabel = (type: IncidentType) => {
  const labels = {
    [IncidentType.CRIMINAL]: 'Криминал',
    [IncidentType.TRAFFIC]: 'ДТП',
    [IncidentType.MEDICAL]: 'Медицина',
    [IncidentType.FIRE]: 'Пожар',
    [IncidentType.NATURAL_DISASTER]: 'Стихия',
    [IncidentType.PUBLIC_DISTURBANCE]: 'Беспорядки',
    [IncidentType.DOMESTIC]: 'Домашний',
    [IncidentType.ACCIDENT]: 'Авария',
    [IncidentType.OTHER]: 'Другое',
  };
  return labels[type] || type;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDuration = (minutes?: number) => {
  if (!minutes) return '-';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}ч ${mins}м`;
  }
  return `${mins}м`;
};

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  loading = false,
  viewMode = 'table',
  onIncidentClick,
  onIncidentEdit,
  onIncidentDelete,
  onSearch,
  onExport,
  onCreateNew,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Partial<IncidentSearchFilters>>({});

  // Фильтрация инцидентов
  const filteredIncidents = useMemo(() => {
    let filtered = incidents;

    // Поиск по тексту
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(incident =>
        incident.title.toLowerCase().includes(term) ||
        incident.description.toLowerCase().includes(term) ||
        incident.incidentNumber.toLowerCase().includes(term) ||
        incident.location.address.toLowerCase().includes(term) ||
        incident.location.city.toLowerCase().includes(term) ||
        incident.reporter.name.toLowerCase().includes(term)
      );
    }

    // Фильтры
    if (selectedFilters.type?.length) {
      filtered = filtered.filter(incident => 
        selectedFilters.type!.includes(incident.type)
      );
    }

    if (selectedFilters.status?.length) {
      filtered = filtered.filter(incident => 
        selectedFilters.status!.includes(incident.status)
      );
    }

    if (selectedFilters.priority?.length) {
      filtered = filtered.filter(incident => 
        selectedFilters.priority!.includes(incident.priority)
      );
    }

    if (selectedFilters.severity?.length) {
      filtered = filtered.filter(incident => 
        selectedFilters.severity!.includes(incident.severity)
      );
    }

    if (selectedFilters.category?.length) {
      filtered = filtered.filter(incident => 
        selectedFilters.category!.includes(incident.category)
      );
    }

    if (selectedFilters.department?.length) {
      filtered = filtered.filter(incident => 
        incident.assignedUnits.some(unit => 
          selectedFilters.department!.includes(unit.department)
        )
      );
    }

    return filtered;
  }, [incidents, searchTerm, selectedFilters]);

  // Колонки для таблицы
  const columns = useMemo(() => [
    {
      key: 'incidentNumber',
      header: 'Номер',
      render: (incident: Incident) => (
        <span className="font-mono text-sm">#{incident.incidentNumber}</span>
      ),
    },
    {
      key: 'title',
      header: 'Название',
      render: (incident: Incident) => (
        <div className="max-w-xs">
          <div className="font-medium text-sm truncate">{incident.title}</div>
          <div className="text-xs text-gray-500 truncate">{incident.description}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Тип',
      render: (incident: Incident) => (
        <span className="text-sm">{getTypeLabel(incident.type)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Статус',
      render: (incident: Incident) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          incident.status === IncidentStatus.CLOSED ? 'bg-green-100 text-green-800' :
          incident.status === IncidentStatus.CANCELLED ? 'bg-red-100 text-red-800' :
          incident.status === IncidentStatus.RESOLVED ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {getStatusLabel(incident.status)}
        </span>
      ),
    },
    {
      key: 'priority',
      header: 'Приоритет',
      render: (incident: Incident) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          incident.priority === IncidentPriority.LOW ? 'bg-green-100 text-green-800' :
          incident.priority === IncidentPriority.MEDIUM ? 'bg-yellow-100 text-yellow-800' :
          incident.priority === IncidentPriority.HIGH ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800'
        }`}>
          {getPriorityLabel(incident.priority)}
        </span>
      ),
    },
    {
      key: 'location',
      header: 'Локация',
      render: (incident: Incident) => (
        <div className="max-w-xs">
          <div className="text-sm font-medium">{incident.location.city}</div>
          <div className="text-xs text-gray-500 truncate">{incident.location.address}</div>
        </div>
      ),
    },
    {
      key: 'reportedAt',
      header: 'Заявлен',
      render: (incident: Incident) => (
        <span className="text-sm">{formatDate(incident.reportedAt)}</span>
      ),
    },
    {
      key: 'units',
      header: 'Подразделения',
      render: (incident: Incident) => (
        <span className="text-sm">{incident.assignedUnits.length}</span>
      ),
    },
    {
      key: 'responseTime',
      header: 'Время отклика',
      render: (incident: Incident) => (
        <span className="text-sm">{formatDuration(incident.responseTime)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Действия',
      render: (incident: Incident) => (
        <div className="flex items-center gap-1">
          {onIncidentClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onIncidentClick(incident)}
              className="h-8 w-8 p-0"
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
          {onIncidentEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onIncidentEdit(incident)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onIncidentDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onIncidentDelete(incident)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ], [onIncidentClick, onIncidentEdit, onIncidentDelete]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (onSearch) {
      onSearch({ ...selectedFilters, search: term });
    }
  };

  const handleFilterChange = (filters: Partial<IncidentSearchFilters>) => {
    const newFilters = { ...selectedFilters, ...filters };
    setSelectedFilters(newFilters);
    if (onSearch) {
      onSearch({ ...newFilters, search: searchTerm });
    }
  };

  const handleExport = (format: 'csv' | 'json' | 'pdf' | 'excel') => {
    onExport?.(format);
  };

  return (
    <div className={className}>
      {/* Заголовок и действия */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Инциденты</h2>
          <p className="text-gray-600 mt-1">
            Найдено {filteredIncidents.length} из {incidents.length} инцидентов
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Переключение вида */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {/* TODO: Добавить переключение вида */}}
              className="h-8 px-3"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {/* TODO: Добавить переключение вида */}}
              className="h-8 px-3"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>

          {/* Экспорт */}
          {onExport && (
            <div className="relative group">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Экспорт
              </Button>
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('csv')}
                    className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                  >
                    Excel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Создать новый */}
          {onCreateNew && (
            <Button onClick={onCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Новый инцидент
            </Button>
          )}
        </div>
      </div>

      {/* Поиск и фильтры */}
      <div className="mb-6 space-y-4">
        <SearchBar
          placeholder="Поиск по номеру, названию, описанию, адресу..."
          onSearch={handleSearch}
          className="max-w-md"
        />
        
        {/* Фильтры */}
        <div className="flex flex-wrap gap-2">
          {/* Фильтр по типу */}
          <select
            value={selectedFilters.type?.[0] || ''}
            onChange={(e) => handleFilterChange({ 
              type: e.target.value ? [e.target.value as IncidentType] : undefined 
            })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все типы</option>
            {Object.values(IncidentType).map(type => (
              <option key={type} value={type}>{getTypeLabel(type)}</option>
            ))}
          </select>

          {/* Фильтр по статусу */}
          <select
            value={selectedFilters.status?.[0] || ''}
            onChange={(e) => handleFilterChange({ 
              status: e.target.value ? [e.target.value as IncidentStatus] : undefined 
            })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все статусы</option>
            {Object.values(IncidentStatus).map(status => (
              <option key={status} value={status}>{getStatusLabel(status)}</option>
            ))}
          </select>

          {/* Фильтр по приоритету */}
          <select
            value={selectedFilters.priority?.[0] || ''}
            onChange={(e) => handleFilterChange({ 
              priority: e.target.value ? [e.target.value as IncidentPriority] : undefined 
            })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все приоритеты</option>
            {Object.values(IncidentPriority).map(priority => (
              <option key={priority} value={priority}>{getPriorityLabel(priority)}</option>
            ))}
          </select>

          {/* Фильтр по департаменту */}
          <select
            value={selectedFilters.department?.[0] || ''}
            onChange={(e) => handleFilterChange({ 
              department: e.target.value ? [e.target.value as Department] : undefined 
            })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все департаменты</option>
            {Object.values(Department).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Содержимое */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'table' ? (
        <DataTable
          data={filteredIncidents}
          columns={columns}
          loading={loading}
          className="bg-white rounded-lg border border-gray-200"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              variant="compact"
              onClick={onIncidentClick}
              onEdit={onIncidentEdit}
              onDelete={onIncidentDelete}
            />
          ))}
        </div>
      )}

      {/* Пустое состояние */}
      {!loading && filteredIncidents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Инциденты не найдены
          </h3>
          <p className="text-gray-600">
            Попробуйте изменить параметры поиска или фильтры
          </p>
        </div>
      )}
    </div>
  );
}; 
