// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useState } from 'react';
import { 
  Edit, 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Hash, 
  Eye, 
  FileText,
  Car,
  Shield,
  PawPrint,
  AlertTriangle,
  Gavel,
  Award,
  Download,
  Trash2
} from 'lucide-react';
import { Card, CardHeader, Button, Badge } from '@/shared/ui/atoms';
import { DataTable } from '@/shared/ui/molecules';
import { PersonTabs } from './PersonTabs';
import { PersonEditModal } from './PersonEditModal';
import type { Characters } from '@roleplay-identity/db-types';
import { MOCK_VEHICLES, MOCK_WEAPONS, MOCK_PETS } from '../../../model/constants';

interface PersonCardProps {
  person: Characters;
}

export const PersonCard: React.FC<PersonCardProps> = ({ person }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'vehicles' | 'weapons' | 'pets'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);

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

  const getGenderIcon = (gender?: string) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return <User className="h-4 w-4 text-blue-400" />;
      case 'female':
        return <User className="h-4 w-4 text-pink-400" />;
      default:
        return <User className="h-4 w-4 text-secondary-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600">Активен</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Неактивен</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Приостановлен</Badge>;
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Основная информация */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={person.mugshot_url || '/default-avatar.png'} 
                  alt={`${person.first_name} ${person.last_name}`} 
                  className="w-20 h-20 rounded-full border-2 border-secondary-600"
                />
                {person.flags?.includes('dangerous') && (
                  <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                    <AlertTriangle className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {person.first_name} {person.last_name}
                  {getGenderIcon(person.gender)}
                </h2>
                <p className="text-secondary-400">
                  Возраст: {person.date_of_birth ? calculateAge(person.date_of_birth) : 'Не указан'} лет • {person.date_of_birth ? formatDate(person.date_of_birth) : 'Не указана'}
                </p>
                {person.ssn && (
                  <p className="text-secondary-400 flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    SSN: {person.ssn}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge('active')}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Основные данные */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Основная информация
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-400">Пол:</span>
                  <span className="text-white">{person.gender || 'Не указан'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-400">Этническая принадлежность:</span>
                  <span className="text-white">Американоидная</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-400">Цвет волос:</span>
                  <span className="text-white">Не указан</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-400">Цвет глаз:</span>
                  <span className="text-white">Не указан</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-400">Вес:</span>
                  <span className="text-white">Не указан</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-400">Рост:</span>
                  <span className="text-white">Не указан</span>
                </div>
              </div>
            </div>

            {/* Контактная информация */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Контактная информация
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-400">Адрес:</span>
                  <span className="text-white">{person.address || 'Не указан'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-400">Номер телефона:</span>
                  <span className="text-white">{person.phone_number || 'Не указан'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-400">Род занятий:</span>
                  <span className="text-white">{person.occupation || 'Не указан'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Флаги и предупреждения */}
          {person.flags && person.flags.length > 0 && (
            <div className="mt-6 pt-6 border-t border-secondary-700">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5" />
                Флаги и предупреждения
              </h3>
              <div className="flex flex-wrap gap-2">
                {person.flags.map((flag, index) => (
                  <Badge key={index} variant="destructive" className="bg-red-600">
                    {flag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Вкладки с дополнительной информацией */}
      <PersonTabs 
        person={person}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        vehicles={personVehicles}
        weapons={personWeapons}
        pets={personPets}
      />

      {/* Модальное окно редактирования */}
      {showEditModal && (
        <PersonEditModal 
          person={person}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedPerson) => {
            console.log('Сохранение изменений:', updatedPerson);
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
};
