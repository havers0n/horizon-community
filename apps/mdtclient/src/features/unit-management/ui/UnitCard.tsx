import React from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Unit } from '../model/store';
import { User, MapPin, Car, Shield } from 'lucide-react';

interface UnitCardProps {
  unit: Unit;
  onClick?: (unit: Unit) => void;
  className?: string;
  showActions?: boolean;
  onStatusChange?: (unitId: string, status: Unit['status']) => void;
}

export const UnitCard: React.FC<UnitCardProps> = ({
  unit,
  onClick,
  className = '',
  showActions = true,
  onStatusChange
}) => {
  const getStatusColor = (status: Unit['status']) => {
    switch (status) {
      case 'available': return 'bg-green-600';
      case 'enRoute': return 'bg-blue-600';
      case 'onScene': return 'bg-orange-600';
      case 'busy': return 'bg-yellow-600';
      case 'unavailable': return 'bg-red-600';
      case 'panic': return 'bg-red-800';
      default: return 'bg-gray-600';
    }
  };

  const getStatusLabel = (status: Unit['status']) => {
    switch (status) {
      case 'available': return 'Доступен';
      case 'enRoute': return 'В пути';
      case 'onScene': return 'На месте';
      case 'busy': return 'Занят';
      case 'unavailable': return 'Недоступен';
      case 'panic': return 'ПАНИКА';
      default: return status;
    }
  };

  const getDepartmentIcon = (department: string) => {
    switch (department.toLowerCase()) {
      case 'lspd':
      case 'bcso':
        return <Shield className="h-4 w-4" />;
      case 'lsfd':
        return <Car className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const handleStatusChange = (e: React.MouseEvent, newStatus: Unit['status']) => {
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
            {getDepartmentIcon(unit.department)}
            <span className="font-semibold text-white truncate">
              {unit.name}
            </span>
            <Badge 
              className={`text-xs ${getStatusColor(unit.status)}`}
            >
              {getStatusLabel(unit.status)}
            </Badge>
          </div>

          <div className="space-y-1 text-sm text-secondary-300">
            <div className="flex items-center gap-2">
              <span className="font-medium">{unit.callSign}</span>
            </div>
            
            {unit.vehicle && (
              <div className="flex items-center gap-2">
                <Car className="h-3 w-3" />
                <span className="truncate">{unit.vehicle}</span>
              </div>
            )}
            
            {unit.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{unit.location}</span>
              </div>
            )}
          </div>

          <div className="mt-2">
            <p className="text-xs text-secondary-400">
              {unit.rank && `${unit.rank}`}
              {unit.division && ` • ${unit.division}`}
            </p>
            {unit.qualifications && unit.qualifications.length > 0 && (
              <p className="text-xs text-secondary-400 mt-1">
                Квалификации: {unit.qualifications.slice(0, 2).join(', ')}
                {unit.qualifications.length > 2 && '...'}
              </p>
            )}
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
              onClick={(e) => handleStatusChange(e, 'enRoute')}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
            >
              В пути
            </button>
            <button
              onClick={(e) => handleStatusChange(e, 'unavailable')}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
            >
              Недоступен
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}; 