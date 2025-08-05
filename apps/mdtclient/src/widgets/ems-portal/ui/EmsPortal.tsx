import { EmsCallList } from '@/features/ems-call-management';
import { PatientSearch } from '@/features/patient-management';
import { ShiftManagement } from '@/features/shift-management';
import { UnitList } from '@/features/unit-management';
import { Card } from '@/shared/ui/atoms/Card';
import {
  AlertTriangle,
  Ambulance,
  BarChart3,
  Calendar,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Phone,
  Settings,
  User,
} from 'lucide-react';
import React, { useState } from 'react';

// Interfaces for placeholder components
interface EmsReportsListProps {
  onCreate: () => void;
  showCreateButton: boolean;
}
interface EmsReportFormProps {
  isOpen: boolean;
  onClose: () => void;
}
interface EmsPersonnelListProps {
  showCreateButton: boolean;
}

// ВРЕМЕННЫЕ ЗАГЛУШКИ
const EmsReportsList: React.FC<EmsReportsListProps> = () => (
  <div className="text-yellow-500">[EmsReportsList Placeholder]</div>
);
const EmsReportForm: React.FC<EmsReportFormProps> = () => (
  <div className="text-yellow-500">[EmsReportForm Placeholder]</div>
);
const EmsPersonnelList: React.FC<EmsPersonnelListProps> = () => (
  <div className="text-yellow-500">[EmsPersonnelList Placeholder]</div>
);

export const EmsPortal: React.FC = () => {
  const [activeView, setActiveView] = useState<
    'dashboard' | 'calls' | 'units' | 'reports' | 'personnel' | 'shifts' | 'patients'
  >('dashboard');
  const [showReportForm, setShowReportForm] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Панель управления', icon: LayoutDashboard },
    { id: 'calls', label: 'Активные инциденты', icon: Phone },
    { id: 'units', label: 'Управление юнитами', icon: Ambulance },
    { id: 'reports', label: 'Рапорты', icon: FileText },
    { id: 'personnel', label: 'Сотрудники', icon: Users },
    { id: 'shifts', label: 'Журнал смен', icon: Calendar },
    { id: 'patients', label: 'Пациенты', icon: User },
  ] as const;

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Ambulance className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-secondary-400">Активных парамедиков</p>
              <p className="text-2xl font-bold text-white">8</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-secondary-400">Отчетов сегодня</p>
              <p className="text-2xl font-bold text-white">12</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-secondary-400">Активных вызовов</p>
              <p className="text-2xl font-bold text-white">5</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-secondary-400">Пациентов сегодня</p>
              <p className="text-2xl font-bold text-white">15</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmsCallList maxItems={3} showActiveOnly={true} />
        <UnitList maxItems={3} />
      </div>

      {/* Дополнительные виджеты */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Статистика EMS</h3>
          </div>
          <div className="space-y-2 text-sm text-secondary-300">
            <div className="flex justify-between">
              <span>Вызовов сегодня:</span>
              <span className="text-white">23</span>
            </div>
            <div className="flex justify-between">
              <span>Среднее время ответа:</span>
              <span className="text-white">4.2 мин</span>
            </div>
            <div className="flex justify-between">
              <span>Спасенных жизней:</span>
              <span className="text-white">7</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Быстрые действия</h3>
          </div>
          <div className="space-y-2">
            <button
              className="w-full text-left p-2 hover:bg-secondary-700 rounded text-sm transition-colors"
              onClick={() => setShowReportForm(true)}
            >
              Создать медицинский отчет
            </button>
            <button className="w-full text-left p-2 hover:bg-secondary-700 rounded text-sm transition-colors">
              Назначить юнит на вызов
            </button>
            <button className="w-full text-left p-2 hover:bg-secondary-700 rounded text-sm transition-colors">
              Просмотр карты
            </button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Уведомления</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="p-2 bg-red-900/20 border border-red-700 rounded">
              <div className="font-semibold text-red-400">Критический вызов!</div>
              <div className="text-red-300">EMS-1 на месте</div>
            </div>
            <div className="p-2 bg-yellow-900/20 border border-yellow-700 rounded">
              <div className="font-semibold text-yellow-400">Новый отчет</div>
              <div className="text-yellow-300">Требует проверки</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderCalls = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Активные инциденты</h2>
      </div>
      <EmsCallList showActiveOnly={true} />
    </div>
  );

  const renderUnits = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Управление юнитами</h2>
      </div>
      <UnitList />
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Система отчетов</h2>
      </div>
      <EmsReportsList onCreate={() => setShowReportForm(true)} showCreateButton={true} />
    </div>
  );

  const renderPersonnel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Управление персоналом</h2>
      </div>
      <EmsPersonnelList showCreateButton={true} />
    </div>
  );

  const renderShifts = () => (
    <div className="space-y-6">
      <ShiftManagement />
    </div>
  );

  const renderPatients = () => (
    <div className="space-y-6">
      <PatientSearch />
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return renderDashboard();
      case 'calls':
        return renderCalls();
      case 'units':
        return renderUnits();
      case 'reports':
        return renderReports();
      case 'personnel':
        return renderPersonnel();
      case 'shifts':
        return renderShifts();
      case 'patients':
        return renderPatients();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">EMS Департамент</h2>
        <div className="flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-red-400" />
          <span className="text-sm text-secondary-400">Статус системы: Онлайн</span>
        </div>
      </div>

      {/* Навигация */}
      <div className="flex border-b border-secondary-700 overflow-x-auto">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeView === item.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-secondary-400 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Контент */}
      <div className="min-h-[600px]">{renderContent()}</div>

      {/* Модальное окно создания отчета */}
      <EmsReportForm isOpen={showReportForm} onClose={() => setShowReportForm(false)} />
    </div>
  );
}; 
