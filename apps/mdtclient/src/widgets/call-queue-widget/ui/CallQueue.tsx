import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Call911, Unit } from '@/shared/types';
import { DispatchApi } from '@/shared/api/dispatch';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';

interface CallQueueProps {
  calls: Call911[];
  onCallSelect: (call: Call911) => void;
  onAssignUnit: (callId: string, unitId: string) => void;
  onUpdateStatus: (callId: string, status: string) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-500 text-white';
    case 'high':
      return 'bg-orange-500 text-white';
    case 'medium':
      return 'bg-yellow-500 text-black';
    case 'low':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'assigned':
      return 'bg-blue-100 text-blue-800';
    case 'en_route':
      return 'bg-purple-100 text-purple-800';
    case 'on_scene':
      return 'bg-green-100 text-green-800';
    case 'resolved':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const CallQueue: React.FC<CallQueueProps> = ({
  calls,
  onCallSelect,
  onAssignUnit,
  onUpdateStatus
}) => {
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [selectedCall, setSelectedCall] = useState<Call911 | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvailableUnits = async () => {
      try {
        const units = await DispatchApi.getActiveUnits();
        setAvailableUnits(units.filter(unit => unit.status === 'available'));
      } catch (error) {
        console.error('Error fetching available units:', error);
      }
    };

    fetchAvailableUnits();
  }, []);

  const handleCallSelect = (call: Call911) => {
    setSelectedCall(call);
    onCallSelect(call);
  };

  const handleAssignUnit = async (callId: string, unitId: string) => {
    try {
      setLoading(true);
      await DispatchApi.assignUnitToCall(callId, unitId);
      onAssignUnit(callId, unitId);
      setSelectedCall(null);
    } catch (error) {
      console.error('Error assigning unit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (callId: string, status: string) => {
    try {
      setLoading(true);
      await DispatchApi.updateCallStatus(callId, status);
      onUpdateStatus(callId, status);
    } catch (error) {
      console.error('Error updating call status:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedCalls = [...calls].sort((a, b) => {
    // Сортируем по приоритету, затем по времени создания
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    return new Date(a.createdAt || a.timestamp).getTime() - 
           new Date(b.createdAt || b.timestamp).getTime();
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Очередь вызовов</h3>
        <Badge variant="secondary">{calls.length} активных</Badge>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sortedCalls.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Нет активных вызовов</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {sortedCalls.map((call) => (
              <Card 
                key={call.id} 
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedCall?.id === call.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleCallSelect(call)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getPriorityColor(call.priority)}>
                        {call.priority.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(call.status)}>
                        {call.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatTime(call.createdAt || call.timestamp)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {call.callerName || call.caller}
                        </span>
                        {call.callerPhone && (
                          <span className="text-sm text-gray-500">
                            {call.callerPhone}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{call.location}</span>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">
                        {call.description}
                      </p>

                      {call.assignedUnits && call.assignedUnits.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            Назначено: {call.assignedUnits.length} юнит(ов)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(call.id, 'resolved');
                      }}
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(call.id, 'closed');
                      }}
                      disabled={loading}
                    >
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Панель назначения юнитов */}
      {selectedCall && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h4 className="font-medium mb-3">Назначить юнит</h4>
          <div className="space-y-2">
            {availableUnits.length === 0 ? (
              <p className="text-sm text-gray-500">Нет доступных юнитов</p>
            ) : (
              availableUnits.map((unit) => (
                <Button
                  key={unit.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleAssignUnit(selectedCall.id, unit.id)}
                  disabled={loading}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {unit.unitNumber || unit.name}
                  <Badge className="ml-auto" variant="secondary">
                    {unit.status}
                  </Badge>
                </Button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 