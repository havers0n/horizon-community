// UI компонент для отображения карточки инцидента
// Поддерживает два варианта: default и compact

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Users, 
  Car, 
  Phone, 
  Calendar,
  Badge,
  Shield,
  Activity
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/shared/ui/atoms/Card';
import { Badge as BadgeComponent } from '@/shared/ui/atoms/Badge';
import { Button } from '@/shared/ui/atoms/Button';

import { 
  Incident, 
  IncidentType, 
  IncidentStatus, 
  IncidentPriority, 
  IncidentSeverity,
  IncidentCategory 
} from '../model';

// Вариации компонента
const incidentCardVariants = cva(
  'transition-all duration-200 hover:shadow-md',
  {
    variants: {
      variant: {
        default: 'w-full',
        compact: 'w-full max-w-sm',
      },
      priority: {
        low: 'border-l-4 border-l-green-500',
        medium: 'border-l-4 border-l-yellow-500',
        high: 'border-l-4 border-l-orange-500',
        critical: 'border-l-4 border-l-red-500',
        emergency: 'border-l-4 border-l-red-600 bg-red-50',
      },
    },
    defaultVariants: {
      variant: 'default',
      priority: 'low',
    },
  }
);

export interface IncidentCardProps extends VariantProps<typeof incidentCardVariants> {
  incident: Incident;
  variant?: 'default' | 'compact';
  onClick?: (incident: Incident) => void;
  onEdit?: (incident: Incident) => void;
  onDelete?: (incident: Incident) => void;
  className?: string;
}

// Утилиты для отображения статусов и приоритетов
const getStatusConfig = (status: IncidentStatus) => {
  const configs = {
    [IncidentStatus.REPORTED]: { label: 'Заявлен', color: 'bg-blue-100 text-blue-800' },
    [IncidentStatus.DISPATCHED]: { label: 'Отправлен', color: 'bg-yellow-100 text-yellow-800' },
    [IncidentStatus.EN_ROUTE]: { label: 'В пути', color: 'bg-orange-100 text-orange-800' },
    [IncidentStatus.ON_SCENE]: { label: 'На месте', color: 'bg-purple-100 text-purple-800' },
    [IncidentStatus.IN_PROGRESS]: { label: 'В работе', color: 'bg-indigo-100 text-indigo-800' },
    [IncidentStatus.RESOLVED]: { label: 'Решен', color: 'bg-green-100 text-green-800' },
    [IncidentStatus.CLOSED]: { label: 'Закрыт', color: 'bg-gray-100 text-gray-800' },
    [IncidentStatus.CANCELLED]: { label: 'Отменен', color: 'bg-red-100 text-red-800' },
  };
  return configs[status] || configs[IncidentStatus.REPORTED];
};

const getPriorityConfig = (priority: IncidentPriority) => {
  const configs = {
    [IncidentPriority.LOW]: { label: 'Низкий', color: 'bg-green-100 text-green-800' },
    [IncidentPriority.MEDIUM]: { label: 'Средний', color: 'bg-yellow-100 text-yellow-800' },
    [IncidentPriority.HIGH]: { label: 'Высокий', color: 'bg-orange-100 text-orange-800' },
    [IncidentPriority.CRITICAL]: { label: 'Критический', color: 'bg-red-100 text-red-800' },
    [IncidentPriority.EMERGENCY]: { label: 'Экстренный', color: 'bg-red-200 text-red-900' },
  };
  return configs[priority] || configs[IncidentPriority.LOW];
};

const getSeverityConfig = (severity: IncidentSeverity) => {
  const configs = {
    [IncidentSeverity.MINOR]: { label: 'Незначительный', color: 'bg-green-100 text-green-800' },
    [IncidentSeverity.MODERATE]: { label: 'Умеренный', color: 'bg-yellow-100 text-yellow-800' },
    [IncidentSeverity.MAJOR]: { label: 'Серьезный', color: 'bg-orange-100 text-orange-800' },
    [IncidentSeverity.SEVERE]: { label: 'Тяжелый', color: 'bg-red-100 text-red-800' },
    [IncidentSeverity.CATASTROPHIC]: { label: 'Катастрофический', color: 'bg-red-200 text-red-900' },
  };
  return configs[severity] || configs[IncidentSeverity.MINOR];
};

const getTypeIcon = (type: IncidentType) => {
  const icons = {
    [IncidentType.CRIMINAL]: Shield,
    [IncidentType.TRAFFIC]: Car,
    [IncidentType.MEDICAL]: Activity,
    [IncidentType.FIRE]: AlertTriangle,
    [IncidentType.NATURAL_DISASTER]: AlertTriangle,
    [IncidentType.PUBLIC_DISTURBANCE]: Users,
    [IncidentType.DOMESTIC]: Users,
    [IncidentType.ACCIDENT]: Car,
    [IncidentType.OTHER]: AlertTriangle,
  };
  return icons[type] || AlertTriangle;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDuration = (minutes?: number) => {
  if (!minutes) return 'Не указано';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}ч ${mins}м`;
  }
  return `${mins}м`;
};

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  variant = 'default',
  onClick,
  onEdit,
  onDelete,
  className,
}) => {
  const statusConfig = getStatusConfig(incident.status);
  const priorityConfig = getPriorityConfig(incident.priority);
  const severityConfig = getSeverityConfig(incident.severity);
  const TypeIcon = getTypeIcon(incident.type);

  const handleClick = () => {
    onClick?.(incident);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(incident);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(incident);
  };

  if (variant === 'compact') {
    return (
      <Card 
        className={clsx(
          incidentCardVariants({ variant, priority: incident.priority }),
          'cursor-pointer',
          className
        )}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <TypeIcon className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-sm truncate">{incident.title}</span>
            </div>
            <BadgeComponent 
              variant="secondary" 
              className={clsx('text-xs', statusConfig.color)}
            >
              {statusConfig.label}
            </BadgeComponent>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{incident.location.city}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(incident.reportedAt)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <BadgeComponent 
                variant="outline" 
                className={clsx('text-xs', priorityConfig.color)}
              >
                {priorityConfig.label}
              </BadgeComponent>
              <BadgeComponent 
                variant="outline" 
                className={clsx('text-xs', severityConfig.color)}
              >
                {severityConfig.label}
              </BadgeComponent>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {incident.assignedUnits.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{incident.assignedUnits.length}</span>
                </div>
              )}
              {incident.involvedVehicles.length > 0 && (
                <div className="flex items-center gap-1">
                  <Car className="w-3 h-3" />
                  <span>{incident.involvedVehicles.length}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={clsx(
        incidentCardVariants({ variant, priority: incident.priority }),
        'cursor-pointer',
        className
      )}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <TypeIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">{incident.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{incident.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BadgeComponent 
              variant="secondary" 
              className={clsx('text-sm', statusConfig.color)}
            >
              {statusConfig.label}
            </BadgeComponent>
            {(onEdit || onDelete) && (
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    className="h-8 w-8 p-0"
                  >
                    <Badge className="w-4 h-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div>
                <span className="font-medium">Локация:</span>
                <span className="ml-1">{incident.location.address}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <span className="font-medium">Заявлен:</span>
                <span className="ml-1">{formatDate(incident.reportedAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <span className="font-medium">Обновлен:</span>
                <span className="ml-1">{formatDate(incident.updatedAt)}</span>
              </div>
            </div>

            {incident.estimatedDuration && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <span className="font-medium">Ожидаемая длительность:</span>
                  <span className="ml-1">{formatDuration(incident.estimatedDuration)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-500" />
              <div>
                <span className="font-medium">Заявитель:</span>
                <span className="ml-1">
                  {incident.reporter.isAnonymous ? 'Анонимно' : incident.reporter.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-500" />
              <div>
                <span className="font-medium">Подразделения:</span>
                <span className="ml-1">{incident.assignedUnits.length}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-500" />
              <div>
                <span className="font-medium">Участники:</span>
                <span className="ml-1">{incident.involvedCitizens.length}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Car className="w-4 h-4 text-gray-500" />
              <div>
                <span className="font-medium">Транспорт:</span>
                <span className="ml-1">{incident.involvedVehicles.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <BadgeComponent 
            variant="outline" 
            className={clsx('text-sm', priorityConfig.color)}
          >
            {priorityConfig.label}
          </BadgeComponent>
          <BadgeComponent 
            variant="outline" 
            className={clsx('text-sm', severityConfig.color)}
          >
            {severityConfig.label}
          </BadgeComponent>
          <BadgeComponent variant="outline" className="text-sm">
            {incident.category}
          </BadgeComponent>
          {incident.subcategory && (
            <BadgeComponent variant="outline" className="text-sm">
              {incident.subcategory}
            </BadgeComponent>
          )}
        </div>

        {incident.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {incident.tags.slice(0, 5).map((tag, index) => (
              <BadgeComponent key={index} variant="secondary" className="text-xs">
                {tag}
              </BadgeComponent>
            ))}
            {incident.tags.length > 5 && (
              <BadgeComponent variant="secondary" className="text-xs">
                +{incident.tags.length - 5}
              </BadgeComponent>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>№{incident.incidentNumber}</span>
            {incident.responseTime && (
              <span>Время отклика: {formatDuration(incident.responseTime)}</span>
            )}
            {incident.resolutionTime && (
              <span>Время решения: {formatDuration(incident.resolutionTime)}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {incident.photos.length > 0 && (
              <span className="flex items-center gap-1">
                📷 {incident.photos.length}
              </span>
            )}
            {incident.videos.length > 0 && (
              <span className="flex items-center gap-1">
                🎥 {incident.videos.length}
              </span>
            )}
            {incident.documents.length > 0 && (
              <span className="flex items-center gap-1">
                📄 {incident.documents.length}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
