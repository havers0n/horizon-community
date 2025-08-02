// Настройка тестового окружения
import { config } from 'dotenv';

// Загружаем переменные окружения для тестов
config({ path: '.env.test' });

// Глобальные настройки для тестов
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.DB_PASSWORD = 'test_password';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.PORT = '5001';
process.env.HOST = 'localhost';

// Увеличиваем таймаут для тестов
jest.setTimeout(10000);

// Глобальные моки
global.console = {
  ...console,
  // Отключаем логи в тестах для чистоты вывода
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Мокаем все внешние зависимости
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      admin: {
        createUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'auth-123' } },
          error: null
        }),
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { 
            user: { id: 'auth-123' },
            session: { access_token: 'test-token' }
          },
          error: null
        }),
      },
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { 
          user: { id: 'auth-123' },
          session: { access_token: 'test-token' }
        },
        error: null
      }),
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'auth-123' } },
        error: null
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}));

// Мокаем storage
jest.mock('../storage', () => ({
  storage: {
    getUserByEmail: jest.fn(),
    getUserByUsername: jest.fn(),
    createUser: jest.fn(),
    getUserByAuthId: jest.fn(),
    getCharactersByOwner: jest.fn(),
    getAllUsers: jest.fn(),
    createNotification: jest.fn(),
    getApplicationsByUser: jest.fn(),
    createApplication: jest.fn(),
    getReportsByUser: jest.fn(),
    createReport: jest.fn(),
    getNotificationsByUser: jest.fn(),
    getAllDepartments: jest.fn(),
    getDepartment: jest.fn(),
    createDepartment: jest.fn(),
    updateDepartment: jest.fn(),
    deleteDepartment: jest.fn(),
    getDepartmentMembers: jest.fn(),
    getDepartmentStats: jest.fn(),
    getApplicationById: jest.fn(),
    updateApplication: jest.fn(),
    deleteApplication: jest.fn(),
    getReportById: jest.fn(),
    updateReport: jest.fn(),
    deleteReport: jest.fn(),
    getReportsByStatus: jest.fn(),
    getReportsByDateRange: jest.fn(),
    markNotificationAsRead: jest.fn(),
    markAllNotificationsAsRead: jest.fn(),
    deleteNotification: jest.fn(),
    getNotificationById: jest.fn(),
    getUnreadNotificationsByUser: jest.fn(),
  }
}));

// Мокаем BusinessLogic
jest.mock('../businessLogic', () => ({
  BusinessLogic: jest.fn().mockImplementation(() => ({
    canSubmitApplication: jest.fn(),
    getUserApplicationStats: jest.fn(),
    advanceApplicationStatus: jest.fn(),
  }))
}));

// Мокаем Scheduler
jest.mock('../scheduler', () => ({
  Scheduler: jest.fn().mockImplementation(() => ({
    scheduleJob: jest.fn(),
    cancelJob: jest.fn(),
    getJobs: jest.fn(),
  }))
}));

// Мокаем file system
jest.mock('fs/promises', () => ({
  access: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
  mkdir: jest.fn(),
  readdir: jest.fn(),
}));

// Мокаем path
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/')),
  dirname: jest.fn((path) => path.split('/').slice(0, -1).join('/')),
  basename: jest.fn((path) => path.split('/').pop()),
}));

// Мокаем middleware аутентификации
jest.mock('../middleware/auth.middleware', () => ({
  authenticateToken: jest.fn((req: any, res: any, next: any) => {
    // По умолчанию пропускаем аутентификацию в тестах
    req.user = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'candidate',
      status: 'active'
    };
    next();
  }),
  requireSupervisor: jest.fn((req: any, res: any, next: any) => {
    if (!req.user || !['supervisor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Supervisor access required' });
    }
    next();
  }),
  requireAdmin: jest.fn((req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  }),
}));

// Очистка после каждого теста
afterEach(() => {
  jest.clearAllMocks();
}); 