import React, { useState } from 'react';
import { Button } from '../shared/ui/atoms/Button/Button';
import { Input } from '../shared/ui/atoms/Input/Input';
import { Card } from '../shared/ui/atoms/Card/Card';
import { Badge } from '../shared/ui/atoms/Badge/Badge';
import { Checkbox } from '../shared/ui/atoms/Checkbox/Checkbox';
import { Table } from '../shared/ui/atoms/Table/Table';
import { Search, Plus, Trash2, Settings, User, Car, Building, Rocket } from 'lucide-react';

export const Playground: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [checkboxValue, setCheckboxValue] = useState(false);

  const mockTableData = [
    { id: 1, name: 'Иван Иванов', department: 'Полиция', status: 'Активен' },
    { id: 2, name: 'Петр Петров', department: 'EMS', status: 'В отпуске' },
    { id: 3, name: 'Анна Сидорова', department: 'Пожарная', status: 'Активен' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎨 Playground - Эксперименты с интерфейсами
          </h1>
          <p className="text-gray-600">
            Здесь вы можете экспериментировать с компонентами интерфейса MDT системы
          </p>
          
          {/* Ссылка на Advanced Playground */}
          <div className="mt-4">
            <Button 
              variant="outline" 
              leftIcon={<Rocket className="h-4 w-4" />}
              onClick={() => {
                // Здесь можно добавить навигацию к Advanced Playground
                console.log('Navigate to Advanced Playground');
              }}
            >
              🚀 Перейти к Advanced Playground
            </Button>
          </div>
        </div>

        {/* Секция кнопок */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Кнопки</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="outline">Outline</Button>
              </div>
              
              <div className="flex items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button leftIcon={<Plus className="h-4 w-4" />}>
                  Добавить
                </Button>
                <Button rightIcon={<Trash2 className="h-4 w-4" />}>
                  Удалить
                </Button>
                <Button leftIcon={<Search className="h-4 w-4" />}>
                  Поиск
                </Button>
                <Button isLoading>Загрузка...</Button>
                <Button disabled>Отключена</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Секция форм */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Формы</h2>
            <div className="space-y-4 max-w-md">
              <Input
                placeholder="Введите текст..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={checkboxValue}
                  onCheckedChange={setCheckboxValue}
                />
                <label className="text-sm text-gray-700">
                  Согласен с условиями
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Секция бейджей */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Бейджи</h2>
            <div className="flex flex-wrap gap-4">
              <Badge variant="default">По умолчанию</Badge>
              <Badge variant="secondary">Вторичный</Badge>
              <Badge variant="destructive">Ошибка</Badge>
              <Badge variant="outline">Контур</Badge>
            </div>
          </div>
        </Card>

        {/* Секция таблицы */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Таблица</h2>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>ID</Table.Head>
                  <Table.Head>Имя</Table.Head>
                  <Table.Head>Департамент</Table.Head>
                  <Table.Head>Статус</Table.Head>
                  <Table.Head>Действия</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {mockTableData.map((row) => (
                  <Table.Row key={row.id}>
                    <Table.Cell>{row.id}</Table.Cell>
                    <Table.Cell>{row.name}</Table.Cell>
                    <Table.Cell>{row.department}</Table.Cell>
                    <Table.Cell>
                      <Badge variant={row.status === 'Активен' ? 'default' : 'secondary'}>
                        {row.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <User className="h-4 w-4" />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </Card>

        {/* Секция экспериментов */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Эксперименты</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Карточка сотрудника */}
              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Иван Иванов</h3>
                    <p className="text-sm text-gray-500">Полиция</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="default">Активен</Badge>
                  <Badge variant="outline">Онлайн</Badge>
                </div>
              </Card>

              {/* Карточка транспорта */}
              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Car className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Ford Crown Victoria</h3>
                    <p className="text-sm text-gray-500">ABC-123</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="default">В патруле</Badge>
                </div>
              </Card>

              {/* Карточка здания */}
              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Building className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Главное отделение</h3>
                    <p className="text-sm text-gray-500">Центр города</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="default">Открыто</Badge>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        {/* Информационная панель */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">💡 Советы по использованию</h2>
            <ul className="space-y-1 text-sm opacity-90">
              <li>• Используйте разные варианты кнопок для разных действий</li>
              <li>• Комбинируйте иконки с текстом для лучшего UX</li>
              <li>• Экспериментируйте с цветами и размерами</li>
              <li>• Тестируйте адаптивность на разных экранах</li>
              <li>• Попробуйте Advanced Playground для сложных интерфейсов</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}; 