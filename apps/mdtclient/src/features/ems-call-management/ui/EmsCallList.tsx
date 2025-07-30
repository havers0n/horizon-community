import React, { useEffect } from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import { EmsCallCard } from '@/entities/ems';
import { useEmsCallManagementStore } from '../model/store';
import { Phone, AlertTriangle, RefreshCw } from 'lucide-react';

interface EmsCallListProps {
  className?: string;
  maxItems?: number;
  showActiveOnly?: boolean;
}

export const EmsCallList: React.FC<EmsCallListProps> = ({ 
  className = '', 
  maxItems = 5,
  showActiveOnly = true
}) => {
  const { 
    calls, 
    isLoading, 
    error, 
    loadCalls, 
    loadActiveCalls,
    assignCall,
    completeCall
  } = useEmsCallManagementStore();

  useEffect(() => {
    if (showActiveOnly) {
      loadActiveCalls();
    } else {
      loadCalls();
    }
  }, [loadCalls, loadActiveCalls, showActiveOnly]);

  const displayedCalls = calls.slice(0, maxItems);

  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Phone className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">
            {showActiveOnly ? 'Активные вызовы' : 'Все вызовы'}
          </h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-secondary-800 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Phone className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">
            {showActiveOnly ? 'Активные вызовы' : 'Все вызовы'}
          </h3>
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
          <Phone className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">
            {showActiveOnly ? 'Активные вызовы' : 'Все вызовы'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={showActiveOnly ? loadActiveCalls : loadCalls}
            className="p-1 hover:bg-secondary-700 rounded transition-colors"
            title="Обновить"
          >
            <RefreshCw className="h-4 w-4 text-secondary-400" />
          </button>
          {calls.length > 0 && (
            <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
              {calls.length}
            </span>
          )}
        </div>
      </div>

      {displayedCalls.length > 0 ? (
        <div className="space-y-3">
          {displayedCalls.map(call => (
            <EmsCallCard
              key={call.id}
              call={call}
              onAssign={assignCall}
              onComplete={completeCall}
              className="border border-secondary-700"
            />
          ))}
          
          {calls.length > maxItems && (
            <div className="text-center text-sm text-secondary-400">
              И еще {calls.length - maxItems} вызовов
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Phone className="h-12 w-12 text-secondary-600 mx-auto mb-2" />
          <p className="text-secondary-400">
            {showActiveOnly ? 'Нет активных вызовов' : 'Нет вызовов'}
          </p>
        </div>
      )}
    </Card>
  );
}; 
