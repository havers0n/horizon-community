import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User, Character } from '../services/api';
import { setTokenGlobally, clearTokenGlobally } from '../src/lib/auth-init';

interface AuthContextType {
  user: User | null;
  characters: Character[];
  activeCharacter: Character | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setActiveCharacter: (character: Character | null) => void;
  refreshCharacters: () => Promise<void>;
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
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('[AuthProvider] Initializing with isLoading:', isLoading);

  const isAuthenticated = !!user;

  // Функция для получения персонажей пользователя
  const fetchUserCharacters = async (): Promise<Character[]> => {
    try {
      console.log('[AuthContext] Fetching user characters...');
      const response = await apiService.getUserCharacters();
      console.log('[AuthContext] Characters response:', response);
      if (response.success && response.data) {
        console.log('[AuthContext] Characters loaded:', response.data);
        return response.data;
      } else {
        console.error('Failed to fetch characters:', response.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
      return [];
    }
  };

  // Функция для установки активного персонажа
  const setActiveCharacterHandler = (character: Character | null) => {
    console.log('[AuthProvider] Setting active character:', character);
    setActiveCharacter(character);
    
    // Сохраняем выбор в localStorage
    if (character) {
      localStorage.setItem('activeCharacterId', character.id.toString());
    } else {
      localStorage.removeItem('activeCharacterId');
    }
  };

  // Функция для обновления списка персонажей
  const refreshCharacters = async () => {
    try {
      console.log('[AuthContext] Refreshing characters...');
      const fetchedCharacters = await fetchUserCharacters();
      console.log('[AuthContext] Fetched characters:', fetchedCharacters);
      setCharacters(fetchedCharacters);
      
      // Если нет активного персонажа, но есть персонажи, выбираем первого
      if ((!activeCharacter || !fetchedCharacters.find(c => c.id === activeCharacter.id)) && fetchedCharacters.length > 0) {
        console.log('[AuthContext] Setting active character from fetched characters');
        const savedCharacterId = localStorage.getItem('activeCharacterId');
        const tempCharacterId = localStorage.getItem('tempActiveCharacterId');
        const characterId = tempCharacterId || savedCharacterId;
        
        const savedCharacter = characterId
          ? fetchedCharacters.find(char => char.id.toString() === characterId)
          : null;
        
        setActiveCharacterHandler(savedCharacter || fetchedCharacters[0]);
        
        // Очищаем временный ID после использования
        if (tempCharacterId) {
          localStorage.removeItem('tempActiveCharacterId');
        }
      } else {
        console.log('[AuthContext] No need to set active character. Current:', activeCharacter, 'Fetched count:', fetchedCharacters.length);
      }
    } catch (error) {
      console.error('Error refreshing characters:', error);
    }
  };

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
        await refreshCharacters();
        
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
    setActiveCharacter(null);
    localStorage.removeItem('activeCharacterId');
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.getCurrentUser();
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setCharacters(response.data.characters);
        
        // Восстанавливаем активного персонажа
        if (response.data.characters.length > 0) {
          const savedCharacterId = localStorage.getItem('activeCharacterId');
          const savedCharacter = savedCharacterId 
            ? response.data.characters.find(char => char.id.toString() === savedCharacterId)
            : null;
          
          setActiveCharacterHandler(savedCharacter || response.data.characters[0]);
        }
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
    activeCharacter,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    setActiveCharacter: setActiveCharacterHandler,
    refreshCharacters,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 