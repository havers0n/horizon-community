import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/atoms/Select';
import { Input } from '@/shared/ui/atoms/Input';
import { DispatchApi } from '@/shared/api/dispatch';
import { Call911, Unit, CallStatus } from '@/shared/types';
import { 
  Phone, 
  MapPin, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Play,
  Pause,
  Edit,
  Eye,
  EyeOff,
  Users,
  Car,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Zap,
  Target,
  Navigation,
  Layers,
  Maximize2,
  Minimize2,
  Volume2,
  Mic,
  MicOff,
  Wifi,
  WifiOff,
  BarChart3,
  TrendingUp,
  AlertCircle,
  RotateCcw,
  Calendar,
  Timer,
  Star,
  Heart
} from 'lucide-react';

interface CallQueueProps {
  calls: Call911[];
  onCallSelect: (call: Call911) => void;
  onAssignUnit: (callId: string, unitId: string) => void;
  onUpdateStatus: (callId: string, status: CallStatus) => void;
}

const priorityConfig = {
  low: { label: 'Низкий', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
  medium: { label: 'Средний', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
  high: { label: 'Высокий', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: AlertCircle },
  critical: { label: 'Критический', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertTriangle },
  panic: { label: 'ПАНИКА', color: 'bg-red-600/20 text-red-300 border-red-600/30', icon: Zap }
};

const statusConfig = {
  pending: { label: 'Ожидает', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  assigned: { label: 'Назначен', color: 'bg-blue-500/20 text-blue-400', icon: Play },
  active: { label: 'Активен', color: 'bg-orange-500/20 text-orange-400', icon: Car },
  resolved: { label: 'Решен', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  closed: { label: 'Закрыт', color: 'bg-gray-500/20 text-gray-400', icon: XCircle }
};

const CallCard: React.FC<{ 
  call: Call911; 
  units: Unit[];
  onSelect: (call: Call911) => void;
  onAssignUnit: (callId: string, unitId: string) => void;
  onUpdateStatus: (callId: string, status: CallStatus) => void;
}> = ({ call, units, onSelect, onAssignUnit, onUpdateStatus }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<CallStatus>(call.status);
  
  const StatusIcon = statusConfig[call.status]?.icon || Clock;
  const PriorityIcon = priorityConfig[call.priority]?.icon || Clock;
  const availableUnits = units.filter(unit => unit.status === 'available');

  const handleAssignUnit = () => {
    if (selectedUnit) {
      onAssignUnit(call.id, selectedUnit);
      setSelectedUnit('');
    }
  };

  const handleStatusChange = () => {
    if (selectedStatus !== call.status) {
      onUpdateStatus(call.id, selectedStatus);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const callTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - callTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Только что';
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} ч назад`;
  };

  return (
    <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/50 hover:bg-slate-700/30 transition-all duration-200 cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${statusConfig[call.status]?.color} group-hover:scale-110 transition-transform duration-200`}>
              <StatusIcon className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${priorityConfig[call.priority]?.color} border text-xs font-medium`}>
                  <PriorityIcon className="h-3 w-3 mr-1" />
                  {priorityConfig[call.priority]?.label}
                </Badge>
                <Badge className={`${statusConfig[call.status]?.color} border text-xs`}>
                  {statusConfig[call.status]?.label}
                </Badge>
                <span className="text-xs text-slate-400 ml-auto">
                  {getTimeAgo(call.timestamp)}
                </span>
              </div>
              
              <h4 className="text-sm font-medium text-slate-200 mb-1 line-clamp-2 group-hover:text-white transition-colors duration-200">
                {call.description}
              </h4>
              
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <MapPin className="h-3 w-3" />
                <span>{call.location}</span>
                {call.caller && (
                  <>
                    <User className="h-3 w-3 ml-2" />
                    <span>{call.caller}</span>
                  </>
                )}
              </div>

              {call.assignedUnits && call.assignedUnits.length > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <Users className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-400">
                    Назначено: {call.assignedUnits.length} юнит(ов)
                  </span>
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
                onSelect(call);
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
                             <Select value={selectedStatus} onValueChange={(value: string) => setSelectedStatus(value as CallStatus)}>
                <SelectTrigger className="h-8 text-xs bg-slate-700/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      <div className="flex items-center gap-2">
                        <config.icon className="h-3 w-3" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleStatusChange}
                disabled={selectedStatus === call.status}
                className="h-8 px-3 text-xs bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
              >
                Обновить
              </Button>
            </div>

            {/* Unit Assignment */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-16">Назначить:</span>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="h-8 text-xs bg-slate-700/50 border-slate-600">
                  <SelectValue placeholder="Выберите юнит" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {availableUnits.map(unit => (
                    <SelectItem key={unit.id} value={unit.id} className="text-xs">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {unit.name} ({unit.status})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleAssignUnit}
                disabled={!selectedUnit}
                className="h-8 px-3 text-xs bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all duration-200"
              >
                Назначить
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const CallQueue: React.FC<CallQueueProps> = ({
  calls,
  onCallSelect,
  onAssignUnit,
  onUpdateStatus
}) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        const unitsData = await DispatchApi.getActiveUnits();
        setUnits(unitsData);
      } catch (error) {
        console.error('Error fetching units:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  const filteredCalls = calls.filter(call => {
    const matchesFilter = (() => {
      switch (filter) {
        case 'pending':
          return call.status === 'pending';
        case 'active':
          return ['assigned', 'active'].includes(call.status);
        case 'completed':
          return ['resolved', 'closed'].includes(call.status);
        default:
          return true;
      }
    })();

    const matchesSearch = searchQuery === '' || 
      call.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (call.caller && call.caller.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const getFilterCount = (filterType: string) => {
    switch (filterType) {
      case 'pending': return calls.filter(c => c.status === 'pending').length;
      case 'active': return calls.filter(c => ['assigned', 'active'].includes(c.status)).length;
      case 'completed': return calls.filter(c => ['resolved', 'closed'].includes(c.status)).length;
      default: return calls.length;
    }
  };

  const criticalCalls = filteredCalls.filter(call => call.priority === 'critical' || call.priority === 'panic');
  const highPriorityCalls = filteredCalls.filter(call => call.priority === 'high');
  const normalCalls = filteredCalls.filter(call => !['critical', 'panic', 'high'].includes(call.priority));

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Header */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Очередь вызовов</h3>
            <p className="text-sm text-slate-400">Всего вызовов: {calls.length}</p>
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
            placeholder="Поиск по описанию, адресу, звонящему..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700/50 text-slate-300 placeholder:text-slate-400 focus:border-blue-500/50"
          />
        </div>
        
        {/* Enhanced Filter Tabs */}
        <div className="flex items-center gap-2">
          {[
            { key: 'all', label: 'Все', icon: Phone, color: 'bg-slate-500/20 border-slate-500/30 text-slate-300' },
            { key: 'pending', label: 'Ожидают', icon: Clock, color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' },
            { key: 'active', label: 'Активные', icon: Play, color: 'bg-blue-500/20 border-blue-500/30 text-blue-400' },
            { key: 'completed', label: 'Завершенные', icon: CheckCircle, color: 'bg-green-500/20 border-green-500/30 text-green-400' }
          ].map(({ key, label, icon: Icon, color }) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => setFilter(key as any)}
              className={`flex items-center gap-2 text-xs transition-all duration-200 ${
                filter === key 
                  ? color
                  : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Icon className="h-3 w-3" />
              {label} ({getFilterCount(key)})
            </Button>
          ))}
        </div>
      </div>

      {/* Calls List with Priority Grouping */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-slate-400">Загрузка вызовов...</p>
            </div>
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Phone className="h-8 w-8 text-slate-500 mx-auto" />
              <p className="mt-2 text-sm text-slate-500">Нет вызовов в этой категории</p>
            </div>
          </div>
        ) : (
          <>
            {/* Critical Calls */}
            {criticalCalls.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <h4 className="text-sm font-medium text-red-400">КРИТИЧЕСКИЕ ВЫЗОВЫ</h4>
                  <Badge variant="destructive" className="text-xs">{criticalCalls.length}</Badge>
                </div>
                <div className="space-y-2">
                  {criticalCalls.map(call => (
                    <CallCard
                      key={call.id}
                      call={call}
                      units={units}
                      onSelect={onCallSelect}
                      onAssignUnit={onAssignUnit}
                      onUpdateStatus={onUpdateStatus}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* High Priority Calls */}
            {highPriorityCalls.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-400" />
                  <h4 className="text-sm font-medium text-orange-400">ВЫСОКИЙ ПРИОРИТЕТ</h4>
                  <Badge className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">{highPriorityCalls.length}</Badge>
                </div>
                <div className="space-y-2">
                  {highPriorityCalls.map(call => (
                    <CallCard
                      key={call.id}
                      call={call}
                      units={units}
                      onSelect={onCallSelect}
                      onAssignUnit={onAssignUnit}
                      onUpdateStatus={onUpdateStatus}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Normal Calls */}
            {normalCalls.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <h4 className="text-sm font-medium text-slate-400">ОБЫЧНЫЕ ВЫЗОВЫ</h4>
                  <Badge className="text-xs bg-slate-500/20 text-slate-400 border-slate-500/30">{normalCalls.length}</Badge>
                </div>
                <div className="space-y-2">
                  {normalCalls.map(call => (
                    <CallCard
                      key={call.id}
                      call={call}
                      units={units}
                      onSelect={onCallSelect}
                      onAssignUnit={onAssignUnit}
                      onUpdateStatus={onUpdateStatus}
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