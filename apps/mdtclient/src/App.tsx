import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@/shared/contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { UIProvider } from '@/shared/contexts/UIContext';
import { LocaleProvider } from '@/shared/contexts/LocaleContext';
import { AuthGuard } from './components/AuthGuard';
import { TestTokenInserter } from './components/TestTokenInserter';
import { DashboardPage } from './pages/DashboardPage';
import { initializeAuthSync } from './lib/auth-init';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  console.log('App component rendering');
  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    IS_NUI: process.env.IS_NUI,
    BUILD_TARGET: process.env.BUILD_TARGET,
    API_KEY: process.env.API_KEY ? 'Present' : 'Missing'
  });

  // Инициализируем синхронизацию аутентификации
  useEffect(() => {
    initializeAuthSync();
    console.log('Auth sync initialized');
  }, []);

  // Проверяем доступность всех необходимых компонентов
  const componentsCheck = {
    ThemeProvider: !!ThemeProvider,
    AuthProvider: !!AuthProvider,
    UIProvider: !!UIProvider,
    LocaleProvider: !!LocaleProvider,
    AuthGuard: !!AuthGuard,
    TestTokenInserter: !!TestTokenInserter,
    DashboardPage: !!DashboardPage,
    Router: !!Router,
    QueryClientProvider: !!QueryClientProvider
  };

  console.log('Components availability:', componentsCheck);

  // Проверяем наличие всех необходимых элементов
  const missingComponents = Object.entries(componentsCheck)
    .filter(([_, available]) => !available)
    .map(([name]) => name);

  if (missingComponents.length > 0) {
    console.error('Missing components:', missingComponents);
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#dc2626', 
        color: 'white',
        fontFamily: 'monospace'
      }}>
        <h1>❌ Ошибка загрузки приложения</h1>
        <p>Отсутствуют следующие компоненты:</p>
        <ul>
          {missingComponents.map(comp => <li key={comp}>{comp}</li>)}
        </ul>
        <p>Проверьте импорты и зависимости.</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LocaleProvider>
            <UIProvider>
              <Router>
                <AuthGuard>
                  <div className="min-h-screen text-white overflow-hidden relative">
                    <div className="relative z-10">
                      <DashboardPage />
                    </div>
                  </div>
                </AuthGuard>
                <TestTokenInserter />
              </Router>
            </UIProvider>
          </LocaleProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 
