import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Monitor, 
  Shield, 
  ChevronDown 
} from 'lucide-react';
import { useLocation } from 'wouter';

interface InterfaceSwitcherProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'lg' | 'icon';
  className?: string;
}

export function InterfaceSwitcher({ 
  variant = 'outline', 
  size = 'sm', 
  className = '' 
}: InterfaceSwitcherProps) {
  const [, setLocation] = useLocation();
  
  // Определяем текущий интерфейс по URL
  const currentPath = window.location.pathname;
  const isMDT = currentPath.startsWith('/mdt');

  const interfaces = [
    {
      id: 'main',
      label: 'Личный кабинет',
      path: '/',
      icon: Shield,
      description: 'Главная панель управления'
    },
    {
      id: 'mdt',
      label: 'MDT System',
      path: '/mdt',
      icon: Monitor,
      description: 'Система управления данными'
    }
  ];

  const currentInterface = isMDT ? interfaces[1] : interfaces[0];

  const handleInterfaceChange = (path: string) => {
    // Если переходим на другой интерфейс, используем window.location для полного перезапуска
    if (path !== currentPath) {
      window.location.href = path;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`flex items-center gap-2 ${className}`}
        >
          <currentInterface.icon className="h-4 w-4" />
          <span className="hidden sm:inline">{currentInterface.label}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {interfaces.map((iface) => (
          <DropdownMenuItem
            key={iface.id}
            onClick={() => handleInterfaceChange(iface.path)}
            className={`flex items-center gap-3 ${
              iface.id === currentInterface.id ? 'bg-accent' : ''
            }`}
          >
            <iface.icon className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="font-medium">{iface.label}</span>
              <span className="text-xs text-muted-foreground">{iface.description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 