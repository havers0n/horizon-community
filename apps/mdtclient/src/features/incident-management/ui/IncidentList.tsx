// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useEffect } from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import { IncidentCard } from '@/entities/incident/ui/IncidentCard';
import { useIncidentManagementStore } from '../model/store';
import { AlertTriangle, Plus, RefreshCw } from 'lucide-react';

interface IncidentListProps {
  className?: string;
  maxItems?: number;
}

export const IncidentList: React.FC<IncidentListProps> = ({ 
  className = '', 
  maxItems = 5 
}) => {
  const { 
    incidents, 
    isLoading, 
    error, 
    loadIncidents, 
    selectIncident,
    generateReport
  } = useIncidentManagementStore();

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const activeIncidents = incidents.filter(incident => 
    incident.events.length > 0 && incident.involvedUnits.length > 0
  );
  const displayedIncidents = activeIncidents.slice(0, maxItems);

  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Активные инциденты</h3>
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
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Активные инциденты</h3>
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
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Активные инциденты</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadIncidents}
            className="p-1 hover:bg-secondary-700 rounded transition-colors"
            title="Обновить"
          >
            <RefreshCw className="h-4 w-4 text-secondary-400" />
          </button>
          <button
            className="p-1 hover:bg-secondary-700 rounded transition-colors"
            title="Создать инцидент"
          >
            <Plus className="h-4 w-4 text-secondary-400" />
          </button>
          {activeIncidents.length > 0 && (
            <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
              {activeIncidents.length}
            </span>
          )}
        </div>
      </div>

      {displayedIncidents.length > 0 ? (
        <div className="space-y-3">
          {displayedIncidents.map(incident => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onViewDetails={selectIncident}
              onGenerateReport={generateReport}
              className="border border-secondary-700"
            />
          ))}
          
          {activeIncidents.length > maxItems && (
            <div className="text-center text-sm text-secondary-400">
              И еще {activeIncidents.length - maxItems} активных инцидентов
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-secondary-600 mx-auto mb-2" />
          <p className="text-secondary-400">Нет активных инцидентов</p>
        </div>
      )}
    </Card>
  );
}; 
