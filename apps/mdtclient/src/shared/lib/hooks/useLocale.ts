// Заглушка для useLocale хука
export const useLocale = () => {
  return {
    t: (key: string) => key,
    locale: 'en',
    setLocale: (locale: string) => {},
  };
}; 