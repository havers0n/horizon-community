
import React, { useState, createContext, useContext } from 'react';
import { UserRole } from './types';
import { MainLayout } from './components/Layout';
import { CitizenPortal } from './components/CitizenPortal';
import { MdtPortal } from './components/MdtPortal';
import { DispatchPortal } from './components/DispatchPortal';
import { AdminPortal } from './components/AdminPortal';
import { EmsFdPortal } from './components/EmsFdPortal';
import { createNavigationMap } from './constants';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocaleProvider, useLocale } from './contexts/LocaleContext';
import { LoginForm } from './components/LoginForm';

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentRole, _setCurrentRole] = useState<UserRole>(UserRole.EMS_FD);
    const [activeView, setActiveView] = useState('Dashboard');

    const setCurrentRole = (role: UserRole) => {
        _setCurrentRole(role);
        // Используем функцию для получения навигации
        const navigationMap = createNavigationMap(() => '');
        const defaultView = navigationMap[role]?.[0]?.name || 'Dashboard';
        setActiveView(defaultView);
    };
    
    return (
        <AppContext.Provider value={{ currentRole, setCurrentRole, activeView, setActiveView }}>
            {children}
        </AppContext.Provider>
    );
};

const RoleBasedPortal: React.FC<{ role: UserRole; activeView: string; onViewChange: (view: string) => void }> = ({ role, activeView, onViewChange }) => {
    switch (role) {
        case UserRole.CITIZEN:
            return <CitizenPortal activeView={activeView} onViewChange={onViewChange} />;
        case UserRole.LEO:
            return <MdtPortal activeView={activeView} onViewChange={onViewChange} />;
        case UserRole.EMS_FD:
            return <EmsFdPortal activeView={activeView} onViewChange={onViewChange} />;
        case UserRole.DISPATCH:
            return <DispatchPortal />;
        case UserRole.ADMIN:
            return <AdminPortal />;
        default:
            return <div>Invalid Role</div>;
    }
};

const AppContent: React.FC = () => {
    const { currentRole, setCurrentRole, activeView, setActiveView } = useAppContext();
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const { t } = useLocale();
    const availableRoles = Object.values(UserRole);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginForm />;
    }

    return (
        <MainLayout 
            currentRole={currentRole} 
            onRoleChange={setCurrentRole}
            availableRoles={availableRoles}
            activeView={activeView}
            onViewChange={setActiveView}
            user={user}
            onLogout={logout}
        >
            <RoleBasedPortal role={currentRole} activeView={activeView} onViewChange={setActiveView} />
        </MainLayout>
    );
};

const App: React.FC = () => {
    return (
        <LocaleProvider>
            <AuthProvider>
                <AppProvider>
                    <AppContent />
                </AppProvider>
            </AuthProvider>
        </LocaleProvider>
    );
};

export default App;