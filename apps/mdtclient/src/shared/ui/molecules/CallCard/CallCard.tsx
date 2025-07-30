import React from 'react';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Button } from '@/shared/ui/atoms/Button';
import { MapPin, Clock, Phone, Users, AlertTriangle, Car, Building } from 'lucide-react';

export type CallPriority = 'low' | 'medium' | 'high' | 'critical';
export type CallStatus = 'pending' | 'dispatched' | 'enroute' | 'onscene' | 'completed' | 'cancelled';

export interface Call {
  id: string;
  callNumber: string;
  priority: CallPriority;
  status: CallStatus;
  type: string;
  address: string;
  description: string;
  caller?: string;
  callerPhone?: string;
  units?: string[];
  createdAt: string;
  updatedAt: string;
  coordinates?: { lat: number; lng: number };
}

export interface CallCardProps {
  call: Call;
  onSelect?: (call: Call) => void;
  onAssign?: (call: Call) => void;
  onUpdate?: (call: Call) => void;
  className?: string;
  compact?: boolean;
  showActions?: boolean;
}

const priorityConfig = {
  low: { color: 'bg-green-500/20 border-green-500/50 text-green-300', label: 'Низкий' },
  medium: { color: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300', label: 'Средний' },
  high: { color: 'bg-orange-500/20 border-orange-500/50 text-orange-300', label: 'Высокий' },
  critical: { color: 'bg-red-500/20 border-red-500/50 text-red-300', label: 'Критичный' },
};

const statusConfig = {
  pending: { color: 'bg-gray-500/20 border-gray-500/50', label: 'Ожидает' },
  dispatched: { color: 'bg-blue-500/20 border-blue-500/50', label: 'Назначен' },
  enroute: { color: 'bg-yellow-500/20 border-yellow-500/50', label: 'В пути' },
  onscene: { color: 'bg-orange-500/20 border-orange-500/50', label: 'На месте' },
  completed: { color: 'bg-green-500/20 border-green-500/50', label: 'Завершен' },
  cancelled: { color: 'bg-red-500/20 border-red-500/50', label: 'Отменен' },
};

const getCallIcon = (type: string) => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('traffic') || lowerType.includes('vehicle')) return Car;
  if (lowerType.includes('fire') || lowerType.includes('medical')) return AlertTriangle;
  if (lowerType.includes('building') || lowerType.includes('property')) return Building;
  return Phone;
};

export const CallCard: React.FC<CallCardProps> = ({
  call,
  onSelect,
  onAssign,
  onUpdate,
  className,
  compact = false,
  showActions = true,
}) => {
  const handleSelect = () => {
    onSelect?.(call);
  };

  const handleAssign = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAssign?.(call);
  };

  const handleUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate?.(call);
  };

  const CallIcon = getCallIcon(call.type);
  const priority = priorityConfig[call.priority];
  const status = statusConfig[call.status];

  if (compact) {
    return (
      <Card 
        className={cn(
          'cursor-pointer transition-all hover:bg-secondary-800/50 hover:border-accent-500/50',
          className
        )}
        onClick={handleSelect}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CallIcon className="w-4 h-4 text-secondary-400" />
              <div>
                <p className="font-medium text-sm">#{call.callNumber}</p>
                <p className="text-xs text-secondary-400">{call.type}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge 
                className={cn('text-xs', priority.color)}
                variant="outline"
              >
                {priority.label}
              </Badge>
              <Badge 
                className={cn('text-xs', status.color)}
                variant="outline"
              >
                {status.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:bg-secondary-800/50 hover:border-accent-500/50',
        className
      )}
      onClick={handleSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CallIcon className="w-5 h-5 text-secondary-400" />
            <CardTitle className="text-lg font-semibold">
              #{call.callNumber}
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge 
              className={cn('text-xs', priority.color)}
              variant="outline"
            >
              {priority.label}
            </Badge>
            <Badge 
              className={cn('text-xs', status.color)}
              variant="outline"
            >
              {status.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="text-sm font-medium">
            {call.type}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-secondary-400">
            <MapPin className="w-4 h-4" />
            <span>{call.address}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-secondary-400">
            <Clock className="w-4 h-4" />
            <span>{new Date(call.createdAt).toLocaleTimeString()}</span>
          </div>

          {call.caller && (
            <div className="flex items-center gap-2 text-sm text-secondary-400">
              <Phone className="w-4 h-4" />
              <span>{call.caller}</span>
              {call.callerPhone && (
                <span className="text-xs">({call.callerPhone})</span>
              )}
            </div>
          )}

          {call.units && call.units.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-secondary-400">
              <Users className="w-4 h-4" />
              <span>Юниты: {call.units.join(', ')}</span>
            </div>
          )}

          <div className="text-sm text-secondary-300">
            {call.description}
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2 pt-2 border-t border-secondary-700">
            {onAssign && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAssign}
                className="flex-1"
              >
                Назначить
              </Button>
            )}
            
            {onUpdate && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpdate}
                className="flex-1"
              >
                Обновить
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
