// @ts-nocheck - TODO: Remove after major refactoring is complete
import React from 'react';
import { Incident } from '@/shared/types';
import { Card } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Shield, Clock, Users, AlertTriangle } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  onClick?: (incident: Incident) => void;
  className?: string;
  showActions?: boolean;
  onViewDetails?: (incident: Incident) => void;
  onGenerateReport?: (incident: Incident) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  onClick,
  className = '',
  showActions = true,
  onViewDetails,
  onGenerateReport,
}) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLatestEvent = () => {
    return incident.events[incident.events.length - 1];
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails?.(incident);
  };

  const handleGenerateReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    onGenerateReport?.(incident);
  };

  const latestEvent = getLatestEvent();

  return (
    <Card 
      className={`p-4 hover:bg-secondary-800/50 transition-colors cursor-pointer ${className}`}
      onClick={() => onClick?.(incident)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <span className="font-semibold text-white truncate">
              {incident.title}
            </span>
            <Badge className="bg-blue-600 text-xs">
              {incident.involvedUnits.length} юнитов
            </Badge>
          </div>

          <div className="space-y-1 text-sm text-secondary-300">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>{formatTime(latestEvent.timestamp)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3" />
              <span>{incident.involvedUnits.length} задействовано</span>
            </div>

            {incident.involvedCitizens.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                <span>{incident.involvedCitizens.length} граждан</span>
              </div>
            )}
          </div>

          <p className="text-sm text-secondary-400 mt-2 line-clamp-2">
            {latestEvent.description}
          </p>

          <div className="mt-2 text-xs text-secondary-500">
            Событий: {incident.events.length}
          </div>
        </div>

        {showActions && (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleViewDetails}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
            >
              Детали
            </button>
            <button
              onClick={handleGenerateReport}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
            >
              Отчет
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}; 
