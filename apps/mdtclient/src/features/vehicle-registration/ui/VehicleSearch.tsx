import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { Input } from '@/shared/ui/atoms/Input';
import { Button } from '@/shared/ui/atoms/Button';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Search, Car, User, Calendar } from 'lucide-react';

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  color: string;
  owner: string;
  registrationStatus: 'active' | 'expired' | 'suspended';
  insuranceStatus: 'active' | 'expired' | 'none';
  vin: string;
}

export const VehicleSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Vehicle[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Моковые данные для демонстрации
  const mockVehicles: Vehicle[] = [
    {
      id: '1',
      plate: 'ABC-123',
      model: 'BMW X5',
      color: 'Черный',
      owner: 'Иван Петров',
      registrationStatus: 'active',
      insuranceStatus: 'active',
      vin: 'WBA12345678901234'
    },
    {
      id: '2',
      plate: 'XYZ-789',
      model: 'Toyota Camry',
      color: 'Белый',
      owner: 'Мария Сидорова',
      registrationStatus: 'active',
      insuranceStatus: 'expired',
      vin: 'JTD12345678901234'
    },
    {
      id: '3',
      plate: 'DEF-456',
      model: 'Honda Civic',
      color: 'Красный',
      owner: 'Алексей Козлов',
      registrationStatus: 'suspended',
      insuranceStatus: 'none',
      vin: '1HGB1234567890123'
    }
  ];

  const handleSearch = () => {
    setIsSearching(true);
    // Имитация поиска
    setTimeout(() => {
      const filtered = mockVehicles.filter(vehicle =>
        vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.owner.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'expired': return 'bg-yellow-500';
      case 'suspended': return 'bg-red-500';
      case 'none': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Поисковая форма */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Поиск транспортных средств
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Введите номер, модель или владельца..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Поиск...' : 'Найти'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Результаты поиска */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Результаты поиска ({searchResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((vehicle) => (
                <div key={vehicle.id} className="border rounded-lg p-4 hover:bg-secondary-800/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Car className="h-6 w-6 text-blue-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{vehicle.plate}</h3>
                        <p className="text-sm text-secondary-400">{vehicle.model} • {vehicle.color}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getStatusColor(vehicle.registrationStatus)}>
                        Регистрация: {vehicle.registrationStatus}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(vehicle.insuranceStatus)}>
                        Страховка: {vehicle.insuranceStatus}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-secondary-400">Владелец:</span>
                      <p className="text-white font-medium">{vehicle.owner}</p>
                    </div>
                    <div>
                      <span className="text-secondary-400">VIN:</span>
                      <p className="text-white font-mono">{vehicle.vin}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Просмотр владельца
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      История
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Детали
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Сообщение об отсутствии результатов */}
      {searchQuery && searchResults.length === 0 && !isSearching && (
        <Card>
          <CardContent className="text-center py-8">
            <Car className="h-12 w-12 mx-auto mb-4 text-secondary-400" />
            <h3 className="text-lg font-semibold text-white mb-2">Транспортные средства не найдены</h3>
            <p className="text-secondary-400">Попробуйте изменить параметры поиска</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
