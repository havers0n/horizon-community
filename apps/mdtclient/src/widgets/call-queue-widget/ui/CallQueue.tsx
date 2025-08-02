import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/atoms/Select';
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
  Users,
  Car
} from 'lucide-react';

interface CallQueueProps {
  calls: Call911[];
  onCallSelect: (call: Call911) => void;
  onAssignUnit: (callId: string, unitId: string) => void;
  onUpdateStatus: (callId: string, status: CallStatus) => void;
}

const priorityConfig = {
  low: { label: 'Низкий', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  medium: { label: 'Средний', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  high: { label: 'Высокий', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  critical: { label: 'Критический', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  panic: { label: 'ПАНИКА', color: 'bg-red-600/20 text-red-300 border-red-600/30' }
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
  
  const StatusIcon = statusConfig[call.status]?.icon || Clock;
  const availableUnits = units.filter(unit => unit.status === 'available');

  const handleAssignUnit = () => {
    if (selectedUnit) {
      onAssignUnit(call.id, selectedUnit);
      setSelectedUnit('');
    }
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-700/50 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-slate-700/50 ${statusConfig[call.status]?.color}`}>
              <StatusIcon className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Badge className={`${priorityConfig[call.priority]?.color} border`}>
                  {priorityConfig[call.priority]?.label}
                </Badge>
                <Badge className={`${statusConfig[call.status]?.color} border`}>
                  {statusConfig[call.status]?.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                <span>{new Date(call.timestamp).toLocaleString('ru-RU', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelect(call)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Compact View */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm text-white mb-1">Описание</h4>
              <p className="text-sm text-slate-300 line-clamp-2">{call.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{call.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{call.assignedUnits?.length || 0} юнитов</span>
            </div>
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="pt-3 border-t border-slate-700/50 space-y-3">
            {/* Caller Information */}
            {call.caller && (
              <div>
                <h4 className="font-medium text-sm text-white mb-1">Звонивший</h4>
                <p className="text-sm text-slate-300">{call.caller}</p>
              </div>
            )}
            
            {/* Assigned Units */}
            <div>
              <h4 className="font-medium text-sm text-white mb-2">Назначенные юниты</h4>
              {call.assignedUnits && call.assignedUnits.length > 0 ? (
                <div className="space-y-1">
                  {call.assignedUnits.map(unitId => {
                    const unit = units.find(u => u.id === unitId);
                    return unit ? (
                      <div key={unitId} className="flex items-center gap-2 text-sm text-slate-300">
                        <User className="h-3 w-3" />
                        <span>{unit.name}</span>
                        <Badge variant="outline" className="text-xs">{unit.status}</Badge>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Нет назначенных юнитов</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-white">Быстрые действия</h4>
              
              {/* Status Update */}
              <div className="flex items-center gap-2">
                <Select value={call.status} onValueChange={(value) => onUpdateStatus(call.id, value as CallStatus)}>
                  <SelectTrigger className="w-32 h-8 text-xs bg-slate-700/50 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assign Unit */}
              <div className="flex items-center gap-2">
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger className="w-40 h-8 text-xs bg-slate-700/50 border-slate-600">
                    <SelectValue placeholder="Выбрать юнит" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUnits.map(unit => (
                      <SelectItem key={unit.id} value={unit.id} className="text-xs">
                        {unit.name} ({unit.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleAssignUnit}
                  disabled={!selectedUnit}
                  className="h-8 px-3 text-xs bg-blue-500 hover:bg-blue-600"
                >
                  Назначить
                </Button>
              </div>
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
  });

  const getFilterCount = (filterType: string) => {
    switch (filterType) {
      case 'pending': return calls.filter(c => c.status === 'pending').length;
      case 'active': return calls.filter(c => ['assigned', 'active'].includes(c.status)).length;
      case 'completed': return calls.filter(c => ['resolved', 'closed'].includes(c.status)).length;
      default: return calls.length;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Очередь вызовов</h3>
          <p className="text-sm text-slate-400">Всего вызовов: {calls.length}</p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {[
            { key: 'all', label: 'Все', icon: Phone },
            { key: 'pending', label: 'Ожидают', icon: Clock },
            { key: 'active', label: 'Активные', icon: Play },
            { key: 'completed', label: 'Завершенные', icon: CheckCircle }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(key as any)}
              className={`flex items-center gap-1 text-xs ${
                filter === key 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Icon className="h-3 w-3" />
              {label} ({getFilterCount(key)})
            </Button>
          ))}
        </div>
      </div>

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
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
          filteredCalls.map(call => (
            <CallCard
              key={call.id}
              call={call}
              units={units}
              onSelect={onCallSelect}
              onAssignUnit={onAssignUnit}
              onUpdateStatus={onUpdateStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}; 