import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Input } from '@/shared/ui/atoms/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/atoms/Select';
import { Unit, UnitStatus } from '@/shared/types';
import { DispatchApi } from '@/shared/api/dispatch';
import { 
  Users, 
  MapPin, 
  Clock, 
  Phone,
  Filter,
  Search,
  Radio,
  Shield,
  Car,
  Truck
} from 'lucide-react';

interface UnitListProps {
  units: Unit[];
  onUnitSelect: (unit: Unit) => void;
  onStatusChange: (unitId: string, status: UnitStatus) => void;
}

const getStatusColor = (status: UnitStatus) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'busy':
      return 'bg-orange-100 text-orange-800';
    case 'enRoute':
      return 'bg-blue-100 text-blue-800';
    case 'onScene':
      return 'bg-purple-100 text-purple-800';
    case 'unavailable':
      return 'bg-gray-100 text-gray-800';
    case 'panic':
      return 'bg-red-100 text-red-800';
    case 'transporting':
      return 'bg-indigo-100 text-indigo-800';
    case 'outOfService':
      return 'bg-red-100 text-red-800';
    case 'training':
      return 'bg-yellow-100 text-yellow-800';
    case 'dispatched':
      return 'bg-blue-100 text-blue-800';
    case 'cleared':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

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

const getDepartmentColor = (departmentId: string) => {
  switch (departmentId) {
    case '1': // LSPD
      return 'text-blue-600';
    case '2': // BCSO
      return 'text-green-600';
    case '3': // SAHP
      return 'text-yellow-600';
    case '4': // LSFD
      return 'text-red-600';
    case '5': // SAMS
      return 'text-purple-600';
    default:
      return 'text-gray-600';
  }
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const UnitList: React.FC<UnitListProps> = ({
  units,
  onUnitSelect,
  onStatusChange
}) => {
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>(units);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let filtered = [...units];

    // Фильтр по поиску
    if (searchQuery) {
      filtered = filtered.filter(unit => 
        unit.unitNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.characterName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(unit => unit.status === statusFilter);
    }

    // Фильтр по департаменту
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(unit => unit.departmentId === departmentFilter);
    }

    setFilteredUnits(filtered);
  }, [units, searchQuery, statusFilter, departmentFilter]);

  const handleUnitSelect = (unit: Unit) => {
    setSelectedUnit(unit);
    onUnitSelect(unit);
  };

  const handleStatusChange = async (unitId: string, newStatus: UnitStatus) => {
    try {
      setLoading(true);
      await DispatchApi.updateUnitStatus(unitId, newStatus);
      onStatusChange(unitId, newStatus);
    } catch (error) {
      console.error('Error updating unit status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusOptions = () => [
    { value: 'available', label: 'Доступен' },
    { value: 'busy', label: 'Занят' },
    { value: 'enRoute', label: 'В пути' },
    { value: 'onScene', label: 'На месте' },
    { value: 'unavailable', label: 'Недоступен' },
    { value: 'outOfService', label: 'Вне службы' },
    { value: 'training', label: 'Тренировка' }
  ];

  const getDepartmentOptions = () => [
    { value: '1', label: 'LSPD' },
    { value: '2', label: 'BCSO' },
    { value: '3', label: 'SAHP' },
    { value: '4', label: 'LSFD' },
    { value: '5', label: 'SAMS' }
  ];

  const statusCounts = units.reduce((acc, unit) => {
    acc[unit.status] = (acc[unit.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Активные юниты</h3>
          <Badge variant="secondary">{units.length} всего</Badge>
        </div>

        {/* Фильтры */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по номеру или имени..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                {getStatusOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label} ({statusCounts[option.value] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Департамент" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                {getDepartmentOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredUnits.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Нет юнитов, соответствующих фильтрам</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredUnits.map((unit) => (
              <Card 
                key={unit.id} 
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedUnit?.id === unit.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleUnitSelect(unit)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getUnitIcon(unit.unitType)}
                      <span className="font-medium">
                        {unit.unitNumber || unit.name}
                      </span>
                      <Badge className={getStatusColor(unit.status)}>
                        {unit.status}
                      </Badge>
                      <span className={`text-sm font-medium ${getDepartmentColor(unit.departmentId)}`}>
                        {unit.department}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {unit.characterName && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{unit.characterName}</span>
                        </div>
                      )}

                      {unit.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{unit.location}</span>
                        </div>
                      )}

                      {unit.lastUpdate && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            Обновлено: {formatTime(unit.lastUpdate)}
                          </span>
                        </div>
                      )}

                      {unit.isPanic && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-red-100 text-red-800">
                            ПАНИКА
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Select 
                      value={unit.status} 
                      onValueChange={(value) => handleStatusChange(unit.id, value as UnitStatus)}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getStatusOptions().map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Статистика */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-green-600">
              {statusCounts.available || 0}
            </div>
            <div className="text-gray-500">Доступны</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-orange-600">
              {statusCounts.busy || 0}
            </div>
            <div className="text-gray-500">Заняты</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-blue-600">
              {statusCounts.enRoute || 0}
            </div>
            <div className="text-gray-500">В пути</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 