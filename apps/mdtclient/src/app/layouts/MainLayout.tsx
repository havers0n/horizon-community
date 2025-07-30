import React from 'react';
import { useNavigationStore } from '@/shared/model/navigationStore';
import { ModuleContent } from '@/app/components/ModuleContent';
import { Button } from '@/shared/ui/atoms';
import { ArrowLeft, Home, Search, FileText, Users, Calendar, Key, MapPin, Phone } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { 
    activeDepartmentId, 
    getActiveDepartment,
    resetNavigation 
  } = useNavigationStore();

  const activeDepartment = getActiveDepartment();

  if (!activeDepartment) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Ошибка загрузки департамента</h1>
          <Button onClick={resetNavigation}>
            Вернуться к выбору департамента
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="flex h-screen">
        {/* MdtSidebar - левая панель */}
        <aside className="w-80 bg-slate-900/80 backdrop-blur-md border-r border-blue-500/20 overflow-y-auto">
          <div className="p-6">
            {/* Заголовок Synapse Terminal */}
            <div className="mb-8">
              <div className="mb-4">
                <h1 className="text-xl font-bold text-glow-red">SYNAPSE TERMINAL</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-400 text-xs">ONLINE</span>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={resetNavigation}
                className="w-full bg-slate-800/50 border-slate-600/30 text-white hover:bg-slate-700/50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Выбор департаментов
              </Button>
            </div>

            {/* Навигационные секции */}
            <div className="space-y-6">
              {/* Оперативный дашборд */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">ОПЕРАТИВНЫЙ ДАШБОРД</h3>
                <div className="space-y-2">
                  <div className="nav-item active">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <Home className="h-4 w-4 nav-icon text-blue-400" />
                    <span className="text-blue-400 text-sm">Оперативный дашборд</span>
                  </div>
                </div>
              </div>

              {/* Поиск */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">ПОИСК</h3>
                <div className="space-y-2">
                  <div className="nav-item">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <Search className="h-4 w-4 nav-icon text-slate-400" />
                    <span className="text-slate-300 text-sm">Поиск граждан</span>
                  </div>
                  <div className="nav-item">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <Search className="h-4 w-4 nav-icon text-slate-400" />
                    <span className="text-slate-300 text-sm">Поиск ТС</span>
                  </div>
                </div>
              </div>

              {/* Основные функции */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">ОСНОВНЫЕ ФУНКЦИИ</h3>
                <div className="space-y-2">
                  <div className="nav-item">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <FileText className="h-4 w-4 nav-icon text-slate-400" />
                    <span className="text-slate-300 text-sm">Создать отчет</span>
                  </div>
                </div>
              </div>

              {/* Управление */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">УПРАВЛЕНИЕ</h3>
                <div className="space-y-2">
                  <div className="nav-item">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <Users className="h-4 w-4 nav-icon text-slate-400" />
                    <span className="text-slate-300 text-sm">Офицеры</span>
                  </div>
                  <div className="nav-item">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <Calendar className="h-4 w-4 nav-icon text-slate-400" />
                    <span className="text-slate-300 text-sm">Журнал смен</span>
                  </div>
                </div>
              </div>

              {/* Инструменты */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">ИНСТРУМЕНТЫ</h3>
                <div className="space-y-2">
                  <div className="nav-item">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <Key className="h-4 w-4 nav-icon text-slate-400" />
                    <span className="text-slate-300 text-sm">Кодексы</span>
                  </div>
                  <div className="nav-item">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <MapPin className="h-4 w-4 nav-icon text-slate-400" />
                    <span className="text-slate-300 text-sm">Карта</span>
                  </div>
                </div>
              </div>

              {/* Быстрые действия */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">БЫСТРЫЕ ДЕЙСТВИЯ</h3>
                <div className="space-y-2">
                  <div className="nav-item">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <Phone className="h-4 w-4 nav-icon text-slate-400" />
                    <span className="text-slate-300 text-sm">Вызов 911</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Системная информация */}
            <div className="mt-8 pt-6 border-t border-slate-700/30">
              <div className="card-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-xs">СИСТЕМА</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-xs">ONLINE</span>
                  </div>
                </div>
                <div className="text-slate-400 text-xs">
                  <div>Версия: 2.1.4</div>
                  <div>Время: 14:35:42</div>
                  <div>Пинг: 12ms</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Основной контент */}
        <main className="flex-1 overflow-auto p-6">
          <ModuleContent />
        </main>
      </div>
    </div>
  );
}; 
