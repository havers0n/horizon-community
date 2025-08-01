// @ts-nocheck - TODO: Remove after major refactoring is complete
import React from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { EmsUnit, UnitStatus, UnitStatuses } from '@/shared/types';
import { Ambulance, Users, MapPin, Radio } from 'lucide-react';

interface EmsUnitCardProps {
  unit: EmsUnit;
  onClick?: (unit: EmsUnit) => void;
  className?: string;
  showActions?: boolean;
  onStatusChange?: (unitId: string, status: UnitStatus) => void;
}

export const EmsUnitCard: React.FC<EmsUnitCardProps> = ({
  unit,
  onClick,
  className = '',
  showActions = true,
  onStatusChange
}) => {
  const getStatusColor = (status: UnitStatus) => {
    switch (status) {
      case UnitStatuses.AVAILABLE: return 'bg-green-600';
      case UnitStatuses.EN_ROUTE: return 'bg-blue-600';
      case UnitStatuses.ON_SCENE: return 'bg-orange-600';
      case UnitStatuses.TRANSPORTING: return 'bg-purple-600';
      case UnitStatuses.OUT_OF_SERVICE: return 'bg-red-600';
      case UnitStatuses.TRAINING: return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusLabel = (status: UnitStatus) => {
    switch (status) {
      case UnitStatuses.AVAILABLE: return 'Доступен';
      case UnitStatuses.EN_ROUTE: return 'В пути';
      case UnitStatuses.ON_SCENE: return 'На месте';
      case UnitStatuses.TRANSPORTING: return 'Транспортировка';
      case UnitStatuses.OUT_OF_SERVICE: return 'Недоступен';
      case UnitStatuses.TRAINING: return 'Обучение';
      default: return status;
    }
  };

  const getUnitTypeIcon = (unitType: string) => {
    switch (unitType) {
      case 'ambulance': return <Ambulance className="h-4 w-4" />;
      case 'fire_engine': return <Radio className="h-4 w-4" />;
      default: return <Radio className="h-4 w-4" />;
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
            {getUnitTypeIcon(unit.unitType)}
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
              <Users className="h-3 w-3" />
              <span>{unit.crew.length} членов экипажа</span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{unit.location}</span>
            </div>
          </div>

          <div className="mt-2">
            <p className="text-xs text-secondary-400">
              Оборудование: {unit.equipment.slice(0, 2).join(', ')}
              {unit.equipment.length > 2 && '...'}
            </p>
          </div>
        </div>

        {showActions && (
          <div className="flex flex-col gap-1">
            <button
              onClick={(e) => handleStatusChange(e, UnitStatuses.AVAILABLE)}
              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
            >
              Доступен
            </button>
            <button
              onClick={(e) => handleStatusChange(e, UnitStatuses.EN_ROUTE)}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
            >
              В пути
            </button>
            <button
              onClick={(e) => handleStatusChange(e, UnitStatuses.OUT_OF_SERVICE)}
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
