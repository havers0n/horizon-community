
import React, { useState, useEffect, useMemo } from 'react';
import type { Bolo, Unit } from '../types';
import { UnitStatus } from '../types';
import { MOCK_BOLOS, MOCK_UNITS, MOCK_REPORTS } from '../constants';
import { Card, CardHeader, Button, Modal } from './ui/Theme';
import { MapPin, Siren, Radio, Search, LayoutDashboard, ZoomIn, ZoomOut, Layers, Gavel, FileText } from 'lucide-react';
import { ActiveIncidents } from './ActiveIncidents';
import { PenalCodeSearch } from './PenalCodeSearch';
import { ReportsPortal } from './ReportsPortal';


const BoloFeed: React.FC = () => {
    const [bolos, setBolos] = useState<Bolo[]>(MOCK_BOLOS);

    return (
        <Card className="h-full">
            <CardHeader>Активные ориентировки</CardHeader>
            <div className="space-y-3 overflow-y-auto max-h-48">
                {bolos.map(bolo => (
                    <div key={bolo.id} className="p-3 bg-secondary-900 rounded-md">
                        <p className={`font-bold ${bolo.type === 'PERSON' ? 'text-orange-400' : 'text-blue-400'}`}>ОРИЕНТИРОВКА: {bolo.type === 'PERSON' ? 'ЧЕЛОВЕК' : 'ТРАНСПОРТ'}</p>
                        <p className="text-sm text-secondary-300">{bolo.description}</p>
                        <p className="text-xs text-secondary-500 mt-1">{new Date(bolo.timestamp).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const UnitStatusPanel: React.FC = () => {
    const [unit, setUnit] = useState<Unit>(MOCK_UNITS[0]);
    
    const setStatus = (status: UnitStatus) => {
        setUnit(prev => ({ ...prev, status }));
    };

    const leoStatuses: UnitStatus[] = [
        UnitStatus.AVAILABLE,
        UnitStatus.BUSY,
        UnitStatus.EN_ROUTE,
        UnitStatus.ON_SCENE,
        UnitStatus.UNAVAILABLE,
        UnitStatus.PANIC,
    ];

    return (
        <Card className="h-full">
            <CardHeader>Мой статус: {unit.name}</CardHeader>
            <div className="grid grid-cols-2 gap-2">
                {leoStatuses.map(status => (
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

const DashboardView: React.FC = () => (
     <div className="space-y-4">
         <Card>
            <CardHeader>Поиск по базе данных</CardHeader>
            <div className="flex gap-2">
                <input type="text" placeholder="Поиск по имени, номеру, серийному номеру..." className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500" />
                <Button><Search className="mr-2 h-4 w-4" /> Поиск</Button>
            </div>
         </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
                <Card className="h-96 p-0 relative overflow-hidden">
                    <div className="w-full h-full bg-secondary-900 flex items-center justify-center">
                        <div className="text-center text-secondary-500">
                            <MapPin size={48}/>
                            <p>Интерфейс карты</p>
                        </div>
                    </div>
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <Button variant="secondary" size="sm" className="!p-2"><ZoomIn size={16}/></Button>
                        <Button variant="secondary" size="sm" className="!p-2"><ZoomOut size={16}/></Button>
                        <Button variant="secondary" size="sm" className="!p-2"><Layers size={16}/></Button>
                    </div>
                </Card>
            </div>
            <div className="space-y-4">
                <UnitStatusPanel />
                <BoloFeed />
            </div>
        </div>
    </div>
);

interface MdtPortalProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const MdtPortal: React.FC<MdtPortalProps> = ({ activeView, onViewChange }) => {
    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, label: 'Панель управления' },
        { name: 'Active Incidents', icon: Siren, label: 'Активные инциденты' },
        { name: 'Penal Codes', icon: Gavel, label: 'Уголовный кодекс' },
        { name: 'Reports', icon: FileText, label: 'Рапорты' },
    ];
    
    const leoReports = useMemo(() => MOCK_REPORTS.filter(r => r.type === 'Arrest' || r.type === 'Incident'), []);
    
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

            {activeView === 'Dashboard' && <DashboardView />}
            {activeView === 'Active Incidents' && <ActiveIncidents />}
            {activeView === 'Penal Codes' && <PenalCodeSearch />}
            {activeView === 'Reports' && <ReportsPortal reports={leoReports} reportTypeName="Полевые рапорты" />}
        </div>
    );
};