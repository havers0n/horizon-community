import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/atoms';
import { Button } from '@/shared/ui/atoms';
import { Car, Plus, Edit, Trash2, Search } from 'lucide-react';
import { Character, Vehicle } from '@/shared/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/services/api';

interface VehiclesTabProps {
  character: Character;
}

interface VehicleFormData {
  plate: string;
  vin: string;
  model: string;
  make: string;
  year: number;
  color: string;
  bodyType: string;
  mileage: number;
  engineSize: string;
  registration: 'valid' | 'invalid' | 'expired';
  insurance: 'valid' | 'invalid' | 'expired';
}

export const VehiclesTab: React.FC<VehiclesTabProps> = ({ character }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const apiService = new ApiService();

  // Загружаем транспортные средства персонажа
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['character-vehicles', character.id],
    queryFn: () => apiService.getVehicles({ ownerId: character.id }),
    enabled: !!character.id,
  });

  // Мутация для добавления транспортного средства
  const addVehicleMutation = useMutation({
    mutationFn: (data: VehicleFormData) => 
      apiService.createVehicle({ ...data, ownerId: character.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character-vehicles', character.id] });
      setShowAddForm(false);
    },
  });

  // Мутация для удаления транспортного средства
  const deleteVehicleMutation = useMutation({
    mutationFn: (vehicleId: string) => 
      Promise.resolve(), // TODO: Добавить API для удаления
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character-vehicles', character.id] });
    },
  });

  // Фильтруем транспортные средства по поисковому запросу
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.make.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddVehicle = (data: VehicleFormData) => {
    addVehicleMutation.mutate(data);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (confirm('Вы уверены, что хотите удалить это транспортное средство?')) {
      deleteVehicleMutation.mutate(vehicleId);
    }
  };

  const getRegistrationStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-500';
      case 'expired': return 'text-yellow-500';
      case 'invalid': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };

  const getInsuranceStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-500';
      case 'expired': return 'text-yellow-500';
      case 'invalid': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и поиск */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Транспортные средства</h3>
          <p className="text-slate-400">
            Управление транспортными средствами {character.firstName} {character.lastName}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Зарегистрировать ТС
        </Button>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Поиск по номеру, модели или марке..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Список транспортных средств */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-slate-400 mt-2">Загрузка транспортных средств...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Car className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">
              {searchQuery ? 'Транспортные средства не найдены' : 'Нет зарегистрированных транспортных средств'}
            </p>
            {!searchQuery && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Зарегистрировать первое ТС
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:bg-slate-800/50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary-500" />
                    <h4 className="font-semibold text-white">{vehicle.model}</h4>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingVehicle(vehicle)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Номер:</span>
                    <span className="text-white font-mono">{vehicle.plate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Марка:</span>
                    <span className="text-white">{vehicle.make}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Год:</span>
                    <span className="text-white">{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Цвет:</span>
                    <span className="text-white">{vehicle.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Регистрация:</span>
                    <span className={getRegistrationStatusColor(vehicle.registration)}>
                      {vehicle.registration === 'valid' ? 'Действительна' : 
                       vehicle.registration === 'expired' ? 'Истекла' : 'Недействительна'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Страховка:</span>
                    <span className={getInsuranceStatusColor(vehicle.insurance)}>
                      {vehicle.insurance === 'valid' ? 'Действительна' : 
                       vehicle.insurance === 'expired' ? 'Истекла' : 'Недействительна'}
                    </span>
                  </div>
                  {vehicle.stolen && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded px-2 py-1 text-center">
                      <span className="text-red-400 text-xs">УГОН</span>
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
        <VehicleForm
          onSubmit={handleAddVehicle}
          onCancel={() => setShowAddForm(false)}
          vehicle={editingVehicle}
        />
      )}
    </div>
  );
};

// Компонент формы для добавления/редактирования транспортного средства
interface VehicleFormProps {
  onSubmit: (data: VehicleFormData) => void;
  onCancel: () => void;
  vehicle?: Vehicle | null;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ onSubmit, onCancel, vehicle }) => {
  const [formData, setFormData] = useState<VehicleFormData>({
    plate: vehicle?.plate || '',
    vin: vehicle?.vin || '',
    model: vehicle?.model || '',
    make: vehicle?.make || '',
    year: vehicle?.year || new Date().getFullYear(),
    color: vehicle?.color || '',
    bodyType: vehicle?.bodyType || '',
    mileage: vehicle?.mileage || 0,
    engineSize: vehicle?.engineSize || '',
    registration: vehicle?.registration as any || 'valid',
    insurance: vehicle?.insurance as any || 'valid',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <h4 className="text-lg font-semibold text-white">
          {vehicle ? 'Редактировать транспортное средство' : 'Зарегистрировать транспортное средство'}
        </h4>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Номерной знак *
              </label>
              <input
                type="text"
                required
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                VIN *
              </label>
              <input
                type="text"
                required
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Модель *
              </label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Марка
              </label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Год выпуска
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Цвет *
              </label>
              <input
                type="text"
                required
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Тип кузова
              </label>
              <input
                type="text"
                value={formData.bodyType}
                onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Пробег
              </label>
              <input
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Объем двигателя
              </label>
              <input
                type="text"
                value={formData.engineSize}
                onChange={(e) => setFormData({ ...formData, engineSize: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Статус регистрации
              </label>
              <select
                value={formData.registration}
                onChange={(e) => setFormData({ ...formData, registration: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="valid">Действительна</option>
                <option value="expired">Истекла</option>
                <option value="invalid">Недействительна</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Статус страховки
              </label>
              <select
                value={formData.insurance}
                onChange={(e) => setFormData({ ...formData, insurance: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="valid">Действительна</option>
                <option value="expired">Истекла</option>
                <option value="invalid">Недействительна</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit">
              {vehicle ? 'Сохранить изменения' : 'Зарегистрировать ТС'}
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