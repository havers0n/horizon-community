// @ts-nocheck - TODO: Remove after major refactoring is complete
import React from 'react';
import type { Unit, UnitStatus } from '@/shared/types';
import { Card } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Shield, Clock, MapPin } from 'lucide-react';

interface UnitStatusCardProps {
  unit: Unit;
  onClick?: (unit: Unit) => void;
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
      case 'available': return 'bg-green-600';
      case 'busy': return 'bg-yellow-600';
      case 'enRoute': return 'bg-blue-600';
      case 'onScene': return 'bg-purple-600';
      case 'panic': return 'bg-red-600';
      case 'unavailable': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusLabel = (status: UnitStatus) => {
    switch (status) {
      case 'available': return 'Доступен';
      case 'busy': return 'Занят';
      case 'enRoute': return 'В пути';
      case 'onScene': return 'На месте';
      case 'panic': return 'Паника!';
      case 'unavailable': return 'Недоступен';
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
              {unit.unitNumber}
            </span>
            <Badge 
              className={`text-xs ${getDepartmentColor(unit.departmentId === 1 ? 'LSPD' : unit.departmentId === 2 ? 'BCSO' : 'LSFD')}`}
            >
              {getDepartmentLabel(unit.departmentId === 1 ? 'LSPD' : unit.departmentId === 2 ? 'BCSO' : 'LSFD')}
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
              {unit.status === 'onScene' ? 'На месте происшествия' : 'В патруле'}
            </span>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex flex-col gap-1">
            <button
              onClick={(e) => handleStatusChange(e, 'available')}
              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
            >
              Доступен
            </button>
            <button
              onClick={(e) => handleStatusChange(e, 'busy')}
              className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors"
            >
              Занят
            </button>
            <button
              onClick={(e) => handleStatusChange(e, 'unavailable')}
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
