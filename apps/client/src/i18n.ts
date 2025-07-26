import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru.json';
import en from './locales/en.json';

const resources = {
  ru: {
    translation: ru
  },
  en: {
    translation: en
  }
};

// Определяем язык по умолчанию
const getDefaultLanguage = () => {
  const savedLanguage = localStorage.getItem('i18nextLng');
  if (savedLanguage && (savedLanguage === 'ru' || savedLanguage === 'en')) {
    return savedLanguage;
  }
  
  // Проверяем язык браузера
  const browserLanguage = navigator.language.toLowerCase();
  if (browserLanguage.startsWith('ru')) {
    return 'ru';
  }
  
  return 'ru'; // По умолчанию русский
};

console.log('Initializing i18n with language:', getDefaultLanguage());

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDefaultLanguage(),
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false
    }
  })
  .then(() => {
    console.log('i18n initialized successfully with language:', i18n.language);
  })
  .catch((error) => {
    console.error('i18n initialization failed:', error);
  });

export default i18n;
