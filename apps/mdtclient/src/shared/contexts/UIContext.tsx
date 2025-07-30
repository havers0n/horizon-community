import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIState {
  // UI состояние - только то, что относится к интерфейсу
  currentDepartment: string;
  sidebarCollapsed: boolean;
  activeTab: string;
  showNotifications: boolean;
  theme: 'dark' | 'light';
  language: 'en' | 'ru';
}

interface UIActions {
  setCurrentDepartment: (department: string) => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
  toggleNotifications: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setLanguage: (language: 'en' | 'ru') => void;
}

interface UIContextType extends UIState, UIActions {}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [currentDepartment, setCurrentDepartment] = useState('pd');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState<'en' | 'ru'>('ru');

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };

  const value: UIContextType = {
    // State
    currentDepartment,
    sidebarCollapsed,
    activeTab,
    showNotifications,
    theme,
    language,
    
    // Actions
    setCurrentDepartment,
    toggleSidebar,
    setActiveTab,
    toggleNotifications,
    setTheme,
    setLanguage,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}; 
