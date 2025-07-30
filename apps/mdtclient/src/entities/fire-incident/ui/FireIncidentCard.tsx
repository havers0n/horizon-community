// Fire Incident Entity - UI Layer
// Компонент карточки пожарного инцидента

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Button } from '@/shared/ui/atoms/Button';
import { Avatar, AvatarFallback } from '@/shared/ui/atoms/Avatar';
import { 
  Flame, 
  MapPin, 
  Clock, 
  Users, 
  AlertTriangle, 
  Phone, 
  Eye, 
  Edit,
  Truck,
  Building,
  Car,
  Tree,
  Zap,
  Droplets,
  Bomb,
  GasPump,
  Biohazard,
  LifeBuoy,
  Bell,
  HelpCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Calendar,
  Thermometer,
  Wind
} from 'lucide-react';
import { 
  FireIncident, 
  FireIncidentType, 
  FireIncidentStatus, 
  FireIncidentPriority, 
  FireIncidentSeverity,
  FireIncidentCategory,
  FireUnitType,
  WeatherCondition
} from '../model/types';

interface FireIncidentCardProps {
  incident: FireIncident;
  variant?: 'default' | 'compact';
  onView?: (incident: FireIncident) => void;
  onEdit?: (incident: FireIncident) => void;
  className?: string;
}

export const FireIncidentCard: React.FC<FireIncidentCardProps> = ({
  incident,
  variant = 'default',
  onView,
  onEdit,
  className = ''
}) => {
  const getIncidentTypeIcon = (type: FireIncidentType) => {
    switch (type) {
      case FireIncidentType.STRUCTURE_FIRE:
        return <Building className="w-4 h-4" />;
      case FireIncidentType.VEHICLE_FIRE:
        return <Car className="w-4 h-4" />;
      case FireIncidentType.WILDLAND_FIRE:
        return <Tree className="w-4 h-4" />;
      case FireIncidentType.GRASS_FIRE:
        return <Tree className="w-4 h-4" />;
      case FireIncidentType.ELECTRICAL_FIRE:
        return <Zap className="w-4 h-4" />;
      case FireIncidentType.CHEMICAL_FIRE:
        return <Droplets className="w-4 h-4" />;
      case FireIncidentType.EXPLOSION:
        return <Bomb className="w-4 h-4" />;
      case FireIncidentType.GAS_LEAK:
        return <GasPump className="w-4 h-4" />;
      case FireIncidentType.HAZMAT:
        return <Biohazard className="w-4 h-4" />;
      case FireIncidentType.RESCUE:
        return <LifeBuoy className="w-4 h-4" />;
      case FireIncidentType.FALSE_ALARM:
        return <Bell className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getIncidentTypeLabel = (type: FireIncidentType) => {
    switch (type) {
      case FireIncidentType.STRUCTURE_FIRE:
        return 'Пожар в здании';
      case FireIncidentType.VEHICLE_FIRE:
        return 'Пожар ТС';
      case FireIncidentType.WILDLAND_FIRE:
        return 'Лесной пожар';
      case FireIncidentType.GRASS_FIRE:
        return 'Пожар травы';
      case FireIncidentType.ELECTRICAL_FIRE:
        return 'Электрический пожар';
      case FireIncidentType.CHEMICAL_FIRE:
        return 'Химический пожар';
      case FireIncidentType.EXPLOSION:
        return 'Взрыв';
      case FireIncidentType.GAS_LEAK:
        return 'Утечка газа';
      case FireIncidentType.HAZMAT:
        return 'Опасные материалы';
      case FireIncidentType.RESCUE:
        return 'Спасательная операция';
      case FireIncidentType.FALSE_ALARM:
        return 'Ложная тревога';
      default:
        return 'Другое';
    }
  };

  const getStatusIcon = (status: FireIncidentStatus) => {
    switch (status) {
      case FireIncidentStatus.REPORTED:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case FireIncidentStatus.DISPATCHED:
      case FireIncidentStatus.EN_ROUTE:
        return <Truck className="w-4 h-4 text-blue-500" />;
      case FireIncidentStatus.ON_SCENE:
      case FireIncidentStatus.IN_PROGRESS:
        return <Flame className="w-4 h-4 text-orange-500" />;
      case FireIncidentStatus.UNDER_CONTROL:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case FireIncidentStatus.EXTINGUISHED:
      case FireIncidentStatus.CLEANUP:
      case FireIncidentStatus.CLOSED:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case FireIncidentStatus.CANCELLED:
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: FireIncidentStatus) => {
    switch (status) {
      case FireIncidentStatus.REPORTED:
        return 'Заявлен';
      case FireIncidentStatus.DISPATCHED:
        return 'Отправлен';
      case FireIncidentStatus.EN_ROUTE:
        return 'В пути';
      case FireIncidentStatus.ON_SCENE:
        return 'На месте';
      case FireIncidentStatus.IN_PROGRESS:
        return 'В работе';
      case FireIncidentStatus.UNDER_CONTROL:
        return 'Под контролем';
      case FireIncidentStatus.EXTINGUISHED:
        return 'Потух';
      case FireIncidentStatus.CLEANUP:
        return 'Уборка';
      case FireIncidentStatus.CLOSED:
        return 'Закрыт';
      case FireIncidentStatus.CANCELLED:
        return 'Отменен';
      default:
        return 'Неизвестно';
    }
  };

  const getPriorityColor = (priority: FireIncidentPriority) => {
    switch (priority) {
      case FireIncidentPriority.LOW:
        return 'bg-green-100 text-green-800 border-green-200';
      case FireIncidentPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case FireIncidentPriority.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case FireIncidentPriority.CRITICAL:
        return 'bg-red-100 text-red-800 border-red-200';
      case FireIncidentPriority.EMERGENCY:
        return 'bg-red-200 text-red-900 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: FireIncidentSeverity) => {
    switch (severity) {
      case FireIncidentSeverity.MINOR:
        return 'bg-green-100 text-green-800 border-green-200';
      case FireIncidentSeverity.MODERATE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case FireIncidentSeverity.SERIOUS:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case FireIncidentSeverity.SEVERE:
        return 'bg-red-100 text-red-800 border-red-200';
      case FireIncidentSeverity.CATASTROPHIC:
        return 'bg-red-200 text-red-900 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: FireIncidentCategory) => {
    switch (category) {
      case FireIncidentCategory.RESIDENTIAL:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case FireIncidentCategory.COMMERCIAL:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case FireIncidentCategory.INDUSTRIAL:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case FireIncidentCategory.VEHICLE:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case FireIncidentCategory.WILDLAND:
        return 'bg-green-100 text-green-800 border-green-200';
      case FireIncidentCategory.ELECTRICAL:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case FireIncidentCategory.CHEMICAL:
        return 'bg-red-100 text-red-800 border-red-200';
      case FireIncidentCategory.EXPLOSIVE:
        return 'bg-red-200 text-red-900 border-red-300';
      case FireIncidentCategory.GAS:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryLabel = (category: FireIncidentCategory) => {
    switch (category) {
      case FireIncidentCategory.RESIDENTIAL:
        return 'Жилой дом';
      case FireIncidentCategory.COMMERCIAL:
        return 'Коммерческое здание';
      case FireIncidentCategory.INDUSTRIAL:
        return 'Промышленное здание';
      case FireIncidentCategory.VEHICLE:
        return 'Транспортное средство';
      case FireIncidentCategory.WILDLAND:
        return 'Дикая природа';
      case FireIncidentCategory.ELECTRICAL:
        return 'Электрическое оборудование';
      case FireIncidentCategory.CHEMICAL:
        return 'Химические вещества';
      case FireIncidentCategory.EXPLOSIVE:
        return 'Взрывчатые вещества';
      case FireIncidentCategory.GAS:
        return 'Газ';
      default:
        return 'Другое';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const incidentDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - incidentDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} мин назад`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ч назад`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} дн назад`;
    }
  };

  const getUnitsCount = () => {
    return incident.units.length;
  };

  const getCiviliansCount = () => {
    return incident.civilians.length;
  };

  const getEvacuatedCount = () => {
    return incident.civilians.filter(c => c.evacuated).length;
  };

  const getWeatherIcon = (condition?: WeatherCondition) => {
    if (!condition) return null;
    
    switch (condition) {
      case WeatherCondition.CLEAR:
        return <Thermometer className="w-4 h-4 text-yellow-500" />;
      case WeatherCondition.CLOUDY:
        return <Thermometer className="w-4 h-4 text-gray-500" />;
      case WeatherCondition.RAIN:
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case WeatherCondition.SNOW:
        return <Droplets className="w-4 h-4 text-blue-300" />;
      case WeatherCondition.FOG:
        return <Thermometer className="w-4 h-4 text-gray-400" />;
      case WeatherCondition.WINDY:
        return <Wind className="w-4 h-4 text-gray-600" />;
      case WeatherCondition.STORM:
        return <Wind className="w-4 h-4 text-red-500" />;
      default:
        return <Thermometer className="w-4 h-4 text-gray-500" />;
    }
  };

  if (variant === 'compact') {
    return (
      <Card className={`hover:shadow-md transition-shadow cursor-pointer ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-red-100 text-red-600">
                  {getIncidentTypeIcon(incident.type)}
                </AvatarFallback>
              </Avatar>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium truncate">
                    №{incident.incidentNumber}
                  </h3>
                  {getStatusIcon(incident.status)}
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {incident.location.address}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={getPriorityColor(incident.priority)}>
                {incident.priority === FireIncidentPriority.LOW ? 'Низкий' :
                 incident.priority === FireIncidentPriority.MEDIUM ? 'Средний' :
                 incident.priority === FireIncidentPriority.HIGH ? 'Высокий' :
                 incident.priority === FireIncidentPriority.CRITICAL ? 'Критический' : 'Экстренный'}
              </Badge>
              
              {onView && (
                <Button variant="ghost" size="sm" onClick={() => onView(incident)}>
                  <Eye className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{getTimeAgo(incident.reportedAt)}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Truck className="w-3 h-3" />
                <span>{getUnitsCount()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{getCiviliansCount()}</span>
              </div>
              {incident.requiresEvacuation && (
                <div className="flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                  <span>{getEvacuatedCount()}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-red-100 text-red-600">
                {getIncidentTypeIcon(incident.type)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>№{incident.incidentNumber}</span>
                {getStatusIcon(incident.status)}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {getIncidentTypeLabel(incident.type)} • {getStatusLabel(incident.status)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(incident)}>
                <Edit className="w-4 h-4 mr-2" />
                Изменить
              </Button>
            )}
            {onView && (
              <Button variant="default" size="sm" onClick={() => onView(incident)}>
                <Eye className="w-4 h-4 mr-2" />
                Просмотр
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Описание */}
        <div>
          <p className="text-sm text-gray-700 line-clamp-2">
            {incident.description}
          </p>
        </div>

        {/* Локация */}
        <div className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">{incident.location.address}</p>
            <p className="text-gray-500">
              {incident.location.city}, {incident.location.state} {incident.location.zipCode}
            </p>
          </div>
        </div>

        {/* Бейджи */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={getPriorityColor(incident.priority)}>
            {incident.priority === FireIncidentPriority.LOW ? 'Низкий приоритет' :
             incident.priority === FireIncidentPriority.MEDIUM ? 'Средний приоритет' :
             incident.priority === FireIncidentPriority.HIGH ? 'Высокий приоритет' :
             incident.priority === FireIncidentPriority.CRITICAL ? 'Критический' : 'Экстренный'}
          </Badge>
          
          <Badge variant="outline" className={getSeverityColor(incident.severity)}>
            {incident.severity === FireIncidentSeverity.MINOR ? 'Незначительный' :
             incident.severity === FireIncidentSeverity.MODERATE ? 'Умеренный' :
             incident.severity === FireIncidentSeverity.SERIOUS ? 'Серьезный' :
             incident.severity === FireIncidentSeverity.SEVERE ? 'Тяжелый' : 'Катастрофический'}
          </Badge>
          
          <Badge variant="outline" className={getCategoryColor(incident.category)}>
            {getCategoryLabel(incident.category)}
          </Badge>
          
          {incident.isFalseAlarm && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
              Ложная тревога
            </Badge>
          )}
          
          {incident.requiresEvacuation && (
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
              Эвакуация
            </Badge>
          )}
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
              <Truck className="w-4 h-4" />
              <span>Подразделения</span>
            </div>
            <p className="text-lg font-semibold">{getUnitsCount()}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>Гражданские</span>
            </div>
            <p className="text-lg font-semibold">{getCiviliansCount()}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Время</span>
            </div>
            <p className="text-sm font-medium">{getTimeAgo(incident.reportedAt)}</p>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
          <div className="flex items-center space-x-4">
            {incident.reporter && (
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>Заявитель: {incident.reporter.name}</span>
              </div>
            )}
            
            {incident.weather && (
              <div className="flex items-center space-x-1">
                {getWeatherIcon(incident.weather.condition)}
                <span>
                  {incident.weather.temperature && `${incident.weather.temperature}°C`}
                  {incident.weather.windSpeed && `, ${incident.weather.windSpeed} км/ч`}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(incident.reportedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
