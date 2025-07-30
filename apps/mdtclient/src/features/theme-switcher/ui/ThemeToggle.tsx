import React from 'react';
import { Button } from '@/shared/ui/atoms';
import { useTheme } from './useTheme';
import { Sun, Moon, Zap } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabels?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabels = false 
}) => {
  const { theme, toggleTheme, isDark, isLight, isNeon } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={16} />;
      case 'dark':
        return <Moon size={16} />;
      case 'neon':
        return <Zap size={16} />;
      default:
        return <Moon size={16} />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Светлая';
      case 'dark':
        return 'Темная';
      case 'neon':
        return 'Неоновая';
      default:
        return 'Темная';
    }
  };

  const getNextThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Переключить на темную';
      case 'dark':
        return 'Переключить на неоновую';
      case 'neon':
        return 'Переключить на светлую';
      default:
        return 'Переключить тему';
    }
  };

  return (
    <Button
      onClick={toggleTheme}
      variant={isNeon ? 'neon' : isDark ? 'secondary' : 'primary'}
      size="sm"
      className={`transition-all duration-300 ${className}`}
      title={getNextThemeLabel()}
    >
      {getThemeIcon()}
      {showLabels && (
        <span className="ml-2">{getThemeLabel()}</span>
      )}
    </Button>
  );
};
