// @ts-nocheck - TODO: Remove after major refactoring is complete
// Fire Incident Entity - UI Layer
// Компонент детального просмотра пожарного инцидента

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Avatar, AvatarFallback } from '@/shared/ui/atoms/Avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/atoms/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/atoms/Table';
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Flame, 
  MapPin, 
  Clock, 
  Users, 
  Truck,
  AlertTriangle,
  Phone,
  Calendar,
  Thermometer,
  Wind,
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
  CheckCircle,
  XCircle,
  Eye,
  FileText
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
} from '@/shared/types';

interface FireIncidentDetailsProps {
  incident: FireIncident;
  onBack?: () => void;
  onEdit?: (incident: FireIncident) => void;
  onExport?: (format: 'pdf' | 'json') => void;
  className?: string;
}

export const FireIncidentDetails: React.FC<FireIncidentDetailsProps> = ({
  incident,
  onBack,
  onEdit,
  onExport,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getIncidentTypeIcon = (type: FireIncidentType) => {
    switch (type) {
      case FireIncidentType.STRUCTURE_FIRE: return <Building className="w-4 h-4" />;
      case FireIncidentType.VEHICLE_FIRE: return <Car className="w-4 h-4" />;
      case FireIncidentType.WILDLAND_FIRE: return <Tree className="w-4 h-4" />;
      case FireIncidentType.ELECTRICAL_FIRE: return <Zap className="w-4 h-4" />;
      case FireIncidentType.CHEMICAL_FIRE: return <Droplets className="w-4 h-4" />;
      case FireIncidentType.EXPLOSION: return <Bomb className="w-4 h-4" />;
      case FireIncidentType.GAS_LEAK: return <GasPump className="w-4 h-4" />;
      case FireIncidentType.HAZMAT: return <Biohazard className="w-4 h-4" />;
      case FireIncidentType.RESCUE: return <LifeBuoy className="w-4 h-4" />;
      case FireIncidentType.FALSE_ALARM: return <Bell className="w-4 h-4" />;
      default: return <Flame className="w-4 h-4" />;
    }
  };

  const getIncidentTypeLabel = (type: FireIncidentType) => {
    switch (type) {
      case FireIncidentType.STRUCTURE_FIRE: return 'Пожар в здании';
      case FireIncidentType.VEHICLE_FIRE: return 'Пожар ТС';
      case FireIncidentType.WILDLAND_FIRE: return 'Лесной пожар';
      case FireIncidentType.GRASS_FIRE: return 'Пожар травы';
      case FireIncidentType.ELECTRICAL_FIRE: return 'Электрический пожар';
      case FireIncidentType.CHEMICAL_FIRE: return 'Химический пожар';
      case FireIncidentType.EXPLOSION: return 'Взрыв';
      case FireIncidentType.GAS_LEAK: return 'Утечка газа';
      case FireIncidentType.HAZMAT: return 'Опасные материалы';
      case FireIncidentType.RESCUE: return 'Спасательная операция';
      case FireIncidentType.FALSE_ALARM: return 'Ложная тревога';
      default: return 'Другое';
    }
  };

  const getStatusIcon = (status: FireIncidentStatus) => {
    switch (status) {
      case FireIncidentStatus.REPORTED: return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case FireIncidentStatus.DISPATCHED:
      case FireIncidentStatus.EN_ROUTE: return <Truck className="w-4 h-4 text-blue-500" />;
      case FireIncidentStatus.ON_SCENE:
      case FireIncidentStatus.IN_PROGRESS: return <Flame className="w-4 h-4 text-orange-500" />;
      case FireIncidentStatus.UNDER_CONTROL: return <CheckCircle className="w-4 h-4 text-green-500" />;
      case FireIncidentStatus.EXTINGUISHED:
      case FireIncidentStatus.CLEANUP:
      case FireIncidentStatus.CLOSED: return <CheckCircle className="w-4 h-4 text-green-600" />;
      case FireIncidentStatus.CANCELLED: return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: FireIncidentStatus) => {
    switch (status) {
      case FireIncidentStatus.REPORTED: return 'Заявлен';
      case FireIncidentStatus.DISPATCHED: return 'Отправлен';
      case FireIncidentStatus.EN_ROUTE: return 'В пути';
      case FireIncidentStatus.ON_SCENE: return 'На месте';
      case FireIncidentStatus.IN_PROGRESS: return 'В работе';
      case FireIncidentStatus.UNDER_CONTROL: return 'Под контролем';
      case FireIncidentStatus.EXTINGUISHED: return 'Потух';
      case FireIncidentStatus.CLEANUP: return 'Уборка';
      case FireIncidentStatus.CLOSED: return 'Закрыт';
      case FireIncidentStatus.CANCELLED: return 'Отменен';
      default: return 'Неизвестно';
    }
  };

  const getPriorityColor = (priority: FireIncidentPriority) => {
    switch (priority) {
      case FireIncidentPriority.LOW: return 'bg-green-100 text-green-800 border-green-200';
      case FireIncidentPriority.MEDIUM: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case FireIncidentPriority.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
      case FireIncidentPriority.CRITICAL: return 'bg-red-100 text-red-800 border-red-200';
      case FireIncidentPriority.EMERGENCY: return 'bg-red-200 text-red-900 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: FireIncidentSeverity) => {
    switch (severity) {
      case FireIncidentSeverity.MINOR: return 'bg-green-100 text-green-800 border-green-200';
      case FireIncidentSeverity.MODERATE: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case FireIncidentSeverity.SERIOUS: return 'bg-orange-100 text-orange-800 border-orange-200';
      case FireIncidentSeverity.SEVERE: return 'bg-red-100 text-red-800 border-red-200';
      case FireIncidentSeverity.CATASTROPHIC: return 'bg-red-200 text-red-900 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: FireIncidentCategory) => {
    switch (category) {
      case FireIncidentCategory.RESIDENTIAL: return 'bg-blue-100 text-blue-800 border-blue-200';
      case FireIncidentCategory.COMMERCIAL: return 'bg-purple-100 text-purple-800 border-purple-200';
      case FireIncidentCategory.INDUSTRIAL: return 'bg-gray-100 text-gray-800 border-gray-200';
      case FireIncidentCategory.VEHICLE: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case FireIncidentCategory.WILDLAND: return 'bg-green-100 text-green-800 border-green-200';
      case FireIncidentCategory.ELECTRICAL: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case FireIncidentCategory.CHEMICAL: return 'bg-red-100 text-red-800 border-red-200';
      case FireIncidentCategory.EXPLOSIVE: return 'bg-red-200 text-red-900 border-red-300';
      case FireIncidentCategory.GAS: return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryLabel = (category: FireIncidentCategory) => {
    switch (category) {
      case FireIncidentCategory.RESIDENTIAL: return 'Жилой дом';
      case FireIncidentCategory.COMMERCIAL: return 'Коммерческое здание';
      case FireIncidentCategory.INDUSTRIAL: return 'Промышленное здание';
      case FireIncidentCategory.VEHICLE: return 'Транспортное средство';
      case FireIncidentCategory.WILDLAND: return 'Дикая природа';
      case FireIncidentCategory.ELECTRICAL: return 'Электрическое оборудование';
      case FireIncidentCategory.CHEMICAL: return 'Химические вещества';
      case FireIncidentCategory.EXPLOSIVE: return 'Взрывчатые вещества';
      case FireIncidentCategory.GAS: return 'Газ';
      default: return 'Другое';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const incidentDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - incidentDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ч назад`;
    return `${Math.floor(diffInMinutes / 1440)} дн назад`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          )}
          
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="text-lg font-semibold bg-red-100 text-red-600">
                {getIncidentTypeIcon(incident.type)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-2xl font-bold flex items-center space-x-2">
                <span>№{incident.incidentNumber}</span>
                {getStatusIcon(incident.status)}
              </h1>
              <p className="text-gray-500">
                {getIncidentTypeLabel(incident.type)} • {getTimeAgo(incident.reportedAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant={incident.isActive ? 'default' : 'secondary'}>
            {incident.isActive ? 'Активен' : 'Неактивен'}
          </Badge>
          
          {incident.isFalseAlarm && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              Ложная тревога
            </Badge>
          )}
          
          {incident.requiresEvacuation && (
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              Эвакуация
            </Badge>
          )}
          
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(incident)}>
              <Edit className="w-4 h-4 mr-2" />
              Изменить
            </Button>
          )}
          
          {onExport && (
            <Button variant="outline" size="sm" onClick={() => onExport('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              Экспорт
            </Button>
          )}
        </div>
      </div>

      {/* Вкладки */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="units">Подразделения</TabsTrigger>
          <TabsTrigger value="civilians">Гражданские</TabsTrigger>
          <TabsTrigger value="damages">Повреждения</TabsTrigger>
          <TabsTrigger value="timeline">Временная линия</TabsTrigger>
          <TabsTrigger value="weather">Погода</TabsTrigger>
        </TabsList>

        {/* Обзор */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Основная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Flame className="w-5 h-5" />
                  <span>Основная информация</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Тип инцидента</label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getIncidentTypeIcon(incident.type)}
                      <span className="text-sm">{getIncidentTypeLabel(incident.type)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Статус</label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(incident.status)}
                      <span className="text-sm">{getStatusLabel(incident.status)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Приоритет</label>
                    <Badge variant="outline" className={`mt-1 ${getPriorityColor(incident.priority)}`}>
                      {incident.priority === FireIncidentPriority.LOW ? 'Низкий' :
                       incident.priority === FireIncidentPriority.MEDIUM ? 'Средний' :
                       incident.priority === FireIncidentPriority.HIGH ? 'Высокий' :
                       incident.priority === FireIncidentPriority.CRITICAL ? 'Критический' : 'Экстренный'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Серьезность</label>
                    <Badge variant="outline" className={`mt-1 ${getSeverityColor(incident.severity)}`}>
                      {incident.severity === FireIncidentSeverity.MINOR ? 'Незначительный' :
                       incident.severity === FireIncidentSeverity.MODERATE ? 'Умеренный' :
                       incident.severity === FireIncidentSeverity.SERIOUS ? 'Серьезный' :
                       incident.severity === FireIncidentSeverity.SEVERE ? 'Тяжелый' : 'Катастрофический'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Категория</label>
                    <Badge variant="outline" className={`mt-1 ${getCategoryColor(incident.category)}`}>
                      {getCategoryLabel(incident.category)}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Время заявления</label>
                    <p className="text-sm mt-1">{formatDate(incident.reportedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Локация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Локация</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Адрес</label>
                  <p className="text-sm mt-1">{incident.location.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Город</label>
                  <p className="text-sm mt-1">{incident.location.city}, {incident.location.state} {incident.location.zipCode}</p>
                </div>
                {incident.location.buildingType && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Тип здания</label>
                    <p className="text-sm mt-1">{incident.location.buildingType}</p>
                  </div>
                )}
                {incident.location.buildingHeight && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Высота здания</label>
                    <p className="text-sm mt-1">{incident.location.buildingHeight} этажей</p>
                  </div>
                )}
                {incident.location.crossStreets && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Пересекающиеся улицы</label>
                    <p className="text-sm mt-1">{incident.location.crossStreets}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Описание */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Описание</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{incident.description}</p>
                {incident.notes && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-500">Заметки</label>
                    <p className="text-sm mt-1">{incident.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Заявитель */}
            {incident.reporter && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="w-5 h-5" />
                    <span>Заявитель</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Имя</label>
                    <p className="text-sm">{incident.reporter.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Телефон</label>
                    <p className="text-sm">{incident.reporter.phone}</p>
                  </div>
                  {incident.reporter.relationship && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Отношение к месту</label>
                      <p className="text-sm">{incident.reporter.relationship}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Свидетель</label>
                    <Badge variant={incident.reporter.isWitness ? 'default' : 'secondary'}>
                      {incident.reporter.isWitness ? 'Да' : 'Нет'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Статистика */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Статистика</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                      <Truck className="w-4 h-4" />
                      <span>Подразделения</span>
                    </div>
                    <p className="text-lg font-semibold">{incident.units.length}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Гражданские</span>
                    </div>
                    <p className="text-lg font-semibold">{incident.civilians.length}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Эвакуированы</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {incident.civilians.filter(c => c.evacuated).length}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>Повреждения</span>
                    </div>
                    <p className="text-lg font-semibold">{incident.damages.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Подразделения */}
        <TabsContent value="units" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="w-5 h-5" />
                <span>Пожарные подразделения ({incident.units.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incident.units.length > 0 ? (
                <div className="space-y-4">
                  {incident.units.map((unit) => (
                    <Card key={unit.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {unit.type === FireUnitType.ENGINE ? 'Пожарная машина' :
                               unit.type === FireUnitType.LADDER ? 'Лестница' :
                               unit.type === FireUnitType.RESCUE ? 'Спасательная машина' :
                               unit.type === FireUnitType.HAZMAT ? 'Опасные материалы' :
                               unit.type === FireUnitType.WATER_TENDER ? 'Водовоз' :
                               unit.type === FireUnitType.COMMAND ? 'Командная машина' :
                               unit.type === FireUnitType.MEDICAL ? 'Медицинская машина' :
                               unit.type === FireUnitType.AIR_SUPPORT ? 'Воздушная поддержка' : 'Другое'}
                            </Badge>
                            <span className="text-sm font-medium">№{unit.unitNumber}</span>
                          </div>
                          <Badge variant={unit.status === 'on_scene' ? 'default' : 'secondary'}>
                            {unit.status === 'available' ? 'Доступен' :
                             unit.status === 'dispatched' ? 'Отправлен' :
                             unit.status === 'en_route' ? 'В пути' :
                             unit.status === 'on_scene' ? 'На месте' :
                             unit.status === 'in_progress' ? 'В работе' :
                             unit.status === 'returning' ? 'Возвращается' :
                             unit.status === 'out_of_service' ? 'Вне службы' : 'Техобслуживание'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {unit.personnel.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Личный состав</label>
                            <div className="space-y-1 mt-1">
                              {unit.personnel.map((person) => (
                                <div key={person.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div>
                                    <span className="text-sm font-medium">{person.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">({person.rank})</span>
                                  </div>
                                  <Badge variant={person.isCommander ? 'default' : 'secondary'}>
                                    {person.isCommander ? 'Командир' : person.role}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {unit.equipment.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Оборудование</label>
                            <div className="space-y-1 mt-1">
                              {unit.equipment.map((equipment) => (
                                <div key={equipment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div>
                                    <span className="text-sm font-medium">{equipment.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">({equipment.type})</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm">x{equipment.quantity}</span>
                                    <Badge variant={equipment.isUsed ? 'default' : 'secondary'}>
                                      {equipment.isUsed ? 'Использовано' : 'Не использовано'}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {unit.notes && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Заметки</label>
                            <p className="text-sm mt-1">{unit.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Подразделения не назначены</h3>
                  <p className="text-gray-500">К этому инциденту не назначены пожарные подразделения</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Гражданские лица */}
        <TabsContent value="civilians" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Гражданские лица ({incident.civilians.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incident.civilians.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Имя</TableHead>
                      <TableHead>Возраст</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>Эвакуирован</TableHead>
                      <TableHead>Медпомощь</TableHead>
                      <TableHead>Травмы</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incident.civilians.map((civilian) => (
                      <TableRow key={civilian.id}>
                        <TableCell className="font-medium">{civilian.name}</TableCell>
                        <TableCell>{civilian.age || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {civilian.role === 'victim' ? 'Пострадавший' :
                             civilian.role === 'witness' ? 'Свидетель' :
                             civilian.role === 'evacuee' ? 'Эвакуированный' : 'Другое'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={civilian.evacuated ? 'default' : 'secondary'}>
                            {civilian.evacuated ? 'Да' : 'Нет'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={civilian.medicalAttention ? 'default' : 'secondary'}>
                            {civilian.medicalAttention ? 'Требуется' : 'Не требуется'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {civilian.injuries && civilian.injuries.length > 0 ? (
                            <div className="space-y-1">
                              {civilian.injuries.map((injury) => (
                                <Badge key={injury.id} variant="outline" className="text-xs">
                                  {injury.type} ({injury.severity})
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Гражданские лица отсутствуют</h3>
                  <p className="text-gray-500">К этому инциденту не привязаны гражданские лица</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Повреждения */}
        <TabsContent value="damages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Повреждения ({incident.damages.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incident.damages.length > 0 ? (
                <div className="space-y-4">
                  {incident.damages.map((damage) => (
                    <Card key={damage.id} className="border-l-4 border-l-red-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {damage.type === 'structural' ? 'Структурное' :
                               damage.type === 'electrical' ? 'Электрическое' :
                               damage.type === 'water' ? 'Водное' :
                               damage.type === 'smoke' ? 'Дымовое' : 'Другое'}
                            </Badge>
                            <span className="text-sm font-medium">{damage.location}</span>
                          </div>
                          <Badge variant="outline" className={
                            damage.severity === 'minor' ? 'bg-green-100 text-green-800' :
                            damage.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            damage.severity === 'severe' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {damage.severity === 'minor' ? 'Незначительное' :
                             damage.severity === 'moderate' ? 'Умеренное' :
                             damage.severity === 'severe' ? 'Тяжелое' : 'Полное'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Описание</label>
                          <p className="text-sm mt-1">{damage.description}</p>
                        </div>
                        {damage.estimatedCost && (
                          <div className="mt-3">
                            <label className="text-sm font-medium text-gray-500">Оценочная стоимость</label>
                            <p className="text-sm mt-1">${damage.estimatedCost.toLocaleString()}</p>
                          </div>
                        )}
                        {damage.notes && (
                          <div className="mt-3">
                            <label className="text-sm font-medium text-gray-500">Заметки</label>
                            <p className="text-sm mt-1">{damage.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Повреждения отсутствуют</h3>
                  <p className="text-gray-500">К этому инциденту не зарегистрированы повреждения</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Временная линия */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Временная линия</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Заявлен</p>
                    <p className="text-xs text-gray-500">{formatDate(incident.reportedAt)}</p>
                  </div>
                </div>
                
                {incident.dispatchedAt && (
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Отправлен</p>
                      <p className="text-xs text-gray-500">{formatDate(incident.dispatchedAt)}</p>
                    </div>
                  </div>
                )}
                
                {incident.arrivedAt && (
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Прибыл на место</p>
                      <p className="text-xs text-gray-500">{formatDate(incident.arrivedAt)}</p>
                    </div>
                  </div>
                )}
                
                {incident.underControlAt && (
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Взят под контроль</p>
                      <p className="text-xs text-gray-500">{formatDate(incident.underControlAt)}</p>
                    </div>
                  </div>
                )}
                
                {incident.extinguishedAt && (
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Потух</p>
                      <p className="text-xs text-gray-500">{formatDate(incident.extinguishedAt)}</p>
                    </div>
                  </div>
                )}
                
                {incident.closedAt && (
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Закрыт</p>
                      <p className="text-xs text-gray-500">{formatDate(incident.closedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Погода */}
        <TabsContent value="weather" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Thermometer className="w-5 h-5" />
                <span>Погодные условия</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incident.weather ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Погодное условие</label>
                      <div className="flex items-center space-x-2 mt-1">
                        {incident.weather.condition === WeatherCondition.CLEAR ? <Thermometer className="w-4 h-4 text-yellow-500" /> :
                         incident.weather.condition === WeatherCondition.CLOUDY ? <Thermometer className="w-4 h-4 text-gray-500" /> :
                         incident.weather.condition === WeatherCondition.RAIN ? <Droplets className="w-4 h-4 text-blue-500" /> :
                         incident.weather.condition === WeatherCondition.SNOW ? <Droplets className="w-4 h-4 text-blue-300" /> :
                         incident.weather.condition === WeatherCondition.FOG ? <Thermometer className="w-4 h-4 text-gray-400" /> :
                         incident.weather.condition === WeatherCondition.WINDY ? <Wind className="w-4 h-4 text-gray-600" /> :
                         incident.weather.condition === WeatherCondition.STORM ? <Wind className="w-4 h-4 text-red-500" /> :
                         <Thermometer className="w-4 h-4 text-gray-500" />}
                        <span className="text-sm">
                          {incident.weather.condition === WeatherCondition.CLEAR ? 'Ясно' :
                           incident.weather.condition === WeatherCondition.CLOUDY ? 'Облачно' :
                           incident.weather.condition === WeatherCondition.RAIN ? 'Дождь' :
                           incident.weather.condition === WeatherCondition.SNOW ? 'Снег' :
                           incident.weather.condition === WeatherCondition.FOG ? 'Туман' :
                           incident.weather.condition === WeatherCondition.WINDY ? 'Ветрено' :
                           incident.weather.condition === WeatherCondition.STORM ? 'Буря' : 'Другое'}
                        </span>
                      </div>
                    </div>
                    
                    {incident.weather.temperature && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Температура</label>
                        <p className="text-sm mt-1">{incident.weather.temperature}°C</p>
                      </div>
                    )}
                    
                    {incident.weather.humidity && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Влажность</label>
                        <p className="text-sm mt-1">{incident.weather.humidity}%</p>
                      </div>
                    )}
                    
                    {incident.weather.visibility && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Видимость</label>
                        <p className="text-sm mt-1">{incident.weather.visibility} км</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {incident.weather.windSpeed && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Скорость ветра</label>
                        <p className="text-sm mt-1">{incident.weather.windSpeed} км/ч</p>
                      </div>
                    )}
                    
                    {incident.weather.windDirection && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Направление ветра</label>
                        <p className="text-sm mt-1">
                          {incident.weather.windDirection === 'north' ? 'Север' :
                           incident.weather.windDirection === 'northeast' ? 'Северо-восток' :
                           incident.weather.windDirection === 'east' ? 'Восток' :
                           incident.weather.windDirection === 'southeast' ? 'Юго-восток' :
                           incident.weather.windDirection === 'south' ? 'Юг' :
                           incident.weather.windDirection === 'southwest' ? 'Юго-запад' :
                           incident.weather.windDirection === 'west' ? 'Запад' : 'Северо-запад'}
                        </p>
                      </div>
                    )}
                    
                    {incident.weather.pressure && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Давление</label>
                        <p className="text-sm mt-1">{incident.weather.pressure} мм рт.ст.</p>
                      </div>
                    )}
                    
                    {incident.weather.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Заметки</label>
                        <p className="text-sm mt-1">{incident.weather.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Thermometer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Погодные данные отсутствуют</h3>
                  <p className="text-gray-500">Информация о погодных условиях не зарегистрирована</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 
