import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation, Locale } from '../lib/i18n';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, any>) => string;
  getRoleName: (role: string) => string;
  getUnitStatus: (status: string) => string;
  getDepartmentName: (department: string) => string;
  getReportType: (type: string) => string;
  getPriority: (priority: string) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatRelativeTime: (date: Date | string) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  getSupportedLocales: () => Locale[];
}

const LocaleContext = createContext<LocaleContextType | null>(null);

interface LocaleProviderProps {
  children: ReactNode;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  const translation = useTranslation();
  const [locale, setLocaleState] = useState<Locale>(translation.locale);

  const setLocale = (newLocale: Locale) => {
    translation.setLocale(newLocale);
    setLocaleState(newLocale);
  };

  // Синхронизируем состояние с i18n при изменении локали
  useEffect(() => {
    setLocaleState(translation.locale);
  }, [translation.locale]);

  const value: LocaleContextType = {
    locale,
    setLocale,
    t: translation.t,
    getRoleName: translation.getRoleName,
    getUnitStatus: translation.getUnitStatus,
    getDepartmentName: translation.getDepartmentName,
    getReportType: translation.getReportType,
    getPriority: translation.getPriority,
    formatDate: translation.formatDate,
    formatTime: translation.formatTime,
    formatDateTime: translation.formatDateTime,
    formatRelativeTime: translation.formatRelativeTime,
    formatNumber: translation.formatNumber,
    formatCurrency: translation.formatCurrency,
    getSupportedLocales: translation.getSupportedLocales,
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}; 