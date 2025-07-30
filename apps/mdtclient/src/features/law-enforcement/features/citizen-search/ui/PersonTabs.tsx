import React, { useState } from 'react';
import { 
  Car, 
  Shield, 
  PawPrint, 
  AlertTriangle, 
  Gavel, 
  Award, 
  FileText,
  Edit,
  Download,
  Trash2,
  Eye
} from 'lucide-react';
import { Card, Button, Badge } from '@/shared/ui/atoms';
import { DataTable } from '@/shared/ui/molecules';
import { VehicleDetailsModal } from '../../../ui/VehicleDetailsModal';
import { WeaponDetailsModal } from '../../../ui/WeaponDetailsModal';
import type { Citizen, Vehicle, Weapon, Pet } from '../../model/types';

interface PersonTabsProps {
  person: Citizen & { ssn?: string; flags?: string[]; addressFlags?: string[] };
  activeTab: string;
  onTabChange: (tab: string) => void;
  vehicles: Vehicle[];
  weapons: Weapon[];
  pets: Pet[];
}

export const PersonTabs: React.FC<PersonTabsProps> = ({
  person,
  activeTab,
  onTabChange,
  vehicles,
  weapons,
  pets
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const vehicleColumns = [
    { 
      key: 'plate', 
      header: 'НОМЕРНОЙ ЗНАК', 
      render: (value: string) => (
        <button
          onClick={() => {
            const vehicle = vehicles.find(v => v.plate === value);
            if (vehicle) setSelectedVehicle(vehicle);
          }}
          className="text-primary-400 hover:text-primary-300 underline"
        >
          {value}
        </button>
      )
    },
    { key: 'model', header: 'МОДЕЛЬ' },
    { key: 'color', header: 'ЦВЕТ' },
    { 
      key: 'registration', 
      header: 'СТАТУС РЕГИСТРАЦИИ', 
      render: (value: string) => (
        <Badge variant={value === 'valid' ? 'default' : 'destructive'}>
          {value === 'valid' ? 'Присутствует' : 'Отсутствует'}
        </Badge>
      )
    },
    { key: 'vin', header: 'VIN' },
    { 
      key: 'createdAt', 
      header: 'СОЗДАН', 
      render: () => formatDate(new Date().toISOString()) 
    }
  ];

  const weaponColumns = [
    { 
      key: 'serialNumber', 
      header: 'СЕРИЙНЫЙ НОМЕР', 
      render: (value: string) => (
        <button
          onClick={() => {
            const weapon = weapons.find(w => w.serialNumber === value);
            if (weapon) setSelectedWeapon(weapon);
          }}
          className="text-primary-400 hover:text-primary-300 underline"
        >
          {value}
        </button>
      )
    },
    { key: 'model', header: 'МОДЕЛЬ' },
    { key: 'type', header: 'ТИП' },
    { key: 'caliber', header: 'КАЛИБР' },
    { 
      key: 'status', 
      header: 'СТАТУС', 
      render: (value: string) => (
        <Badge 
          variant={
            value === 'registered' ? 'default' :
            value === 'stolen' ? 'destructive' : 'secondary'
          }
        >
          {value === 'registered' ? 'Зарегистрировано' :
           value === 'stolen' ? 'Похищено' : 'Конфисковано'}
        </Badge>
      )
    },
    { 
      key: 'registrationDate', 
      header: 'ДАТА РЕГИСТРАЦИИ', 
      render: (value: string) => formatDate(value) 
    }
  ];

  const tabs = [
    {
      id: 'vehicles',
      label: 'Зарегистрированный транспорт',
      icon: Car,
      count: vehicles.length
    },
    {
      id: 'weapons',
      label: 'Зарегистрированное оружие',
      icon: Shield,
      count: weapons.length
    },
    {
      id: 'pets',
      label: 'Питомцы',
      icon: PawPrint,
      count: pets.length
    },
    {
      id: 'fines',
      label: 'Штрафы',
      icon: AlertTriangle,
      count: 4 // Моковые данные
    },
    {
      id: 'arrests',
      label: 'Аресты',
      icon: Gavel,
      count: 2 // Моковые данные
    },
    {
      id: 'warnings',
      label: 'Письменные предупреждения',
      icon: FileText,
      count: 1 // Моковые данные
    },
    {
      id: 'warrants',
      label: 'Ордера',
      icon: Award,
      count: 0 // Моковые данные
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vehicles':
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Зарегистрированный транспорт</h3>
              <Button size="sm" variant="outline">
                <Car className="mr-2 h-4 w-4" />
                Добавить транспорт
              </Button>
            </div>
            {vehicles.length > 0 ? (
              <DataTable 
                columns={vehicleColumns}
                data={vehicles}
              />
            ) : (
              <div className="text-center py-8">
                <Car className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                <p className="text-secondary-400">Нет зарегистрированного транспорта</p>
              </div>
            )}
          </div>
        );

      case 'weapons':
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Зарегистрированное оружие</h3>
              <Button size="sm" variant="outline">
                <Shield className="mr-2 h-4 w-4" />
                Добавить оружие
              </Button>
            </div>
            {weapons.length > 0 ? (
              <DataTable 
                columns={weaponColumns}
                data={weapons}
              />
            ) : (
              <div className="text-center py-8">
                <Shield className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                <p className="text-secondary-400">Нет зарегистрированного оружия</p>
              </div>
            )}
          </div>
        );

      case 'pets':
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Питомцы</h3>
              <Button size="sm" variant="outline">
                <PawPrint className="mr-2 h-4 w-4" />
                Добавить питомца
              </Button>
            </div>
            {pets.length > 0 ? (
              <div className="space-y-4">
                {pets.map((pet) => (
                  <div key={pet.id} className="border border-secondary-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-white">{pet.name}</h4>
                        <p className="text-secondary-400">Порода: {pet.breed}</p>
                        <p className="text-secondary-400">Цвет: {pet.color}</p>
                        <p className="text-secondary-400">Вес: {pet.weight}</p>
                        <p className="text-secondary-400">Владелец: {pet.ownerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-secondary-400">
                          Дата регистрации: {formatDate(pet.registrationDate)}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
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
              <div className="text-center py-8">
                <PawPrint className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                <p className="text-secondary-400">Нет зарегистрированных питомцев</p>
              </div>
            )}
          </div>
        );

      case 'fines':
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Штрафы</h3>
              <Button size="sm" variant="outline">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Создать штраф
              </Button>
            </div>
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
              <p className="text-secondary-400">История штрафов будет отображаться здесь</p>
            </div>
          </div>
        );

      case 'arrests':
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Аресты</h3>
              <Button size="sm" variant="outline">
                <Gavel className="mr-2 h-4 w-4" />
                Создать отчёт об аресте
              </Button>
            </div>
            <div className="text-center py-8">
              <Gavel className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
              <p className="text-secondary-400">История арестов будет отображаться здесь</p>
            </div>
          </div>
        );

      case 'warnings':
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Письменные предупреждения</h3>
              <Button size="sm" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Создать предупреждение
              </Button>
            </div>
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
              <p className="text-secondary-400">История предупреждений будет отображаться здесь</p>
            </div>
          </div>
        );

      case 'warrants':
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Ордера</h3>
              <Button size="sm" variant="outline">
                <Award className="mr-2 h-4 w-4" />
                Создать ордер
              </Button>
            </div>
            <div className="text-center py-8">
              <Award className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
              <p className="text-secondary-400">История ордеров будет отображаться здесь</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <div className="border-b border-secondary-700">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-colors ${
                  activeTab === tab.id 
                    ? 'border-b-2 border-primary-500 text-primary-400 bg-primary-500/10' 
                    : 'text-secondary-400 hover:text-secondary-300 hover:bg-secondary-800/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {tab.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {renderTabContent()}
      </div>

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
    </Card>
  );
};
