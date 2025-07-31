// @ts-nocheck - TODO: Remove after major refactoring is complete
import React from 'react';
import { Card, CardHeader } from '@/shared/ui/atoms';
import { 
    User, 
    Car, 
    Building, 
    Phone, 
    Shield, 
    Truck,
    Heart,
    BookOpen,
    PlusCircle
} from 'lucide-react';
import { Button } from '@/shared/ui/atoms';
import { CitizenRegistrationWidget, CitizenRegistrationModals } from '../../../features/citizen-registration';
import { VehicleRegistrationWidget } from '../../../features/vehicle-registration';
import { WeaponRegistrationWidget } from '../../../features/weapon-registration';
import { EmergencyCallsWidget } from '../../../features/emergency-calls';

interface CitizenPortalNewProps {
    activeView: string;
    onViewChange: (view: string) => void;
}

// Временные заглушки для фич (будут заменены на реальные компоненты)
const ProfileManagementFeature = () => (
    <div className="p-4 bg-secondary-800 rounded-md">
        <p className="text-secondary-300">Profile Management Feature - в разработке</p>
    </div>
);

const CargoManagementFeature = () => (
    <div className="p-4 bg-secondary-800 rounded-md">
        <p className="text-secondary-300">Cargo Management Feature - в разработке</p>
    </div>
);

const CompanyManagementFeature = () => (
    <div className="p-4 bg-secondary-800 rounded-md">
        <p className="text-secondary-300">Company Management Feature - в разработке</p>
    </div>
);

const LegalRecordsFeature = () => (
    <div className="p-4 bg-secondary-800 rounded-md">
        <p className="text-secondary-300">Legal Records Feature - в разработке</p>
    </div>
);

// Панель управления гражданского
const CitizenDashboard: React.FC<{ onAction: (action: string) => void }> = ({ onAction }) => {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>Панель управления гражданского</CardHeader>
                <p className="text-secondary-300 mb-6">Добро пожаловать в систему управления гражданскими делами. Выберите нужное действие:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button 
                        onClick={() => onAction('citizenRegistration')}
                        className="h-32 flex flex-col items-center justify-center gap-3"
                    >
                        <User className="h-8 w-8" />
                        <span>Регистрация гражданина</span>
                    </Button>
                    
                    <Button 
                        onClick={() => onAction('emergencyCalls')}
                        variant="secondary"
                        className="h-32 flex flex-col items-center justify-center gap-3"
                    >
                        <Phone className="h-8 w-8" />
                        <span>Вызовы 911</span>
                    </Button>
                    
                    <Button 
                        onClick={() => onAction('weaponRegistration')}
                        variant="secondary"
                        className="h-32 flex flex-col items-center justify-center gap-3"
                    >
                        <Shield className="h-8 w-8" />
                        <span>Регистрация оружия</span>
                    </Button>
                    
                    <Button 
                        onClick={() => onAction('vehicleRegistration')}
                        variant="secondary"
                        className="h-32 flex flex-col items-center justify-center gap-3"
                    >
                        <Car className="h-8 w-8" />
                        <span>Регистрация Т/С</span>
                    </Button>
                    
                    <Button 
                        onClick={() => onAction('cargoManagement')}
                        variant="secondary"
                        className="h-32 flex flex-col items-center justify-center gap-3"
                    >
                        <Truck className="h-8 w-8" />
                        <span>Грузоперевозки</span>
                    </Button>
                    
                    <Button 
                        onClick={() => onAction('companyManagement')}
                        variant="secondary"
                        className="h-32 flex flex-col items-center justify-center gap-3"
                    >
                        <Building className="h-8 w-8" />
                        <span>Компании</span>
                    </Button>
                    
                    <Button 
                        onClick={() => onAction('legalRecords')}
                        variant="secondary"
                        className="h-32 flex flex-col items-center justify-center gap-3"
                    >
                        <BookOpen className="h-8 w-8" />
                        <span>Правовые записи</span>
                    </Button>
                    
                    <Button 
                        onClick={() => onAction('profileManagement')}
                        variant="secondary"
                        className="h-32 flex flex-col items-center justify-center gap-3"
                    >
                        <PlusCircle className="h-8 w-8" />
                        <span>Управление профилем</span>
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export const CitizenPortalNew: React.FC<CitizenPortalNewProps> = ({ activeView, onViewChange }) => {
    const handleDashboardAction = (action: string) => {
        onViewChange(action);
    };

    const renderActiveView = () => {
        switch (activeView) {
            case 'Панель управления':
                return <CitizenDashboard onAction={handleDashboardAction} />;
            case 'citizenRegistration':
                return <CitizenRegistrationWidget />;
            case 'vehicleRegistration':
                return <VehicleRegistrationWidget />;
            case 'weaponRegistration':
                return <WeaponRegistrationWidget />;
            case 'emergencyCalls':
                return <EmergencyCallsWidget />;
            case 'profileManagement':
                return <ProfileManagementFeature />;
            case 'cargoManagement':
                return <CargoManagementFeature />;
            case 'companyManagement':
                return <CompanyManagementFeature />;
            case 'legalRecords':
                return <LegalRecordsFeature />;
            default:
                return <CitizenDashboard onAction={handleDashboardAction} />;
        }
    };

    return (
        <div className="space-y-6">
            {renderActiveView()}
            <CitizenRegistrationModals />
        </div>
    );
};
