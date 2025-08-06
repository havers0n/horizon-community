export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000,
  retries: 3,
  
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      logout: '/api/auth/logout',
      me: '/api/auth/me',
    },
    citizens: {
      search: '/api/citizens/search',
      create: '/api/citizens',
      get: (id: string) => `/api/citizens/${id}`,
      update: (id: string) => `/api/citizens/${id}`,
      delete: (id: string) => `/api/citizens/${id}`,
    },
    vehicles: {
      search: '/api/vehicles/search',
      get: (id: string) => `/api/vehicles/${id}`,
    },
    weapons: {
      search: '/api/weapons/search',
      get: (id: string) => `/api/weapons/${id}`,
    },
    units: {
      list: '/api/units',
      updateStatus: (id: string) => `/api/units/${id}/status`,
    },
    calls: {
      list: '/api/calls',
      assign: (id: string) => `/api/calls/${id}/assign`,
    },
    bolos: {
      list: '/api/bolos',
      create: '/api/bolos',
    },
  },
} as const; 