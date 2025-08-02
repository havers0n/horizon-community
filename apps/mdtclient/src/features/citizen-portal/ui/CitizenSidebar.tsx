import React from 'react';
import { 
  User, 
  Building, 
  Monitor, 
  BookOpen,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useCitizenPortalStore } from '../model/store';
import type { NavigationItem } from '../model/types';

const navigationItems: NavigationItem[] = [
  {
    id: 'profile',
    title: 'Профиль',
    icon: User,
    subItems: [
      { id: 'personal', title: 'Личные данные' },
      { id: 'career', title: 'Карьерный путь' },
      { id: 'criminal', title: 'Криминальная история' },
    ]
  },
  {
    id: 'property',
    title: 'Собственность и связи',
    icon: Building,
    subItems: [
      { id: 'vehicles', title: 'Транспорт' },
      { id: 'weapons', title: 'Оружие' },
      { id: 'companies', title: 'Компании' },
      { id: 'pets', title: 'Питомцы' },
      { id: 'cargo', title: 'Грузоперевозки' },
    ]
  },
  {
    id: 'mdt',
    title: 'MDT/CAD',
    icon: Monitor,
    subItems: [
      { id: 'leo', title: 'LEO MDT' },
      { id: 'ems', title: 'EMS/FD MDT' },
      { id: 'dispatch', title: 'Dispatch CAD' },
      { id: 'emergency', title: 'Вызовы 911' },
    ]
  },
  {
    id: 'reference',
    title: 'Справочники',
    icon: BookOpen,
    subItems: [
      { id: 'criminal-code', title: 'Уголовный кодекс' },
      { id: 'medical', title: 'Медицинский справочник' },
    ]
  },
];

export const CitizenSidebar: React.FC = () => {
  const { 
    activeCharacter, 
    currentView, 
    currentSubView,
    setCurrentView, 
    setCurrentSubView 
  } = useCitizenPortalStore();

  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (itemId: string) => {
    setCurrentView(itemId as any);
    setCurrentSubView('');
  };

  const handleSubItemClick = (itemId: string, subItemId: string) => {
    setCurrentView(itemId as any);
    setCurrentSubView(subItemId);
  };

  if (!activeCharacter) return null;

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
      {/* Заголовок */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">
              {activeCharacter.firstName} {activeCharacter.lastName}
            </h3>
            <p className="text-xs text-slate-400">
              {activeCharacter.occupation || 'Гражданский'}
            </p>
          </div>
        </div>
      </div>

      {/* Навигация */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isExpanded = expandedItems.has(item.id);
          const isActive = currentView === item.id;
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (hasSubItems) {
                    toggleExpanded(item.id);
                  } else {
                    handleItemClick(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary-500 text-white' 
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </div>
                {hasSubItems && (
                  isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )
                )}
              </button>

              {/* Подпункты */}
              {hasSubItems && isExpanded && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.subItems!.map((subItem) => {
                    const isSubActive = currentView === item.id && currentSubView === subItem.id;
                    
                    return (
                      <button
                        key={subItem.id}
                        onClick={() => handleSubItemClick(item.id, subItem.id)}
                        className={`w-full text-left p-2 rounded transition-colors ${
                          isSubActive 
                            ? 'bg-primary-500/20 text-primary-400' 
                            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                        }`}
                      >
                        {subItem.title}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Информация о персонаже */}
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-400 space-y-1">
          {activeCharacter.ssn && (
            <div>SSN: {activeCharacter.ssn}</div>
          )}
          {activeCharacter.phoneNumber && (
            <div>Тел: {activeCharacter.phoneNumber}</div>
          )}
          {activeCharacter.address && (
            <div className="truncate" title={activeCharacter.address}>
              Адрес: {activeCharacter.address}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 