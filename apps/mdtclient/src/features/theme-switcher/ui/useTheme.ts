import { useState, useEffect } from 'react';

export type Theme = 'dark' | 'light' | 'neon';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Проверяем localStorage
    const savedTheme = localStorage.getItem('mdt-theme') as Theme;
    if (savedTheme && ['dark', 'light', 'neon'].includes(savedTheme)) {
      return savedTheme;
    }
    
    // Проверяем системную тему
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Удаляем все классы тем
    root.classList.remove('dark', 'light');
    body.classList.remove('theme-neon');

    // Применяем выбранную тему
    switch (theme) {
      case 'dark':
        root.classList.add('dark');
        break;
      case 'light':
        root.classList.add('light');
        break;
      case 'neon':
        root.classList.add('dark'); // Неоновая тема основана на темной
        body.classList.add('theme-neon');
        break;
    }

    // Сохраняем в localStorage
    localStorage.setItem('mdt-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      switch (prev) {
        case 'dark':
          return 'light';
        case 'light':
          return 'neon';
        case 'neon':
          return 'dark';
        default:
          return 'dark';
      }
    });
  };

  const setSpecificTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isNeon: theme === 'neon',
  };
};