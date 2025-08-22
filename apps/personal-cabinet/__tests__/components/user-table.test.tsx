import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserTable } from '@/widgets/user-table/ui/UserTable';
import { userManagementApi } from '@/shared/api/user-management';

// Mock the user management API
vi.mock('@/shared/api/user-management', () => ({
  userManagementApi: {
    getUsersWithRoles: vi.fn(),
  },
}));

// Mock the debounce hook
vi.mock('@/shared/hooks/use-debounce', () => ({
  useDebounce: vi.fn((value) => value),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Settings: () => <div data-testid="settings-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Users: () => <div data-testid="users-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
}));

const mockGetUsersWithRoles = vi.mocked(userManagementApi.getUsersWithRoles);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('UserTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', async () => {
    // Arrange
    mockGetUsersWithRoles.mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    );

    // Act
    render(<UserTable />, { wrapper: createWrapper() });

    // Assert
    expect(screen.getByText('Пользователи системы')).toBeInTheDocument();
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('should render users table when data is loaded', async () => {
    // Arrange
    const mockUsersData = {
      users: [
        {
          id: '1',
          username: 'testuser1',
          email: 'test1@example.com',
          roles: [
            { id: 'role1', name: 'admin', display_name: 'Администратор' }
          ],
          created_at: '2023-01-01T00:00:00Z',
          last_sign_in_at: '2023-01-01T12:00:00Z',
        },
        {
          id: '2',
          username: 'testuser2',
          email: 'test2@example.com',
          roles: [],
          created_at: '2023-01-02T00:00:00Z',
        },
      ],
      total_count: 2,
      page: 1,
      page_limit: 20,
      total_pages: 1,
    };

    mockGetUsersWithRoles.mockResolvedValue(mockUsersData);

    // Act
    render(<UserTable />, { wrapper: createWrapper() });

    // Assert
    await waitFor(() => {
      expect(screen.getByText('testuser1')).toBeInTheDocument();
      expect(screen.getByText('test1@example.com')).toBeInTheDocument();
      expect(screen.getByText('Администратор')).toBeInTheDocument();
      
      expect(screen.getByText('testuser2')).toBeInTheDocument();
      expect(screen.getByText('test2@example.com')).toBeInTheDocument();
      expect(screen.getByText('Без ролей')).toBeInTheDocument();
    });
  });

  it('should render error state when API fails', async () => {
    // Arrange
    mockGetUsersWithRoles.mockRejectedValue(new Error('API Error'));

    // Act
    render(<UserTable />, { wrapper: createWrapper() });

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Ошибка загрузки пользователей/)).toBeInTheDocument();
      expect(screen.getByText(/API Error/)).toBeInTheDocument();
    });
  });

  it('should render empty state when no users found', async () => {
    // Arrange
    const mockEmptyData = {
      users: [],
      total_count: 0,
      page: 1,
      page_limit: 20,
      total_pages: 0,
    };

    mockGetUsersWithRoles.mockResolvedValue(mockEmptyData);

    // Act
    render(<UserTable />, { wrapper: createWrapper() });

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Нет пользователей в системе')).toBeInTheDocument();
    });
  });

  it('should call onManageUser when manage button is clicked', async () => {
    // Arrange
    const mockOnManageUser = vi.fn();
    const mockUsersData = {
      users: [
        {
          id: '1',
          username: 'testuser1',
          email: 'test1@example.com',
          roles: [],
          created_at: '2023-01-01T00:00:00Z',
        },
      ],
      total_count: 1,
      page: 1,
      page_limit: 20,
      total_pages: 1,
    };

    mockGetUsersWithRoles.mockResolvedValue(mockUsersData);

    // Act
    render(<UserTable onManageUser={mockOnManageUser} />, { wrapper: createWrapper() });

    // Assert
    await waitFor(() => {
      const manageButton = screen.getByRole('button', { name: /управлять ролями/i });
      expect(manageButton).toBeInTheDocument();
      
      manageButton.click();
      expect(mockOnManageUser).toHaveBeenCalledWith(mockUsersData.users[0]);
    });
  });
});