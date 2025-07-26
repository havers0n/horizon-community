
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { createNavigationMap, MOCK_UNITS, MOCK_CITIZENS } from '../constants';
import { LogOut } from 'lucide-react';
import { User } from '../services/api';
import { useLocale } from '../contexts/LocaleContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
    currentRole: UserRole;
    onRoleChange: (role: UserRole) => void;
    availableRoles: UserRole[];
    user?: User | null;
    onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange, availableRoles, user, onLogout }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    // For demonstration, we'll associate a specific citizen and unit based on the role.
    const isUnitRole = [UserRole.LEO, UserRole.EMS_FD].includes(currentRole);
    let displayUnit = null;
    let displayCitizen = null;

    if (isUnitRole) {
        if (currentRole === UserRole.LEO) {
            displayUnit = MOCK_UNITS.find(u => u.department === 'LSPD') || MOCK_UNITS[0];
            displayCitizen = MOCK_CITIZENS[0];
        } else if (currentRole === UserRole.EMS_FD) {
            displayUnit = MOCK_UNITS.find(u => u.department === 'LSFD') || MOCK_UNITS[2];
            displayCitizen = MOCK_CITIZENS[1];
        }
    }

    return (
        <header className="bg-secondary-900/80 backdrop-blur-sm border-b border-secondary-700 p-3 flex justify-between items-center sticky top-0 z-30">
            <div className="flex items-center gap-4 flex-grow">
                <h1 className="text-xl font-bold text-white flex-shrink-0">SC-MDT</h1>
                 {isUnitRole && displayCitizen && displayUnit && (
                     <div className="hidden md:flex items-center gap-3 border-l-2 border-secondary-700/50 pl-4">
                        <div>
                            <p className="text-sm font-semibold text-white leading-tight">{displayCitizen.firstName} {displayCitizen.lastName}</p>
                            <p className="text-xs text-secondary-400 leading-tight">{displayUnit.department}</p>
                        </div>
                    </div>
                )}
                 <div className="ml-auto font-mono font-bold text-primary-400 text-lg bg-secondary-950/50 px-3 py-1 rounded-md border border-secondary-700">
                    {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
            </div>
            <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                <LanguageSwitcher />
                <select
                    value={currentRole}
                    onChange={(e) => onRoleChange(e.target.value as UserRole)}
                    className="bg-secondary-700 border border-secondary-600 rounded-md px-3 py-1.5 text-sm text-white focus:ring-2 focus:ring-primary-500"
                >
                    {availableRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                </select>
                <div className="flex items-center gap-3 text-right">
                    {displayUnit && <span className="font-bold text-sm text-secondary-200">{displayUnit.name}</span>}
                    {user && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-secondary-300">{user.username}</span>
                            <img 
                                src={`https://picsum.photos/seed/${user.username}/40`}
                                alt="User" 
                                className="w-10 h-10 rounded-full border-2 border-primary-500" 
                            />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

interface SidebarProps {
    currentRole: UserRole;
    activeView: string;
    onViewChange: (view: string) => void;
    onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentRole, activeView, onViewChange, onLogout }) => {
    const { t } = useLocale();
    const navItems = createNavigationMap(t)[currentRole] || [];
    
    return (
        <aside className="w-60 bg-secondary-900/80 backdrop-blur-sm border-r border-secondary-700 p-4 flex flex-col fixed h-full z-20">
            <div className="flex-grow">
                <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            onClick={(e) => {
                                e.preventDefault();
                                onViewChange(item.name);
                            }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeView === item.name 
                                ? 'bg-primary-600 text-white' 
                                : 'text-secondary-300 hover:bg-secondary-700 hover:text-white'
                            }`}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.name}</span>
                        </a>
                    ))}
                </nav>
            </div>
            <div>
                 <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-secondary-300 hover:bg-secondary-700 hover:text-white"
                >
                    <LogOut className="h-5 w-5" />
                    <span>{t('auth.logOut')}</span>
                </button>
            </div>
        </aside>
    );
};

interface MainLayoutProps {
    children: React.ReactNode;
    currentRole: UserRole;
    onRoleChange: (role: UserRole) => void;
    availableRoles: UserRole[];
    activeView: string;
    onViewChange: (view: string) => void;
    user?: User | null;
    onLogout?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
    children, 
    currentRole, 
    onRoleChange, 
    availableRoles, 
    activeView, 
    onViewChange,
    user,
    onLogout
}) => {
    const needsSidebar = [UserRole.CITIZEN, UserRole.LEO, UserRole.EMS_FD].includes(currentRole);
    const sidebarWidth = needsSidebar ? 'ml-60' : 'ml-0';
    
    return (
        <div className="h-screen flex">
            {needsSidebar && (
                <Sidebar 
                    currentRole={currentRole} 
                    activeView={activeView} 
                    onViewChange={onViewChange}
                    onLogout={onLogout}
                />
            )}
            <div className={`flex-1 ${sidebarWidth} flex flex-col`}>
                <Header 
                    currentRole={currentRole} 
                    onRoleChange={onRoleChange} 
                    availableRoles={availableRoles}
                    user={user}
                    onLogout={onLogout}
                />
                <main className="flex-1 p-4 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};
