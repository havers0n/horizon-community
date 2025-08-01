// UI компонент для детального просмотра инцидента
// Поддерживает вкладки для разных аспектов инцидента

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Users, 
  Car, 
  Phone, 
  Calendar,
  FileText,
  Image,
  Video,
  Download,
  Edit,
  ArrowLeft,
  Shield,
  Activity,
  Cloud,
  Wind,
  Thermometer,
  Eye
} from 'lucide-react';

import { Button } from '@/shared/ui/atoms/Button';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';

import { 
  Incident, 
  IncidentType, 
  IncidentStatus, 
  IncidentPriority, 
  IncidentSeverity,
  IncidentCategory,
  CitizenRole,
  VehicleRole,
  UnitStatus
} from '../model';
import { UnitStatuses } from '@/shared/types';

export interface IncidentDetailsProps {
  incident: Incident;
  onBack?: () => void;
  onEdit?: (incident: Incident) => void;
  onExport?: (format: 'pdf' | 'json') => void;
  className?: string;
}

// Утилиты для отображения
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

const getTypeIcon = (type: IncidentType) => {
  const icons = {
    [IncidentType.CRIMINAL]: Shield,
    [IncidentType.TRAFFIC]: Car,
    [IncidentType.MEDICAL]: Activity,
    [IncidentType.FIRE]: AlertTriangle,
    [IncidentType.NATURAL_DISASTER]: Cloud,
    [IncidentType.PUBLIC_DISTURBANCE]: Users,
    [IncidentType.DOMESTIC]: Users,
    [IncidentType.ACCIDENT]: Car,
    [IncidentType.OTHER]: AlertTriangle,
  };
  return icons[type] || AlertTriangle;
};

const getRoleLabel = (role: CitizenRole) => {
  const labels = {
    [CitizenRole.VICTIM]: 'Потерпевший',
    [CitizenRole.SUSPECT]: 'Подозреваемый',
    [CitizenRole.WITNESS]: 'Свидетель',
    [CitizenRole.REPORTING_PARTY]: 'Заявитель',
    [CitizenRole.INVOLVED]: 'Участник',
    [CitizenRole.OTHER]: 'Другое',
  };
  return labels[role] || role;
};

const getVehicleRoleLabel = (role: VehicleRole) => {
  const labels = {
    [VehicleRole.INVOLVED]: 'Участвующее',
    [VehicleRole.SUSPECT_VEHICLE]: 'ТС подозреваемого',
    [VehicleRole.VICTIM_VEHICLE]: 'ТС потерпевшего',
    [VehicleRole.WITNESS_VEHICLE]: 'ТС свидетеля',
    [VehicleRole.EMERGENCY_VEHICLE]: 'Экстренное ТС',
    [VehicleRole.OTHER]: 'Другое',
  };
  return labels[role] || role;
};

const getUnitStatusLabel = (status: UnitStatus) => {
  const labels = {
    [UnitStatuses.DISPATCHED]: 'Отправлен',
    [UnitStatuses.EN_ROUTE]: 'В пути',
    [UnitStatuses.ON_SCENE]: 'На месте',
    [UnitStatuses.CLEARED]: 'Завершен',
    [UnitStatuses.UNAVAILABLE]: 'Недоступен',
  };
  return labels[status] || status;
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

// Вкладки
const TABS = [
  { id: 'overview', label: 'Обзор', icon: Eye },
  { id: 'units', label: 'Подразделения', icon: Users },
  { id: 'citizens', label: 'Участники', icon: Users },
  { id: 'vehicles', label: 'Транспорт', icon: Car },
  { id: 'media', label: 'Медиа', icon: Image },
  { id: 'notes', label: 'Заметки', icon: FileText },
  { id: 'weather', label: 'Погода', icon: Cloud },
];

export const IncidentDetails: React.FC<IncidentDetailsProps> = ({
  incident,
  onBack,
  onEdit,
  onExport,
  className,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const statusConfig = getStatusConfig(incident.status);
  const priorityConfig = getPriorityConfig(incident.priority);
  const TypeIcon = getTypeIcon(incident.type);

  const handleExport = (format: 'pdf' | 'json') => {
    onExport?.(format);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Основная информация */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TypeIcon className="w-5 h-5" />
            Основная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Номер инцидента</label>
              <p className="text-lg font-mono">#{incident.incidentNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Статус</label>
              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Приоритет</label>
              <Badge className={priorityConfig.color}>{priorityConfig.label}</Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Серьезность</label>
              <Badge variant="outline">{incident.severity}</Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Категория</label>
              <p className="text-sm">{incident.category}</p>
            </div>
            {incident.subcategory && (
              <div>
                <label className="text-sm font-medium text-gray-600">Подкатегория</label>
                <p className="text-sm">{incident.subcategory}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Описание */}
      <Card>
        <CardHeader>
          <CardTitle>Описание</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">{incident.title}</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{incident.description}</p>
        </CardContent>
      </Card>

      {/* Локация */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Локация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Адрес</label>
              <p className="text-sm">{incident.location.address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Город</label>
              <p className="text-sm">{incident.location.city}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Штат</label>
              <p className="text-sm">{incident.location.state}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Индекс</label>
              <p className="text-sm">{incident.location.zipCode}</p>
            </div>
          </div>
          {incident.location.coordinates && (
            <div>
              <label className="text-sm font-medium text-gray-600">Координаты</label>
              <p className="text-sm">
                {incident.location.coordinates.latitude}, {incident.location.coordinates.longitude}
              </p>
            </div>
          )}
          {incident.location.buildingInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incident.location.buildingInfo.name && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Здание</label>
                  <p className="text-sm">{incident.location.buildingInfo.name}</p>
                </div>
              )}
              {incident.location.buildingInfo.floor && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Этаж</label>
                  <p className="text-sm">{incident.location.buildingInfo.floor}</p>
                </div>
              )}
              {incident.location.buildingInfo.room && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Комната</label>
                  <p className="text-sm">{incident.location.buildingInfo.room}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Временная информация */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Временная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Заявлен</label>
              <p className="text-sm">{formatDate(incident.reportedAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Обновлен</label>
              <p className="text-sm">{formatDate(incident.updatedAt)}</p>
            </div>
            {incident.resolvedAt && (
              <div>
                <label className="text-sm font-medium text-gray-600">Решен</label>
                <p className="text-sm">{formatDate(incident.resolvedAt)}</p>
              </div>
            )}
            {incident.estimatedDuration && (
              <div>
                <label className="text-sm font-medium text-gray-600">Ожидаемая длительность</label>
                <p className="text-sm">{formatDuration(incident.estimatedDuration)}</p>
              </div>
            )}
            {incident.actualDuration && (
              <div>
                <label className="text-sm font-medium text-gray-600">Фактическая длительность</label>
                <p className="text-sm">{formatDuration(incident.actualDuration)}</p>
              </div>
            )}
            {incident.responseTime && (
              <div>
                <label className="text-sm font-medium text-gray-600">Время отклика</label>
                <p className="text-sm">{formatDuration(incident.responseTime)}</p>
              </div>
            )}
            {incident.resolutionTime && (
              <div>
                <label className="text-sm font-medium text-gray-600">Время решения</label>
                <p className="text-sm">{formatDuration(incident.resolutionTime)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Заявитель */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Заявитель
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Имя</label>
              <p className="text-sm">
                {incident.reporter.isAnonymous ? 'Анонимно' : incident.reporter.name}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Телефон</label>
              <p className="text-sm">{incident.reporter.phone}</p>
            </div>
            {incident.reporter.email && (
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-sm">{incident.reporter.email}</p>
              </div>
            )}
            {incident.reporter.relationshipToIncident && (
              <div>
                <label className="text-sm font-medium text-gray-600">Отношение к инциденту</label>
                <p className="text-sm">{incident.reporter.relationshipToIncident}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Теги */}
      {incident.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Теги</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {incident.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderUnits = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Подразделения ({incident.assignedUnits.length})</h3>
      </div>
      
      {incident.assignedUnits.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Подразделения не назначены</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {incident.assignedUnits.map((unit, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{unit.unitNumber}</h4>
                      <p className="text-sm text-gray-600">{unit.unitType} - {unit.department}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{getUnitStatusLabel(unit.status)}</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="text-gray-600">Назначен</label>
                    <p>{formatDate(unit.assignedAt)}</p>
                  </div>
                  {unit.arrivedAt && (
                    <div>
                      <label className="text-gray-600">Прибыл</label>
                      <p>{formatDate(unit.arrivedAt)}</p>
                    </div>
                  )}
                  {unit.leftAt && (
                    <div>
                      <label className="text-gray-600">Покинул</label>
                      <p>{formatDate(unit.leftAt)}</p>
                    </div>
                  )}
                </div>
                
                {unit.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <label className="text-sm text-gray-600">Заметки</label>
                    <p className="text-sm">{unit.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderCitizens = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Участники ({incident.involvedCitizens.length})</h3>
      </div>
      
      {incident.involvedCitizens.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Участники не указаны</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {incident.involvedCitizens.map((citizen, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">ID: {citizen.citizenId}</h4>
                      <p className="text-sm text-gray-600">{getRoleLabel(citizen.role)}</p>
                    </div>
                  </div>
                  {citizen.arrested && (
                    <Badge variant="destructive">Арестован</Badge>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Участие</label>
                    <p className="text-sm">{citizen.involvement}</p>
                  </div>
                  
                  {citizen.injuries && citizen.injuries.length > 0 && (
                    <div>
                      <label className="text-sm text-gray-600">Травмы</label>
                      <div className="space-y-2">
                        {citizen.injuries.map((injury, injuryIndex) => (
                          <div key={injuryIndex} className="text-sm p-2 bg-red-50 rounded">
                            <p><strong>{injury.type}</strong> - {injury.severity}</p>
                            <p className="text-gray-600">{injury.location}: {injury.description}</p>
                            {injury.hospital && <p className="text-gray-600">Госпиталь: {injury.hospital}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {citizen.charges && citizen.charges.length > 0 && (
                    <div>
                      <label className="text-sm text-gray-600">Обвинения</label>
                      <div className="flex flex-wrap gap-1">
                        {citizen.charges.map((charge, chargeIndex) => (
                          <Badge key={chargeIndex} variant="outline" className="text-xs">
                            {charge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {citizen.notes && (
                    <div>
                      <label className="text-sm text-gray-600">Заметки</label>
                      <p className="text-sm">{citizen.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderVehicles = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Транспортные средства ({incident.involvedVehicles.length})</h3>
      </div>
      
      {incident.involvedVehicles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Транспортные средства не указаны</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {incident.involvedVehicles.map((vehicle, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Car className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">ID: {vehicle.vehicleId}</h4>
                      <p className="text-sm text-gray-600">{getVehicleRoleLabel(vehicle.role)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {vehicle.towed && <Badge variant="destructive">Эвакуирован</Badge>}
                    {vehicle.impounded && <Badge variant="destructive">Конфискован</Badge>}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {vehicle.damage && vehicle.damage.length > 0 && (
                    <div>
                      <label className="text-sm text-gray-600">Повреждения</label>
                      <div className="space-y-2">
                        {vehicle.damage.map((damage, damageIndex) => (
                          <div key={damageIndex} className="text-sm p-2 bg-yellow-50 rounded">
                            <p><strong>{damage.area}</strong> - {damage.severity}</p>
                            <p className="text-gray-600">{damage.description}</p>
                            {damage.estimatedCost && (
                              <p className="text-gray-600">Стоимость: ${damage.estimatedCost}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {vehicle.notes && (
                    <div>
                      <label className="text-sm text-gray-600">Заметки</label>
                      <p className="text-sm">{vehicle.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderMedia = () => (
    <div className="space-y-6">
      {/* Фотографии */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Фотографии ({incident.photos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incident.photos.length === 0 ? (
            <p className="text-gray-600">Фотографии не загружены</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {incident.photos.map((photo, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Видео */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Видео ({incident.videos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incident.videos.length === 0 ? (
            <p className="text-gray-600">Видео не загружены</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incident.videos.map((video, index) => (
                <div key={index} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <Video className="w-8 h-8 text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Документы */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Документы ({incident.documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incident.documents.length === 0 ? (
            <p className="text-gray-600">Документы не загружены</p>
          ) : (
            <div className="space-y-2">
              {incident.documents.map((document, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">Документ {index + 1}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Заметки ({incident.notes.length})</h3>
      </div>
      
      {incident.notes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Заметки отсутствуют</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {incident.notes.map((note, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <p className="text-sm whitespace-pre-wrap">{note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderWeather = () => (
    <div className="space-y-6">
      {incident.weatherConditions ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              Погодные условия
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incident.weatherConditions.temperature && (
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Температура: {incident.weatherConditions.temperature}°C</span>
                </div>
              )}
              {incident.weatherConditions.humidity && (
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Влажность: {incident.weatherConditions.humidity}%</span>
                </div>
              )}
              {incident.weatherConditions.windSpeed && (
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Ветер: {incident.weatherConditions.windSpeed} км/ч</span>
                </div>
              )}
              {incident.weatherConditions.windDirection && (
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Направление: {incident.weatherConditions.windDirection}</span>
                </div>
              )}
              {incident.weatherConditions.precipitation && (
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Осадки: {incident.weatherConditions.precipitation}</span>
                </div>
              )}
              {incident.weatherConditions.visibility && (
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Видимость: {incident.weatherConditions.visibility} км</span>
                </div>
              )}
              <div className="md:col-span-2">
                <span className="text-sm font-medium">Условия: {incident.weatherConditions.conditions}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Погодные условия не указаны</p>
          </CardContent>
        </Card>
      )}

      {incident.trafficConditions && (
        <Card>
          <CardHeader>
            <CardTitle>Дорожные условия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Уровень трафика</label>
                <p className="text-sm">{incident.trafficConditions.trafficLevel}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Состояние дорог</label>
                <p className="text-sm">{incident.trafficConditions.roadConditions}</p>
              </div>
              {incident.trafficConditions.construction && (
                <Badge variant="outline">Строительные работы</Badge>
              )}
              {incident.trafficConditions.specialEvents && (
                <Badge variant="outline">Специальные события</Badge>
              )}
              {incident.trafficConditions.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Заметки</label>
                  <p className="text-sm">{incident.trafficConditions.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'units':
        return renderUnits();
      case 'citizens':
        return renderCitizens();
      case 'vehicles':
        return renderVehicles();
      case 'media':
        return renderMedia();
      case 'notes':
        return renderNotes();
      case 'weather':
        return renderWeather();
      default:
        return renderOverview();
    }
  };

  return (
    <div className={className}>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Инцидент #{incident.incidentNumber}
            </h1>
            <p className="text-gray-600">{incident.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onExport && (
            <div className="relative group">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Экспорт
              </Button>
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                  >
                    JSON
                  </button>
                </div>
              </div>
            </div>
          )}
          {onEdit && (
            <Button onClick={() => onEdit(incident)}>
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
          )}
        </div>
      </div>

      {/* Вкладки */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Содержимое вкладки */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
}; 
