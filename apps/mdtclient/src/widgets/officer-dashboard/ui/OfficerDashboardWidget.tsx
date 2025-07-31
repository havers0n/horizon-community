// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/atoms/Tabs';
import { 
  Shield, 
  Radio, 
  Car, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Phone, 
  User 
} from 'lucide-react';
import { useUnitManagementStore } from '@/features/unit-management/model/store';
import { useIncidentManagementStore } from '@/features/incident-management/model/store';
import { useBoloManagementStore } from '@/features/bolo-management/model/store';

const statusOptions = [
  { value: 'available', label: 'Доступен (10-8)', icon: Shield, color: 'bg-green-500' },
  { value: 'busy', label: 'Занят (10-12)', icon: Clock, color: 'bg-orange-500' },
  { value: 'enRoute', label: 'В пути (10-31)', icon: Car, color: 'bg-blue-500' },
  { value: 'onScene', label: 'На месте (10-97)', icon: MapPin, color: 'bg-purple-500' },
  { value: 'unavailable', label: 'Недоступен (10-7)', icon: User, color: 'bg-gray-500' },
  { value: 'panic', label: 'Паника (10-99)', icon: AlertTriangle, color: 'bg-red-500' }
];

const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      return 'text-red-400';
    case 'medium':
      return 'text-orange-400';
    case 'low':
      return 'text-green-400';
    default:
      return 'text-gray-400';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'emergency':
      return <AlertTriangle className="h-3 w-3 text-red-400" />;
    case 'traffic':
      return <Car className="h-3 w-3 text-blue-400" />;
    case 'medical':
      return <Shield className="h-3 w-3 text-green-400" />;
    case 'fire':
      return <AlertTriangle className="h-3 w-3 text-orange-400" />;
    default:
      return <Phone className="h-3 w-3 text-gray-400" />;
  }
};

export const OfficerDashboardWidget: React.FC = () => {
  // Используем Zustand сторы вместо DashboardContext
  const { units, updateUnitStatus } = useUnitManagementStore();
  const { incidents } = useIncidentManagementStore();
  const { bolos } = useBoloManagementStore();

  // Моковые данные для текущего офицера (в реальном приложении будут из API)
  const mockCurrentOfficer = units[0] || {
    id: '1',
    name: 'Джон Смит',
    callSign: '1-ADAM-12',
    department: 'LSPD Patrol Division',
    status: 'available',
    vehicle: 'Круизер LSPD #12',
    location: 'Центральный участок',
    lastUpdate: '14:35'
  };

  const [currentStatus, setCurrentStatus] = useState(mockCurrentOfficer.status);

  const getStatusInfo = (status: string) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  const currentStatusInfo = getStatusInfo(currentStatus);

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    // Обновляем статус в сторе
    updateUnitStatus(mockCurrentOfficer.id, newStatus as any);
  };

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Виджет статуса офицера */}
      <Card className="flex-shrink-0">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-medium text-white">Статус офицера</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Информация об офицере */}
          <div className="p-2 bg-blue-900/20 border border-blue-700/30 rounded text-xs">
            <div className="flex items-center gap-1 mb-1">
              <Radio className="h-3 w-3 text-blue-400" />
              <span className="font-medium text-white">{mockCurrentOfficer.callSign}</span>
            </div>
            <div className="text-secondary-300 space-y-0.5">
              <div>Офицер: <span className="text-white">{mockCurrentOfficer.name}</span></div>
              <div>Департамент: <span className="text-white">{mockCurrentOfficer.department}</span></div>
            </div>
          </div>

          {/* Текущий статус */}
          <div className="p-2 border border-secondary-700 rounded text-xs">
            <div className="flex items-center gap-1 mb-1">
              <div className={`w-2 h-2 rounded-full ${currentStatusInfo.color}`}></div>
              <span className="font-medium text-white">Текущий статус</span>
            </div>
            
            <div className="flex items-center gap-1 mb-1">
              <currentStatusInfo.icon className="h-3 w-3 text-secondary-400" />
              <span className="text-secondary-300">{currentStatusInfo.label}</span>
            </div>

            {mockCurrentOfficer.vehicle && (
              <div className="flex items-center gap-1 mb-1">
                <Car className="h-2.5 w-2.5 text-secondary-400" />
                <span className="text-secondary-300">{mockCurrentOfficer.vehicle}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5 text-secondary-400" />
              <span className="text-secondary-400">Обновлено: {mockCurrentOfficer.lastUpdate}</span>
            </div>
          </div>

          {/* Кнопки смены статуса */}
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-white mb-1">Изменить статус</h4>
            {statusOptions.map((status) => (
              <Button
                key={status.value}
                variant={currentStatus === status.value ? "default" : "outline"}
                size="sm"
                className="w-full justify-start h-7 text-xs"
                onClick={() => handleStatusChange(status.value)}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${status.color} mr-1.5`}></div>
                <status.icon className="h-2.5 w-2.5 mr-1.5" />
                {status.label}
              </Button>
            ))}
          </div>

          {/* Быстрые действия */}
          <div className="pt-1 border-t border-secondary-700">
            <h4 className="text-xs font-medium text-white mb-1">Быстрые действия</h4>
            <div className="space-y-1">
              <Button variant="outline" size="sm" className="w-full justify-start h-7 text-xs">
                <AlertTriangle className="h-2.5 w-2.5 mr-1.5" />
                Кнопка паники
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start h-7 text-xs">
                <Radio className="h-2.5 w-2.5 mr-1.5" />
                Отправить сигнал
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Лента событий (вызовы и BOLO) */}
      <Card className="flex-1 min-h-0">
        <CardHeader className="pb-2">
          <Tabs defaultValue="calls" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-7">
              <TabsTrigger value="calls" className="text-xs">
                <Phone className="h-2.5 w-2.5 mr-1" />
                Вызовы
                <Badge variant="secondary" className="ml-1 text-xs">
                  {incidents.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="bolos" className="text-xs">
                <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                BOLO
                <Badge variant="secondary" className="ml-1 text-xs">
                  {bolos.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calls" className="mt-2 h-full">
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-2 border border-secondary-700 rounded text-xs hover:bg-secondary-800/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-1">
                        {getTypeIcon(incident.type)}
                        <span className={`font-medium ${getPriorityColor(incident.priority)}`}>
                          {incident.type}
                        </span>
                      </div>
                      <span className="text-secondary-400 text-xs">{incident.timestamp}</span>
                    </div>
                    <div className="text-secondary-300 mb-1">{incident.location}</div>
                    <div className="text-secondary-400 text-xs line-clamp-2">
                      {incident.description}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bolos" className="mt-2 h-full">
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {bolos.map((bolo) => (
                  <div
                    key={bolo.id}
                    className="p-2 border border-secondary-700 rounded text-xs hover:bg-secondary-800/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-orange-400" />
                        <span className={`font-medium ${getPriorityColor(bolo.priority)}`}>
                          {bolo.type.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-secondary-400 text-xs">{bolo.timestamp}</span>
                    </div>
                    <div className="text-secondary-300 mb-1">{bolo.description}</div>
                    <div className="text-secondary-400 text-xs">
                      Причина: {bolo.reason}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
};
