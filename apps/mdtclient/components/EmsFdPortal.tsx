
import React, { useMemo, useState } from 'react';
import { Button, Card, CardHeader } from './ui/Theme';
import { LayoutDashboard, Handshake, Ambulance, FileText, MapPin } from 'lucide-react';
import { PatientSearch } from './PatientSearch';
import { ReportsPortal } from './ReportsPortal';
import { MOCK_REPORTS, MOCK_UNITS } from '../constants';
import type { Unit } from '../types';
import { UnitStatus } from '../types';

interface EmsFdPortalProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const EmsFdStatusPanel: React.FC = () => {
    const [unit, setUnit] = useState<Unit>(MOCK_UNITS.find(u => u.department === 'LSFD') || MOCK_UNITS[2]);

    const setStatus = (status: UnitStatus) => {
        setUnit(prev => ({ ...prev, status }));
    };

    const emsStatuses: UnitStatus[] = [
        UnitStatus.AVAILABLE,
        UnitStatus.EN_ROUTE,
        UnitStatus.ON_SCENE,
        UnitStatus.AWAITING_PATIENT,
        UnitStatus.EN_ROUTE_TO_HOSPITAL,
        UnitStatus.AT_HOSPITAL,
        UnitStatus.UNAVAILABLE,
        UnitStatus.PANIC,
    ];

    return (
        <Card className="h-full">
            <CardHeader>Мой статус: {unit.name}</CardHeader>
            <div className="grid grid-cols-2 gap-2">
                {emsStatuses.map(status => (
                    <Button 
                        key={status}
                        onClick={() => setStatus(status)}
                        variant={unit.status === status ? 'primary' : 'secondary'}
                        size="sm"
                        className={status === UnitStatus.PANIC ? "!bg-red-600 hover:!bg-red-700 focus:!ring-red-500" : ""}
                    >
                        {status}
                    </Button>
                ))}
            </div>
        </Card>
    );
};

const EmsFdDashboard: React.FC = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card className="h-96 p-0 relative overflow-hidden">
                    <div className="w-full h-full bg-secondary-900 flex items-center justify-center">
                        <div className="text-center text-secondary-500">
                            <MapPin size={48}/>
                            <p className="mt-2">Карта с активными вызовами</p>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="space-y-6">
                <EmsFdStatusPanel />
                <Card>
                    <CardHeader>Важные оповещения</CardHeader>
                    <p className="text-secondary-400">Нет активных оповещений.</p>
                </Card>
            </div>
        </div>
    </div>
);


const ActiveCalls: React.FC = () => (
     <Card>
        <CardHeader>Active Calls</CardHeader>
        <p className="text-secondary-400">Displaying active medical and fire emergency calls...</p>
        {/* Placeholder for active calls list */}
    </Card>
);

export const EmsFdPortal: React.FC<EmsFdPortalProps> = ({ activeView, onViewChange }) => {
    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, label: 'Панель управления' },
        { name: 'Patient Search', icon: Handshake, label: 'Поиск по пациентам' },
        { name: 'Active Calls', icon: Ambulance, label: 'Активные вызовы' },
        { name: 'Reports', icon: FileText, label: 'Рапорты' },
    ];
    
    const emsReports = useMemo(() => MOCK_REPORTS.filter(r => r.type === 'Medical'), []);

    return (
        <div className="space-y-4">
            <div className="flex gap-2 border-b-2 border-secondary-700/50 pb-2 mb-4">
                {navItems.map(item => (
                    <Button 
                        key={item.name}
                        variant={activeView === item.name ? 'primary' : 'secondary'}
                        onClick={() => onViewChange(item.name)}
                        className={`!px-4 !py-2 !rounded-b-none !rounded-t-md ${activeView !== item.name && '!bg-transparent border-b-0'}`}
                    >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                    </Button>
                ))}
            </div>

            {activeView === 'Dashboard' && <EmsFdDashboard />}
            {activeView === 'Patient Search' && <PatientSearch />}
            {activeView === 'Active Calls' && <ActiveCalls />}
            {activeView === 'Reports' && <ReportsPortal reports={emsReports} reportTypeName="Медицинские рапорты" />}
        </div>
    );
};