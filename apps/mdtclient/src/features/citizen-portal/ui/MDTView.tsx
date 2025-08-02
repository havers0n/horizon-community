import React from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/atoms';
import { Button } from '@/shared/ui/atoms';
import { Phone, Shield, Heart, Map, Users, AlertTriangle, Search, FileText } from 'lucide-react';
import { useCitizenPortalStore } from '../model/store';
import { useQuery } from '@tanstack/react-query';
import { CitizenApi } from '../api/citizenApi';

interface MDTViewProps {
  subView: string;
}

export const MDTView: React.FC<MDTViewProps> = ({ subView }) => {
  const { activeCharacter } = useCitizenPortalStore();

  // Определяем тип карьеры персонажа
  const getCareerType = () => {
    if (!activeCharacter) return 'civilian';
    
    // Проверяем различные атрибуты для определения карьеры
    if (activeCharacter.isUnit && activeCharacter.departmentId) {
      // Определяем тип департамента по departmentId
      const departmentMap: Record<string, string> = {
        'law-enforcement': 'leo',
        'ems': 'ems',
        'fire': 'fire',
        'dispatch': 'dispatch'
      };
      return departmentMap[activeCharacter.departmentId] || 'leo';
    }
    
    return 'civilian';
  };

  const careerType = getCareerType();

  // Компонент для гражданских
  const CivilianMDT = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Phone className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-semibold text-white">Экстренные вызовы</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Phone className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Создать вызов 911
            </h3>
            <p className="text-slate-400 mb-6">
              Сообщите о происшествии или запросите экстренную помощь
            </p>
            <Button className="bg-red-600 hover:bg-red-700">
              <Phone className="w-4 h-4 mr-2" />
              Создать вызов
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Компонент для LEO
  const LEOMDT = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-500" />
              <h3 className="font-semibold text-white">Статус</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                На службе
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                На вызове
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                Недоступен
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="font-semibold text-white">Паника</h3>
            </div>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-red-600 hover:bg-red-700">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Кнопка паники
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Search className="w-6 h-6 text-green-500" />
              <h3 className="font-semibold text-white">Поиск</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Поиск граждан
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                База данных
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Активные вызовы</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-400">
            Нет активных вызовов
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Компонент для EMS/FD
  const EMSFDMDT = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-500" />
              <h3 className="font-semibold text-white">Медицинские вызовы</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Heart className="w-4 h-4 mr-2" />
                Создать мед. отчет
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Пациенты
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h3 className="font-semibold text-white">Экстренные вызовы</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-400">
              Нет активных вызовов
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Компонент для диспетчера
  const DispatchCAD = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Map className="w-6 h-6 text-blue-500" />
                <h3 className="font-semibold text-white">Интерактивная карта</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-slate-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <Map className="w-12 h-12 mx-auto mb-2" />
                  <p>Карта города</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-white">Управление юнитами</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Все юниты
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  LEO юниты
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="w-4 h-4 mr-2" />
                  EMS юниты
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Все вызовы</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-400">
            Нет активных вызовов
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Рендерим соответствующий интерфейс
  const renderMDTInterface = () => {
    switch (careerType) {
      case 'leo':
        return <LEOMDT />;
      case 'ems':
      case 'fire':
        return <EMSFDMDT />;
      case 'dispatch':
        return <DispatchCAD />;
      default:
        return <CivilianMDT />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {careerType === 'dispatch' ? 'CAD Система' : 'MDT Система'}
        </h1>
        <p className="text-slate-400">
          {careerType === 'dispatch' 
            ? 'Система компьютерной помощи диспетчерам'
            : 'Доступ к базе данных правоохранительных органов'
          }
        </p>
        {activeCharacter && (
          <p className="text-sm text-slate-500 mt-1">
            Персонаж: {activeCharacter.firstName} {activeCharacter.lastName} 
            {activeCharacter.badgeNumber && ` (${activeCharacter.badgeNumber})`}
          </p>
        )}
      </div>

      {renderMDTInterface()}
    </div>
  );
}; 