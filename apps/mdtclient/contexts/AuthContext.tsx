import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User, Character } from '../services/api';
import { setTokenGlobally, clearTokenGlobally } from '../src/lib/auth-init';

interface AuthContextType {
  user: User | null;
  characters: Character[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log('[AuthProvider] Initializing with isLoading:', isLoading);

  const isAuthenticated = !!user;

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        const { user: userData, session } = response.data;
        
        // Сохраняем токен из сессии во все системы
        if (session?.access_token) {
          setTokenGlobally(session.access_token);
        }
        
        setUser(userData);
        
        // Получаем персонажей пользователя
        const userResponse = await apiService.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          setCharacters(userResponse.data.characters);
        }
        
        return true;
      } else {
        console.error('Login failed:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.register({ username, email, password });
      
      if (response.success && response.data) {
        const { user: userData } = response.data;
        setUser(userData);
        return true;
      } else {
        console.error('Registration failed:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    clearTokenGlobally();
    setUser(null);
    setCharacters([]);
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.getCurrentUser();
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setCharacters(response.data.characters);
      } else {
        // Если не удалось получить пользователя, возможно токен истек
        console.log('Failed to get current user, logging out');
        logout();
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  // Проверяем аутентификацию при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[AuthProvider] Starting auth check...');
      try {
        const token = apiService.getToken();
        console.log('[AuthProvider] Token found:', !!token);
        
        if (token) {
          console.log('[AuthProvider] Token exists, refreshing user...');
          await refreshUser();
        } else {
          console.log('[AuthProvider] No token found, user not authenticated');
        }
      } catch (error) {
        console.error('[AuthProvider] Auth check failed:', error);
      } finally {
        console.log('[AuthProvider] Setting isLoading to false');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    characters,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 