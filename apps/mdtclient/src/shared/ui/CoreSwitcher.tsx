import React, { useState } from 'react';
import { ChevronUp, Users, Shield, User } from 'lucide-react';
import { useCoreNavigationStore, CoreType } from '@/shared/model/coreNavigationStore';
import { useUserRoles } from '@/shared/hooks/useUserRoles';
import { Button } from '@/shared/ui/atoms/Button';

interface CoreSwitcherProps {
  className?: string;
}

export const CoreSwitcher: React.FC<CoreSwitcherProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { roles } = useUserRoles();
  const { 
    activeCore, 
    switchCore, 
    canAccessCore 
  } = useCoreNavigationStore();

  const cores: Array<{
    id: CoreType;
    name: string;
    shortName: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }> = [
    {
      id: 'civil',
      name: 'Гражданское ядро',
      shortName: 'CS MDT',
      icon: Users,
      description: 'Портал для гражданских активностей'
    },
    {
      id: 'citizen-portal',
      name: 'Гражданский портал',
      shortName: 'CP',
      icon: User,
      description: 'Управление персонажами и биографией'
    },
    {
      id: 'emergency',
      name: 'Ядро экстренных служб',
      shortName: 'ES MDT',
      icon: Shield,
      description: 'Портал для экстренных служб'
    }
  ];

  const activeCoreData = cores.find(core => core.id === activeCore);
  const ActiveIcon = activeCoreData?.icon || Users;

  const handleCoreSwitch = (coreId: CoreType) => {
    if (canAccessCore(coreId, roles)) {
      switchCore(coreId);
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Основная кнопка переключателя */}
      <Button
        variant="outline"
        size="sm"
        className={`
          bg-slate-900/90 backdrop-blur-md border-slate-700/50 
          hover:bg-slate-800/90 hover:border-slate-600/50
          text-white font-medium px-3 py-2
          transition-all duration-200 ease-in-out
          ${isOpen ? 'bg-slate-800/90 border-slate-600/50' : ''}
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <ActiveIcon className="h-4 w-4 mr-2" />
        <span className="text-sm">{activeCoreData?.shortName}</span>
        <ChevronUp 
          className={`h-4 w-4 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </Button>

      {/* Выпадающее меню */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-xl z-50">
          <div className="p-3">
            <div className="text-xs text-slate-400 px-2 py-1 border-b border-slate-700/30 mb-2">
              Переключить ядро
            </div>
            
            <div className="space-y-1">
              {cores.map((core) => {
                const Icon = core.icon;
                const isActive = core.id === activeCore;
                const isDisabled = !canAccessCore(core.id, roles);
                
                return (
                  <Button
                    key={core.id}
                    variant={isActive ? 'default' : 'ghost'}
                    className={`
                      w-full justify-start text-left h-auto py-3 px-3
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                      ${isActive ? 'bg-primary-600/20 border-primary-500/30' : ''}
                    `}
                    onClick={() => handleCoreSwitch(core.id)}
                    disabled={isDisabled}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{core.name}</div>
                        <div className="text-xs text-slate-400">
                          {core.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 