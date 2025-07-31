export const THEME_CONFIG = {
  default: 'dark',
  supported: ['light', 'dark', 'auto'],
  
  presets: {
    light: {
      name: 'Light',
      colors: {
        primary: '#1e40af',
        secondary: '#64748b',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        border: '#e2e8f0',
      },
    },
    dark: {
      name: 'Dark',
      colors: {
        primary: '#3b82f6',
        secondary: '#94a3b8',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        border: '#334155',
      },
    },
  },
  
  departments: {
    police: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#dbeafe',
    },
    ems: {
      primary: '#dc2626',
      secondary: '#ef4444',
      accent: '#fecaca',
    },
    fire: {
      primary: '#ea580c',
      secondary: '#f97316',
      accent: '#fed7aa',
    },
    dispatch: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#a7f3d0',
    },
    civil: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#c4b5fd',
    },
  },
} as const; 