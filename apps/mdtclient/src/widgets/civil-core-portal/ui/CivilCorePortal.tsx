import React from 'react';
import { Users, UserPlus, Car, Shield, FileText, Building, User } from 'lucide-react';
import { Button } from '@/shared/ui/atoms/Button';
import { useCoreNavigationStore } from '@/shared/model/coreNavigationStore';

interface CivilModule {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  action?: () => void;
}

export const CivilCorePortal: React.FC = () => {
  const { switchCore } = useCoreNavigationStore();

  const handleModuleClick = (moduleId: string) => {
    console.log(`Civil module clicked: ${moduleId}`);
    
    // Специальная обработка для гражданского портала
    if (moduleId === 'citizen-portal') {
      // Переключаемся на гражданский портал
      console.log('Switching to Citizen Portal');
      switchCore('citizen-portal');
    }
  };

  const civilModules: CivilModule[] = [
    {
      id: 'citizen-portal',
      name: 'Гражданский портал',
      icon: User,
      description: 'Управление персонажами и их биографией',
      color: 'from-indigo-600/20 to-indigo-800/20 border-indigo-500/30',
      action: () => handleModuleClick('citizen-portal')
    },
    {
      id: 'citizen-registration',
      name: 'Регистрация граждан',
      icon: UserPlus,
      description: 'Создание и управление гражданскими профилями',
      color: 'from-blue-600/20 to-blue-800/20 border-blue-500/30'
    },
    {
      id: 'vehicle-registration',
      name: 'Регистрация ТС',
      icon: Car,
      description: 'Регистрация и управление транспортными средствами',
      color: 'from-green-600/20 to-green-800/20 border-green-500/30'
    },
    {
      id: 'weapon-registration',
      name: 'Регистрация оружия',
      icon: Shield,
      description: 'Регистрация и управление оружием',
      color: 'from-red-600/20 to-red-800/20 border-red-500/30'
    },
    {
      id: 'documents',
      name: 'Документы',
      icon: FileText,
      description: 'Управление документами и лицензиями',
      color: 'from-purple-600/20 to-purple-800/20 border-purple-500/30'
    },
    {
      id: 'companies',
      name: 'Компании',
      icon: Building,
      description: 'Регистрация и управление компаниями',
      color: 'from-orange-600/20 to-orange-800/20 border-orange-500/30'
    },
    {
      id: 'citizen-search',
      name: 'Поиск граждан',
      icon: Users,
      description: 'Поиск и просмотр гражданских профилей',
      color: 'from-cyan-600/20 to-cyan-800/20 border-cyan-500/30'
    }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Гражданское ядро
          </h1>
          <p className="text-slate-400">
            Портал для гражданских активностей и регистрации
          </p>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {civilModules.map((module) => {
            const Icon = module.icon;
            
            return (
              <Button
                key={module.id}
                variant="outline"
                className={`
                  h-40 p-6 text-left bg-gradient-to-br ${module.color}
                  border-2 hover:border-opacity-60 transition-all duration-200
                  hover:scale-105 hover:shadow-lg
                  group
                `}
                onClick={() => module.action ? module.action() : handleModuleClick(module.id)}
              >
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-start justify-between">
                    <Icon className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {module.name}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Статистика */}
      <div className="p-6 border-t border-slate-700/50 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">1,247</div>
              <div className="text-sm text-slate-400">Зарегистрированных граждан</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">892</div>
              <div className="text-sm text-slate-400">Транспортных средств</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">156</div>
              <div className="text-sm text-slate-400">Зарегистрированного оружия</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">89</div>
              <div className="text-sm text-slate-400">Активных компаний</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 