// @ts-nocheck - TODO: Remove after major refactoring is complete
import React from 'react';
import { Call911 } from '@/shared/types';
import { Card } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Phone, MapPin, Clock, User } from 'lucide-react';

interface Call911CardProps {
  call: Call911;
  onClick?: (call: Call911) => void;
  className?: string;
  showActions?: boolean;
  onAccept?: (callId: string) => void;
  onReject?: (callId: string) => void;
}

export const Call911Card: React.FC<Call911CardProps> = ({
  call,
  onClick,
  className = '',
  showActions = true,
  onAccept,
  onReject,
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
      case 'PENDING': return 'bg-yellow-600';
      case 'ACCEPTED': return 'bg-blue-600';
      case 'REJECTED': return 'bg-red-600';
      case 'COMPLETED': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Ожидает';
      case 'ACCEPTED': return 'Принят';
      case 'REJECTED': return 'Отклонен';
      case 'COMPLETED': return 'Завершен';
      default: return status;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAccept?.(call.id);
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReject?.(call.id);
  };

  return (
    <Card 
      className={`p-4 hover:bg-secondary-800/50 transition-colors cursor-pointer ${className}`}
      onClick={() => onClick?.(call)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="h-4 w-4 text-primary-400" />
            <span className="font-semibold text-white truncate">
              {call.callerName || 'Анонимный звонок'}
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
              <span>{formatTime(call.createdAt)}</span>
            </div>

            {call.callerPhone && (
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span>{call.callerPhone}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-secondary-400 mt-2 line-clamp-2">
            {call.description}
          </p>
        </div>

        {showActions && call.status === 'PENDING' && (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleAccept}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
            >
              Принять
            </button>
            <button
              onClick={handleReject}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
            >
              Отклонить
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}; 
