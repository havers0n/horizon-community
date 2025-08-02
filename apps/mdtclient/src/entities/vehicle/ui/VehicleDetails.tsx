// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useState } from 'react';
import type { Vehicle } from '@/shared/types';
import type { VehicleViolation, VehicleAccident, VehicleMaintenance } from '../model/types';
import { Card, CardHeader, CardContent, CardTitle, Badge, Button } from '@/shared/ui/atoms';
import { 
  Car, 
  Calendar, 
  MapPin, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Clock,
  DollarSign,
  Wrench,
  Shield,
  Gauge
} from 'lucide-react';

interface VehicleDetailsProps {
  vehicle: Vehicle;
  onEdit?: (vehicle: Vehicle) => void;
  onBack?: () => void;
}

type TabType = 'info' | 'violations' | 'accidents' | 'maintenance';

export const VehicleDetails: React.FC<VehicleDetailsProps> = ({
  vehicle,
  onEdit,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('info');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'destructive';
      case 'suspended': return 'warning';
      case 'revoked': return 'destructive';
      default: return 'secondary';
    }
  };

  const tabs = [
    { id: 'info', label: 'Основная информация', icon: Car },
    { id: 'violations', label: 'Нарушения', icon: AlertTriangle, count: vehicle.violations.length },
    { id: 'accidents', label: 'Аварии', icon: FileText, count: vehicle.accidents.length },
    { id: 'maintenance', label: 'Обслуживание', icon: Wrench, count: vehicle.maintenance.length }
  ];

  const renderViolationCard = (violation: VehicleViolation) => (
    <Card key={violation.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h4 className="font-semibold">{violation.type}</h4>
          </div>
          <Badge variant={violation.status === 'paid' ? 'success' : 'warning'}>
            {violation.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Дата:</span>
            <p>{formatDate(violation.date)}</p>
          </div>
          <div>
            <span className="text-gray-500">Место:</span>
            <p>{violation.location}</p>
          </div>
          <div>
            <span className="text-gray-500">Штраф:</span>
            <p className="font-medium">{formatCurrency(violation.fine)}</p>
          </div>
          <div>
            <span className="text-gray-500">Баллы:</span>
            <p>{violation.points}</p>
          </div>
        </div>
        
        <div className="mt-3">
          <span className="text-gray-500">Описание:</span>
          <p className="text-sm">{violation.description}</p>
        </div>
        
        <div className="mt-3 text-xs text-gray-600">
          Инспектор: {violation.officerName}
        </div>
      </CardContent>
    </Card>
  );

  const renderAccidentCard = (accident: VehicleAccident) => (
    <Card key={accident.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <h4 className="font-semibold">Авария</h4>
          </div>
          <Badge variant={accident.severity === 'fatal' ? 'destructive' : 'warning'}>
            {accident.severity}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Дата:</span>
            <p>{formatDate(accident.date)}</p>
          </div>
          <div>
            <span className="text-gray-500">Место:</span>
            <p>{accident.location}</p>
          </div>
          <div>
            <span className="text-gray-500">Ущерб:</span>
            <p>{accident.damage}</p>
          </div>
          <div>
            <span className="text-gray-500">Статус:</span>
            <p>{accident.status}</p>
          </div>
        </div>
        
        <div className="mt-3">
          <span className="text-gray-500">Описание:</span>
          <p className="text-sm">{accident.description}</p>
        </div>
        
        {accident.involvedParties.length > 0 && (
          <div className="mt-3">
            <span className="text-gray-500">Участники:</span>
            <p className="text-sm">{accident.involvedParties.join(', ')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderMaintenanceCard = (maintenance: VehicleMaintenance) => (
    <Card key={maintenance.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-green-500" />
            <h4 className="font-semibold">{maintenance.type}</h4>
          </div>
          <Badge variant={maintenance.status === 'completed' ? 'success' : 'warning'}>
            {maintenance.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Дата:</span>
            <p>{formatDate(maintenance.date)}</p>
          </div>
          <div>
            <span className="text-gray-500">Пробег:</span>
            <p>{maintenance.mileage.toLocaleString()} км</p>
          </div>
          <div>
            <span className="text-gray-500">Стоимость:</span>
            <p className="font-medium">{formatCurrency(maintenance.cost)}</p>
          </div>
          <div>
            <span className="text-gray-500">Сервис:</span>
            <p>{maintenance.garage}</p>
          </div>
        </div>
        
        <div className="mt-3">
          <span className="text-gray-500">Описание:</span>
          <p className="text-sm">{maintenance.description}</p>
        </div>
        
        {maintenance.nextServiceDate && (
          <div className="mt-3 text-sm">
            <span className="text-gray-500">Следующее обслуживание:</span>
            <p className="font-medium">{formatDate(maintenance.nextServiceDate)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              ← Назад
            </Button>
          )}
          <Car className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">{vehicle.plateNumber}</h1>
          {vehicle.stolen && (
            <Badge variant="destructive">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Украдено
            </Badge>
          )}
        </div>
        
        {onEdit && (
          <Button onClick={() => onEdit(vehicle)}>
            Редактировать
          </Button>
        )}
      </div>

      {/* Вкладки */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <Badge variant="secondary" size="sm">{tab.count}</Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Контент вкладок */}
      <div className="mt-6">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Основная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Car className="h-5 w-5" />
                  <span>Основная информация</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Марка</span>
                    <p className="font-medium">{vehicle.make}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Модель</span>
                    <p className="font-medium">{vehicle.model}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Год</span>
                    <p className="font-medium">{vehicle.year}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Цвет</span>
                    <p className="font-medium">{vehicle.color}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Тип кузова</span>
                    <p className="font-medium">{vehicle.bodyType}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Топливо</span>
                    <p className="font-medium">{vehicle.fuelType}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Коробка</span>
                    <p className="font-medium">{vehicle.transmission}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Двигатель</span>
                    <p className="font-medium">{vehicle.engineSize}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Gauge className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Пробег:</span>
                  <span className="font-medium">{vehicle.mileage.toLocaleString()} км</span>
                </div>
              </CardContent>
            </Card>

            {/* VIN и регистрация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Регистрация</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">VIN</span>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded">{vehicle.vin}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Статус регистрации</span>
                  <Badge variant={getStatusColor(vehicle.registrationStatus)}>
                    {vehicle.registrationStatus}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Истекает:</span>
                  <span className="font-medium">{formatDate(vehicle.registrationExpiry)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Страховка */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Страховка</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Статус</span>
                  <Badge variant={getStatusColor(vehicle.insuranceStatus)}>
                    {vehicle.insuranceStatus}
                  </Badge>
                </div>
                
                {vehicle.insuranceProvider && (
                  <div>
                    <span className="text-sm text-gray-500">Страховая компания</span>
                    <p className="font-medium">{vehicle.insuranceProvider}</p>
                  </div>
                )}
                
                {vehicle.insuranceExpiry && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Истекает:</span>
                    <span className="font-medium">{formatDate(vehicle.insuranceExpiry)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Владелец */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Владелец</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Имя</span>
                  <p className="font-medium">{vehicle.owner.name}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Телефон</span>
                  <p className="font-medium">{vehicle.owner.phone}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Адрес</span>
                  <p className="font-medium">{vehicle.owner.address}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'violations' && (
          <div>
            {vehicle.violations.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Нарушений не найдено
                </h3>
                <p className="text-gray-600">
                  У этого транспортного средства нет зарегистрированных нарушений
                </p>
              </div>
            ) : (
              vehicle.violations.map(renderViolationCard)
            )}
          </div>
        )}

        {activeTab === 'accidents' && (
          <div>
            {vehicle.accidents.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Аварий не найдено
                </h3>
                <p className="text-gray-600">
                  У этого транспортного средства нет зарегистрированных аварий
                </p>
              </div>
            ) : (
              vehicle.accidents.map(renderAccidentCard)
            )}
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div>
            {vehicle.maintenance.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Обслуживание не найдено
                </h3>
                <p className="text-gray-600">
                  У этого транспортного средства нет записей об обслуживании
                </p>
              </div>
            ) : (
              vehicle.maintenance.map(renderMaintenanceCard)
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 
