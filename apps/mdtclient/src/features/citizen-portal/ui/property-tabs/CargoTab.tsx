import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/atoms';
import { Button } from '@/shared/ui/atoms';
import { Truck, Plus, Edit, Trash2, Search, Calendar, MapPin, Package, DollarSign } from 'lucide-react';
import { Character } from '@/shared/types';

interface CargoTabProps {
  character: Character;
}

interface CargoRecord {
  id: string;
  cargoType: string;
  weight: number;
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
  value: number;
  description: string;
  vehicleId: string;
  driverId: string;
  notes: string;
}

export const CargoTab: React.FC<CargoTabProps> = ({ character }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCargo, setEditingCargo] = useState<CargoRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Моковые данные для грузоперевозок
  const [cargoRecords, setCargoRecords] = useState<CargoRecord[]>([
    {
      id: '1',
      cargoType: 'Строительные материалы',
      weight: 2500,
      origin: 'Лос-Сантос, Склад №1',
      destination: 'Сан-Фиерро, Строительная площадка',
      departureDate: '2024-01-15',
      arrivalDate: '2024-01-16',
      status: 'delivered',
      value: 15000,
      description: 'Цемент, кирпичи, арматура для строительства жилого комплекса',
      vehicleId: 'TRUCK001',
      driverId: character.id,
      notes: 'Доставка выполнена в срок, получатель доволен качеством груза'
    },
    {
      id: '2',
      cargoType: 'Электроника',
      weight: 500,
      origin: 'Лас-Вентурас, Электронный магазин',
      destination: 'Лос-Сантос, Торговый центр',
      departureDate: '2024-01-20',
      arrivalDate: '2024-01-21',
      status: 'in-transit',
      value: 25000,
      description: 'Компьютеры, мониторы, периферийные устройства',
      vehicleId: 'VAN002',
      driverId: character.id,
      notes: 'Груз упакован в специальные контейнеры с защитой от повреждений'
    }
  ]);

  // Фильтруем грузоперевозки по поисковому запросу
  const filteredCargo = cargoRecords.filter(cargo =>
    cargo.cargoType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cargo.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cargo.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCargo = (data: Omit<CargoRecord, 'id'>) => {
    const newCargo: CargoRecord = {
      ...data,
      id: Date.now().toString(),
    };
    setCargoRecords([...cargoRecords, newCargo]);
    setShowAddForm(false);
  };

  const handleUpdateCargo = (id: string, data: Partial<CargoRecord>) => {
    setCargoRecords(cargoRecords.map(cargo => 
      cargo.id === id ? { ...cargo, ...data } : cargo
    ));
    setEditingCargo(null);
  };

  const handleDeleteCargo = (cargoId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту запись о грузоперевозке?')) {
      setCargoRecords(cargoRecords.filter(cargo => cargo.id !== cargoId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500';
      case 'in-transit': return 'text-blue-500';
      case 'delivered': return 'text-green-500';
      case 'cancelled': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает отправки';
      case 'in-transit': return 'В пути';
      case 'delivered': return 'Доставлено';
      case 'cancelled': return 'Отменено';
      default: return 'Неизвестно';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatWeight = (weight: number) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)} т`;
    }
    return `${weight} кг`;
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и поиск */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Грузоперевозки</h3>
          <p className="text-slate-400">
            Журнал грузоперевозок {character.firstName} {character.lastName}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить перевозку
        </Button>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Поиск по типу груза, пункту отправления или назначения..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Список грузоперевозок */}
      {filteredCargo.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Truck className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">
              {searchQuery ? 'Грузоперевозки не найдены' : 'Нет записей о грузоперевозках'}
            </p>
            {!searchQuery && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить первую перевозку
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCargo.map((cargo) => (
            <Card key={cargo.id} className="hover:bg-slate-800/50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary-500" />
                    <div>
                      <h4 className="font-semibold text-white">{cargo.cargoType}</h4>
                      <p className="text-sm text-slate-400">{cargo.vehicleId}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingCargo(cargo)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCargo(cargo.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Вес:</span>
                    <span className="text-white flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {formatWeight(cargo.weight)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Стоимость:</span>
                    <span className="text-green-400 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatCurrency(cargo.value)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Статус:</span>
                    <span className={getStatusColor(cargo.status)}>
                      {getStatusText(cargo.status)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Откуда:</span>
                      <span className="text-white flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {cargo.origin}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Куда:</span>
                      <span className="text-white flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {cargo.destination}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Отправление:</span>
                      <span className="text-white flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(cargo.departureDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Прибытие:</span>
                      <span className="text-white flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(cargo.arrivalDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-slate-800/50 rounded text-xs">
                    <span className="text-slate-400">Описание:</span>
                    <p className="text-white mt-1">{cargo.description}</p>
                  </div>
                  {cargo.notes && (
                    <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs">
                      <span className="text-slate-400">Примечания:</span>
                      <p className="text-white mt-1">{cargo.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Форма добавления/редактирования */}
      {showAddForm && (
        <CargoForm
          onSubmit={handleAddCargo}
          onCancel={() => setShowAddForm(false)}
          cargo={editingCargo}
          onUpdate={handleUpdateCargo}
        />
      )}
    </div>
  );
};

// Компонент формы для добавления/редактирования грузоперевозки
interface CargoFormProps {
  onSubmit: (data: Omit<CargoRecord, 'id'>) => void;
  onCancel: () => void;
  cargo?: CargoRecord | null;
  onUpdate: (id: string, data: Partial<CargoRecord>) => void;
}

const CargoForm: React.FC<CargoFormProps> = ({ onSubmit, onCancel, cargo, onUpdate }) => {
  const [formData, setFormData] = useState({
    cargoType: cargo?.cargoType || '',
    weight: cargo?.weight || 0,
    origin: cargo?.origin || '',
    destination: cargo?.destination || '',
    departureDate: cargo?.departureDate || new Date().toISOString().split('T')[0],
    arrivalDate: cargo?.arrivalDate || new Date().toISOString().split('T')[0],
    status: cargo?.status || 'pending',
    value: cargo?.value || 0,
    description: cargo?.description || '',
    vehicleId: cargo?.vehicleId || '',
    driverId: cargo?.driverId || '',
    notes: cargo?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cargo) {
      onUpdate(cargo.id, formData);
    } else {
      onSubmit(formData as Omit<CargoRecord, 'id'>);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h4 className="text-lg font-semibold text-white">
          {cargo ? 'Редактировать грузоперевозку' : 'Добавить грузоперевозку'}
        </h4>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Тип груза *
              </label>
              <input
                type="text"
                required
                value={formData.cargoType}
                onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Вес (кг) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Пункт отправления *
              </label>
              <input
                type="text"
                required
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Пункт назначения *
              </label>
              <input
                type="text"
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Дата отправления *
              </label>
              <input
                type="date"
                required
                value={formData.departureDate}
                onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Дата прибытия *
              </label>
              <input
                type="date"
                required
                value={formData.arrivalDate}
                onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Стоимость груза (USD)
              </label>
              <input
                type="number"
                min="0"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                ID транспортного средства
              </label>
              <input
                type="text"
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Статус
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="pending">Ожидает отправки</option>
                <option value="in-transit">В пути</option>
                <option value="delivered">Доставлено</option>
                <option value="cancelled">Отменено</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Описание груза
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Подробное описание груза..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Примечания
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Дополнительные примечания..."
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit">
              {cargo ? 'Сохранить изменения' : 'Добавить грузоперевозку'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 