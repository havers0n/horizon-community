import React, { useState } from 'react';
import { Card, CardHeader, Button } from '@/shared/ui/atoms';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Building, 
  Newspaper, 
  Siren, 
  Gavel, 
  FileText, 
  Handshake, 
  Ambulance, 
  Radio, 
  ClipboardList, 
  Cog,
  Truck,
  Heart,
  BookOpen,
  Shield,
  Calendar,
  Warehouse,
  Map,
  Search,
  User
} from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { PersonSearchWidget } from '@/features/law-enforcement/features/citizen-search/ui/PersonSearchWidget';
import { useNavigationStore } from '@/shared/model/navigationStore';

// Импортируем наши порталы
import { DispatchPortal } from '../widgets/dispatch-portal';
import { MdtPortal } from '../widgets/mdt-portal';

// Простые тестовые компоненты для проверки работы
const TestModule: React.FC<{ name: string; description: string }> = ({ name, description }) => (
  <div className="p-6 text-center">
    <h2 className="text-2xl font-bold text-slate-100 mb-4">{name}</h2>
    <p className="text-slate-400 mb-6">{description}</p>
    <div className="bg-slate-700/50 p-4 rounded-lg">
      <p className="text-slate-300">Это тестовый модуль для проверки работы системы</p>
    </div>
  </div>
);

export const DashboardPage: React.FC = () => {
  const { t } = useLocale();
  const { selectDepartment, selectModule, activeModuleId, activeDepartmentId, resetNavigation } = useNavigationStore();

  const modules = [
    {
      id: 'person-search',
      title: 'Поиск граждан',
      description: 'Поиск и управление данными граждан',
      icon: Search,
      color: 'bg-blue-600',
      category: 'law-enforcement'
    },
    {
      id: 'citizen-management',
      title: 'Управление гражданами',
      description: 'Создание и редактирование профилей граждан',
      icon: Users,
      color: 'bg-green-600',
      category: 'civil'
    },
    {
      id: 'vehicle-registration',
      title: 'Регистрация транспорта',
      description: 'Регистрация и управление транспортными средствами',
      icon: Car,
      color: 'bg-yellow-600',
      category: 'civil'
    },
    {
      id: 'weapon-registration',
      title: 'Регистрация оружия',
      description: 'Регистрация и управление оружием',
      icon: Shield,
      color: 'bg-red-600',
      category: 'civil'
    },
    {
      id: 'emergency-calls',
      title: 'Экстренные вызовы',
      description: 'Управление вызовами 911',
      icon: Siren,
      color: 'bg-red-500',
      category: 'dispatch'
    },
    {
      id: 'law-enforcement',
      title: 'Правоохранительные органы',
      description: 'Панель управления для LEO',
      icon: Gavel,
      color: 'bg-blue-500',
      category: 'law-enforcement'
    },
    {
      id: 'ems',
      title: 'Система EMS',
      description: 'Управление медицинскими службами',
      icon: Ambulance,
      color: 'bg-green-500',
      category: 'ems'
    },
    {
      id: 'fire',
      title: 'Пожарная служба',
      description: 'Управление пожарными службами',
      icon: Truck,
      color: 'bg-orange-500',
      category: 'fire'
    },
    {
      id: 'dispatch',
      title: 'Диспетчерская система',
      description: 'Управление диспетчерскими службами',
      icon: Radio,
      color: 'bg-purple-500',
      category: 'dispatch'
    },
    {
      id: 'reports',
      title: 'Отчеты',
      description: 'Создание и управление отчетами',
      icon: FileText,
      color: 'bg-gray-600',
      category: 'admin'
    },
    {
      id: 'admin-panel',
      title: 'Административная панель',
      description: 'Управление системой',
      icon: Cog,
      color: 'bg-indigo-600',
      category: 'admin'
    }
  ];

  const handleModuleClick = (moduleId: string) => {
    console.log('=== handleModuleClick DEBUG ===');
    console.log('moduleId:', moduleId);
    console.log('Current state - activeDepartmentId:', activeDepartmentId);
    console.log('Current state - activeModuleId:', activeModuleId);
    
    // Для департаментов - выбираем департамент
    if (['law-enforcement', 'dispatch', 'ems', 'fire'].includes(moduleId)) {
      console.log('✅ Selecting department:', moduleId);
      selectDepartment(moduleId);
      console.log('✅ selectDepartment called');
    } else {
      // Для остальных модулей - выбираем модуль
      console.log('✅ Selecting module:', moduleId);
      selectModule(moduleId);
      console.log('✅ selectModule called');
    }
    
    console.log('=== END DEBUG ===');
  };

  const renderModuleContent = () => {
    console.log('=== renderModuleContent DEBUG ===');
    console.log('activeDepartmentId:', activeDepartmentId);
    console.log('activeModuleId:', activeModuleId);
    
    // Проверяем активный департамент
    if (activeDepartmentId) {
      console.log('✅ Rendering department:', activeDepartmentId);
      switch (activeDepartmentId) {
        case 'law-enforcement':
          console.log('✅ Rendering MdtPortal');
          return (
            <MdtPortal onBackToModules={() => resetNavigation()} />
          );
        
        case 'dispatch':
          console.log('✅ Rendering DispatchPortal');
          return (
            <DispatchPortal onBackToModules={() => resetNavigation()} />
          );
        
        case 'ems':
          console.log('✅ Rendering EMS placeholder');
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Система EMS</h1>
                <Button 
                  variant="outline" 
                  onClick={() => resetNavigation()}
                >
                  Назад к панели
                </Button>
              </div>
              <div className="text-center py-8 text-secondary-400">
                <Ambulance className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Портал EMS будет доступен в следующем обновлении</p>
              </div>
            </div>
          );
        
        case 'fire':
          console.log('✅ Rendering Fire Department placeholder');
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Пожарная служба</h1>
                <Button 
                  variant="outline" 
                  onClick={() => resetNavigation()}
                >
                  Назад к панели
                </Button>
              </div>
              <div className="text-center py-8 text-secondary-400">
                <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Портал пожарной службы будет доступен в следующем обновлении</p>
              </div>
            </div>
          );
      }
    }

    // Проверяем активный модуль
    if (activeModuleId) {
      console.log('✅ Rendering module:', activeModuleId);
      switch (activeModuleId) {
        case 'person-search':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Поиск граждан</h1>
                <Button 
                  variant="outline" 
                  onClick={() => resetNavigation()}
                >
                  Назад к панели
                </Button>
              </div>
              <PersonSearchWidget />
            </div>
          );
        
        case 'citizen-management':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Управление гражданами</h1>
                <Button 
                  variant="outline" 
                  onClick={() => resetNavigation()}
                >
                  Назад к панели
                </Button>
              </div>
              <div className="text-center py-8 text-secondary-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Модуль управления гражданами будет доступен в следующем обновлении</p>
              </div>
            </div>
          );
        
        case 'vehicle-registration':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Регистрация транспорта</h1>
                <Button 
                  variant="outline" 
                  onClick={() => resetNavigation()}
                >
                  Назад к панели
                </Button>
              </div>
              <div className="text-center py-8 text-secondary-400">
                <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Модуль регистрации транспорта будет доступен в следующем обновлении</p>
              </div>
            </div>
          );
        
        case 'weapon-registration':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Регистрация оружия</h1>
                <Button 
                  variant="outline" 
                  onClick={() => resetNavigation()}
                >
                  Назад к панели
                </Button>
              </div>
              <div className="text-center py-8 text-secondary-400">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Модуль регистрации оружия будет доступен в следующем обновлении</p>
              </div>
            </div>
          );
        
        case 'emergency-calls':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Экстренные вызовы</h1>
                <Button 
                  variant="outline" 
                  onClick={() => resetNavigation()}
                >
                  Назад к панели
                </Button>
              </div>
              <div className="text-center py-8 text-secondary-400">
                <Siren className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Модуль экстренных вызовов будет доступен в следующем обновлении</p>
              </div>
            </div>
          );
        
        case 'reports':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Отчеты</h1>
                <Button 
                  variant="outline" 
                  onClick={() => resetNavigation()}
                >
                  Назад к панели
                </Button>
              </div>
              <div className="text-center py-8 text-secondary-400">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Модуль отчетов будет доступен в следующем обновлении</p>
              </div>
            </div>
          );
        
        case 'admin-panel':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Административная панель</h1>
                <Button 
                  variant="outline" 
                  onClick={() => resetNavigation()}
                >
                  Назад к панели
                </Button>
              </div>
              <div className="text-center py-8 text-secondary-400">
                <Cog className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Административная панель будет доступна в следующем обновлении</p>
              </div>
            </div>
          );
      }
    }

    // Если ничего не выбрано - показываем сетку модулей
    console.log('✅ Rendering module grid');
    console.log('=== END renderModuleContent DEBUG ===');
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card 
              key={module.id} 
              className="cursor-pointer hover:bg-secondary-800 transition-colors"
              onClick={() => handleModuleClick(module.id)}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${module.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {module.title}
                    </h3>
                    <p className="text-sm text-secondary-400">
                      {module.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {!activeDepartmentId && !activeModuleId && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Панель управления MDT
          </h1>
          <p className="text-secondary-400">
            Выберите модуль для работы с системой
          </p>
        </div>
      )}
      
      {renderModuleContent()}
    </div>
  );
}; 
