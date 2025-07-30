import React, { useState } from 'react';
import { Card, CardHeader, Button } from '../../../shared/ui/atoms';
import { DataTable } from '../../../shared/ui/molecules';
import { Edit, Eye } from 'lucide-react';
import { MOCK_VEHICLES, MOCK_WEAPONS, MOCK_PETS } from '../model/constants';
import type { Citizen, Vehicle, Weapon } from '../model/types';
import { VehicleDetailsModal } from './VehicleDetailsModal';
import { WeaponDetailsModal } from './WeaponDetailsModal';

interface PersonDetailsProps {
  person: Citizen & { ssn?: string; flags?: string[]; addressFlags?: string[] };
}

export const PersonDetails: React.FC<PersonDetailsProps> = ({ person }) => {
  const [activeTab, setActiveTab] = useState('vehicles');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);

  const personVehicles = MOCK_VEHICLES.filter(v => v.ownerId === person.id);
  const personWeapons = MOCK_WEAPONS.filter(w => w.ownerId === person.id);
  const personPets = MOCK_PETS.filter(p => p.ownerId === person.id);

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const vehicleColumns = [
    { key: 'plate', header: 'НОМЕРНОЙ ЗНАК', render: (value: string) => (
      <button
        onClick={() => {
          const vehicle = personVehicles.find(v => v.plate === value);
          if (vehicle) setSelectedVehicle(vehicle);
        }}
        className="text-primary-400 hover:text-primary-300 underline"
      >
        {value}
      </button>
    )},
    { key: 'model', header: 'МОДЕЛЬ' },
    { key: 'color', header: 'ЦВЕТ' },
    { key: 'registration', header: 'СТАТУС РЕГИСТРАЦИИ', render: (value: string) => 
      value === 'valid' ? 'Присутствует' : 'Отсутствует'
    },
    { key: 'vin', header: 'VIN' },
    { key: 'createdAt', header: 'СОЗДАН', render: () => formatDate(new Date().toISOString()) }
  ];

  const weaponColumns = [
    { key: 'serialNumber', header: 'СЕРИЙНЫЙ НОМЕР', render: (value: string) => (
      <button
        onClick={() => {
          const weapon = personWeapons.find(w => w.serialNumber === value);
          if (weapon) setSelectedWeapon(weapon);
        }}
        className="text-primary-400 hover:text-primary-300 underline"
      >
        {value}
      </button>
    )},
    { key: 'model', header: 'МОДЕЛЬ' },
    { key: 'type', header: 'ТИП' },
    { key: 'caliber', header: 'КАЛИБР' },
    { key: 'status', header: 'СТАТУС', render: (value: string) => (
      <span className={`px-2 py-1 rounded text-xs ${
        value === 'registered' ? 'bg-green-600' :
        value === 'stolen' ? 'bg-red-600' : 'bg-yellow-600'
      }`}>
        {value === 'registered' ? 'Зарегистрировано' :
         value === 'stolen' ? 'Похищено' : 'Конфисковано'}
      </span>
    )},
    { key: 'registrationDate', header: 'ДАТА РЕГИСТРАЦИИ', render: (value: string) => formatDate(value) }
  ];

  return (
    <div className="space-y-6">
      {/* Основная информация */}
      <Card>
        <CardHeader>Информация о гражданине</CardHeader>
        <div className="p-6">
          <div className="flex gap-6">
            <img src={person.imageUrl} alt={`${person.firstName} ${person.lastName}`} className="w-24 h-24 rounded-full" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Полное имя:</strong> {person.firstName} {person.lastName}</p>
                <p><strong>Номер социального страхования:</strong> {person.ssn || 'Не указан'}</p>
                <p><strong>Дата рождения:</strong> {formatDate(person.dateOfBirth)} (Возраст: {calculateAge(person.dateOfBirth)})</p>
                <p><strong>Пол:</strong> {person.gender || 'Не указан'}</p>
                <p><strong>Этническая принадлежность:</strong> Американоидная</p>
                <p><strong>Цвет волос:</strong> {person.weight || 'Не указан'}</p>
                <p><strong>Цвет глаз:</strong> {person.height || 'Не указан'}</p>
                <p><strong>Вес:</strong> {person.weight || 'Не указан'}</p>
                <p><strong>Рост:</strong> {person.height || 'Не указан'}</p>
                <p><strong>Адрес:</strong> {person.address}</p>
                <p><strong>Номер телефона:</strong> Не указан</p>
                <p><strong>Род занятий:</strong> {person.occupation || 'Не указан'}</p>
                <p><strong>Дополнительная информация:</strong> Не указан</p>
              </div>
              <div>
                <p><strong>Водительская лицензия:</strong> Не указан</p>
                <p><strong>Летная лицензия:</strong> Не указан</p>
                <p><strong>Лицензия на водный транспорт:</strong> Не указан</p>
                <p><strong>Лицензии на оружие:</strong> Не указан</p>
                <p><strong>Лицензия на рыбалку:</strong> Не указан</p>
                <p><strong>Лицензия на охоту:</strong> Не указан</p>
                <div className="mt-4">
                  <Button size="sm" variant="secondary">
                    <Edit className="mr-2 h-4 w-4" />
                    Редактировать
                  </Button>
                </div>
                <div className="mt-4">
                  <p><strong>Баллы водительской лицензии:</strong> 0</p>
                  <p><strong>Баллы лётной лицензии:</strong> 0</p>
                  <p><strong>Баллы лицензии на оружие:</strong> 0</p>
                  <p><strong>Баллы лицензии на водный транспорт:</strong> 0</p>
                  <p><strong>Баллы лицензии на охоту:</strong> 0</p>
                  <p><strong>Баллы лицензии на рыбалку:</strong> 0</p>
                  <div className="mt-2">
                    <Button size="sm" variant="secondary">
                      <Edit className="mr-2 h-4 w-4" />
                      Редактировать баллы лицензии
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <p><strong>Флаги:</strong> {person.flags?.join(', ') || 'Не указан'}</p>
                  <Button size="sm" variant="secondary">
                    <Edit className="mr-2 h-4 w-4" />
                    Управлять флагами граждан
                  </Button>
                  <p className="mt-2"><strong>Флаги адреса:</strong> {person.addressFlags?.join(', ') || 'Не указан'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Вкладки с дополнительной информацией */}
      <Card>
        <div className="border-b border-secondary-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`px-4 py-2 ${activeTab === 'vehicles' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-secondary-400'}`}
            >
              Зарегистрированный транспорт ({personVehicles.length})
            </button>
            <button
              onClick={() => setActiveTab('weapons')}
              className={`px-4 py-2 ${activeTab === 'weapons' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-secondary-400'}`}
            >
              Зарегистрированное оружие ({personWeapons.length})
            </button>
            <button
              onClick={() => setActiveTab('pets')}
              className={`px-4 py-2 ${activeTab === 'pets' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-secondary-400'}`}
            >
              Питомцы ({personPets.length})
            </button>
            <button
              onClick={() => setActiveTab('fines')}
              className={`px-4 py-2 ${activeTab === 'fines' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-secondary-400'}`}
            >
              Штрафы (4)
            </button>
            <button
              onClick={() => setActiveTab('arrests')}
              className={`px-4 py-2 ${activeTab === 'arrests' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-secondary-400'}`}
            >
              Аресты (0)
            </button>
            <button
              onClick={() => setActiveTab('warnings')}
              className={`px-4 py-2 ${activeTab === 'warnings' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-secondary-400'}`}
            >
              Письменные предупреждения
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'vehicles' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Зарегистрированный транспорт</h3>
              {personVehicles.length > 0 ? (
                <DataTable 
                  columns={vehicleColumns}
                  data={personVehicles}
                />
              ) : (
                <p className="text-secondary-400">Нет зарегистрированного транспорта</p>
              )}
            </div>
          )}

          {activeTab === 'weapons' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Зарегистрированное оружие</h3>
              {personWeapons.length > 0 ? (
                <DataTable 
                  columns={weaponColumns}
                  data={personWeapons}
                />
              ) : (
                <p className="text-secondary-400">Нет зарегистрированного оружия</p>
              )}
            </div>
          )}

          {activeTab === 'pets' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Питомцы</h3>
              {personPets.length > 0 ? (
                <div className="space-y-4">
                  {personPets.map((pet) => (
                    <div key={pet.id} className="border border-secondary-700 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-medium">{pet.name}</h4>
                          <p className="text-secondary-400">Порода: {pet.breed}</p>
                          <p className="text-secondary-400">Цвет: {pet.color}</p>
                          <p className="text-secondary-400">Вес: {pet.weight}</p>
                          <p className="text-secondary-400">Владелец: {pet.ownerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-secondary-400">Дата регистрации: {formatDate(pet.registrationDate)}</p>
                        </div>
                      </div>
                      {pet.medicalRecords.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-secondary-300">Медицинские записи:</p>
                          <ul className="text-sm text-secondary-400 mt-1">
                            {pet.medicalRecords.map((record, index) => (
                              <li key={index}>• {record}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {pet.notes && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-secondary-300">Заметки:</p>
                          <p className="text-sm text-secondary-400 mt-1">{pet.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary-400">Нет зарегистрированных питомцев</p>
              )}
            </div>
          )}

          {activeTab === 'fines' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Штрафы</h3>
              <p className="text-secondary-400">История штрафов будет отображаться здесь</p>
            </div>
          )}

          {activeTab === 'arrests' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Аресты</h3>
              <p className="text-secondary-400">История арестов будет отображаться здесь</p>
            </div>
          )}

          {activeTab === 'warnings' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Письменные предупреждения</h3>
              <p className="text-secondary-400">История предупреждений будет отображаться здесь</p>
            </div>
          )}
        </div>
      </Card>

      {/* Модальные окна для детальной информации */}
      {selectedVehicle && (
        <VehicleDetailsModal 
          vehicle={selectedVehicle} 
          onClose={() => setSelectedVehicle(null)} 
        />
      )}

      {selectedWeapon && (
        <WeaponDetailsModal 
          weapon={selectedWeapon} 
          onClose={() => setSelectedWeapon(null)} 
        />
      )}
    </div>
  );
};
