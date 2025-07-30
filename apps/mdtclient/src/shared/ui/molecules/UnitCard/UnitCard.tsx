import React from 'react';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { StatusIndicator, StatusVariant } from '@/shared/ui/atoms/StatusIndicator';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Button } from '@/shared/ui/atoms/Button';
import { Phone, MapPin, Clock, User } from 'lucide-react';

export interface Unit {
  id: string;
  callsign: string;
  name: string;
  status: StatusVariant;
  department: string;
  division: string;
  location?: string;
  lastSeen?: string;
  phone?: string;
  vehicle?: string;
  qualifications?: string[];
}

export interface UnitCardProps {
  unit: Unit;
  onSelect?: (unit: Unit) => void;
  onCall?: (unit: Unit) => void;
  onTrack?: (unit: Unit) => void;
  className?: string;
  compact?: boolean;
  showActions?: boolean;
}

export const UnitCard: React.FC<UnitCardProps> = ({
  unit,
  onSelect,
  onCall,
  onTrack,
  className,
  compact = false,
  showActions = true,
}) => {
  const handleSelect = () => {
    onSelect?.(unit);
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCall?.(unit);
  };

  const handleTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTrack?.(unit);
  };

  if (compact) {
    return (
      <Card 
        className={cn(
          'cursor-pointer transition-all hover:bg-secondary-800/50 hover:border-accent-500/50',
          className
        )}
        onClick={handleSelect}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIndicator variant={unit.status} size="sm" />
              <div>
                <p className="font-medium text-sm">{unit.callsign}</p>
                <p className="text-xs text-secondary-400">{unit.name}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {unit.department}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:bg-secondary-800/50 hover:border-accent-500/50',
        className
      )}
      onClick={handleSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {unit.callsign}
          </CardTitle>
          <StatusIndicator variant={unit.status} size="md">
            {unit.status === 'available' && 'Доступен'}
            {unit.status === 'unavailable' && 'Недоступен'}
            {unit.status === 'busy' && 'Занят'}
            {unit.status === 'enroute' && 'В пути'}
            {unit.status === 'on-scene' && 'На месте'}
            {unit.status === 'offline' && 'Офлайн'}
            {unit.status === 'panic' && 'ПАНИКА'}
          </StatusIndicator>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-secondary-400" />
            <span>{unit.name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="text-xs">
              {unit.department}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {unit.division}
            </Badge>
          </div>

          {unit.location && (
            <div className="flex items-center gap-2 text-sm text-secondary-400">
              <MapPin className="w-4 h-4" />
              <span>{unit.location}</span>
            </div>
          )}

          {unit.lastSeen && (
            <div className="flex items-center gap-2 text-sm text-secondary-400">
              <Clock className="w-4 h-4" />
              <span>Последний раз: {unit.lastSeen}</span>
            </div>
          )}

          {unit.vehicle && (
            <div className="text-sm text-secondary-400">
              ТС: {unit.vehicle}
            </div>
          )}

          {unit.qualifications && unit.qualifications.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {unit.qualifications.map((qual, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {qual}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2 pt-2 border-t border-secondary-700">
            {unit.phone && onCall && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCall}
                className="flex-1"
              >
                <Phone className="w-4 h-4 mr-1" />
                Позвонить
              </Button>
            )}
            
            {onTrack && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTrack}
                className="flex-1"
              >
                <MapPin className="w-4 h-4 mr-1" />
                Отследить
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
