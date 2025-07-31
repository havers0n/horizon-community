// @ts-nocheck - TODO: Remove after major refactoring is complete
// Fire Incident Entity - UI Layer
// Компонент списка пожарных инцидентов

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { Input } from '@/shared/ui/atoms/Input';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/atoms/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/atoms/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/atoms/Tabs';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Grid, 
  List, 
  RefreshCw,
  Flame,
  MapPin,
  Clock,
  Users,
  Truck,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Building,
  Car,
  Tree,
  Zap,
  Droplets,
  Bomb,
  GasPump,
  Biohazard,
  LifeBuoy,
  Bell,
  HelpCircle
} from 'lucide-react';
import { 
  FireIncident, 
  FireIncidentType, 
  FireIncidentStatus, 
  FireIncidentPriority, 
  FireIncidentSeverity,
  FireIncidentCategory,
  FireIncidentSearchParams,
  FireIncidentFilters
} from '@/shared/types';
import { FireIncidentApi } from '../api/fireIncidentApi';
import { FireIncidentCard } from './FireIncidentCard';

interface FireIncidentListProps {
  onView?: (incident: FireIncident) => void;
  onEdit?: (incident: FireIncident) => void;
  onDelete?: (incident: FireIncident) => void;
  onCreate?: () => void;
  className?: string;
}

export const FireIncidentList: React.FC<FireIncidentListProps> = ({
  onView,
  onEdit,
  onDelete,
  onCreate,
  className = ''
}) => {
  const [incidents, setIncidents] = useState<FireIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FireIncidentFilters>({
    type: [],
    status: [],
    priority: [],
    severity: [],
    category: [],
    dateRange: {
      start: '',
      end: ''
    },
    isActive: false,
    isFalseAlarm: false,
    requiresEvacuation: false
  });

  const options = FireIncidentApi.getFireIncidentOptions();

  // Загрузка данных
  const loadIncidents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams: FireIncidentSearchParams = {
        limit: 100,
        sortBy: 'reportedAt',
        sortOrder: 'desc'
      };

      // Добавляем фильтры
      if (filters.type.length > 0) searchParams.type = filters.type;
      if (filters.status.length > 0) searchParams.status = filters.status;
      if (filters.priority.length > 0) searchParams.priority = filters.priority;
      if (filters.severity.length > 0) searchParams.severity = filters.severity;
      if (filters.category.length > 0) searchParams.category = filters.category;
      if (filters.dateRange.start) searchParams.reportedAfter = filters.dateRange.start;
      if (filters.dateRange.end) searchParams.reportedBefore = filters.dateRange.end;
      if (filters.isActive) searchParams.isActive = true;
      if (filters.isFalseAlarm) searchParams.isFalseAlarm = true;
      if (filters.requiresEvacuation) searchParams.requiresEvacuation = true;

      const response = await FireIncidentApi.searchFireIncidents(searchParams);
      
      if (response.success) {
        setIncidents(response.data.incidents);
      } else {
        setError(response.message || 'Ошибка загрузки данных');
      }
    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error('Error loading fire incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [filters]);

  // Фильтрация по поисковому запросу
  const filteredIncidents = incidents.filter(incident => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      incident.incidentNumber.toLowerCase().includes(searchLower) ||
      incident.description.toLowerCase().includes(searchLower) ||
      incident.location.address.toLowerCase().includes(searchLower) ||
      incident.location.city.toLowerCase().includes(searchLower) ||
      (incident.reporter?.name.toLowerCase().includes(searchLower) || false)
    );
  });

  // Обработчики фильтров
  const handleFilterChange = (key: keyof FireIncidentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTypeFilter = (type: FireIncidentType, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      type: checked 
        ? [...prev.type, type]
        : prev.type.filter(t => t !== type)
    }));
  };

  const handleStatusFilter = (status: FireIncidentStatus, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      status: checked 
        ? [...prev.status, status]
        : prev.status.filter(s => s !== status)
    }));
  };

  const handlePriorityFilter = (priority: FireIncidentPriority, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      priority: checked 
        ? [...prev.priority, priority]
        : prev.priority.filter(p => p !== priority)
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: [],
      status: [],
      priority: [],
      severity: [],
      category: [],
      dateRange: {
        start: '',
        end: ''
      },
      isActive: false,
      isFalseAlarm: false,
      requiresEvacuation: false
    });
    setSearchTerm('');
  };

  // Экспорт
  const handleExport = async (format: 'csv' | 'json' | 'pdf' | 'excel') => {
    try {
      const searchParams: FireIncidentSearchParams = {
        limit: 1000
      };

      if (filters.type.length > 0) searchParams.type = filters.type;
      if (filters.status.length > 0) searchParams.status = filters.status;
      if (filters.priority.length > 0) searchParams.priority = filters.priority;
      if (filters.severity.length > 0) searchParams.severity = filters.severity;
      if (filters.category.length > 0) searchParams.category = filters.category;

      let response;
      switch (format) {
        case 'csv':
          response = await FireIncidentApi.exportFireIncidentsToCSV(searchParams);
          break;
        case 'json':
          response = await FireIncidentApi.exportFireIncidentsToJSON(searchParams);
          break;
        case 'pdf':
          response = await FireIncidentApi.exportFireIncidentsToPDF(searchParams);
          break;
        case 'excel':
          response = await FireIncidentApi.exportFireIncidentsToExcel(searchParams);
          break;
      }

      if (response.success) {
        // Скачивание файла
        const link = document.createElement('a');
        link.href = response.data.url;
        link.download = response.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  // Утилитарные функции
  const getIncidentTypeIcon = (type: FireIncidentType) => {
    switch (type) {
      case FireIncidentType.STRUCTURE_FIRE:
        return <Building className="w-4 h-4" />;
      case FireIncidentType.VEHICLE_FIRE:
        return <Car className="w-4 h-4" />;
      case FireIncidentType.WILDLAND_FIRE:
        return <Tree className="w-4 h-4" />;
      case FireIncidentType.ELECTRICAL_FIRE:
        return <Zap className="w-4 h-4" />;
      case FireIncidentType.CHEMICAL_FIRE:
        return <Droplets className="w-4 h-4" />;
      case FireIncidentType.EXPLOSION:
        return <Bomb className="w-4 h-4" />;
      case FireIncidentType.GAS_LEAK:
        return <GasPump className="w-4 h-4" />;
      case FireIncidentType.HAZMAT:
        return <Biohazard className="w-4 h-4" />;
      case FireIncidentType.RESCUE:
        return <LifeBuoy className="w-4 h-4" />;
      case FireIncidentType.FALSE_ALARM:
        return <Bell className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: FireIncidentStatus) => {
    switch (status) {
      case FireIncidentStatus.REPORTED:
        return 'bg-yellow-100 text-yellow-800';
      case FireIncidentStatus.DISPATCHED:
      case FireIncidentStatus.EN_ROUTE:
        return 'bg-blue-100 text-blue-800';
      case FireIncidentStatus.ON_SCENE:
      case FireIncidentStatus.IN_PROGRESS:
        return 'bg-orange-100 text-orange-800';
      case FireIncidentStatus.UNDER_CONTROL:
        return 'bg-green-100 text-green-800';
      case FireIncidentStatus.EXTINGUISHED:
      case FireIncidentStatus.CLEANUP:
      case FireIncidentStatus.CLOSED:
        return 'bg-green-200 text-green-900';
      case FireIncidentStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: FireIncidentPriority) => {
    switch (priority) {
      case FireIncidentPriority.LOW:
        return 'bg-green-100 text-green-800';
      case FireIncidentPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case FireIncidentPriority.HIGH:
        return 'bg-orange-100 text-orange-800';
      case FireIncidentPriority.CRITICAL:
        return 'bg-red-100 text-red-800';
      case FireIncidentPriority.EMERGENCY:
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2">Загрузка инцидентов...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={loadIncidents}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок и действия */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Пожарные инциденты</h2>
          <p className="text-gray-500">
            {filteredIncidents.length} из {incidents.length} инцидентов
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {onCreate && (
            <Button onClick={onCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Создать инцидент
            </Button>
          )}
          
          <Select value={viewMode} onValueChange={(value: 'table' | 'cards') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="table">
                <div className="flex items-center space-x-2">
                  <List className="w-4 h-4" />
                  <span>Таблица</span>
                </div>
              </SelectItem>
              <SelectItem value="cards">
                <div className="flex items-center space-x-2">
                  <Grid className="w-4 h-4" />
                  <span>Карточки</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Фильтры</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Поиск */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск по номеру, описанию, адресу..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            <Button variant="outline" onClick={clearFilters}>
              Очистить фильтры
            </Button>
            
            <Button variant="outline" onClick={loadIncidents}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Обновить
            </Button>
          </div>

          {/* Фильтры по типам */}
          <div>
            <h4 className="text-sm font-medium mb-2">Типы инцидентов</h4>
            <div className="flex flex-wrap gap-2">
              {options.types.map((type) => (
                <label key={type.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type.value)}
                    onChange={(e) => handleTypeFilter(type.value, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Фильтры по статусам */}
          <div>
            <h4 className="text-sm font-medium mb-2">Статусы</h4>
            <div className="flex flex-wrap gap-2">
              {options.statuses.map((status) => (
                <label key={status.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status.value)}
                    onChange={(e) => handleStatusFilter(status.value, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">{status.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Фильтры по приоритетам */}
          <div>
            <h4 className="text-sm font-medium mb-2">Приоритеты</h4>
            <div className="flex flex-wrap gap-2">
              {options.priorities.map((priority) => (
                <label key={priority.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.priority.includes(priority.value)}
                    onChange={(e) => handlePriorityFilter(priority.value, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">{priority.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Дополнительные фильтры */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Только активные</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.isFalseAlarm}
                onChange={(e) => handleFilterChange('isFalseAlarm', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Ложные тревоги</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.requiresEvacuation}
                onChange={(e) => handleFilterChange('requiresEvacuation', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">С эвакуацией</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Экспорт */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Экспорт:</span>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Содержимое */}
      {viewMode === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Номер</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Приоритет</TableHead>
                <TableHead>Локация</TableHead>
                <TableHead>Подразделения</TableHead>
                <TableHead>Время</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">
                    №{incident.incidentNumber}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getIncidentTypeIcon(incident.type)}
                      <span className="text-sm">{options.types.find(t => t.value === incident.type)?.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(incident.status)}>
                      {options.statuses.find(s => s.value === incident.status)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(incident.priority)}>
                      {options.priorities.find(p => p.value === incident.priority)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm font-medium truncate">{incident.location.address}</p>
                      <p className="text-xs text-gray-500">{incident.location.city}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{incident.units.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(incident.reportedAt)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {onView && (
                        <Button variant="ghost" size="sm" onClick={() => onView(incident)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button variant="ghost" size="sm" onClick={() => onEdit(incident)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button variant="ghost" size="sm" onClick={() => onDelete(incident)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIncidents.map((incident) => (
            <FireIncidentCard
              key={incident.id}
              incident={incident}
              variant="default"
              onView={onView}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}

      {filteredIncidents.length === 0 && (
        <div className="text-center py-12">
          <Flame className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Инциденты не найдены</h3>
          <p className="text-gray-500">
            {searchTerm || filters.type.length > 0 || filters.status.length > 0
              ? 'Попробуйте изменить фильтры или поисковый запрос'
              : 'Пожарные инциденты отсутствуют'}
          </p>
        </div>
      )}
    </div>
  );
}; 
