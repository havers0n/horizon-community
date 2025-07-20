
import React from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-card hover:bg-card-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <SunIcon className="w-6 h-6 text-text-primary" />
      ) : (
        <MoonIcon className="w-6 h-6 text-text-primary" />
      )}
    </button>
  );
};

export default ThemeToggle;
