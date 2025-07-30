import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Shield, Radio, Car, Clock, MapPin, AlertTriangle } from 'lucide-react';

interface OfficerStatus {
  id: string;
  name: string;
  badgeNumber: string;
  callsign: string;
  department: string;
  status: 'available' | 'busy' | 'responding' | 'on-scene' | 'unavailable';
  vehicle?: string;
  location?: string;
  lastUpdate: string;
}

// Моковые данные текущего офицера
const mockCurrentOfficer: OfficerStatus = {
  id: '1',
  name: 'Джон Смит',
  badgeNumber: '12345',
  callsign: '1-ADAM-12',
  department: 'LSPD Patrol Division',
  status: 'available',
  vehicle: 'Круизер LSPD #12',
  location: 'Центральный участок',
  lastUpdate: '14:35'
};

const statusOptions = [
  { value: 'available', label: 'Доступен (10-8)', color: 'bg-green-500', icon: Shield },
  { value: 'busy', label: 'Занят (10-12)', color: 'bg-yellow-500', icon: AlertTriangle },
  { value: 'responding', label: 'В пути (10-31)', color: 'bg-blue-500', icon: Car },
  { value: 'on-scene', label: 'На месте (10-97)', color: 'bg-orange-500', icon: MapPin },
  { value: 'unavailable', label: 'Недоступен (10-7)', color: 'bg-red-500', icon: Clock }
];

export const OfficerStatusPanel: React.FC = () => {
  const [currentStatus, setCurrentStatus] = useState(mockCurrentOfficer.status);

  const getStatusInfo = (status: string) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  const currentStatusInfo = getStatusInfo(currentStatus);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Статус офицера</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Информация об офицере */}
        <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">{mockCurrentOfficer.callsign}</span>
          </div>
          <div className="text-sm text-secondary-300 space-y-1">
            <div>Офицер: <span className="text-white">{mockCurrentOfficer.name}</span></div>
            <div>Жетон: <span className="text-white font-mono">{mockCurrentOfficer.badgeNumber}</span></div>
            <div>Департамент: <span className="text-white">{mockCurrentOfficer.department}</span></div>
          </div>
        </div>

        {/* Текущий статус */}
        <div className="p-3 border border-secondary-700 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-3 h-3 rounded-full ${currentStatusInfo.color}`}></div>
            <span className="text-sm font-medium text-white">Текущий статус</span>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <currentStatusInfo.icon className="h-4 w-4 text-secondary-400" />
            <span className="text-sm text-secondary-300">{currentStatusInfo.label}</span>
          </div>

          {mockCurrentOfficer.vehicle && (
            <div className="flex items-center gap-2 mb-2">
              <Car className="h-3 w-3 text-secondary-400" />
              <span className="text-xs text-secondary-300">{mockCurrentOfficer.vehicle}</span>
            </div>
          )}

          {mockCurrentOfficer.location && (
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-3 w-3 text-secondary-400" />
              <span className="text-xs text-secondary-300">{mockCurrentOfficer.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-secondary-400" />
            <span className="text-xs text-secondary-400">Обновлено: {mockCurrentOfficer.lastUpdate}</span>
          </div>
        </div>

        {/* Кнопки смены статуса */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white mb-2">Изменить статус</h4>
          {statusOptions.map((status) => (
            <Button
              key={status.value}
              variant={currentStatus === status.value ? "default" : "outline"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setCurrentStatus(status.value as any)}
            >
              <div className={`w-2 h-2 rounded-full ${status.color} mr-2`}></div>
              <status.icon className="h-3 w-3 mr-2" />
              {status.label}
            </Button>
          ))}
        </div>

        {/* Быстрые действия */}
        <div className="pt-2 border-t border-secondary-700">
          <h4 className="text-sm font-medium text-white mb-2">Быстрые действия</h4>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <AlertTriangle className="h-3 w-3 mr-2" />
              Кнопка паники
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Radio className="h-3 w-3 mr-2" />
              Отправить сигнал
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
