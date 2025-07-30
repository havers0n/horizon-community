import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface DashboardWidget {
  id: string;
  type: 'stats' | 'callQueue' | 'unitList' | 'map' | 'notifications' | 'activity' | 'search' | 'tools' | 'status' | 'calls911';
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isVisible: boolean;
  settings?: Record<string, any>;
}

interface DashboardContextType {
  widgets: DashboardWidget[];
  setWidgets: (widgets: DashboardWidget[]) => void;
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => void;
  addWidget: (type: DashboardWidget['type']) => void;
  removeWidget: (id: string) => void;
  toggleWidgetVisibility: (id: string) => void;
  toggleWidgetMinimize: (id: string) => void;
  getVisibleWidgets: () => DashboardWidget[];
  resetToDefaults: () => void;
  exportSettings: () => string;
  importSettings: (data: string) => boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const DEFAULT_WIDGETS: DashboardWidget[] = [
  {
    id: 'stats',
    type: 'stats',
    title: 'Статистика',
    position: { x: 0, y: 0 },
    size: { width: 2, height: 1 },
    isMinimized: false,
    isVisible: true
  },
  {
    id: 'callQueue',
    type: 'callQueue',
    title: 'Очередь вызовов',
    position: { x: 2, y: 0 },
    size: { width: 2, height: 2 },
    isMinimized: false,
    isVisible: true
  },
  {
    id: 'unitList',
    type: 'unitList',
    title: 'Список единиц',
    position: { x: 0, y: 1 },
    size: { width: 2, height: 2 },
    isMinimized: false,
    isVisible: true
  },
  {
    id: 'search',
    type: 'search',
    title: 'Поиск',
    position: { x: 4, y: 0 },
    size: { width: 1, height: 1 },
    isMinimized: false,
    isVisible: true
  },
  {
    id: 'tools',
    type: 'tools',
    title: 'Инструменты',
    position: { x: 4, y: 1 },
    size: { width: 1, height: 1 },
    isMinimized: false,
    isVisible: true
  },
  {
    id: 'status',
    type: 'status',
    title: 'Статус',
    position: { x: 4, y: 2 },
    size: { width: 1, height: 1 },
    isMinimized: false,
    isVisible: true
  },
  {
    id: 'calls911',
    type: 'calls911',
    title: 'Звонки 911',
    position: { x: 0, y: 3 },
    size: { width: 3, height: 2 },
    isMinimized: false,
    isVisible: true
  }
];

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    const saved = localStorage.getItem('dispatch-dashboard-widgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_WIDGETS;
      }
    }
    return DEFAULT_WIDGETS;
  });

  // Сохраняем конфигурацию в localStorage
  useEffect(() => {
    localStorage.setItem('dispatch-dashboard-widgets', JSON.stringify(widgets));
  }, [widgets]);

  const updateWidget = (id: string, updates: Partial<DashboardWidget>) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const addWidget = (type: DashboardWidget['type']) => {
    const newWidget: DashboardWidget = {
      id: `${type}_${Date.now()}`,
      type,
      title: getWidgetTitle(type),
      position: { x: 0, y: 0 },
      size: getWidgetDefaultSize(type),
      isMinimized: false,
      isVisible: true
    };
    setWidgets(prev => [...prev, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const toggleWidgetVisibility = (id: string) => {
    updateWidget(id, { isVisible: !widgets.find(w => w.id === id)?.isVisible });
  };

  const toggleWidgetMinimize = (id: string) => {
    updateWidget(id, { isMinimized: !widgets.find(w => w.id === id)?.isMinimized });
  };

  const getVisibleWidgets = () => {
    return widgets.filter(w => w.isVisible);
  };

  const resetToDefaults = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  const exportSettings = () => {
    return JSON.stringify(widgets, null, 2);
  };

  const importSettings = (data: string): boolean => {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        setWidgets(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const value: DashboardContextType = {
    widgets,
    setWidgets,
    updateWidget,
    addWidget,
    removeWidget,
    toggleWidgetVisibility,
    toggleWidgetMinimize,
    getVisibleWidgets,
    resetToDefaults,
    exportSettings,
    importSettings
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

// Вспомогательные функции
const getWidgetTitle = (type: DashboardWidget['type']): string => {
  const titles = {
    stats: 'Статистика',
    callQueue: 'Очередь вызовов',
    unitList: 'Список единиц',
    map: 'Карта',
    notifications: 'Уведомления',
    activity: 'Активность',
    search: 'Поиск',
    tools: 'Инструменты',
    status: 'Статус',
    calls911: 'Звонки 911'
  };
  return titles[type];
};

const getWidgetDefaultSize = (type: DashboardWidget['type']) => {
  const sizes = {
    stats: { width: 2, height: 1 },
    callQueue: { width: 2, height: 2 },
    unitList: { width: 2, height: 2 },
    map: { width: 3, height: 3 },
    notifications: { width: 1, height: 2 },
    activity: { width: 2, height: 1 },
    search: { width: 1, height: 1 },
    tools: { width: 1, height: 1 },
    status: { width: 1, height: 1 },
    calls911: { width: 3, height: 2 }
  };
  return sizes[type];
}; 