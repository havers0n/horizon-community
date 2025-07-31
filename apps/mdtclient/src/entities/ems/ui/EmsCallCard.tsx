// @ts-nocheck - TODO: Remove after major refactoring is complete
import React from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { EmsCall } from '@/shared/types';
import { Phone, MapPin, Clock, AlertTriangle, HeartPulse } from 'lucide-react';

interface EmsCallCardProps {
  call: EmsCall;
  onClick?: (call: EmsCall) => void;
  className?: string;
  showActions?: boolean;
  onAssign?: (callId: string) => void;
  onComplete?: (callId: string) => void;
}

export const EmsCallCard: React.FC<EmsCallCardProps> = ({
  call,
  onClick,
  className = '',
  showActions = true,
  onAssign,
  onComplete
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600';
      case 'en_route': return 'bg-blue-600';
      case 'on_scene': return 'bg-orange-600';
      case 'transporting': return 'bg-purple-600';
      case 'completed': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'en_route': return 'В пути';
      case 'on_scene': return 'На месте';
      case 'transporting': return 'Транспортировка';
      case 'completed': return 'Завершен';
      default: return status;
    }
  };

  const getCallTypeIcon = (type: string) => {
    switch (type) {
      case 'medical_emergency': return <HeartPulse className="h-4 w-4" />;
      case 'trauma': return <AlertTriangle className="h-4 w-4" />;
      case 'structure_fire': return <AlertTriangle className="h-4 w-4" />;
      default: return <Phone className="h-4 w-4" />;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAssign = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAssign?.(call.id);
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete?.(call.id);
  };

  return (
    <Card 
      className={`p-4 hover:bg-secondary-800/50 transition-colors cursor-pointer ${className}`}
      onClick={() => onClick?.(call)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {getCallTypeIcon(call.type)}
            <span className="font-semibold text-white truncate">
              {call.caller}
            </span>
            <Badge 
              className={`text-xs ${getPriorityColor(call.priority)}`}
            >
              {call.priority.toUpperCase()}
            </Badge>
            <Badge 
              className={`text-xs ${getStatusColor(call.status)}`}
            >
              {getStatusLabel(call.status)}
            </Badge>
          </div>

          <div className="space-y-1 text-sm text-secondary-300">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{call.location}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>{formatTime(call.timestamp)}</span>
            </div>
          </div>

          <p className="text-sm text-secondary-400 mt-2 line-clamp-2">
            {call.description}
          </p>

          {call.patientInfo && (
            <div className="mt-2 p-2 bg-secondary-800/50 rounded text-xs">
              <p className="text-white font-medium">{call.patientInfo.name}, {call.patientInfo.age} лет</p>
              <p className="text-secondary-300">{call.patientInfo.condition}</p>
            </div>
          )}
        </div>

        {showActions && call.status !== 'completed' && (
          <div className="flex flex-col gap-1">
            {call.status === 'pending' && (
              <button
                onClick={handleAssign}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
              >
                Назначить
              </button>
            )}
            {['en_route', 'on_scene', 'transporting'].includes(call.status) && (
              <button
                onClick={handleComplete}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
              >
                Завершить
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}; 
