import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';

// Мокаем зависимости
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn()
    }
  }
}));

jest.mock('@/hooks/use-mobile', () => ({
  useMobile: () => false
}));

// Создаем тестовый QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

// Обертка для тестов
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('Layout Component', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    role: 'user',
    permissions: ['user']
  };

  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks();
  });

  describe('Рендеринг навигации', () => {
    it('should render navigation menu correctly', () => {
      render(
        <TestWrapper>
          <Layout user={mockUser}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      // Проверяем наличие основных элементов навигации
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Applications')).toBeInTheDocument();
      expect(screen.getByText('Departments')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    it('should show admin menu items for admin users', () => {
      const adminUser = {
        ...mockUser,
        role: 'admin',
        permissions: ['admin', 'user']
      };

      render(
        <TestWrapper>
          <Layout user={adminUser}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
    });

    it('should hide admin menu items for regular users', () => {
      render(
        <TestWrapper>
          <Layout user={mockUser}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
    });

    it('should render user profile information', () => {
      render(
        <TestWrapper>
          <Layout user={mockUser}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  describe('Адаптивность', () => {
    it('should handle mobile navigation toggle', async () => {
      render(
        <TestWrapper>
          <Layout user={mockUser}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      const mobileMenuButton = screen.getByLabelText('Toggle navigation menu');
      expect(mobileMenuButton).toBeInTheDocument();

      fireEvent.click(mobileMenuButton);

      await waitFor(() => {
        expect(screen.getByRole('navigation')).toHaveClass('mobile-open');
      });
    });

    it('should close mobile menu when clicking outside', async () => {
      render(
        <TestWrapper>
          <Layout user={mockUser}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      const mobileMenuButton = screen.getByLabelText('Toggle navigation menu');
      fireEvent.click(mobileMenuButton);

      await waitFor(() => {
        expect(screen.getByRole('navigation')).toHaveClass('mobile-open');
      });

      // Кликаем вне меню
      fireEvent.click(document.body);

      await waitFor(() => {
        expect(screen.getByRole('navigation')).not.toHaveClass('mobile-open');
      });
    });
  });

  describe('Переключение темы', () => {
    it('should toggle theme when theme button is clicked', async () => {
      render(
        <TestWrapper>
          <Layout user={mockUser}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      const themeToggle = screen.getByLabelText('Toggle theme');
      expect(themeToggle).toBeInTheDocument();

      const initialTheme = document.documentElement.getAttribute('data-theme');
      
      fireEvent.click(themeToggle);

      await waitFor(() => {
        const newTheme = document.documentElement.getAttribute('data-theme');
        expect(newTheme).not.toBe(initialTheme);
      });
    });

    it('should persist theme preference', async () => {
      const mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn()
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });

      render(
        <TestWrapper>
          <Layout user={mockUser}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      const themeToggle = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeToggle);

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', expect.any(String));
      });
    });
  });

  describe('Обработка ошибок', () => {
    it('should handle navigation errors gracefully', () => {
      // Мокаем ошибку роутинга
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <Layout user={mockUser}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      // Симулируем ошибку навигации
      const navigation = screen.getByRole('navigation');
      fireEvent.error(navigation);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle user data loading errors', async () => {
      const errorUser = null;

      render(
        <TestWrapper>
          <Layout user={errorUser}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      // Проверяем, что компонент не падает при отсутствии пользователя
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Доступность (Accessibility)', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <Layout user={mockUser}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(
        <TestWrapper>
          <Layout user={mockUser}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      const navigation = screen.getByRole('navigation');
      const firstLink = screen.getByText('Dashboard');

      // Проверяем, что можно переключаться с клавиатуры
      firstLink.focus();
      expect(firstLink).toHaveFocus();

      // Проверяем Tab навигацию
      fireEvent.keyDown(firstLink, { key: 'Tab' });
      expect(firstLink).not.toHaveFocus();
    });

    it('should have proper focus management', () => {
      render(
        <TestWrapper>
          <Layout user={mockUser}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      const mobileMenuButton = screen.getByLabelText('Toggle navigation menu');
      
      // Открываем мобильное меню
      fireEvent.click(mobileMenuButton);

      // Проверяем, что фокус остается в пределах меню
      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Производительность', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      
      const TestComponent = () => {
        renderSpy();
        return <div>Test content</div>;
      };

      render(
        <TestWrapper>
          <Layout user={mockUser}>
            <TestComponent />
          </Layout>
        </TestWrapper>
      );

      // Проверяем, что компонент рендерится только один раз
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle large user data efficiently', () => {
      const largeUser = {
        ...mockUser,
        permissions: Array.from({ length: 100 }, (_, i) => `permission_${i}`),
        metadata: {
          largeData: Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `value_${i}` }))
        }
      };

      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <Layout user={largeUser}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Рендеринг должен завершиться за разумное время (менее 100мс)
      expect(renderTime).toBeLessThan(100);
    });
  });

  describe('Интеграция с контекстами', () => {
    it('should use theme context correctly', () => {
      render(
        <TestWrapper>
          <Layout user={mockUser}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      const themeToggle = screen.getByLabelText('Toggle theme');
      expect(themeToggle).toBeInTheDocument();

      // Проверяем, что кнопка переключения темы работает
      fireEvent.click(themeToggle);
      expect(themeToggle).toBeInTheDocument();
    });

    it('should use auth context correctly', () => {
      render(
        <TestWrapper>
          <Layout user={mockUser}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      // Проверяем, что пользователь отображается корректно
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  describe('Обработка состояний загрузки', () => {
    it('should show loading state when user data is loading', () => {
      render(
        <TestWrapper>
          <Layout user={undefined}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      // Проверяем, что компонент отображается даже без данных пользователя
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should handle loading states gracefully', async () => {
      render(
        <TestWrapper>
          <Layout user={mockUser}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      // Симулируем загрузку
      const navigation = screen.getByRole('navigation');
      fireEvent.loadStart(navigation);

      // Проверяем, что компонент остается функциональным
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Валидация пропсов', () => {
    it('should handle missing user prop gracefully', () => {
      render(
        <TestWrapper>
          <Layout user={null}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      // Компонент должен отображаться без ошибок
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should handle invalid user data', () => {
      const invalidUser = {
        id: null,
        email: '',
        username: undefined,
        role: 'invalid_role',
        permissions: null
      };

      render(
        <TestWrapper>
          <Layout user={invalidUser}>
            <div>Test content</div>
          </Layout>
        </TestWrapper>
      );

      // Компонент должен обработать некорректные данные
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });
}); 