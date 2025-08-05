import React, { useState } from 'react';
import { Button } from '../shared/ui/atoms/Button/Button';
import { Input } from '../shared/ui/atoms/Input/Input';
import { Card } from '../shared/ui/atoms/Card/Card';
import { Badge } from '../shared/ui/atoms/Badge/Badge';
import { Checkbox } from '../shared/ui/atoms/Checkbox/Checkbox';
import { Table } from '../shared/ui/atoms/Table/Table';
import { 
  Search, Plus, Trash2, Settings, User, Car, Building, 
  MapPin, Clock, AlertTriangle, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Filter, Download, Upload
} from 'lucide-react';

export const AdvancedPlayground: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const mockIncidents = [
    { id: 1, type: 'ДТП', location: 'ул. Ленина, 15', status: 'В работе', priority: 'Высокий', time: '2 мин назад' },
    { id: 2, type: 'Пожар', location: 'пр. Мира, 42', status: 'Завершен', priority: 'Критический', time: '15 мин назад' },
    { id: 3, type: 'Медицинская помощь', location: 'ул. Гагарина, 7', status: 'В ожидании', priority: 'Средний', time: '5 мин назад' },
  ];

  const mockUnits = [
    { id: 1, callSign: '1-ADAM-12', officer: 'Иван Иванов', status: 'В патруле', location: 'Центр города' },
    { id: 2, callSign: '2-BRAVO-15', officer: 'Петр Петров', status: 'На вызове', location: 'ул. Ленина' },
    { id: 3, callSign: '3-CHARLIE-8', officer: 'Анна Сидорова', status: 'В дежурке', location: 'Отделение' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'В работе':
      case 'В патруле':
        return 'default';
      case 'Завершен':
      case 'В дежурке':
        return 'secondary';
      case 'В ожидании':
        return 'outline';
      case 'На вызове':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Критический':
        return 'destructive';
      case 'Высокий':
        return 'default';
      case 'Средний':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Advanced Playground - Продвинутые эксперименты
          </h1>
          <p className="text-gray-600">
            Сложные интерфейсы и реальные сценарии использования
          </p>
        </div>

        {/* Навигационные табы */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
            {[
              { id: 'dashboard', label: 'Дашборд', icon: Settings },
              { id: 'incidents', label: 'Инциденты', icon: AlertTriangle },
              { id: 'units', label: 'Подразделения', icon: User },
              { id: 'analytics', label: 'Аналитика', icon: Download },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Контент табов */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Статистика */}
            <Card className="lg:col-span-2">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Статистика за сегодня</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-gray-600">Активных вызовов</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <div className="text-sm text-gray-600">Завершенных</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">15</div>
                    <div className="text-sm text-gray-600">Единиц техники</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">24</div>
                    <div className="text-sm text-gray-600">Сотрудников</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Быстрые действия */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Быстрые действия</h2>
                <div className="space-y-3">
                  <Button className="w-full" leftIcon={<Plus className="h-4 w-4" />}>
                    Новый вызов
                  </Button>
                  <Button variant="outline" className="w-full" leftIcon={<Upload className="h-4 w-4" />}>
                    Импорт данных
                  </Button>
                  <Button variant="outline" className="w-full" leftIcon={<Download className="h-4 w-4" />}>
                    Экспорт отчета
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'incidents' && (
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Инциденты</h2>
                <div className="flex gap-3">
                  <Input
                    placeholder="Поиск инцидентов..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="h-4 w-4" />}
                    className="w-64"
                  />
                  <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
                    Фильтры
                  </Button>
                  <Button leftIcon={<Plus className="h-4 w-4" />}>
                    Новый инцидент
                  </Button>
                </div>
              </div>

              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>ID</Table.Head>
                    <Table.Head>Тип</Table.Head>
                    <Table.Head>Местоположение</Table.Head>
                    <Table.Head>Статус</Table.Head>
                    <Table.Head>Приоритет</Table.Head>
                    <Table.Head>Время</Table.Head>
                    <Table.Head>Действия</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {mockIncidents.map((incident) => (
                    <Table.Row key={incident.id}>
                      <Table.Cell>#{incident.id}</Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          {incident.type}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {incident.location}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={getStatusColor(incident.status)}>
                          {incident.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={getPriorityColor(incident.priority)}>
                          {incident.priority}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {incident.time}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </Card>
        )}

        {activeTab === 'units' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Активные подразделения</h2>
                <div className="space-y-4">
                  {mockUnits.map((unit) => (
                    <div key={unit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{unit.callSign}</h3>
                          <p className="text-sm text-gray-500">{unit.officer}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusColor(unit.status)}>
                          {unit.status}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">{unit.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Карта подразделений</h2>
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <p>Интерактивная карта</p>
                    <p className="text-sm">Здесь будет отображаться карта с подразделениями</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Графики производительности</h2>
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Download className="h-12 w-12 mx-auto mb-2" />
                    <p>Графики и диаграммы</p>
                    <p className="text-sm">Здесь будут отображаться аналитические данные</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Экспорт данных</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Отчет по инцидентам</h3>
                      <p className="text-sm text-gray-500">PDF, Excel, CSV</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Статистика подразделений</h3>
                      <p className="text-sm text-gray-500">PDF, Excel, CSV</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Аналитика производительности</h3>
                      <p className="text-sm text-gray-500">PDF, Excel, CSV</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}; 