// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useState } from 'react';
import { Card, CardHeader, Button } from '@/shared/ui/atoms';
import { 
    User, 
    Car, 
    Building, 
    Phone, 
    Shield, 
    Truck,
    Heart,
    BookOpen,
    LayoutDashboard,
    Users,
    FileText,
    Plus
} from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';

// Импорт всех фич
import { CitizenRegistrationWidget } from '../../features/citizen-registration';
import { VehicleRegistrationWidget } from '../../features/vehicle-registration';
import { WeaponRegistrationWidget } from '../../features/weapon-registration';
import { EmergencyCallsWidget } from '../../features/emergency-calls';
import { CompanyManagementWidget } from '../../features/company-management';
import { CargoManagementWidget } from '../../features/cargo-management';
import { ProfileManagementWidget } from '../../features/profile-management';

interface CitizenPortalNewProps {
    activeView: string;
    onViewChange: (view: string) => void;
}

const CitizenDashboard: React.FC<{ onAction: (action: string) => void }> = ({ onAction }) => {
    const { t } = useLocale();

    const dashboardItems = [
        {
            id: 'profile',
            title: 'Профиль гражданина',
            description: 'Просмотр и редактирование профиля',
            icon: User,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            id: 'citizen-registration',
            title: 'Регистрация гражданина',
            description: 'Создание нового гражданина',
            icon: Users,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            id: 'vehicle-registration',
            title: 'Регистрация транспорта',
            description: 'Регистрация транспортных средств',
            icon: Car,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            id: 'weapon-registration',
            title: 'Регистрация оружия',
            description: 'Регистрация оружия',
            icon: Shield,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
        },
        {
            id: 'emergency-calls',
            title: 'Вызовы 911',
            description: 'Создание экстренных вызовов',
            icon: Phone,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
        },
        {
            id: 'company-management',
            title: 'Управление компаниями',
            description: 'Создание и управление компаниями',
            icon: Building,
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-500/10',
        },
        {
            id: 'cargo-management',
            title: 'Грузоперевозки',
            description: 'Управление грузоперевозками',
            icon: Truck,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10',
        },
        {
            id: 'pets',
            title: 'Питомцы',
            description: 'Управление питомцами',
            icon: Heart,
            color: 'text-pink-500',
            bgColor: 'bg-pink-500/10',
        },
        {
            id: 'codes',
            title: 'Кодексы',
            description: 'Просмотр правовых кодексов',
            icon: BookOpen,
            color: 'text-gray-500',
            bgColor: 'bg-gray-500/10',
        },
    ];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-6 h-6 text-primary-500" />
                    <h3 className="text-lg font-semibold text-white">Портал гражданина</h3>
                </div>
            </CardHeader>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <Card 
                                key={item.id} 
                                className="hover:bg-secondary-800 transition-colors cursor-pointer"
                                onClick={() => onAction(item.id)}
                            >
                                <div className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`p-2 rounded-lg ${item.bgColor}`}>
                                            <IconComponent className={`w-5 h-5 ${item.color}`} />
                                        </div>
                                        <h4 className="font-semibold text-white">{item.title}</h4>
                                    </div>
                                    <p className="text-sm text-secondary-400">{item.description}</p>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
};

export const CitizenPortalNew: React.FC<CitizenPortalNewProps> = ({ activeView, onViewChange }) => {
    const { t } = useLocale();

    const handleDashboardAction = (action: string) => {
        onViewChange(action);
    };

    const renderActiveView = () => {
        switch (activeView) {
            case 'dashboard':
                return <CitizenDashboard onAction={handleDashboardAction} />;
            case 'profile':
                return <ProfileManagementWidget />;
            case 'citizen-registration':
                return <CitizenRegistrationWidget />;
            case 'vehicle-registration':
                return <VehicleRegistrationWidget />;
            case 'weapon-registration':
                return <WeaponRegistrationWidget />;
            case 'emergency-calls':
                return <EmergencyCallsWidget />;
            case 'company-management':
                return <CompanyManagementWidget />;
            case 'cargo-management':
                return <CargoManagementWidget />;
            case 'pets':
                return (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Heart className="w-6 h-6 text-primary-500" />
                                <h3 className="text-lg font-semibold text-white">Управление питомцами</h3>
                            </div>
                        </CardHeader>
                        <div className="p-6 text-center">
                            <Heart className="w-12 h-12 text-secondary-500 mx-auto mb-4" />
                            <p className="text-secondary-400">Функция управления питомцами находится в разработке</p>
                        </div>
                    </Card>
                );
            case 'codes':
                return (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-6 h-6 text-primary-500" />
                                <h3 className="text-lg font-semibold text-white">Правовые кодексы</h3>
                            </div>
                        </CardHeader>
                        <div className="p-6 text-center">
                            <BookOpen className="w-12 h-12 text-secondary-500 mx-auto mb-4" />
                            <p className="text-secondary-400">Функция просмотра кодексов находится в разработке</p>
                        </div>
                    </Card>
                );
            default:
                return <CitizenDashboard onAction={handleDashboardAction} />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Навигация */}
            {activeView !== 'dashboard' && (
                <Card>
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <Button 
                                variant="ghost" 
                                onClick={() => onViewChange('dashboard')}
                                className="flex items-center gap-2"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Назад к дашборду
                            </Button>
                            <div className="flex items-center gap-2">
                                <span className="text-secondary-400">Текущий раздел:</span>
                                <span className="text-white font-medium">
                                    {activeView === 'profile' && 'Профиль гражданина'}
                                    {activeView === 'citizen-registration' && 'Регистрация гражданина'}
                                    {activeView === 'vehicle-registration' && 'Регистрация транспорта'}
                                    {activeView === 'weapon-registration' && 'Регистрация оружия'}
                                    {activeView === 'emergency-calls' && 'Вызовы 911'}
                                    {activeView === 'company-management' && 'Управление компаниями'}
                                    {activeView === 'cargo-management' && 'Грузоперевозки'}
                                    {activeView === 'pets' && 'Питомцы'}
                                    {activeView === 'codes' && 'Кодексы'}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Основной контент */}
            {renderActiveView()}
        </div>
    );
};
