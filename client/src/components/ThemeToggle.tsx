import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full bg-card border border-border hover:bg-accent transition-all duration-300 group"
      aria-label="Переключить тему"
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
            theme === 'light' 
              ? 'text-foreground rotate-0 scale-100' 
              : 'text-muted-foreground -rotate-90 scale-0'
          }`}
        />
        <Moon 
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
            theme === 'dark' 
              ? 'text-foreground rotate-0 scale-100' 
              : 'text-muted-foreground rotate-90 scale-0'
          }`}
        />
      </div>
      
      {/* Анимированный фон */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Button>
  );
}

export default ThemeToggle; 