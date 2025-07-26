import '@testing-library/jest-dom';

// Мок для nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id-123')
}));

// Настройка моков для тестов
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [], error: null })
    }))
  }
}));

// Мок для localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
global.localStorage = localStorageMock as Storage;

// Мок для sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
global.sessionStorage = sessionStorageMock as Storage;

// Мок для fetch
global.fetch = jest.fn();

// Мок для WebSocket
const WebSocketMock = jest.fn().mockImplementation(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}));
(WebSocketMock as any).CONNECTING = 0;
(WebSocketMock as any).OPEN = 1;
(WebSocketMock as any).CLOSING = 2;
(WebSocketMock as any).CLOSED = 3;
global.WebSocket = WebSocketMock as any;

// Мок для ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Мок для IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Мок для matchMedia (только если window доступен)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Мок для URL.createObjectURL (только если window доступен)
if (typeof window !== 'undefined') {
  global.URL.createObjectURL = jest.fn(() => 'mocked-url');
  global.URL.revokeObjectURL = jest.fn();
}

// Мок для FileReader
const FileReaderMock = jest.fn().mockImplementation(() => ({
  readAsDataURL: jest.fn(),
  readAsText: jest.fn(),
  readAsArrayBuffer: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  result: null,
  error: null,
  readyState: 0,
  LOADING: 1,
  DONE: 2,
  EMPTY: 0
}));
(FileReaderMock as any).EMPTY = 0;
(FileReaderMock as any).LOADING = 1;
(FileReaderMock as any).DONE = 2;
global.FileReader = FileReaderMock as any;

// Настройка переменных окружения для тестов
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';

// Глобальные настройки для тестов
beforeEach(() => {
  // Очищаем все моки перед каждым тестом
  jest.clearAllMocks();
  
  // Сбрасываем localStorage и sessionStorage
  localStorageMock.clear();
  sessionStorageMock.clear();
  
  // Сбрасываем fetch мок
  (global.fetch as jest.Mock).mockClear();
});

afterEach(() => {
  // Очищаем все таймеры после каждого теста
  jest.clearAllTimers();
});

// Глобальные обработчики ошибок для тестов
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
}); 