import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Input } from '@/shared/ui/atoms/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/atoms/Select';
import { Unit, UnitStatus } from '@/shared/types';
import { DispatchApi } from '@/shared/api/dispatch';
import { 
  Users, 
  MapPin, 
  Clock, 
  Phone,
  Filter,
  Search,
  Radio,
  Shield,
  Car,
  Truck,
  RefreshCw,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Timer,
  Star,
  Heart,
  Zap,
  Target,
  Navigation,
  Layers,
  Volume2,
  Mic,
  MicOff,
  Wifi,
  WifiOff,
  BarChart3,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface UnitListProps {
  units: Unit[];
  onUnitSelect: (unit: Unit) => void;
  onStatusChange: (unitId: string, status: UnitStatus) => void;
}

const getStatusColor = (status: UnitStatus) => {
  switch (status) {
    case 'available':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'busy':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'enRoute':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'onScene':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'unavailable':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    case 'panic':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'transporting':
      return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    case 'outOfService':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'training':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'dispatched':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'cleared':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const getStatusIcon = (status: UnitStatus) => {
  switch (status) {
    case 'available':
      return CheckCircle;
    case 'busy':
      return AlertCircle;
    case 'enRoute':
      return Navigation;
    case 'onScene':
      return MapPin;
    case 'unavailable':
      return XCircle;
    case 'panic':
      return AlertTriangle;
    case 'transporting':
      return Car;
    case 'outOfService':
      return XCircle;
    case 'training':
      return Star;
    case 'dispatched':
      return Play;
    case 'cleared':
      return CheckCircle;
    default:
      return Clock;
  }
};

const getUnitIcon = (unitType?: string) => {
  switch (unitType) {
    case 'patrol':
      return <Car className="h-4 w-4" />;
    case 'medic':
      return <Shield className="h-4 w-4" />;
    case 'fire_truck':
      return <Truck className="h-4 w-4" />;
    case 'dispatch':
      return <Radio className="h-4 w-4" />;
    default:
      return <Users className="h-4 w-4" />;
  }
};

const getDepartmentColor = (departmentId: string) => {
  switch (departmentId) {
    case '1': // LSPD
      return 'text-blue-600';
    case '2': // BCSO
      return 'text-green-600';
    case '3': // SAHP
      return 'text-yellow-600';
    case '4': // LSFD
      return 'text-red-600';
    case '5': // SAMS
      return 'text-purple-600';
    default:
      return 'text-gray-600';
  }
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const UnitCard: React.FC<{
  unit: Unit;
  onSelect: (unit: Unit) => void;
  onStatusChange: (unitId: string, status: UnitStatus) => void;
}> = ({ unit, onSelect, onStatusChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<UnitStatus>(unit.status);
  
  const StatusIcon = getStatusIcon(unit.status);

  const handleStatusChange = () => {
    if (selectedStatus !== unit.status) {
      onStatusChange(unit.id, selectedStatus);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const unitTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - unitTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Только что';
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} ч назад`;
  };

  return (
    <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/50 hover:bg-slate-700/30 transition-all duration-200 cursor-pointer group">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${getStatusColor(unit.status)} group-hover:scale-110 transition-transform duration-200`}>
              <StatusIcon className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${getStatusColor(unit.status)} border text-xs font-medium`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {unit.status}
                </Badge>
                <span className="text-xs text-slate-400 ml-auto">
                  {getTimeAgo(unit.lastUpdate || unit.timestamp)}
                </span>
              </div>
              
              <h4 className="text-sm font-medium text-slate-200 mb-1 group-hover:text-white transition-colors duration-200">
                {unit.name || unit.unitNumber}
              </h4>
              
              <div className="flex items-center gap-2 text-xs text-slate-400">
                {getUnitIcon(unit.type)}
                <span>{unit.type || 'Неизвестный тип'}</span>
                {unit.department && (
                  <>
                    <Shield className="h-3 w-3 ml-2" />
                    <span className={getDepartmentColor(unit.department)}>{unit.department}</span>
                  </>
                )}
              </div>

              {unit.location && (
                <div className="flex items-center gap-1 mt-2">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-400">{unit.location}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(unit);
              }}
              className="h-8 w-8 p-0 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 transition-all duration-200"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expanded Actions */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
            {/* Status Update */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-16">Статус:</span>
              <Select value={selectedStatus} onValueChange={(value: string) => setSelectedStatus(value as UnitStatus)}>
                <SelectTrigger className="h-8 text-xs bg-slate-700/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {[
                    { value: 'available', label: 'Доступен', icon: CheckCircle },
                    { value: 'busy', label: 'Занят', icon: AlertCircle },
                    { value: 'enRoute', label: 'В пути', icon: Navigation },
                    { value: 'onScene', label: 'На месте', icon: MapPin },
                    { value: 'unavailable', label: 'Недоступен', icon: XCircle },
                    { value: 'panic', label: 'Паника', icon: AlertTriangle },
                    { value: 'transporting', label: 'Транспортировка', icon: Car },
                    { value: 'outOfService', label: 'Вне службы', icon: XCircle },
                    { value: 'training', label: 'Обучение', icon: Star },
                    { value: 'dispatched', label: 'Назначен', icon: Play },
                    { value: 'cleared', label: 'Освобожден', icon: CheckCircle }
                  ].map(({ value, label, icon: Icon }) => (
                    <SelectItem key={value} value={value} className="text-xs">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3 w-3" />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleStatusChange}
                disabled={selectedStatus === unit.status}
                className="h-8 px-3 text-xs bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
              >
                Обновить
              </Button>
            </div>

            {/* Additional Info */}
            {unit.officer && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-16">Офицер:</span>
                <span className="text-xs text-slate-300">{unit.officer}</span>
              </div>
            )}

            {unit.vehicle && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-16">Транспорт:</span>
                <span className="text-xs text-slate-300">{unit.vehicle}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export const UnitList: React.FC<UnitListProps> = ({
  units,
  onUnitSelect,
  onStatusChange
}) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UnitStatus | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const handleUnitSelect = (unit: Unit) => {
    onUnitSelect(unit);
  };

  const handleStatusChange = async (unitId: string, newStatus: UnitStatus) => {
    try {
      setLoading(true);
      await DispatchApi.updateUnitStatus(unitId, newStatus);
      onStatusChange(unitId, newStatus);
    } catch (error) {
      console.error('Error updating unit status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusOptions = () => [
    { value: 'all', label: 'Все статусы' },
    { value: 'available', label: 'Доступен' },
    { value: 'busy', label: 'Занят' },
    { value: 'enRoute', label: 'В пути' },
    { value: 'onScene', label: 'На месте' },
    { value: 'unavailable', label: 'Недоступен' },
    { value: 'panic', label: 'Паника' },
    { value: 'transporting', label: 'Транспортировка' },
    { value: 'outOfService', label: 'Вне службы' },
    { value: 'training', label: 'Обучение' },
    { value: 'dispatched', label: 'Назначен' },
    { value: 'cleared', label: 'Освобожден' }
  ];

  const getDepartmentOptions = () => [
    { value: 'all', label: 'Все департаменты' },
    { value: '1', label: 'LSPD' },
    { value: '2', label: 'BCSO' },
    { value: '3', label: 'SAHP' },
    { value: '4', label: 'LSFD' },
    { value: '5', label: 'SAMS' }
  ];

  const filteredUnits = units.filter(unit => {
    const matchesSearch = searchQuery === '' || 
      (unit.name && unit.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (unit.unitNumber && unit.unitNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (unit.officer && unit.officer.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || unit.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || unit.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const availableUnits = filteredUnits.filter(unit => unit.status === 'available');
  const busyUnits = filteredUnits.filter(unit => unit.status === 'busy' || unit.status === 'enRoute');
  const otherUnits = filteredUnits.filter(unit => !['available', 'busy', 'enRoute'].includes(unit.status));

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Header */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Активные юниты</h3>
            <p className="text-sm text-slate-400">Всего юнитов: {units.length}</p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600 transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            Обновить
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Поиск по имени, номеру, офицеру..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700/50 text-slate-300 placeholder:text-slate-400 focus:border-blue-500/50"
          />
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value as UnitStatus | 'all')}>
            <SelectTrigger className="h-8 text-xs bg-slate-700/50 border-slate-600">
              <SelectValue placeholder="Фильтр по статусу" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {getStatusOptions().map(option => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="h-8 text-xs bg-slate-700/50 border-slate-600">
              <SelectValue placeholder="Фильтр по департаменту" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {getDepartmentOptions().map(option => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Units List with Status Grouping */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-slate-400">Обновление статуса...</p>
            </div>
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Users className="h-8 w-8 text-slate-500 mx-auto" />
              <p className="mt-2 text-sm text-slate-500">Нет юнитов в этой категории</p>
            </div>
          </div>
        ) : (
          <>
            {/* Available Units */}
            {availableUnits.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <h4 className="text-sm font-medium text-green-400">ДОСТУПНЫЕ ЮНИТЫ</h4>
                  <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">{availableUnits.length}</Badge>
                </div>
                <div className="space-y-2">
                  {availableUnits.map(unit => (
                    <UnitCard
                      key={unit.id}
                      unit={unit}
                      onSelect={handleUnitSelect}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Busy Units */}
            {busyUnits.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-400" />
                  <h4 className="text-sm font-medium text-orange-400">ЗАНЯТЫЕ ЮНИТЫ</h4>
                  <Badge className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">{busyUnits.length}</Badge>
                </div>
                <div className="space-y-2">
                  {busyUnits.map(unit => (
                    <UnitCard
                      key={unit.id}
                      unit={unit}
                      onSelect={handleUnitSelect}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Units */}
            {otherUnits.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <h4 className="text-sm font-medium text-slate-400">ДРУГИЕ ЮНИТЫ</h4>
                  <Badge className="text-xs bg-slate-500/20 text-slate-400 border-slate-500/30">{otherUnits.length}</Badge>
                </div>
                <div className="space-y-2">
                  {otherUnits.map(unit => (
                    <UnitCard
                      key={unit.id}
                      unit={unit}
                      onSelect={handleUnitSelect}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}; 