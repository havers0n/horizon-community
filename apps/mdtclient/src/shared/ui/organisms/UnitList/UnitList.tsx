import React, { useState, useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { UnitCard, Unit } from '@/shared/ui/molecules/UnitCard';
import { SearchBar } from '@/shared/ui/molecules/SearchBar';
import { Select } from '@/shared/ui/atoms/Select';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Button } from '@/shared/ui/atoms/Button';
import { Filter, Grid, List, RefreshCw } from 'lucide-react';

export interface UnitListProps {
  units: Unit[];
  onUnitSelect?: (unit: Unit) => void;
  onUnitCall?: (unit: Unit) => void;
  onUnitTrack?: (unit: Unit) => void;
  onRefresh?: () => void;
  className?: string;
  loading?: boolean;
  showFilters?: boolean;
  showViewToggle?: boolean;
  compact?: boolean;
}

export type ViewMode = 'grid' | 'list';

export const UnitList: React.FC<UnitListProps> = ({
  units,
  onUnitSelect,
  onUnitCall,
  onUnitTrack,
  onRefresh,
  className,
  loading = false,
  showFilters = true,
  showViewToggle = true,
  compact = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Получаем уникальные департаменты
  const departments = useMemo(() => {
    const deps = new Set(units.map(unit => unit.department));
    return Array.from(deps).sort();
  }, [units]);

  // Фильтрация юнитов
  const filteredUnits = useMemo(() => {
    return units.filter(unit => {
      const matchesSearch = searchQuery === '' || 
        unit.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || unit.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || unit.department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [units, searchQuery, statusFilter, departmentFilter]);

  // Статистика
  const stats = useMemo(() => {
    const total = units.length;
    const available = units.filter(u => u.status === 'available').length;
    const busy = units.filter(u => u.status === 'busy').length;
    const unavailable = units.filter(u => u.status === 'unavailable').length;
    const offline = units.filter(u => u.status === 'offline').length;

    return { total, available, busy, unavailable, offline };
  }, [units]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDepartmentFilter('all');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Заголовок и статистика */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Юниты ({filteredUnits.length})</h3>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              Всего: {stats.total}
            </Badge>
            <Badge variant="outline" className="text-xs text-green-400">
              Доступны: {stats.available}
            </Badge>
            <Badge variant="outline" className="text-xs text-yellow-400">
              Заняты: {stats.busy}
            </Badge>
            <Badge variant="outline" className="text-xs text-red-400">
              Недоступны: {stats.unavailable}
            </Badge>
            <Badge variant="outline" className="text-xs text-gray-400">
              Офлайн: {stats.offline}
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

      {/* Фильтры */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 bg-secondary-800/50 rounded-lg border border-secondary-700">
          <div className="flex-1 min-w-64">
            <SearchBar
              placeholder="Поиск по позывному или имени..."
              onSearch={handleSearch}
              defaultValue={searchQuery}
            />
          </div>
          
          <Select
            value={statusFilter}
            onValueChange={handleStatusFilterChange}
            className="w-48"
          >
            <option value="all">Все статусы</option>
            <option value="available">Доступен</option>
            <option value="unavailable">Недоступен</option>
            <option value="busy">Занят</option>
            <option value="enroute">В пути</option>
            <option value="on-scene">На месте</option>
            <option value="offline">Офлайн</option>
            <option value="panic">Паника</option>
          </Select>
          
          <Select
            value={departmentFilter}
            onValueChange={handleDepartmentFilterChange}
            className="w-48"
          >
            <option value="all">Все департаменты</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </Select>
          
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

      {/* Список юнитов */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-secondary-400" />
          <span className="ml-2 text-secondary-400">Загрузка юнитов...</span>
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-secondary-400">
          <span>Юниты не найдены</span>
        </div>
      ) : (
        <div className={cn(
          'grid gap-4',
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        )}>
          {filteredUnits.map(unit => (
            <UnitCard
              key={unit.id}
              unit={unit}
              onSelect={onUnitSelect}
              onCall={onUnitCall}
              onTrack={onUnitTrack}
              compact={compact || viewMode === 'list'}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
