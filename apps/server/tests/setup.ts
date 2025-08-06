// Настройка тестового окружения
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Загружаем переменные окружения для тестов
// config({ path: '.env.test' }); // This line is removed as per the new_code

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
jest.setTimeout(30000);

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

// Создаем фиктивный Supabase клиент для тестов
const createMockSupabaseClient = () => {
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    and: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockReturnThis(),
    then: jest.fn().mockResolvedValue({ data: null, error: null }),
    execute: jest.fn().mockResolvedValue({ data: null, error: null }),
  };

  return {
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
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'auth-123' } },
          error: null
        }),
        updateUserById: jest.fn().mockResolvedValue({
          data: { user: { id: 'auth-123' } },
          error: null
        }),
        deleteUser: jest.fn().mockResolvedValue({
          data: null,
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
      signUp: jest.fn().mockResolvedValue({
        data: { 
          user: { id: 'auth-123' },
          session: { access_token: 'test-token' }
        },
        error: null
      }),
      signOut: jest.fn().mockResolvedValue({
        error: null
      }),
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'auth-123' } },
        error: null
      }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
    },
    from: jest.fn(() => mockQueryBuilder),
    rpc: jest.fn(() => mockQueryBuilder),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: null, error: null }),
        download: jest.fn().mockResolvedValue({ data: null, error: null }),
        remove: jest.fn().mockResolvedValue({ data: null, error: null }),
        list: jest.fn().mockResolvedValue({ data: null, error: null }),
        createSignedUrl: jest.fn().mockResolvedValue({ data: null, error: null }),
        createSignedUploadUrl: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
    realtime: {
      channel: jest.fn(() => ({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockResolvedValue({}),
        unsubscribe: jest.fn().mockResolvedValue({}),
      })),
    },
  };
};

// Мокаем createSupabaseClient - это ключевой мок для всей системы
jest.mock('../src/core/lib/supabase', () => ({
  createSupabaseClient: jest.fn((schema: string) => {
    const mockClient = createMockSupabaseClient() as any;
    // Добавляем информацию о схеме для отладки
    mockClient.schema = schema;
    return mockClient;
  }),
  supabase: createMockSupabaseClient(),
  mdtClient: createMockSupabaseClient(),
}));

// Мокаем @supabase/supabase-js для случаев прямого импорта
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => createMockSupabaseClient()),
}));

// Мокаем middleware аутентификации
jest.mock('../src/api/middleware/auth.middleware', () => ({
  authenticateToken: jest.fn((req: any, res: any, next: any) => {
    // По умолчанию пропускаем аутентификацию в тестах
    req.user = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      role: 'candidate',
      status: 'active',
      characterId: 'char-test-id',
    };
    next();
  }),
  authenticateCadToken: jest.fn((req: any, res: any, next: any) => {
    req.user = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      role: 'officer',
      status: 'active',
      characterId: 'char-test-id',
    };
    next();
  }),
  authenticateApiToken: jest.fn((req: any, res: any, next: any) => {
    req.user = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin',
      status: 'active',
      characterId: 'char-test-id',
    };
    next();
  }),
  authenticateAny: jest.fn((req: any, res: any, next: any) => {
    req.user = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      role: 'candidate',
      status: 'active',
      characterId: 'char-test-id',
    };
    next();
  }),
  requireRole: jest.fn((minimumRole: string) => (req: any, res: any, next: any) => {
    // In a test environment, we generally want to bypass role checks
    // and test the controller logic itself.
    // Specific authorization tests should mock this differently.
    next();
  }),
  requireExactRole: jest.fn((role: string) => (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: `${role} access required` });
    }
    next();
  }),
  requirePermission: jest.fn((permission: string) => (req: any, res: any, next: any) => {
    // Простая проверка - в тестах всегда разрешаем
    next();
  }),
  requireActiveStatus: jest.fn((req: any, res: any, next: any) => {
    if (!req.user || req.user.status !== 'active') {
      return res.status(403).json({ message: 'Active status required' });
    }
    next();
  }),
}));

// Мокаем альтернативный middleware
jest.mock('../src/api/middleware/auth-fixed.middleware', () => ({
  authenticateToken: jest.fn((req: any, res: any, next: any) => {
    req.user = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      role: 'candidate',
      status: 'active'
    };
    next();
  }),
  authenticateCadToken: jest.fn((req: any, res: any, next: any) => {
    req.user = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      role: 'officer',
      status: 'active'
    };
    next();
  }),
  authenticateApiToken: jest.fn((req: any, res: any, next: any) => {
    req.user = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin',
      status: 'active'
    };
    next();
  }),
  authenticateAny: jest.fn((req: any, res: any, next: any) => {
    req.user = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      role: 'candidate',
      status: 'active'
    };
    next();
  }),
}));

// Мокаем logging middleware
jest.mock('../src/api/middleware/logging.middleware', () => ({
  loggingMiddleware: jest.fn((req: any, res: any, next: any) => next()),
  errorLoggingMiddleware: jest.fn((error: any, req: any, res: any, next: any) => next(error)),
  performanceMiddleware: jest.fn((req: any, res: any, next: any) => next()),
  securityLoggingMiddleware: jest.fn((req: any, res: any, next: any) => next()),
}));

// Мокаем security middleware
jest.mock('../src/api/middleware/security.middleware', () => ({
  validateInput: jest.fn((req: any, res: any, next: any) => next()),
  sanitizeInput: jest.fn((req: any, res: any, next: any) => next()),
  securityErrorHandler: jest.fn((error: any, req: any, res: any, next: any) => next(error)),
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

// Мокаем WebSocket сервер
jest.mock('../src/websocket', () => ({
  initializeCADWebSocket: jest.fn(() => ({
    broadcastEvent: jest.fn(),
    broadcastUnitStatusUpdate: jest.fn(),
    broadcastNewCall: jest.fn(),
    broadcastCallStatusUpdate: jest.fn(),
    broadcastPanicAlert: jest.fn(),
    broadcastBOLOAlert: jest.fn(),
    stop: jest.fn(),
    getStats: jest.fn(() => ({ clients: 0, events: 0 })),
  })),
  getCADWebSocket: jest.fn(() => ({
    broadcastEvent: jest.fn(),
    broadcastUnitStatusUpdate: jest.fn(),
    broadcastNewCall: jest.fn(),
    broadcastCallStatusUpdate: jest.fn(),
    broadcastPanicAlert: jest.fn(),
    broadcastBOLOAlert: jest.fn(),
    stop: jest.fn(),
    getStats: jest.fn(() => ({ clients: 0, events: 0 })),
  })),
}));

// Мокаем RealTimeService
jest.mock('../src/core/services/RealTimeService', () => ({
  RealTimeService: jest.fn().mockImplementation(() => ({
    broadcastEvent: jest.fn(),
    broadcastUnitStatusUpdate: jest.fn(),
    broadcastNewCall: jest.fn(),
    broadcastCallStatusUpdate: jest.fn(),
    broadcastPanicAlert: jest.fn(),
    broadcastBOLOAlert: jest.fn(),
    getEventsForChannels: jest.fn(() => []),
    getCacheStats: jest.fn(() => ({ size: 0, events: 0 })),
  })),
}));

// Мокаем CacheService
jest.mock('../src/core/services/CacheService', () => ({
  CacheService: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    size: jest.fn(() => 0),
    cleanup: jest.fn(),
    cached: jest.fn((key, fn) => fn()),
    invalidatePattern: jest.fn(),
  })),
}));

// Мокаем LoggerService
jest.mock('../src/core/services/LoggerService', () => ({
  LoggerService: jest.fn().mockImplementation(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    logApiCall: jest.fn(),
    logDatabaseQuery: jest.fn(),
    logUserAction: jest.fn(),
    logSecurityEvent: jest.fn(),
    logPerformance: jest.fn(),
    logError: jest.fn(),
    timeOperation: jest.fn((operation, fn) => fn()),
    timeSyncOperation: jest.fn((operation, fn) => fn()),
  })),
}));

// Мокаем CharacterService
jest.mock('../src/core/services/CharacterService', () => ({
  CharacterService: jest.fn().mockImplementation(() => ({
    createCharacter: jest.fn(),
    getCharacter: jest.fn(),
    updateCharacter: jest.fn(),
    deleteCharacter: jest.fn(),
    getCharactersByUser: jest.fn(),
    searchCharacters: jest.fn(),
  })),
}));

// Мокаем ApplicationService
jest.mock('../src/core/services/ApplicationService', () => ({
  ApplicationService: jest.fn().mockImplementation(() => ({
    createApplication: jest.fn(),
    getApplicationById: jest.fn(),
    updateApplication: jest.fn(),
    deleteApplication: jest.fn(),
    getUserApplications: jest.fn(),
    getApplicationsByStatus: jest.fn(),
  })),
}));

// Мокаем ReportService
jest.mock('../src/core/services/ReportService', () => ({
  ReportService: jest.fn().mockImplementation(() => ({
    createReport: jest.fn(),
    getReport: jest.fn(),
    updateReport: jest.fn(),
    deleteReport: jest.fn(),
    getReportsByAuthor: jest.fn(),
    getReportsByType: jest.fn(),
  })),
}));





// Глобальные хелперы для тестов
global.testHelpers = {
  createMockRequest: (overrides = {}) => ({
    body: {},
    query: {},
    params: {},
    headers: {},
    user: {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      role: 'candidate',
      status: 'active'
    },
    ...overrides,
  }),
  
  createMockResponse: () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.end = jest.fn().mockReturnValue(res);
    return res;
  },
  
  createMockNext: () => jest.fn(),
  
  createMockSupabaseClient: createMockSupabaseClient,
};

// Очистка после каждого теста
afterEach(() => {
  jest.clearAllMocks();
});

// Глобальные типы для TypeScript
declare global {
  var testHelpers: {
    createMockRequest: (overrides?: any) => any;
    createMockResponse: () => any;
    createMockNext: () => jest.Mock;
    createMockSupabaseClient: () => any;
  };
} 