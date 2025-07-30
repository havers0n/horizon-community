import React from 'react';
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
import { CitizenSearchWidget } from '../features/citizen-search/ui/CitizenSearchWidget';
import { VehicleSearchWidget } from '../features/vehicle-search/ui/VehicleSearchWidget';
import { WeaponSearchWidget } from '../features/weapon-search/ui/WeaponSearchWidget';
import { AddressSearchWidget } from '../features/address-search/ui/AddressSearchWidget';
import { ReportCreationWidget } from '../features/report-creation/ui/ReportCreationWidget';
import { LawReportsList } from './LawReportsList';
import type { LawReport } from '../model/types';

interface LawControlPanelNewProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const LawControlPanelNew: React.FC<LawControlPanelNewProps> = ({ activeView, onViewChange }) => {
  const { t } = useLocale();
  const { reports, deleteReport } = useLawEnforcementStore();
  
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

  const handleDeleteReport = (reportId: string) => {
    deleteReport(reportId);
  };

  const handleEditReport = (report: LawReport) => {
    // TODO: Реализовать редактирование отчета
    console.log('Edit report:', report);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'person-search':
        return <CitizenSearchWidget />;
      case 'vehicle-search':
        return <VehicleSearchWidget />;
      case 'weapon-search':
        return <WeaponSearchWidget />;
      case 'address-search':
        return <AddressSearchWidget />;
      case 'create-report':
        return <ReportCreationWidget />;
      case 'reports-list':
        return (
          <LawReportsList 
            reports={reports}
            onDelete={handleDeleteReport}
            onEdit={handleEditReport}
          />
        );
      case 'notebook':
        return (
          <div className="text-center py-8 text-secondary-400">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Блокнот будет доступен в следующем обновлении</p>
          </div>
        );
      case 'signals':
        return (
          <div className="text-center py-8 text-secondary-400">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Система сигналов будет доступна в следующем обновлении</p>
          </div>
        );
      default:
        return <CitizenSearchWidget />;
    }
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

      {renderActiveView()}
    </div>
  );
};
