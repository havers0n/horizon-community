import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authUtils } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { apiService } from '../../services/api';
import type { Character, User } from '../types';

// Локальный тип для AuthContext (совместимый с API)
interface AuthUser {
  id: string;
  email: string;
  role: string;
  roles?: string[]; // Добавлено для совместимости с существующим кодом
  name: string;
  username?: string; // Добавлено для совместимости с существующим кодом
}

interface AuthContextType {
  user: AuthUser | null;
  characters: Character[];
  activeCharacter: Character | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  checkAuth: () => Promise<boolean>;
  refreshCharacters: () => Promise<void>;
  setActiveCharacter: (character: Character | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Функция для установки активного персонажа
  const setActiveCharacterHandler = (character: Character | null) => {
    console.log('[Auth] Setting active character:', character?.firstName, character?.lastName);
    setActiveCharacter(character);
    
    if (character) {
      localStorage.setItem('activeCharacterId', character.id.toString());
    } else {
      localStorage.removeItem('activeCharacterId');
    }
  };

  // Функция для получения персонажей пользователя
  const fetchCharacters = async (userId: string) => {
    try {
      console.log('[Auth] Fetching characters for user:', userId);
      
      // Используем централизованный API-сервис вместо прямого вызова Supabase
      const charactersData = await apiService.getUserCharacters();
      
      console.log('[Auth] Characters fetched:', charactersData?.length || 0);
      console.log('[Auth] Characters data:', charactersData);
      
      return charactersData || [];
    } catch (error) {
      console.error('[Auth] Error in characters fetch:', error);
      return [];
    }
  };

  const refreshCharacters = async () => {
    if (user) {
      const chars = await fetchCharacters(user.id);
      setCharacters(chars);
      
      // Автоматически устанавливаем активного персонажа, если его нет
      if ((!activeCharacter || !chars.find(c => c.id === activeCharacter.id)) && chars.length > 0) {
        console.log('[Auth] Auto-setting active character from fetched characters');
        
        const savedCharacterId = localStorage.getItem('activeCharacterId');
        const tempCharacterId = localStorage.getItem('tempActiveCharacterId');
        
        const savedCharacter = savedCharacterId ? chars.find(c => c.id.toString() === savedCharacterId) : null;
        const tempCharacter = tempCharacterId ? chars.find(c => c.id.toString() === tempCharacterId) : null;
        
        setActiveCharacterHandler(savedCharacter || tempCharacter || chars[0]);
        
        if (tempCharacterId) {
          localStorage.removeItem('tempActiveCharacterId');
        }
      } else {
        console.log('[Auth] No need to set active character. Current:', activeCharacter, 'Fetched count:', chars.length);
      }
    }
  };

  // Проверка аутентификации при загрузке
  useEffect(() => {
    console.log('[Auth] useEffect triggered');
    const initializeAuth = async () => {
      try {
        console.log('[Auth] Starting auth initialization...');
        await checkAuth();
        console.log('[Auth] Auth initialization completed');
      } catch (error) {
        console.error('[Auth] Error during auth initialization:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();
    
    // Подписка на изменения аутентификации Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('[Auth] Supabase auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session) {
          const token = session.access_token;
          console.log('[Auth] User signed in, token:', token ? 'present' : 'missing');
          
          if (token) {
            authUtils.setToken(token);
            console.log('[Auth] Token saved to localStorage');
            
            // Получаем данные пользователя из базы данных
            try {
              const userData = await apiService.getCurrentUser();
              
              if (userData) {
                const user: AuthUser = {
                  id: userData.id.toString(),
                  email: userData.email || '',
                  role: userData.roles?.[0] || 'citizen', // Берем первую роль из массива
                  name: userData.username || userData.email || ''
                };
                setUser(user);
                
                // Получаем персонажей пользователя
                const chars = await fetchCharacters(user.id);
                setCharacters(chars);
                
                console.log('[Auth] User data loaded:', user);
              }
            } catch (error) {
              console.error('[Auth] Error in user data fetch:', error);
            }
          } else {
            console.error('[Auth] ERROR: No access token in Supabase session!');
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('[Auth] User signed out');
          setUser(null);
          setCharacters([]);
          authUtils.removeToken();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('[Auth] Checking authentication...');
      console.log('[Auth] Current localStorage token:', localStorage.getItem('auth_token'));
      
      // Проверяем текущую сессию Supabase
      console.log('[Auth] Getting Supabase session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('[Auth] Session result:', { session: !!session, error: !!error });
      
      if (error) {
        console.error('[Auth] Error getting session:', error);
        setUser(null);
        setCharacters([]);
        authUtils.removeToken();
        return false;
      }
      
      if (!session) {
        console.log('[Auth] No active session found');
        setUser(null);
        setCharacters([]);
        authUtils.removeToken();
        return false;
      }
      
      const token = session.access_token;
      console.log('[Auth] Session found, token:', token ? 'present' : 'missing');
      
      if (!token) {
        console.error('[Auth] ERROR: No access token in session!');
        setUser(null);
        setCharacters([]);
        authUtils.removeToken();
        return false;
      }
      
      // Сохраняем токен
      authUtils.setToken(token);
      console.log('[Auth] Token saved to localStorage');
      
      // Получаем данные пользователя
      try {
        console.log('[Auth] Fetching user data for auth_id:', session.user.id);
        const userData = await apiService.getCurrentUser();
        console.log('[Auth] User data result:', { userData: !!userData });
          
        if (userData) {
          const user: AuthUser = {
            id: userData.id.toString(),
            email: userData.email || '',
            role: userData.roles?.[0] || 'citizen', // Берем первую роль из массива
            name: userData.username || userData.email || ''
          };
          setUser(user);
          
          // Получаем персонажей пользователя
          const chars = await fetchCharacters(user.id);
          setCharacters(chars);
          
          console.log('[Auth] User authenticated:', user);
          return true;
        } else {
          console.error('[Auth] No user data found for auth_id:', session.user.id);
          setUser(null);
          setCharacters([]);
          return false;
        }
      } catch (error) {
        console.error('[Auth] Error in user data fetch:', error);
        setUser(null);
        setCharacters([]);
        return false;
      }
    } catch (error) {
      console.error('[Auth] Auth check error:', error);
      setUser(null);
      setCharacters([]);
      authUtils.removeToken();
      return false;
    } finally {
      console.log('[Auth] Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('[Auth] Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('[Auth] Login failed:', error);
        throw error;
      }
      
      console.log('[Auth] Supabase login successful. Session data:', data.session);
      
      // Убеждаемся, что сохраняем правильный токен
      const token = data.session?.access_token;
      if (token) {
        authUtils.setToken(token);
        console.log('[Auth] Token saved to localStorage');
      } else {
        console.error('[Auth] ERROR: No access token in Supabase session!');
        throw new Error('No access token received from Supabase');
      }
      
      // Получаем данные пользователя
      if (data.user) {
        try {
          const userData = await apiService.getCurrentUser();
            
          if (userData) {
            const user: AuthUser = {
              id: userData.id.toString(),
              email: userData.email || '',
              role: userData.roles?.[0] || 'citizen', // Берем первую роль из массива
              name: userData.username || userData.email || ''
            };
            setUser(user);
            
            // Получаем персонажей пользователя
            const chars = await fetchCharacters(user.id);
            setCharacters(chars);
            
            console.log('[Auth] User logged in successfully:', user);
          }
        } catch (error) {
          console.error('[Auth] Error in user data fetch:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('[Auth] Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('[Auth] Logging out...');
      await supabase.auth.signOut();
      setUser(null);
      setCharacters([]);
      authUtils.removeToken();
      console.log('[Auth] Logout successful');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    }
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  // Отладочная информация
  console.log('[AuthProvider] Current state:', {
    user: user?.email,
    charactersCount: characters.length,
    isLoading,
    isAuthenticated: !!user,
    userObject: user
  });

  // Добавляем дополнительную отладочную информацию при изменении состояния
  useEffect(() => {
    console.log('[AuthProvider] State changed:', {
      user: user?.email,
      charactersCount: characters.length,
      isLoading,
      isAuthenticated: !!user
    });
  }, [user, characters, isLoading]);

  return (
    <AuthContext.Provider value={{
      user,
      characters,
      activeCharacter,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateUser,
      checkAuth,
      refreshCharacters,
      setActiveCharacter: setActiveCharacterHandler
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 
