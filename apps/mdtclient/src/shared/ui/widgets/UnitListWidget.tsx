import { useMDTUnits } from '@/hooks/useMDT';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { Card, CardHeader } from '@/shared/ui/atoms';
import type { Units } from '@roleplay-identity/db-types';
import { Clock, MapPin, Users } from 'lucide-react';
import React from 'react';

interface UnitListWidgetProps {
  isCompact?: boolean;
  className?: string;
  maxItems?: number;
}

export const UnitListWidget: React.FC<UnitListWidgetProps> = ({
  isCompact = false,
  className = '',
  maxItems = 4,
}) => {
  const { t } = useLocale();
  const { units, updateUnitStatus } = useMDTUnits();

  const activeUnits = units.filter((u) => u.status !== 'unavailable').slice(0, maxItems);

  const handleStatusChange = async (unitId: string, newStatus: Units['status']) => {
    await updateUnitStatus(unitId, newStatus);
  };

  const getStatusColor = (status: Units['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-600';
      case 'busy':
        return 'bg-yellow-600';
      case 'en_route':
        return 'bg-blue-600';
      case 'on_scene':
        return 'bg-purple-600';
      case 'panic':
        return 'bg-red-600';
      default:
        return 'bg-secondary-600';
    }
  };

  if (isCompact) {
    return (
      <div className={`space-y-1 max-h-32 overflow-y-auto ${className}`}>
        {activeUnits.length > 0 ? (
          activeUnits.map((unit) => (
            <div
              key={unit.id}
              className="flex items-center justify-between p-1 bg-secondary-800 rounded text-xs"
            >
              <span>{unit.name}</span>
              <span
                className={`px-1 rounded ${
                  unit.is_panic ? 'bg-red-600' : getStatusColor(unit.status)
                }`}
              >
                {unit.is_panic ? t('mdt.panic') : unit.status}
              </span>
            </div>
          ))
        ) : (
          <p className="text-secondary-400 text-xs">Нет активных единиц</p>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <>{t('dispatch.unitManagement')}</>
      </CardHeader>
      <div className="p-4">
        {activeUnits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeUnits.map((unit) => (
              <div
                key={unit.id}
                className="p-3 bg-secondary-800 rounded-lg border border-secondary-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{unit.name}</h4>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      unit.is_panic ? 'bg-red-600 text-white' : getStatusColor(unit.status)
                    } text-white`}
                  >
                    {unit.is_panic ? t('mdt.panic') : unit.status}
                  </span>
                </div>
                <div className="text-sm text-secondary-400 space-y-1 mb-3">
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>{unit.character_id || 'Unknown'}</span>
                  </div>
                  {unit.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>Location available</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{new Date(unit.updated_at).toLocaleTimeString()}</span>
                  </div>
                </div>
                <select
                  className="w-full bg-secondary-700 border border-secondary-600 rounded px-2 py-1 text-xs"
                  onChange={(e) => handleStatusChange(unit.id, e.target.value as Units['status'])}
                  value={unit.status}
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="en_route">En Route</option>
                  <option value="on_scene">On Scene</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-secondary-400">{t('dispatch.noActiveUnits')}</p>
        )}
      </div>
    </Card>
  );
};
