import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/atoms';
import { Button } from '@/shared/ui/atoms';
import { Heart, Plus, Edit, Trash2, Search, Calendar, MapPin } from 'lucide-react';
import { Character } from '@/shared/types';

interface PetsTabProps {
  character: Character;
}

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  weight: number;
  color: string;
  microchipId: string;
  registrationDate: string;
  ownerId: string;
  status: 'active' | 'lost' | 'deceased';
  description: string;
}

export const PetsTab: React.FC<PetsTabProps> = ({ character }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Моковые данные для питомцев
  const [pets, setPets] = useState<Pet[]>([
    {
      id: '1',
      name: 'Бобик',
      type: 'Собака',
      breed: 'Немецкая овчарка',
      age: 3,
      weight: 35,
      color: 'Черно-подпалый',
      microchipId: 'CHIP001234567',
      registrationDate: '2021-05-10',
      ownerId: character.id,
      status: 'active',
      description: 'Дружелюбная и умная собака, хорошо поддается дрессировке.'
    },
    {
      id: '2',
      name: 'Мурзик',
      type: 'Кошка',
      breed: 'Британская короткошерстная',
      age: 2,
      weight: 4.5,
      color: 'Серый',
      microchipId: 'CHIP007654321',
      registrationDate: '2022-01-15',
      ownerId: character.id,
      status: 'active',
      description: 'Спокойный и ласковый кот, любит спать на коленях.'
    }
  ]);

  // Фильтруем питомцев по поисковому запросу
  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPet = (data: Omit<Pet, 'id'>) => {
    const newPet: Pet = {
      ...data,
      id: Date.now().toString(),
    };
    setPets([...pets, newPet]);
    setShowAddForm(false);
  };

  const handleUpdatePet = (id: string, data: Partial<Pet>) => {
    setPets(pets.map(pet => 
      pet.id === id ? { ...pet, ...data } : pet
    ));
    setEditingPet(null);
  };

  const handleDeletePet = (petId: string) => {
    if (confirm('Вы уверены, что хотите удалить этого питомца?')) {
      setPets(pets.filter(pet => pet.id !== petId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'lost': return 'text-yellow-500';
      case 'deceased': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'lost': return 'Потерян';
      case 'deceased': return 'Умер';
      default: return 'Неизвестно';
    }
  };

  const getPetIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'собака':
      case 'dog':
        return '🐕';
      case 'кошка':
      case 'cat':
        return '🐱';
      case 'птица':
      case 'bird':
        return '🐦';
      case 'рыбка':
      case 'fish':
        return '🐠';
      default:
        return '🐾';
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и поиск */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Питомцы</h3>
          <p className="text-slate-400">
            Управление питомцами {character.firstName} {character.lastName}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Зарегистрировать питомца
        </Button>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Поиск по имени, типу или породе..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Список питомцев */}
      {filteredPets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Heart className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">
              {searchQuery ? 'Питомцы не найдены' : 'Нет зарегистрированных питомцев'}
            </p>
            {!searchQuery && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Зарегистрировать первого питомца
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPets.map((pet) => (
            <Card key={pet.id} className="hover:bg-slate-800/50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getPetIcon(pet.type)}</span>
                    <div>
                      <h4 className="font-semibold text-white">{pet.name}</h4>
                      <p className="text-sm text-slate-400">{pet.breed}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPet(pet)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePet(pet.id)}
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
                    <span className="text-slate-400">Тип:</span>
                    <span className="text-white">{pet.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Возраст:</span>
                    <span className="text-white flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {pet.age} {pet.age === 1 ? 'год' : pet.age < 5 ? 'года' : 'лет'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Вес:</span>
                    <span className="text-white">{pet.weight} кг</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Цвет:</span>
                    <span className="text-white">{pet.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Статус:</span>
                    <span className={getStatusColor(pet.status)}>
                      {getStatusText(pet.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Чип ID:</span>
                    <span className="text-white font-mono text-xs">{pet.microchipId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Регистрация:</span>
                    <span className="text-white flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {new Date(pet.registrationDate).toLocaleDateString()}
                    </span>
                  </div>
                  {pet.description && (
                    <div className="mt-3 p-2 bg-slate-800/50 rounded text-xs">
                      <span className="text-slate-400">Описание:</span>
                      <p className="text-white mt-1">{pet.description}</p>
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
        <PetForm
          onSubmit={handleAddPet}
          onCancel={() => setShowAddForm(false)}
          pet={editingPet}
          onUpdate={handleUpdatePet}
        />
      )}
    </div>
  );
};

// Компонент формы для добавления/редактирования питомца
interface PetFormProps {
  onSubmit: (data: Omit<Pet, 'id'>) => void;
  onCancel: () => void;
  pet?: Pet | null;
  onUpdate: (id: string, data: Partial<Pet>) => void;
}

const PetForm: React.FC<PetFormProps> = ({ onSubmit, onCancel, pet, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: pet?.name || '',
    type: pet?.type || '',
    breed: pet?.breed || '',
    age: pet?.age || 1,
    weight: pet?.weight || 1,
    color: pet?.color || '',
    microchipId: pet?.microchipId || '',
    registrationDate: pet?.registrationDate || new Date().toISOString().split('T')[0],
    status: pet?.status || 'active',
    description: pet?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pet) {
      onUpdate(pet.id, formData);
    } else {
      onSubmit(formData as Omit<Pet, 'id'>);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h4 className="text-lg font-semibold text-white">
          {pet ? 'Редактировать питомца' : 'Зарегистрировать питомца'}
        </h4>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Имя питомца *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Тип животного *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Выберите тип</option>
                <option value="Собака">Собака</option>
                <option value="Кошка">Кошка</option>
                <option value="Птица">Птица</option>
                <option value="Рыбка">Рыбка</option>
                <option value="Хомяк">Хомяк</option>
                <option value="Кролик">Кролик</option>
                <option value="Другое">Другое</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Порода *
              </label>
              <input
                type="text"
                required
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Возраст (лет)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Вес (кг)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Цвет/Окрас
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Номер микрочипа
              </label>
              <input
                type="text"
                value={formData.microchipId}
                onChange={(e) => setFormData({ ...formData, microchipId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="CHIP123456789"
              />
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
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Статус
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">Активен</option>
                <option value="lost">Потерян</option>
                <option value="deceased">Умер</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Описание питомца, особенности характера..."
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit">
              {pet ? 'Сохранить изменения' : 'Зарегистрировать питомца'}
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