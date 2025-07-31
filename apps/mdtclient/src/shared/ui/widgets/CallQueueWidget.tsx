// @ts-nocheck - TODO: Remove after major refactoring is complete
import React from 'react';
import { Card, CardHeader, Button } from '@/shared/ui/atoms';
import { useMDTCalls, useMDTUnits } from '@/hooks/useMDT';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { MapPin, Clock, Users, Phone } from 'lucide-react';

interface CallQueueWidgetProps {
  isCompact?: boolean;
  className?: string;
  maxItems?: number;
}

export const CallQueueWidget: React.FC<CallQueueWidgetProps> = ({ 
  isCompact = false, 
  className = '',
  maxItems = 3
}) => {
  const { t } = useLocale();
  const { calls, updateCallStatus, assignUnitsToCall } = useMDTCalls();
  const { units } = useMDTUnits();

  const activeCalls = calls.filter(call => call.status !== 'closed').slice(0, maxItems);
  const availableUnits = units.filter(u => u.status === 'available');

  const handleStatusChange = async (callId: string, newStatus: string) => {
    await updateCallStatus(callId, newStatus);
  };

  const handleAssignUnits = async (callId: string, unitIds: number[]) => {
    await assignUnitsToCall(callId, unitIds);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-green-600';
      case 2: return 'bg-yellow-600';
      case 3: return 'bg-red-600';
      default: return 'bg-secondary-600';
    }
  };

  if (isCompact) {
    return (
      <div className={`space-y-2 max-h-32 overflow-y-auto ${className}`}>
        {activeCalls.length > 0 ? (
          activeCalls.map(call => (
            <div key={call.id} className="p-2 bg-secondary-800 rounded text-xs">
              <div className="font-semibold">{call.type}</div>
              <div className="text-secondary-400">{call.location}</div>
            </div>
          ))
        ) : (
          <p className="text-secondary-400 text-xs">Нет активных вызовов</p>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>{t('dispatch.callQueue')}</CardHeader>
      <div className="p-4 space-y-3">
        {activeCalls.length > 0 ? (
          activeCalls.map(call => (
            <div key={call.id} className="p-3 bg-secondary-800 rounded-lg border border-secondary-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{call.type}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(call.priority)} text-white`}>
                  Priority {call.priority}
                </span>
              </div>
              <p className="text-sm text-secondary-300 mb-2">{call.description}</p>
              <div className="text-xs text-secondary-400 flex items-center gap-4 mb-3">
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {call.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(call.createdAt).toLocaleTimeString()}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {call.assignedUnits.length} units
                </span>
              </div>
              <div className="flex gap-2">
                <select 
                  className="bg-secondary-700 border border-secondary-600 rounded px-2 py-1 text-xs"
                  onChange={(e) => handleStatusChange(call.id, e.target.value)}
                  value={call.status}
                >
                  <option value="pending">Pending</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="en_route">En Route</option>
                  <option value="on_scene">On Scene</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button 
                  size="sm" 
                  onClick={() => {
                    if (availableUnits.length > 0) {
                      handleAssignUnits(call.id, [parseInt(availableUnits[0].id)]);
                    }
                  }}
                  disabled={availableUnits.length === 0}
                >
                  {t('dispatch.assignUnit')}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-secondary-400">{t('dispatch.noActiveCalls')}</p>
        )}
      </div>
    </Card>
  );
};
