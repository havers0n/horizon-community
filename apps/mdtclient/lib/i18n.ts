import en from '../locales/en.json';
import ru from '../locales/ru.json';

export type Locale = 'en' | 'ru';

export interface Translations {
  [key: string]: any;
}

const translations: Record<Locale, Translations> = {
  en,
  ru,
};

class I18n {
  private locale: Locale = 'ru'; // По умолчанию русский язык
  private fallbackLocale: Locale = 'en';

  constructor() {
    // Попытка получить сохраненную локаль из localStorage
    const savedLocale = localStorage.getItem('mdtclient-locale') as Locale;
    if (savedLocale && translations[savedLocale]) {
      this.locale = savedLocale;
    }
  }

  setLocale(locale: Locale): void {
    if (translations[locale]) {
      this.locale = locale;
      localStorage.setItem('mdtclient-locale', locale);
    }
  }

  getLocale(): Locale {
    return this.locale;
  }

  getSupportedLocales(): Locale[] {
    return Object.keys(translations) as Locale[];
  }

  t(key: string, params?: Record<string, any>): string {
    const keys = key.split('.');
    let value: any = translations[this.locale];

    // Поиск значения в текущей локали
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }

    // Если значение не найдено, ищем в fallback локали
    if (value === undefined && this.locale !== this.fallbackLocale) {
      value = translations[this.fallbackLocale];
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          value = undefined;
          break;
        }
      }
    }

    // Если значение все еще не найдено, возвращаем ключ
    if (value === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    // Если это строка, применяем параметры
    if (typeof value === 'string') {
      if (params) {
        return value.replace(/\{(\w+)\}/g, (match, param) => {
          return params[param] !== undefined ? String(params[param]) : match;
        });
      }
      return value;
    }

    // Если это не строка, возвращаем ключ
    console.warn(`Translation value is not a string: ${key}`);
    return key;
  }

  // Вспомогательные методы для часто используемых переводов
  getRoleName(role: string): string {
    return this.t(`roles.${role.toLowerCase()}`) || role;
  }

  getUnitStatus(status: string): string {
    const statusKey = status.toLowerCase().replace(/[^a-z]/g, '');
    return this.t(`unitStatus.${statusKey}`) || status;
  }

  getDepartmentName(department: string): string {
    const deptKey = department.toLowerCase();
    return this.t(`departments.${deptKey}`) || department;
  }

  getReportType(type: string): string {
    return this.t(`reports.${type.toLowerCase()}`) || type;
  }

  getPriority(priority: string): string {
    return this.t(`incidents.priority.${priority.toLowerCase()}`) || priority;
  }

  // Форматирование дат и времени
  formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(this.locale === 'ru' ? 'ru-RU' : 'en-US', options);
  }

  formatTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString(this.locale === 'ru' ? 'ru-RU' : 'en-US', options);
  }

  formatDateTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString(this.locale === 'ru' ? 'ru-RU' : 'en-US', options);
  }

  // Форматирование относительного времени
  formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return this.t('time.now');
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${this.t('time.minutes')} ${this.t('time.ago')}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${this.t('time.hours')} ${this.t('time.ago')}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${this.t('time.days')} ${this.t('time.ago')}`;
    }

    return this.formatDate(dateObj);
  }

  // Форматирование чисел
  formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
    return num.toLocaleString(this.locale === 'ru' ? 'ru-RU' : 'en-US', options);
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat(this.locale === 'ru' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }
}

// Создаем единственный экземпляр
const i18n = new I18n();

export default i18n;

// React Hook для использования в компонентах
export const useTranslation = () => {
  return {
    t: i18n.t.bind(i18n),
    locale: i18n.getLocale(),
    setLocale: i18n.setLocale.bind(i18n),
    getSupportedLocales: i18n.getSupportedLocales.bind(i18n),
    getRoleName: i18n.getRoleName.bind(i18n),
    getUnitStatus: i18n.getUnitStatus.bind(i18n),
    getDepartmentName: i18n.getDepartmentName.bind(i18n),
    getReportType: i18n.getReportType.bind(i18n),
    getPriority: i18n.getPriority.bind(i18n),
    formatDate: i18n.formatDate.bind(i18n),
    formatTime: i18n.formatTime.bind(i18n),
    formatDateTime: i18n.formatDateTime.bind(i18n),
    formatRelativeTime: i18n.formatRelativeTime.bind(i18n),
    formatNumber: i18n.formatNumber.bind(i18n),
    formatCurrency: i18n.formatCurrency.bind(i18n),
  };
};

// Типы для TypeScript
export type TranslationKey = string;
export type TranslationParams = Record<string, any>; 