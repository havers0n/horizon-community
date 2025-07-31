// @ts-nocheck - TODO: Remove after major refactoring is complete
import React from 'react';
import { PersonSearchWidget } from '@/features/law-enforcement/features/citizen-search/ui/PersonSearchWidget';
import { VehicleSearch } from '@/features/vehicle-registration';
import { UnitList } from '@/features/unit-management';
import { ShiftManagement } from '@/features/shift-management';
import { 
  Search, 
  Car, 
  FileText, 
  Users, 
  Calendar, 
  Gavel,
  MapPin,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/shared/ui/atoms/Button';
import { Card } from '@/shared/ui/atoms/Card';
import { useMdtPortalStore } from '../model/store';

interface ModuleRendererProps {
  moduleId: string;
}

interface Module {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  component: React.ReactNode;
  description: string;
}

const modules: Module[] = [
  { 
    id: 'citizen-search', 
    label: 'Поиск граждан', 
    icon: Search,
    component: <PersonSearchWidget />,
    description: 'Поиск и управление гражданскими профилями'
  },
  { 
    id: 'vehicle-search', 
    label: 'Поиск ТС', 
    icon: Car,
    component: <VehicleSearch />,
    description: 'Поиск и регистрация транспортных средств'
  },
  { 
    id: 'reports', 
    label: 'Создать отчет', 
    icon: FileText,
    component: <div className="p-6 text-center text-secondary-400">
      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <h3 className="text-lg font-semibold text-white mb-2">Отчеты</h3>
      <p>Создание отчетов об инцидентах</p>
    </div>,
    description: 'Создание отчетов об инцидентах'
  },
  { 
    id: 'officers', 
    label: 'Офицеры', 
    icon: Users,
    component: <UnitList showActiveOnly={false} />,
    description: 'Управление персоналом правоохранительных органов'
  },
  { 
    id: 'shifts', 
    label: 'Журнал смен', 
    icon: Calendar,
    component: <ShiftManagement />,
    description: 'Отслеживание смен и активности офицеров'
  },
  { 
    id: 'codes', 
    label: 'Кодексы', 
    icon: Gavel,
    component: <div className="p-6 text-center text-secondary-400">
      <Gavel className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <h3 className="text-lg font-semibold text-white mb-2">Кодексы</h3>
      <p>Справочник статей уголовного/административного/дорожного кодексов</p>
    </div>,
    description: 'Справочник законодательства'
  },
  { 
    id: 'map', 
    label: 'Карта', 
    icon: MapPin,
    component: <div className="p-6 text-center text-secondary-400">
      <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <h3 className="text-lg font-semibold text-white mb-2">Карта</h3>
      <p>Интерактивная карта с отображением юнитов и инцидентов</p>
    </div>,
    description: 'Интерактивная карта оперативной обстановки'
  }
];

export const ModuleRenderer: React.FC<ModuleRendererProps> = ({ moduleId }) => {
  const { goToDashboard } = useMdtPortalStore();
  
  const activeModule = modules.find(module => module.id === moduleId);

  if (!activeModule) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-secondary-400">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-white mb-2">Модуль не найден</h3>
          <p>Запрошенный модуль не существует</p>
          <Button 
            variant="outline" 
            onClick={goToDashboard}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться на дашборд
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок модуля */}
      <div className="flex items-center justify-between mb-6 p-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToDashboard}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            На дашборд
          </Button>
          <div className="flex items-center gap-2">
            <activeModule.icon className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">{activeModule.label}</h2>
          </div>
        </div>
      </div>

      {/* Контент модуля */}
      <div className="flex-1 min-h-0">
        {activeModule.component}
      </div>
    </div>
  );
};
