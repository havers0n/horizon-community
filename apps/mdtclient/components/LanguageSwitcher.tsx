import React from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale, getSupportedLocales, t } = useLocale();
  const supportedLocales = getSupportedLocales();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value as 'en' | 'ru';
    setLocale(newLocale);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-secondary-400" />
      <select
        value={locale}
        onChange={handleLanguageChange}
        className="bg-secondary-700 border border-secondary-600 rounded-md px-2 py-1 text-sm text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
      >
        {supportedLocales.map((lang) => (
          <option key={lang} value={lang}>
            {t(`ui.language.${lang}`)}
          </option>
        ))}
      </select>
    </div>
  );
}; 