import React from 'react';
import { Card, CardHeader, CardContent } from '@/shared/ui/atoms';
import { Button } from '@/shared/ui/atoms';
import { Edit, User, Phone, Mail, MapPin, Calendar, FileText } from 'lucide-react';
import type { Character } from '@/shared/types';

interface PersonalDataTabProps {
  character: Character;
}

export const PersonalDataTab: React.FC<PersonalDataTabProps> = ({ character }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const personalInfo = [
    {
      icon: User,
      label: 'Полное имя',
      value: `${character.firstName} ${character.lastName}`,
    },
    {
      icon: Calendar,
      label: 'Дата рождения',
      value: formatDate(character.dateOfBirth),
    },
    {
      icon: User,
      label: 'Пол',
      value: character.gender === 'male' ? 'Мужской' : character.gender === 'female' ? 'Женский' : 'Не указано',
    },
    {
      icon: User,
      label: 'Этническая принадлежность',
      value: character.ethnicity || 'Не указано',
    },
    {
      icon: User,
      label: 'Рост',
      value: character.height ? `${character.height} см` : 'Не указано',
    },
    {
      icon: User,
      label: 'Вес',
      value: character.weight ? `${character.weight} кг` : 'Не указано',
    },
    {
      icon: User,
      label: 'Цвет волос',
      value: character.hairColor || 'Не указано',
    },
    {
      icon: User,
      label: 'Цвет глаз',
      value: character.eyeColor || 'Не указано',
    },
  ];

  const contactInfo = [
    {
      icon: Phone,
      label: 'Телефон',
      value: character.phoneNumber || 'Не указано',
    },
    {
      icon: Mail,
      label: 'Email',
      value: character.email || 'Не указано',
    },
    {
      icon: MapPin,
      label: 'Адрес',
      value: character.address || 'Не указано',
    },
    {
      icon: MapPin,
      label: 'Почтовый индекс',
      value: character.postal || 'Не указано',
    },
  ];

  const additionalInfo = [
    {
      icon: FileText,
      label: 'Профессия',
      value: character.occupation || 'Не указано',
    },
    {
      icon: FileText,
      label: 'SSN',
      value: character.ssn || 'Не указано',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Основная информация */}
      <Card className="border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Основная информация</h3>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <IconComponent className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">{info.label}</p>
                    <p className="text-white font-medium">{info.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Контактная информация */}
      <Card className="border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Контактная информация</h3>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <IconComponent className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">{info.label}</p>
                    <p className="text-white font-medium">{info.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Дополнительная информация */}
      <Card className="border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Дополнительная информация</h3>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {additionalInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <IconComponent className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">{info.label}</p>
                    <p className="text-white font-medium">{info.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Флаги */}
      {character.flags && character.flags.length > 0 && (
        <Card className="border-slate-700">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Флаги</h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {character.flags.map((flag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm"
                >
                  {flag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 