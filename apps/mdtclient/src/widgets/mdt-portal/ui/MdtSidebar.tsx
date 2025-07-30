import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/atoms/Button';
import { useMdtPortalStore } from '../model/store';
import { 
  Search, 
  Car, 
  FileText, 
  Users, 
  Calendar, 
  Gavel,
  MapPin,
  Home,
  Phone,
  AlertTriangle,
  ArrowLeft,
  Building
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  category: 'main' | 'search' | 'management' | 'tools';
}

const navigationItems: NavigationItem[] = [
  // Основные функции
  { 
    id: 'citizen-search', 
    label: 'Поиск граждан', 
    icon: Search,
    description: 'Поиск и управление гражданскими профилями',
    category: 'search'
  },
  { 
    id: 'vehicle-search', 
    label: 'Поиск ТС', 
    icon: Car,
    description: 'Поиск и регистрация транспортных средств',
    category: 'search'
  },
  { 
    id: 'reports', 
    label: 'Создать отчет', 
    icon: FileText,
    description: 'Создание отчетов об инцидентах',
    category: 'main'
  },
  { 
    id: 'officers', 
    label: 'Офицеры', 
    icon: Users,
    description: 'Управление персоналом правоохранительных органов',
    category: 'management'
  },
  { 
    id: 'shifts', 
    label: 'Журнал смен', 
    icon: Calendar,
    description: 'Отслеживание смен и активности офицеров',
    category: 'management'
  },
  { 
    id: 'codes', 
    label: 'Кодексы', 
    icon: Gavel,
    description: 'Справочник законодательства',
    category: 'tools'
  },
  { 
    id: 'map', 
    label: 'Карта', 
    icon: MapPin,
    description: 'Интерактивная карта оперативной обстановки',
    category: 'tools'
  }
];

const categoryLabels = {
  main: 'Основные функции',
  search: 'Поиск',
  management: 'Управление',
  tools: 'Инструменты'
};

interface MdtSidebarProps {
  onBackToModules?: () => void;
}

export const MdtSidebar: React.FC<MdtSidebarProps> = ({ onBackToModules }) => {
  const { goToDashboard, goToModule, currentView, activeModule } = useMdtPortalStore();
  const navigate = useNavigate();

  const groupedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  // Функция для возврата к выбору департаментов
  const handleBackToDepartments = () => {
    if (onBackToModules) {
      // Если передана функция обратного вызова, используем её
      onBackToModules();
    } else {
      // Иначе используем React Router для навигации
      navigate('/');
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-blue-500/20">
      {/* Название терминала */}
      <div className="mb-6 p-3 bg-red-600/20 border border-red-600/50 rounded-lg">
        <h1 className="text-red-400 text-glow-red">Synapse Terminal</h1>
      </div>

      {/* Кнопка возврата к выбору департаментов */}
      <div className="mb-4">
        <Button 
          variant="outline"
          size="sm" 
          onClick={handleBackToDepartments}
          className="w-full justify-start text-xs"
        >
          <ArrowLeft className="h-3 w-3 mr-2" />
          Выбор департаментов
        </Button>
      </div>

      {/* Кнопка возврата на дашборд */}
      <div className="mb-6">
        <Button 
          variant="outline"
          size="sm" 
          onClick={goToDashboard}
          className={`w-full justify-start ${
            currentView === 'dashboard' ? 'text-blue-400' : ''
          }`}
        >
          <Home className="h-4 w-4 mr-2" />
          Оперативный дашборд
        </Button>
      </div>

      {/* Навигация по модулям */}
      <div className="flex-1 space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-xs font-medium text-secondary-400 uppercase tracking-wider mb-2">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h3>
            <div className="space-y-1">
              {items.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => goToModule(item.id)}
                  className={`w-full justify-start h-8 text-sm ${
                    currentView === 'module' && activeModule === item.id ? 'text-blue-400' : ''
                  }`}
                  title={item.description}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Быстрые действия внизу */}
      <div className="pt-4 border-t border-secondary-700">
        <h3 className="text-xs font-medium text-secondary-400 uppercase tracking-wider mb-2">
          Быстрые действия
        </h3>
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-sm">
            <Phone className="h-4 w-4 mr-2" />
            Вызов 911
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Кнопка паники
          </Button>
        </div>
      </div>
    </div>
  );
};
