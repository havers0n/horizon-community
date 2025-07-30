import React from 'react';
import { Vehicle } from '../model/types';
import { Card, CardHeader, CardContent, CardTitle, Badge, Button } from '@/shared/ui/atoms';
import { Car, Calendar, MapPin, User, AlertTriangle, CheckCircle } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  onViewDetails?: (vehicle: Vehicle) => void;
  onEdit?: (vehicle: Vehicle) => void;
  variant?: 'default' | 'compact';
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onViewDetails,
  onEdit,
  variant = 'default'
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'destructive';
      case 'suspended': return 'warning';
      case 'revoked': return 'destructive';
      default: return 'secondary';
    }
  };

  const getInsuranceColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'destructive';
      case 'none': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Car className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-sm">{vehicle.plateNumber}</h3>
                <p className="text-xs text-gray-600">{vehicle.make} {vehicle.model}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusColor(vehicle.registrationStatus)} size="sm">
                {vehicle.registrationStatus}
              </Badge>
              {vehicle.stolen && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Car className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-lg">{vehicle.plateNumber}</CardTitle>
              <p className="text-sm text-gray-600">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {vehicle.stolen && (
              <Badge variant="destructive" size="sm">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Украдено
              </Badge>
            )}
            <Badge variant={getStatusColor(vehicle.registrationStatus)} size="sm">
              {vehicle.registrationStatus}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Основная информация */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Год: {vehicle.year}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>Цвет: {vehicle.color}</span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span>Тип: {vehicle.bodyType}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Пробег:</span>
            <span>{vehicle.mileage.toLocaleString()} км</span>
          </div>
        </div>

        {/* VIN и двигатель */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">VIN:</span>
              <p className="font-mono text-xs">{vehicle.vin}</p>
            </div>
            <div>
              <span className="text-gray-500">Двигатель:</span>
              <p>{vehicle.engineSize}</p>
            </div>
          </div>
        </div>

        {/* Статусы */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Страховка:</span>
            <Badge variant={getInsuranceColor(vehicle.insuranceStatus)} size="sm">
              {vehicle.insuranceStatus === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
              {vehicle.insuranceStatus}
            </Badge>
          </div>
          <div className="text-xs text-gray-500">
            Истекает: {formatDate(vehicle.registrationExpiry)}
          </div>
        </div>

        {/* Владелец */}
        <div className="border-t pt-3">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">{vehicle.owner.name}</p>
              <p className="text-xs text-gray-600">{vehicle.owner.phone}</p>
            </div>
          </div>
        </div>

        {/* Действия */}
        <div className="flex space-x-2 pt-2">
          {onViewDetails && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails(vehicle)}
              className="flex-1"
            >
              Подробности
            </Button>
          )}
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(vehicle)}
              className="flex-1"
            >
              Редактировать
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 
