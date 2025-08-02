import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/atoms';
import { Button } from '@/shared/ui/atoms';
import { Shield, Plus, Edit, Trash2, Search } from 'lucide-react';
import { Character, Weapon } from '@/shared/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/services/api';

interface WeaponsTabProps {
  character: Character;
}

interface WeaponFormData {
  serialNumber: string;
  model: string;
  type: string;
  caliber: string;
  status: 'registered' | 'stolen' | 'confiscated' | 'illegal';
  registrationDate: string;
  notes: string;
}

export const WeaponsTab: React.FC<WeaponsTabProps> = ({ character }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWeapon, setEditingWeapon] = useState<Weapon | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const apiService = new ApiService();

  // Загружаем оружие персонажа
  const { data: weapons = [], isLoading } = useQuery({
    queryKey: ['character-weapons', character.id],
    queryFn: () => apiService.getWeapons({ ownerId: character.id }),
    enabled: !!character.id,
  });

  // Мутация для добавления оружия
  const addWeaponMutation = useMutation({
    mutationFn: (data: WeaponFormData) => 
      apiService.createWeapon({ ...data, ownerId: character.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character-weapons', character.id] });
      setShowAddForm(false);
    },
  });

  // Мутация для удаления оружия
  const deleteWeaponMutation = useMutation({
    mutationFn: (weaponId: string) => 
      Promise.resolve(), // TODO: Добавить API для удаления
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character-weapons', character.id] });
    },
  });

  // Фильтруем оружие по поисковому запросу
  const filteredWeapons = weapons.filter(weapon =>
    weapon.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    weapon.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    weapon.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddWeapon = (data: WeaponFormData) => {
    addWeaponMutation.mutate(data);
  };

  const handleDeleteWeapon = (weaponId: string) => {
    if (confirm('Вы уверены, что хотите удалить это оружие?')) {
      deleteWeaponMutation.mutate(weaponId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'text-green-500';
      case 'stolen': return 'text-red-500';
      case 'confiscated': return 'text-yellow-500';
      case 'illegal': return 'text-red-600';
      default: return 'text-slate-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registered': return 'Зарегистрировано';
      case 'stolen': return 'Украдено';
      case 'confiscated': return 'Конфисковано';
      case 'illegal': return 'Нелегальное';
      default: return 'Неизвестно';
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и поиск */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Оружие</h3>
          <p className="text-slate-400">
            Управление оружием {character.firstName} {character.lastName}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Зарегистрировать оружие
        </Button>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Поиск по серийному номеру, модели или типу..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Список оружия */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-slate-400 mt-2">Загрузка оружия...</p>
        </div>
      ) : filteredWeapons.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">
              {searchQuery ? 'Оружие не найдено' : 'Нет зарегистрированного оружия'}
            </p>
            {!searchQuery && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Зарегистрировать первое оружие
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWeapons.map((weapon) => (
            <Card key={weapon.id} className="hover:bg-slate-800/50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary-500" />
                    <h4 className="font-semibold text-white">{weapon.model}</h4>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingWeapon(weapon)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWeapon(weapon.id)}
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
                    <span className="text-slate-400">Серийный номер:</span>
                    <span className="text-white font-mono">{weapon.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Тип:</span>
                    <span className="text-white">{weapon.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Калибр:</span>
                    <span className="text-white">{weapon.caliber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Статус:</span>
                    <span className={getStatusColor(weapon.status)}>
                      {getStatusText(weapon.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Дата регистрации:</span>
                    <span className="text-white">
                      {new Date(weapon.registrationDate).toLocaleDateString()}
                    </span>
                  </div>
                  {weapon.notes && (
                    <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs">
                      <span className="text-slate-400">Примечания:</span>
                      <p className="text-white mt-1">{weapon.notes}</p>
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
        <WeaponForm
          onSubmit={handleAddWeapon}
          onCancel={() => setShowAddForm(false)}
          weapon={editingWeapon}
        />
      )}
    </div>
  );
};

// Компонент формы для добавления/редактирования оружия
interface WeaponFormProps {
  onSubmit: (data: WeaponFormData) => void;
  onCancel: () => void;
  weapon?: Weapon | null;
}

const WeaponForm: React.FC<WeaponFormProps> = ({ onSubmit, onCancel, weapon }) => {
  const [formData, setFormData] = useState<WeaponFormData>({
    serialNumber: weapon?.serialNumber || '',
    model: weapon?.model || '',
    type: weapon?.type || '',
    caliber: weapon?.caliber || '',
    status: weapon?.status as any || 'registered',
    registrationDate: weapon?.registrationDate || new Date().toISOString().split('T')[0],
    notes: weapon?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <h4 className="text-lg font-semibold text-white">
          {weapon ? 'Редактировать оружие' : 'Зарегистрировать оружие'}
        </h4>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Серийный номер *
              </label>
              <input
                type="text"
                required
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
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
                Тип *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Выберите тип</option>
                <option value="pistol">Пистолет</option>
                <option value="rifle">Винтовка</option>
                <option value="shotgun">Дробовик</option>
                <option value="smg">Пистолет-пулемет</option>
                <option value="sniper">Снайперская винтовка</option>
                <option value="other">Другое</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Калибр *
              </label>
              <input
                type="text"
                required
                value={formData.caliber}
                onChange={(e) => setFormData({ ...formData, caliber: e.target.value })}
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
                <option value="registered">Зарегистрировано</option>
                <option value="stolen">Украдено</option>
                <option value="confiscated">Конфисковано</option>
                <option value="illegal">Нелегальное</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Дата регистрации
              </label>
              <input
                type="date"
                value={formData.registrationDate}
                onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Примечания
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Дополнительная информация об оружии..."
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit">
              {weapon ? 'Сохранить изменения' : 'Зарегистрировать оружие'}
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