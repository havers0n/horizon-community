import React from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Unit } from '@/shared/types';
import { Users, Car, Shield, Truck, Radio } from 'lucide-react';

interface ActiveUnitsWidgetProps {
  units: Unit[];
  department?: string;
  onUnitClick: (unit: Unit) => void;
}

const getUnitIcon = (unitType?: string) => {
  switch (unitType) {
    case 'patrol':
      return <Car className="h-4 w-4" />;
    case 'medic':
      return <Shield className="h-4 w-4" />;
    case 'fire_truck':
      return <Truck className="h-4 w-4" />;
    case 'dispatch':
      return <Radio className="h-4 w-4" />;
    default:
      return <Users className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'busy':
      return 'bg-orange-100 text-orange-800';
    case 'enRoute':
      return 'bg-blue-100 text-blue-800';
    case 'onScene':
      return 'bg-purple-100 text-purple-800';
    case 'panic':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getDepartmentColor = (departmentId: number) => {
  switch (departmentId) {
    case 1: // LSPD
      return 'text-blue-600';
    case 2: // BCSO
      return 'text-green-600';
    case 3: // SAHP
      return 'text-yellow-600';
    case 4: // LSFD
      return 'text-red-600';
    case 5: // SAMS
      return 'text-purple-600';
    default:
      return 'text-gray-600';
  }
};

export const ActiveUnitsWidget: React.FC<ActiveUnitsWidgetProps> = ({
  units,
  department,
  onUnitClick
}) => {
  const filteredUnits = department 
    ? units.filter(unit => unit.department === department)
    : units;

  const statusCounts = filteredUnits.reduce((acc, unit) => {
    acc[unit.status] = (acc[unit.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {department ? `${department} - Активные юниты` : 'Активные юниты'}
          </h3>
          <Badge variant="secondary">{filteredUnits.length}</Badge>
        </div>
        
        {/* Статистика по статусам */}
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Доступны: {statusCounts.available || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>Заняты: {statusCounts.busy || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>В пути: {statusCounts.enRoute || 0}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {filteredUnits.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Нет активных юнитов</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onUnitClick(unit)}
              >
                <div className="flex items-center gap-2">
                  {getUnitIcon(unit.unitType)}
                  <div>
                    <div className="font-medium text-sm">
                      {unit.unitNumber || unit.name}
                    </div>
                    {unit.characterName && (
                      <div className="text-xs text-gray-500">
                        {unit.characterName}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getStatusColor(unit.status)}`}>
                    {unit.status}
                  </Badge>
                  {unit.isPanic && (
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      ПАНИКА
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}; 