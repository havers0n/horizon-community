import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Users, 
  Car, 
  Shield, 
  Phone, 
  Map, 
  AlertTriangle, 
  Radio, 
  FileText,
  Search,
  Plus,
  Settings,
  LogOut,
  Navigation,
  Clock,
  UserCheck,
  UserX,
  MapPin,
  MessageSquare,
  Bell,
  Zap
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface Character {
  id: number;
  firstName: string;
  lastName: string;
  type: 'civilian' | 'leo' | 'fire' | 'ems';
  isUnit: boolean;
  unitInfo?: any;
}

interface ActiveUnit {
  id: number;
  characterId: number;
  status: string;
  callsign: string;
  location: { x: number; y: number; z: number };
  isPanic: boolean;
  character: Character;
  department: any;
}

interface Call911 {
  id: number;
  location: string;
  description: string;
  status: 'pending' | 'active' | 'closed';
  type: 'police' | 'fire' | 'ems';
  priority: number;
  createdAt: string;
  callerInfo?: any;
  attachments?: any[];
}

interface Department {
  id: number;
  name: string;
  fullName: string;
  logoUrl?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  rank?: string;
}

const CAD: React.FC = () => {
  const { user } = useAuth() as { user: User | null };
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeUnits, setActiveUnits] = useState<ActiveUnit[]>([]);
  const [calls, setCalls] = useState<Call911[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  
  // Состояние для новых вызовов
  const [newCall, setNewCall] = useState({
    location: '',
    description: '',
    type: 'police' as 'police' | 'fire' | 'ems',
    priority: 3,
    callerInfo: {
      name: '',
      phone: ''
    }
  });

  // Состояние для поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'character' | 'vehicle' | 'weapon'>('character');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    loadInitialData();
    connectWebSocket();

    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [user]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Загружаем департаменты
      const deptResponse = await fetch('/api/departments');
      const deptData = await deptResponse.json();
      setDepartments(deptData);

      // Загружаем персонажей пользователя
      const charactersResponse = await fetch('/api/cad/characters', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (charactersResponse.ok) {
        const charactersData = await charactersResponse.json();
        setCharacters(charactersData);
      }

      // Загружаем активные юниты
      const unitsResponse = await fetch('/api/cad/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (unitsResponse.ok) {
        const unitsData = await unitsResponse.json();
        setActiveUnits(unitsData);
      }

      // Загружаем вызовы 911
      const callsResponse = await fetch('/api/cad/calls', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (callsResponse.ok) {
        const callsData = await callsResponse.json();
        setCalls(callsData);
      }

    } catch (error) {
      console.error('Failed to load CAD data:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить данные CAD",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectWebSocket = () => {
    const ws = new WebSocket(`ws://${window.location.host}`);
    
    ws.onopen = () => {
      console.log('CAD WebSocket connected');
      
      // Аутентифицируемся
      ws.send(JSON.stringify({
        type: 'authenticate',
        data: {
          token: localStorage.getItem('token'),
          isDispatcher: user?.role === 'admin' || user?.role === 'supervisor'
        }
      }));

      // Подписываемся на каналы
      ws.send(JSON.stringify({
        type: 'subscribe',
        data: {
          channels: ['units', 'calls', 'alerts']
        }
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    ws.onerror = (error) => {
      console.error('CAD WebSocket error:', error);
      toast({
        title: "Ошибка соединения",
        description: "Потеряно соединение с сервером",
        variant: "destructive"
      });
    };

    ws.onclose = () => {
      console.log('CAD WebSocket disconnected');
    };

    setWsConnection(ws);
  };

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'unit_status_update':
        setActiveUnits(prev => prev.map(unit => 
          unit.id === message.data.unitId 
            ? { ...unit, status: message.data.status }
            : unit
        ));
        break;

      case 'unit_location_update':
        setActiveUnits(prev => prev.map(unit => 
          unit.id === message.data.unitId 
            ? { ...unit, location: message.data.location }
            : unit
        ));
        break;

      case 'new_call':
        setCalls(prev => [message.data, ...prev]);
        toast({
          title: "Новый вызов 911",
          description: message.data.description,
        });
        break;

      case 'panic_alert':
        toast({
          title: "ПАНИКА!",
          description: `Юнит ${message.data.unitId} активировал кнопку паники!`,
          variant: "destructive"
        });
        break;

      case 'bolo_alert':
        toast({
          title: "BOLO",
          description: `ТС ${message.data.vehiclePlate} в розыске`,
        });
        break;
    }
  };

  const handleCreateCall = async () => {
    try {
      const response = await fetch('/api/cad/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newCall)
      });

      if (response.ok) {
        const call = await response.json();
        setCalls(prev => [call, ...prev]);
        setNewCall({
          location: '',
          description: '',
          type: 'police',
          priority: 3,
          callerInfo: { name: '', phone: '' }
        });
        toast({
          title: "Вызов создан",
          description: "Новый вызов 911 успешно создан",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать вызов",
        variant: "destructive"
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      let response;
      switch (searchType) {
        case 'character':
          response = await fetch(`/api/cad/characters/search/${encodeURIComponent(searchQuery)}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          break;
        case 'vehicle':
          response = await fetch(`/api/cad/vehicles/plate/${encodeURIComponent(searchQuery.toUpperCase())}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          break;
        case 'weapon':
          response = await fetch(`/api/cad/weapons/serial/${encodeURIComponent(searchQuery.toUpperCase())}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          break;
      }

      if (response?.ok) {
        const data = await response.json();
        setSearchResults(Array.isArray(data) ? data : [data]);
      }
    } catch (error) {
      toast({
        title: "Ошибка поиска",
        description: "Не удалось выполнить поиск",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '10-8': return 'bg-green-500';
      case '10-7': return 'bg-red-500';
      case '10-6': return 'bg-yellow-500';
      case '10-5': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-blue-500';
      case 5: return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case '10-8': return 'Доступен';
      case '10-7': return 'Вне службы';
      case '10-6': return 'Занят';
      case '10-5': return 'На месте';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Загрузка CAD системы...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Radio className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">CAD System</h1>
              <Badge variant="outline" className="ml-2">
                {activeUnits.length} активных юнитов
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || undefined} />
                  <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">{user?.username}</p>
                  <p className="text-gray-500">{user?.rank || 'N/A'}</p>
                </div>
              </div>
              
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Настройки
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Map className="h-4 w-4" />
              <span>Диспетчерская</span>
            </TabsTrigger>
            <TabsTrigger value="units" className="flex items-center space-x-2">
              <Radio className="h-4 w-4" />
              <span>Юниты</span>
              {activeUnits.length > 0 && (
                <Badge variant="secondary">{activeUnits.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="calls" className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Вызовы</span>
              {calls.filter(call => call.status === 'pending').length > 0 && (
                <Badge variant="destructive">
                  {calls.filter(call => call.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Поиск</span>
            </TabsTrigger>
            <TabsTrigger value="characters" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Персонажи</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab - Диспетчерская */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Активные юниты */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Radio className="h-5 w-5" />
                    <span>Активные юниты</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeUnits.map(unit => (
                      <div key={unit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(unit.status)}`}></div>
                          <div>
                            <p className="font-medium">{unit.callsign}</p>
                            <p className="text-sm text-gray-500">
                              {unit.character.firstName} {unit.character.lastName}
                            </p>
                          </div>
                        </div>
                        {unit.isPanic && (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    ))}
                    {activeUnits.length === 0 && (
                      <p className="text-gray-500 text-center py-4">Нет активных юнитов</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Ожидающие вызовы */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="h-5 w-5" />
                    <span>Ожидающие вызовы</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {calls.filter(call => call.status === 'pending').map(call => (
                      <div key={call.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getPriorityColor(call.priority)}>
                            Приоритет {call.priority}
                          </Badge>
                          <Badge variant="outline">{call.type}</Badge>
                        </div>
                        <p className="font-medium">{call.location}</p>
                        <p className="text-sm text-gray-600">{call.description}</p>
                      </div>
                    ))}
                    {calls.filter(call => call.status === 'pending').length === 0 && (
                      <p className="text-gray-500 text-center py-4">Нет ожидающих вызовов</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Быстрые действия */}
              <Card>
                <CardHeader>
                  <CardTitle>Быстрые действия</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full" variant="outline" onClick={() => setActiveTab('calls')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Новый вызов 911
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => setActiveTab('search')}>
                      <Search className="h-4 w-4 mr-2" />
                      Поиск по базе
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => setActiveTab('units')}>
                      <Radio className="h-4 w-4 mr-2" />
                      Управление юнитами
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Units Tab - Юниты */}
          <TabsContent value="units" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Активные юниты</h2>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Все на смену
                </Button>
                <Button variant="outline">
                  <UserX className="h-4 w-4 mr-2" />
                  Все со смены
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeUnits.map(unit => (
                <Card key={unit.id} className={unit.isPanic ? 'border-red-500 bg-red-50' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{unit.callsign}</span>
                      {unit.isPanic && (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Статус:</span>
                        <Badge className={getStatusColor(unit.status)}>
                          {getStatusLabel(unit.status)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Офицер:</p>
                        <p className="font-medium">
                          {unit.character.firstName} {unit.character.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Департамент:</p>
                        <p className="font-medium">{unit.department?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Координаты:</p>
                        <p className="font-mono text-sm">
                          X: {unit.location.x.toFixed(2)}, Y: {unit.location.y.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Связаться
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          На карте
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Calls Tab - Вызовы */}
          <TabsContent value="calls" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Вызовы 911</h2>
              <Button onClick={() => setActiveTab('dashboard')}>
                <Plus className="h-4 w-4 mr-2" />
                Новый вызов
              </Button>
            </div>
            
            {/* Форма создания вызова */}
            <Card>
              <CardHeader>
                <CardTitle>Создать новый вызов 911</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Местоположение *</Label>
                    <Input
                      id="location"
                      value={newCall.location}
                      onChange={(e) => setNewCall(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Адрес или координаты"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Тип вызова</Label>
                    <Select value={newCall.type} onValueChange={(value: any) => setNewCall(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="police">Полиция</SelectItem>
                        <SelectItem value="fire">Пожарная служба</SelectItem>
                        <SelectItem value="ems">Скорая помощь</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Приоритет</Label>
                    <Select value={newCall.priority.toString()} onValueChange={(value) => setNewCall(prev => ({ ...prev, priority: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Критический</SelectItem>
                        <SelectItem value="2">2 - Высокий</SelectItem>
                        <SelectItem value="3">3 - Средний</SelectItem>
                        <SelectItem value="4">4 - Низкий</SelectItem>
                        <SelectItem value="5">5 - Информационный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="callerName">Имя звонящего</Label>
                    <Input
                      id="callerName"
                      value={newCall.callerInfo.name}
                      onChange={(e) => setNewCall(prev => ({ 
                        ...prev, 
                        callerInfo: { ...prev.callerInfo, name: e.target.value }
                      }))}
                      placeholder="Имя звонящего"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Описание *</Label>
                    <Textarea
                      id="description"
                      value={newCall.description}
                      onChange={(e) => setNewCall(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Подробное описание происшествия"
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button onClick={handleCreateCall} disabled={!newCall.location || !newCall.description}>
                      <Phone className="h-4 w-4 mr-2" />
                      Создать вызов
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Список вызовов */}
            <div className="space-y-4">
              {calls.map(call => (
                <Card key={call.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Badge className={getPriorityColor(call.priority)}>
                          Приоритет {call.priority}
                        </Badge>
                        <Badge variant="outline">{call.type}</Badge>
                        <Badge variant={call.status === 'pending' ? 'destructive' : 'secondary'}>
                          {call.status === 'pending' ? 'Ожидает' : 
                           call.status === 'active' ? 'Активен' : 'Закрыт'}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(call.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Местоположение:</p>
                        <p className="font-medium">{call.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Описание:</p>
                        <p>{call.description}</p>
                      </div>
                      {call.callerInfo?.name && (
                        <div>
                          <p className="text-sm text-gray-500">Звонящий:</p>
                          <p>{call.callerInfo.name}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Search Tab - Поиск */}
          <TabsContent value="search" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Поиск по базе данных</h2>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Поиск</CardTitle>
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
                    <Button onClick={handleSearch}>
                      <Search className="h-4 w-4 mr-2" />
                      Найти
                    </Button>
                  </div>
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
                    {searchResults.map((result, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <pre className="text-sm overflow-auto">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Characters Tab - Персонажи */}
          <TabsContent value="characters" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Персонажи</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Создать персонажа
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map(character => (
                <Card key={character.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{character.firstName} {character.lastName}</span>
                      <Badge variant="outline">{character.type}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Тип:</p>
                        <p className="font-medium capitalize">{character.type}</p>
                      </div>
                      {character.isUnit && (
                        <div>
                          <p className="text-sm text-gray-500">Юнит:</p>
                          <p className="font-medium">Да</p>
                        </div>
                      )}
                      <Button variant="outline" size="sm" className="w-full">
                        Просмотреть детали
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CAD; 