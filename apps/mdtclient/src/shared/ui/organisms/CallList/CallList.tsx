import React, { useState, useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { CallCard, Call, CallPriority, CallStatus } from '@/shared/ui/molecules/CallCard';
import { SearchBar } from '@/shared/ui/molecules/SearchBar';
import { Select } from '@/shared/ui/atoms/Select';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Button } from '@/shared/ui/atoms/Button';
import { Filter, Grid, List, RefreshCw, SortAsc, SortDesc } from 'lucide-react';

export interface CallListProps {
  calls: Call[];
  onCallSelect?: (call: Call) => void;
  onCallAssign?: (call: Call) => void;
  onCallUpdate?: (call: Call) => void;
  onRefresh?: () => void;
  className?: string;
  loading?: boolean;
  showFilters?: boolean;
  showViewToggle?: boolean;
  compact?: boolean;
}

export type ViewMode = 'grid' | 'list';
export type SortField = 'createdAt' | 'priority' | 'status' | 'callNumber';
export type SortOrder = 'asc' | 'desc';

export const CallList: React.FC<CallListProps> = ({
  calls,
  onCallSelect,
  onCallAssign,
  onCallUpdate,
  onRefresh,
  className,
  loading = false,
  showFilters = true,
  showViewToggle = true,
  compact = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Получаем уникальные типы вызовов
  const callTypes = useMemo(() => {
    const types = new Set(calls.map(call => call.type));
    return Array.from(types).sort();
  }, [calls]);

  // Фильтрация и сортировка вызовов
  const filteredAndSortedCalls = useMemo(() => {
    let filtered = calls.filter(call => {
      const matchesSearch = searchQuery === '' || 
        call.callNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPriority = priorityFilter === 'all' || call.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
      const matchesType = typeFilter === 'all' || call.type === typeFilter;
      
      return matchesSearch && matchesPriority && matchesStatus && matchesType;
    });

    // Сортировка
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case 'status':
          const statusOrder = { pending: 1, dispatched: 2, enroute: 3, onscene: 4, completed: 5, cancelled: 6 };
          aValue = statusOrder[a.status as keyof typeof statusOrder];
          bValue = statusOrder[b.status as keyof typeof statusOrder];
          break;
        case 'callNumber':
          aValue = a.callNumber;
          bValue = b.callNumber;
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [calls, searchQuery, priorityFilter, statusFilter, typeFilter, sortField, sortOrder]);

  // Статистика
  const stats = useMemo(() => {
    const total = calls.length;
    const pending = calls.filter(c => c.status === 'pending').length;
    const dispatched = calls.filter(c => c.status === 'dispatched').length;
    const enroute = calls.filter(c => c.status === 'enroute').length;
    const onscene = calls.filter(c => c.status === 'onscene').length;
    const completed = calls.filter(c => c.status === 'completed').length;
    const critical = calls.filter(c => c.priority === 'critical').length;

    return { total, pending, dispatched, enroute, onscene, completed, critical };
  }, [calls]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handlePriorityFilterChange = (value: string) => {
    setPriorityFilter(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
  };

  const handleSortFieldChange = (value: string) => {
    setSortField(value as SortField);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('all');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Заголовок и статистика */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Вызовы ({filteredAndSortedCalls.length})</h3>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              Всего: {stats.total}
            </Badge>
            <Badge variant="outline" className="text-xs text-red-400">
              Критичные: {stats.critical}
            </Badge>
            <Badge variant="outline" className="text-xs text-yellow-400">
              Ожидают: {stats.pending}
            </Badge>
            <Badge variant="outline" className="text-xs text-blue-400">
              Назначены: {stats.dispatched}
            </Badge>
            <Badge variant="outline" className="text-xs text-orange-400">
              В пути: {stats.enroute}
            </Badge>
            <Badge variant="outline" className="text-xs text-green-400">
              Завершены: {stats.completed}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </Button>
          )}
          
          {showViewToggle && (
            <div className="flex border border-secondary-700 rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Фильтры и сортировка */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 bg-secondary-800/50 rounded-lg border border-secondary-700">
          <div className="flex-1 min-w-64">
            <SearchBar
              placeholder="Поиск по номеру, типу, адресу..."
              onSearch={handleSearch}
              defaultValue={searchQuery}
            />
          </div>
          
          <Select
            value={priorityFilter}
            onValueChange={handlePriorityFilterChange}
            className="w-40"
          >
            <option value="all">Все приоритеты</option>
            <option value="critical">Критичный</option>
            <option value="high">Высокий</option>
            <option value="medium">Средний</option>
            <option value="low">Низкий</option>
          </Select>
          
          <Select
            value={statusFilter}
            onValueChange={handleStatusFilterChange}
            className="w-40"
          >
            <option value="all">Все статусы</option>
            <option value="pending">Ожидает</option>
            <option value="dispatched">Назначен</option>
            <option value="enroute">В пути</option>
            <option value="onscene">На месте</option>
            <option value="completed">Завершен</option>
            <option value="cancelled">Отменен</option>
          </Select>
          
          <Select
            value={typeFilter}
            onValueChange={handleTypeFilterChange}
            className="w-48"
          >
            <option value="all">Все типы</option>
            {callTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
          
          <div className="flex gap-2">
            <Select
              value={sortField}
              onValueChange={handleSortFieldChange}
              className="w-40"
            >
              <option value="createdAt">По времени</option>
              <option value="priority">По приоритету</option>
              <option value="status">По статусу</option>
              <option value="callNumber">По номеру</option>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="px-2"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Очистить
          </Button>
        </div>
      )}

      {/* Список вызовов */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-secondary-400" />
          <span className="ml-2 text-secondary-400">Загрузка вызовов...</span>
        </div>
      ) : filteredAndSortedCalls.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-secondary-400">
          <span>Вызовы не найдены</span>
        </div>
      ) : (
        <div className={cn(
          'grid gap-4',
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        )}>
          {filteredAndSortedCalls.map(call => (
            <CallCard
              key={call.id}
              call={call}
              onSelect={onCallSelect}
              onAssign={onCallAssign}
              onUpdate={onCallUpdate}
              compact={compact || viewMode === 'list'}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
