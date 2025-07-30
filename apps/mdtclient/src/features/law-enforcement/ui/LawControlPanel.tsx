import React, { useState } from 'react';
import { Button } from '../../../shared/ui/atoms';
import { 
  User, 
  Car, 
  Shield, 
  MapPin, 
  FileText, 
  BookOpen, 
  Bell, 
  Plus 
} from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { useLawEnforcementStore } from '../model/store';
import { PersonSearch } from './PersonSearch';
import { VehicleSearch } from './VehicleSearch';
import { WeaponSearch } from './WeaponSearch';
import { AddressSearch } from './AddressSearch';
import { LawReportForm } from './LawReportForm';
import { LawReportsList } from './LawReportsList';
import type { LawReport } from '../model/types';

interface LawControlPanelProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const LawControlPanel: React.FC<LawControlPanelProps> = ({ activeView, onViewChange }) => {
  const { t } = useLocale();
  const { reports, addReport, deleteReport } = useLawEnforcementStore();
  const [showReportForm, setShowReportForm] = useState(false);
  
  const navItems = [
    { name: 'person-search', icon: User, label: t('lawControl.personSearch') },
    { name: 'vehicle-search', icon: Car, label: t('lawControl.vehicleSearch') },
    { name: 'weapon-search', icon: Shield, label: t('lawControl.weaponSearch') },
    { name: 'address-search', icon: MapPin, label: t('lawControl.addressSearch') },
    { name: 'create-report', icon: FileText, label: 'Составить отчет' },
    { name: 'reports-list', icon: FileText, label: 'Отчеты' },
    { name: 'notebook', icon: BookOpen, label: t('lawControl.notebook') },
    { name: 'signals', icon: Bell, label: t('lawControl.signals') },
  ];

  const handleCreateReport = (report: LawReport) => {
    addReport(report);
    setShowReportForm(false);
  };

  const handleDeleteReport = (reportId: string) => {
    deleteReport(reportId);
  };

  const handleEditReport = (report: LawReport) => {
    // TODO: Реализовать редактирование отчета
    console.log('Edit report:', report);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b-2 border-secondary-700/50 pb-2 mb-4 overflow-x-auto">
        {navItems.map(item => (
          <Button 
            key={item.name}
            variant={activeView === item.name ? 'primary' : 'secondary'}
            onClick={() => onViewChange(item.name)}
            className={`!px-4 !py-2 !rounded-b-none !rounded-t-md whitespace-nowrap ${activeView !== item.name && '!bg-transparent border-b-0'}`}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </div>

      {activeView === 'person-search' && <PersonSearch />}
      {activeView === 'vehicle-search' && <VehicleSearch />}
      {activeView === 'weapon-search' && <WeaponSearch />}
      {activeView === 'address-search' && <AddressSearch />}
      {activeView === 'create-report' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Составить отчет</h2>
            <Button onClick={() => setShowReportForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Новый отчет
            </Button>
          </div>
          <div className="bg-secondary-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Инструкция</h3>
            <p className="text-secondary-300 mb-4">
              Для составления отчета нажмите кнопку "Новый отчет". Форма состоит из двух страниц:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-secondary-700 p-4 rounded-md">
                <h4 className="font-semibold text-white mb-2">Страница 1 - Основная информация</h4>
                <ul className="text-sm text-secondary-300 space-y-1">
                  <li>• Имя гражданского</li>
                  <li>• Адрес инцидента</li>
                  <li>• Время инцидента</li>
                  <li>• Тип инцидента</li>
                  <li>• Статья</li>
                  <li>• Тип санкции</li>
                  <li>• Описание ситуации</li>
                </ul>
              </div>
              <div className="bg-secondary-700 p-4 rounded-md">
                <h4 className="font-semibold text-white mb-2">Страница 2 - Дополнительная информация</h4>
                <ul className="text-sm text-secondary-300 space-y-1">
                  <li>• Транспорт подозреваемого</li>
                  <li>• Изъятые вещи</li>
                  <li>• Оружие подозреваемого</li>
                  <li>• Дополнительные флаги</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeView === 'reports-list' && (
        <LawReportsList 
          reports={reports}
          onDelete={handleDeleteReport}
          onEdit={handleEditReport}
        />
      )}
      {activeView === 'notebook' && (
        <div className="text-center py-8 text-secondary-400">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Блокнот будет доступен в следующем обновлении</p>
        </div>
      )}
      {activeView === 'signals' && (
        <div className="text-center py-8 text-secondary-400">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Система сигналов будет доступна в следующем обновлении</p>
        </div>
      )}

      {showReportForm && (
        <LawReportForm
          onSubmit={handleCreateReport}
          onClose={() => setShowReportForm(false)}
        />
      )}
    </div>
  );
};
