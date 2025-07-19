import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Search, 
  User, 
  Car, 
  Shield, 
  MapPin, 
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface Character {
  id: number;
  firstName: string;
  lastName: string;
  type: 'civilian' | 'leo' | 'fire' | 'ems';
  insuranceNumber: string;
  address: string;
  dob: string;
  licenses: Record<string, string>;
  medicalInfo: Record<string, any>;
  mugshotUrl?: string;
  isUnit: boolean;
  unitInfo?: any;
  records?: Record[];
}

interface Vehicle {
  id: number;
  plate: string;
  vin: string;
  model: string;
  color: string;
  registration: string;
  insurance: string;
  owner: Character;
}

interface Weapon {
  id: number;
  serialNumber: string;
  model: string;
  registration: string;
  owner: Character;
}

interface Record {
  id: number;
  type: 'arrest' | 'ticket' | 'warning';
  charges: string[];
  description: string;
  date: string;
  officer: Character;
}

const DatabaseSearch: React.FC = () => {
  const { toast } = useToast();
  const [searchType, setSearchType] = useState<'character' | 'vehicle' | 'weapon'>('character');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    characters: Character[];
    vehicles: Vehicle[];
    weapons: Weapon[];
  }>({
    characters: [],
    vehicles: [],
    weapons: []
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите поисковый запрос",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      setResults({ characters: [], vehicles: [], weapons: [] });

      let searchResults;

      switch (searchType) {
        case 'character':
          const characterResponse = await fetch(`/api/cad/characters/search/${encodeURIComponent(searchQuery)}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (characterResponse.ok) {
            const characters = await characterResponse.json();
            setResults(prev => ({ ...prev, characters }));
          }
          break;

        case 'vehicle':
          const vehicleResponse = await fetch(`/api/cad/vehicles/plate/${encodeURIComponent(searchQuery.toUpperCase())}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (vehicleResponse.ok) {
            const vehicle = await vehicleResponse.json();
            setResults(prev => ({ ...prev, vehicles: [vehicle] }));
          }
          break;

        case 'weapon':
          const weaponResponse = await fetch(`/api/cad/weapons/serial/${encodeURIComponent(searchQuery.toUpperCase())}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (weaponResponse.ok) {
            const weapon = await weaponResponse.json();
            setResults(prev => ({ ...prev, weapons: [weapon] }));
          }
          break;
      }

    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "Ошибка поиска",
        description: "Не удалось выполнить поиск",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'suspended':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCharacterTypeLabel = (type: string) => {
    switch (type) {
      case 'civilian': return 'Гражданский';
      case 'leo': return 'Полиция';
      case 'fire': return 'Пожарная служба';
      case 'ems': return 'Скорая помощь';
      default: return type;
    }
  };

  const getRecordTypeLabel = (type: string) => {
    switch (type) {
      case 'arrest': return 'Арест';
      case 'ticket': return 'Штраф';
      case 'warning': return 'Предупреждение';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Поиск по базе данных</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="searchType">Тип поиска</Label>
              <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="character">Персонажи</SelectItem>
                  <SelectItem value="vehicle">Транспортные средства</SelectItem>
                  <SelectItem value="weapon">Оружие</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="searchQuery">
                {searchType === 'character' && 'Имя, фамилия или номер страховки'}
                {searchType === 'vehicle' && 'Номер ТС'}
                {searchType === 'weapon' && 'Серийный номер'}
              </Label>
              <Input
                id="searchQuery"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  searchType === 'character' ? 'Иван Иванов или INS-2024-12345'
                  : searchType === 'vehicle' ? 'ABC123'
                  : 'WPN-12345'
                }
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? 'Поиск...' : 'Найти'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Результаты поиска */}
      <Tabs defaultValue="characters" className="space-y-4">
        <TabsList>
          <TabsTrigger value="characters" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Персонажи ({results.characters.length})</span>
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center space-x-2">
            <Car className="h-4 w-4" />
            <span>ТС ({results.vehicles.length})</span>
          </TabsTrigger>
          <TabsTrigger value="weapons" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Оружие ({results.weapons.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Результаты по персонажам */}
        <TabsContent value="characters" className="space-y-4">
          {results.characters.map(character => (
            <Card key={character.id}>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  {character.mugshotUrl && (
                    <img 
                      src={character.mugshotUrl} 
                      alt={`${character.firstName} ${character.lastName}`}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {character.firstName} {character.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {character.insuranceNumber}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {getCharacterTypeLabel(character.type)}
                        </Badge>
                        {character.isUnit && (
                          <Badge>Юнит</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Дата рождения:</p>
                        <p>{new Date(character.dob).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Адрес:</p>
                        <p>{character.address}</p>
                      </div>
                    </div>
                    
                    {/* Лицензии */}
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Лицензии:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(character.licenses).map(([type, status]) => (
                          <div key={type} className="flex items-center space-x-1">
                            {getStatusIcon(status)}
                            <span className="text-xs">
                              {type === 'driver' ? 'Водительские' :
                               type === 'weapon' ? 'Оружие' :
                               type === 'medical' ? 'Медицинская' :
                               type === 'pilot' ? 'Пилотная' : type}: {status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Медицинская информация */}
                    {character.medicalInfo?.bloodType && (
                      <div>
                        <p className="text-gray-500 text-sm">Группа крови: {character.medicalInfo.bloodType}</p>
                        {character.medicalInfo.allergies && (
                          <p className="text-gray-500 text-sm">Аллергии: {character.medicalInfo.allergies}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Записи */}
                    {character.records && character.records.length > 0 && (
                      <div>
                        <p className="text-gray-500 text-sm mb-2">Записи:</p>
                        <div className="space-y-2">
                          {character.records.map(record => (
                            <div key={record.id} className="p-2 bg-gray-50 rounded text-sm">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline">
                                  {getRecordTypeLabel(record.type)}
                                </Badge>
                                <span className="text-gray-500">
                                  {new Date(record.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-1">{record.description}</p>
                              {record.charges.length > 0 && (
                                <p className="text-xs text-gray-600 mt-1">
                                  Статьи: {record.charges.join(', ')}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {results.characters.length === 0 && searchQuery && !isLoading && (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Персонажи не найдены</p>
            </div>
          )}
        </TabsContent>

        {/* Результаты по ТС */}
        <TabsContent value="vehicles" className="space-y-4">
          {results.vehicles.map(vehicle => (
            <Card key={vehicle.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{vehicle.plate}</h3>
                      <p className="text-sm text-gray-500">VIN: {vehicle.vin}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={vehicle.registration === 'valid' ? 'default' : 'destructive'}>
                        {vehicle.registration === 'valid' ? 'Действительна' : 
                         vehicle.registration === 'expired' ? 'Истекла' : 'В розыске'}
                      </Badge>
                      <Badge variant={vehicle.insurance === 'valid' ? 'default' : 'destructive'}>
                        {vehicle.insurance === 'valid' ? 'Страховка' : 'Без страховки'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Модель:</p>
                      <p>{vehicle.model}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Цвет:</p>
                      <p>{vehicle.color}</p>
                    </div>
                  </div>
                  
                  {/* Владелец */}
                  <div className="border-t pt-4">
                    <p className="text-gray-500 text-sm mb-2">Владелец:</p>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{vehicle.owner.firstName} {vehicle.owner.lastName}</span>
                      <Badge variant="outline" className="text-xs">
                        {getCharacterTypeLabel(vehicle.owner.type)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {results.vehicles.length === 0 && searchQuery && !isLoading && (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Транспортные средства не найдены</p>
            </div>
          )}
        </TabsContent>

        {/* Результаты по оружию */}
        <TabsContent value="weapons" className="space-y-4">
          {results.weapons.map(weapon => (
            <Card key={weapon.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{weapon.serialNumber}</h3>
                      <p className="text-sm text-gray-500">Модель: {weapon.model}</p>
                    </div>
                    <Badge variant={weapon.registration === 'valid' ? 'default' : 'destructive'}>
                      {weapon.registration === 'valid' ? 'Зарегистрировано' : 'Не зарегистрировано'}
                    </Badge>
                  </div>
                  
                  {/* Владелец */}
                  <div className="border-t pt-4">
                    <p className="text-gray-500 text-sm mb-2">Владелец:</p>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{weapon.owner.firstName} {weapon.owner.lastName}</span>
                      <Badge variant="outline" className="text-xs">
                        {getCharacterTypeLabel(weapon.owner.type)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {results.weapons.length === 0 && searchQuery && !isLoading && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Оружие не найдено</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseSearch; 