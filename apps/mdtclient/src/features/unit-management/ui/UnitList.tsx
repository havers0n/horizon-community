import React, { useEffect } from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import { EmsUnitCard } from '@/entities/ems';
import { useUnitManagementStore } from '../model/store';
import { Ambulance, AlertTriangle, RefreshCw } from 'lucide-react';

interface UnitListProps {
  className?: string;
  maxItems?: number;
}

export const UnitList: React.FC<UnitListProps> = ({ 
  className = '', 
  maxItems = 5 
}) => {
  const { 
    units, 
    isLoading, 
    error, 
    loadUnits, 
    updateUnitStatus 
  } = useUnitManagementStore();

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const displayedUnits = units.slice(0, maxItems);

  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Ambulance className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Активные юниты</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-secondary-800 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Ambulance className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Активные юниты</h3>
        </div>
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Ambulance className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Активные юниты</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadUnits}
            className="p-1 hover:bg-secondary-700 rounded transition-colors"
            title="Обновить"
          >
            <RefreshCw className="h-4 w-4 text-secondary-400" />
          </button>
          {units.length > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {units.length}
            </span>
          )}
        </div>
      </div>

      {displayedUnits.length > 0 ? (
        <div className="space-y-3">
          {displayedUnits.map(unit => (
            <EmsUnitCard
              key={unit.id}
              unit={unit}
              onStatusChange={updateUnitStatus}
              className="border border-secondary-700"
            />
          ))}
          
          {units.length > maxItems && (
            <div className="text-center text-sm text-secondary-400">
              И еще {units.length - maxItems} юнитов
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Ambulance className="h-12 w-12 text-secondary-600 mx-auto mb-2" />
          <p className="text-secondary-400">Нет активных юнитов</p>
        </div>
      )}
    </Card>
  );
}; 
