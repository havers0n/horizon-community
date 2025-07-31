// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { Globe, ChevronDown } from 'lucide-react';

export const TopHeader: React.FC = () => {
  const { user } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-600/50 px-6 py-3 shadow-lg shadow-slate-900/30">
      <div className="flex items-center justify-between">
        {/* Left side - App name and user info */}
        <div className="flex items-center space-x-4">
          <div className="text-xl font-bold text-blue-400 glow-primary">SC-MDT</div>
          {user && (
            <div className="text-sm text-slate-300">
              <span className="font-medium">{user.name}</span>
              <span className="mx-2">•</span>
              <span>{user.department}</span>
            </div>
          )}
        </div>

        {/* Center - Navigation tabs */}
        <div className="flex items-center space-x-1">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-600/25 glow-primary transition-all duration-200 ease-in-out transform hover:scale-105">
            {t('dashboard')}
          </button>
          <button className="px-4 py-2 text-slate-300 hover:text-white rounded-lg text-sm transition-all duration-200 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:shadow-md">
            {t('active_incidents')}
          </button>
          <button className="px-4 py-2 text-slate-300 hover:text-white rounded-lg text-sm transition-all duration-200 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:shadow-md">
            {t('criminal_codes')}
          </button>
          <button className="px-4 py-2 text-slate-300 hover:text-white rounded-lg text-sm transition-all duration-200 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:shadow-md">
            {t('reports')}
          </button>
        </div>

        {/* Right side - Time, language, role */}
        <div className="flex items-center space-x-4">
          <div className="text-sm font-mono text-slate-300 bg-gradient-to-r from-slate-700/30 to-slate-600/30 px-3 py-1 rounded-lg backdrop-blur-sm border border-slate-600/30">
            {formatTime(currentTime)}
          </div>
          
          <div className="flex items-center space-x-2 bg-gradient-to-r from-slate-700/30 to-slate-600/30 px-3 py-1 rounded-lg backdrop-blur-sm border border-slate-600/30">
            <Globe className="w-4 h-4 text-slate-400" />
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as 'ru' | 'en')}
              className="bg-transparent text-slate-300 text-sm border-none outline-none cursor-pointer"
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>

          <div className="flex items-center space-x-2 bg-gradient-to-r from-slate-700/30 to-slate-600/30 px-3 py-1 rounded-lg backdrop-blur-sm border border-slate-600/30">
            <select className="bg-transparent text-slate-300 text-sm border-none outline-none cursor-pointer">
              <option value="leo">LEO</option>
              <option value="dispatch">Dispatch</option>
              <option value="ems">EMS</option>
              <option value="fd">FD</option>
              <option value="civil">Civil</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>

          {user?.unitId && (
            <div className="text-sm text-slate-300 font-mono bg-gradient-to-r from-blue-600/20 to-blue-700/20 px-3 py-1 rounded-lg backdrop-blur-sm border border-blue-600/30 glow-primary">
              {user.unitId}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}; 
