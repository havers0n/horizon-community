import { CitizenSearch } from '@/features/citizen-management';
import { ShiftManagement } from '@/features/shift-management';
import { UnitList } from '@/features/unit-management';
import { VehicleSearch } from '@/features/vehicle-registration';
import { ReportsList } from '@/features/reports-management/ui/ReportsList';
import { Button } from '@/shared/ui/atoms/Button';
import { Card } from '@/shared/ui/atoms/Card';
import { useMdtPortalStore } from '@/widgets/mdt-portal/model/store';
import {
  ArrowLeft,
  Car,
  Calendar,
  FileText,
  Gavel,
  MapPin,
  Search,
  Shield,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';

interface Module {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  component: React.ReactNode;
  description: string;
}

export const MdtWorkspaceWidget: React.FC = () => {
  const { activeModule, goToDashboard } = useMdtPortalStore();
  const [localActiveModule, setLocalActiveModule] = useState(activeModule || 'search');

  const modules: Module[] = [
    {
      id: 'search',
      label: 'Поиск граждан',
      icon: Search,
      component: <CitizenSearch />,
      description: 'Поиск и управление гражданскими профилями',
    },
    {
      id: 'vehicles',
      label: 'Поиск ТС',
      icon: Car,
      component: <VehicleSearch />,
      description: 'Поиск и регистрация транспортных средств',
    },
    {
      id: 'reports',
      label: 'Создать отчет',
      icon: FileText,
      component: <ReportsList />,
      description: 'Создание отчетов об инцидентах',
    },
    {
      id: 'officers',
      label: 'Офицеры',
      icon: Users,
      component: <UnitList showActiveOnly={false} />,
      description: 'Управление персоналом правоохранительных органов',
    },
    {
      id: 'shifts',
      label: 'Журнал смен',
      icon: Calendar,
      component: <ShiftManagement />,
      description: 'Отслеживание смен и активности офицеров',
    },
    {
      id: 'codes',
      label: 'Кодексы',
      icon: Gavel,
      component: (
        <div className="p-6 text-center text-secondary-400">
          <Gavel className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-white mb-2">Кодексы</h3>
          <p>Справочник статей уголовного/административного/дорожного кодексов</p>
        </div>
      ),
      description: 'Справочник законодательства',
    },
    {
      id: 'map',
      label: 'Карта',
      icon: MapPin,
      component: (
        <div className="p-6 text-center text-secondary-400">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-white mb-2">Карта</h3>
          <p>Интерактивная карта с отображением юнитов и инцидентов</p>
        </div>
      ),
      description: 'Интерактивная карта оперативной обстановки',
    },
  ];

  const activeModuleData = modules.find((module) => module.id === localActiveModule);

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок с кнопкой возврата */}
      <div className="flex items-center justify-between mb-4">
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
            <Shield className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Рабочая область</h2>
          </div>
        </div>
      </div>

      {/* Панель навигации */}
      <Card className="mb-4 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-medium text-white">Модули правоохранительных органов</h3>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {modules.map((module) => (
            <Button
              key={module.id}
              variant={localActiveModule === module.id ? 'default' : 'outline'}
              size="sm"
              className="h-10 text-xs flex flex-col items-center justify-center gap-1"
              onClick={() => setLocalActiveModule(module.id)}
              title={module.description}
            >
              <module.icon className="h-3 w-3" />
              <span className="text-xs leading-tight">{module.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Рабочая область */}
      <Card className="flex-1 min-h-0">
        <div className="h-full">{activeModuleData?.component}</div>
      </Card>
    </div>
  );
};
