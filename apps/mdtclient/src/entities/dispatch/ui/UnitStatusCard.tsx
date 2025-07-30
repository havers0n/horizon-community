import React from 'react';
import { MDTUnit, UnitStatus } from '../model/types';
import { Card } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Shield, Clock, MapPin } from 'lucide-react';

interface UnitStatusCardProps {
  unit: MDTUnit;
  onClick?: (unit: MDTUnit) => void;
  className?: string;
  showActions?: boolean;
  onStatusChange?: (unitId: string, status: UnitStatus) => void;
}

export const UnitStatusCard: React.FC<UnitStatusCardProps> = ({
  unit,
  onClick,
  className = '',
  showActions = true,
  onStatusChange,
}) => {
  const getStatusColor = (status: UnitStatus) => {
    switch (status) {
      case UnitStatus.AVAILABLE: return 'bg-green-600';
      case UnitStatus.BUSY: return 'bg-yellow-600';
      case UnitStatus.EN_ROUTE: return 'bg-blue-600';
      case UnitStatus.ON_SCENE: return 'bg-purple-600';
      case UnitStatus.PANIC: return 'bg-red-600';
      case UnitStatus.UNAVAILABLE: return 'bg-gray-600';
      case UnitStatus.EN_ROUTE_TO_HOSPITAL: return 'bg-indigo-600';
      case UnitStatus.AT_HOSPITAL: return 'bg-pink-600';
      case UnitStatus.AWAITING_PATIENT: return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusLabel = (status: UnitStatus) => {
    switch (status) {
      case UnitStatus.AVAILABLE: return 'Доступен';
      case UnitStatus.BUSY: return 'Занят';
      case UnitStatus.EN_ROUTE: return 'В пути';
      case UnitStatus.ON_SCENE: return 'На месте';
      case UnitStatus.PANIC: return 'Паника!';
      case UnitStatus.UNAVAILABLE: return 'Недоступен';
      case UnitStatus.EN_ROUTE_TO_HOSPITAL: return 'В больницу';
      case UnitStatus.AT_HOSPITAL: return 'В больнице';
      case UnitStatus.AWAITING_PATIENT: return 'Ожидает пациента';
      default: return status;
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'LSPD': return 'bg-blue-600';
      case 'BCSO': return 'bg-yellow-600';
      case 'LSFD': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getDepartmentLabel = (department: string) => {
    switch (department) {
      case 'LSPD': return 'LSPD';
      case 'BCSO': return 'BCSO';
      case 'LSFD': return 'LSFD';
      default: return department;
    }
  };

  const handleStatusChange = (e: React.MouseEvent, newStatus: UnitStatus) => {
    e.stopPropagation();
    onStatusChange?.(unit.id, newStatus);
  };

  return (
    <Card 
      className={`p-4 hover:bg-secondary-800/50 transition-colors cursor-pointer ${className}`}
      onClick={() => onClick?.(unit)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-primary-400" />
            <span className="font-semibold text-white truncate">
              {unit.name}
            </span>
            <Badge 
              className={`text-xs ${getDepartmentColor(unit.department)}`}
            >
              {getDepartmentLabel(unit.department)}
            </Badge>
            <Badge 
              className={`text-xs ${getStatusColor(unit.status)}`}
            >
              {getStatusLabel(unit.status)}
            </Badge>
          </div>

          <div className="space-y-1 text-sm text-secondary-300">
            {unit.callId && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Вызов: {unit.callId}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span className="truncate">
                {unit.status === UnitStatus.ON_SCENE ? 'На месте происшествия' : 'В патруле'}
              </span>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex flex-col gap-1">
            <button
              onClick={(e) => handleStatusChange(e, UnitStatus.AVAILABLE)}
              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
            >
              Доступен
            </button>
            <button
              onClick={(e) => handleStatusChange(e, UnitStatus.BUSY)}
              className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors"
            >
              Занят
            </button>
            <button
              onClick={(e) => handleStatusChange(e, UnitStatus.UNAVAILABLE)}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              Недоступен
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}; 
