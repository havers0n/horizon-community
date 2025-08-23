import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ProfileSummaryWidget } from '../ProfileSummaryWidget';
import { supabase } from '@/shared/lib/supabase';

// Mock Supabase
jest.mock('@/shared/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

// Mock компонентов
jest.mock('../ui/ProfileSummarySkeleton', () => ({
  ProfileSummarySkeleton: () => <div data-testid="profile-skeleton">Loading...</div>,
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Тестовые данные
const mockProfileData = {
  user: {
    id: 'test-user-id',
    username: 'testuser',
    first_name: 'John',
    last_name: 'Doe',
  },
  memberships: [
    {
      department_name: 'LSPD',
      division_name: 'Patrol Division',
      rank_name: 'Officer',
      is_primary: true,
    },
    {
      department_name: 'BCSO',
      division_name: 'Detective Division',
      rank_name: 'Detective',
      is_primary: false,
    },
  ],
  qualifications: [
    { id: '1', name: 'Firearms Training', code: 'FT001' },
    { id: '2', name: 'Advanced Driving', code: 'AD002' },
  ],
  warnings: {
    community: 1,
    game: 2,
  },
  leave_status: null,
};

const mockProfileDataWithLeave = {
  ...mockProfileData,
  leave_status: {
    is_on_leave: true,
    end_date: '2024-12-31',
  },
};

// Wrapper компонент для тестов
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ProfileSummaryWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows skeleton while loading', () => {
    mockSupabase.rpc.mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    );

    render(
      <TestWrapper>
        <ProfileSummaryWidget />
      </TestWrapper>
    );

    expect(screen.getByTestId('profile-skeleton')).toBeInTheDocument();
  });

  it('displays profile data correctly', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: mockProfileData,
      error: null,
    });

    render(
      <TestWrapper>
        <ProfileSummaryWidget />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Добро пожаловать, John Doe!')).toBeInTheDocument();
    });

    // Проверяем членства
    expect(screen.getByText('LSPD | Patrol Division')).toBeInTheDocument();
    expect(screen.getByText('BCSO | Detective Division (Совмещение)')).toBeInTheDocument();
    
    // Проверяем звания
    expect(screen.getByText('Звание: Officer')).toBeInTheDocument();
    expect(screen.getByText('Звание: Detective')).toBeInTheDocument();

    // Проверяем квалификации
    expect(screen.getByText('Firearms Training')).toBeInTheDocument();
    expect(screen.getByText('Advanced Driving')).toBeInTheDocument();

    // Проверяем предупреждения
    expect(screen.getByText('1')).toBeInTheDocument(); // Community warnings
    expect(screen.getByText('2')).toBeInTheDocument(); // Game warnings

    // Проверяем ссылку на профиль
    expect(screen.getByText('Посмотреть полный профиль')).toBeInTheDocument();
  });

  it('displays leave status when user is on leave', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: mockProfileDataWithLeave,
      error: null,
    });

    render(
      <TestWrapper>
        <ProfileSummaryWidget />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/В отпуске до 31\.12\.2024/)).toBeInTheDocument();
    });
  });

  it('handles no memberships gracefully', async () => {
    const dataWithoutMemberships = {
      ...mockProfileData,
      memberships: [],
    };

    mockSupabase.rpc.mockResolvedValue({
      data: dataWithoutMemberships,
      error: null,
    });

    render(
      <TestWrapper>
        <ProfileSummaryWidget />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Добро пожаловать, John Doe!')).toBeInTheDocument();
    });

    // Не должно быть заголовка "Департаменты"
    expect(screen.queryByText('Департаменты')).not.toBeInTheDocument();
  });

  it('displays fallback username when no first/last name', async () => {
    const dataWithUsernameOnly = {
      ...mockProfileData,
      user: {
        ...mockProfileData.user,
        first_name: null,
        last_name: null,
      },
    };

    mockSupabase.rpc.mockResolvedValue({
      data: dataWithUsernameOnly,
      error: null,
    });

    render(
      <TestWrapper>
        <ProfileSummaryWidget />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Добро пожаловать, testuser!')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    render(
      <TestWrapper>
        <ProfileSummaryWidget />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Ошибка загрузки профиля/)).toBeInTheDocument();
    });
  });

  it('does not show warnings section when no warnings', async () => {
    const dataWithoutWarnings = {
      ...mockProfileData,
      warnings: {
        community: 0,
        game: 0,
      },
    };

    mockSupabase.rpc.mockResolvedValue({
      data: dataWithoutWarnings,
      error: null,
    });

    render(
      <TestWrapper>
        <ProfileSummaryWidget />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Добро пожаловать, John Doe!')).toBeInTheDocument();
    });

    // Не должно быть заголовка "Предупреждения"
    expect(screen.queryByText('Предупреждения')).not.toBeInTheDocument();
  });
});