export const APP_CONFIG = {
  name: 'RolePlay Identity MDT',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  isNUI: process.env.IS_NUI === 'true',
  buildTarget: process.env.BUILD_TARGET || 'browser',
  
  // API конфигурация
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
    timeout: 10000,
  },
  
  // Supabase конфигурация
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  
  // Локализация
  locales: {
    default: 'en',
    supported: ['en', 'ru'],
  },
  
  // Темы
  themes: {
    default: 'dark',
    supported: ['light', 'dark', 'auto'],
  },
  
  // Департаменты
  departments: {
    police: { id: 1, name: 'LSPD', color: '#1e40af' },
    ems: { id: 2, name: 'EMS', color: '#dc2626' },
    fire: { id: 3, name: 'LACoFD', color: '#ea580c' },
    dispatch: { id: 4, name: 'Dispatch', color: '#059669' },
    civil: { id: 5, name: 'Civil', color: '#7c3aed' },
  },
} as const; 