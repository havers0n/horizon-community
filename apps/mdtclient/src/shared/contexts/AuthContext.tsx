import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authUtils } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  checkAuth: () => Promise<boolean>;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
              const { data: userData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
              if (error) {
                console.error('[Auth] Error fetching user data:', error);
              } else if (userData) {
                const user: User = {
                  id: userData.id.toString(),
                  email: userData.email,
                  role: userData.role,
                  name: userData.username || userData.email
                };
                setUser(user);
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
        authUtils.removeToken();
        return false;
      }
      
      if (!session) {
        console.log('[Auth] No active session found');
        setUser(null);
        authUtils.removeToken();
        return false;
      }
      
      const token = session.access_token;
      console.log('[Auth] Session found, token:', token ? 'present' : 'missing');
      
      if (!token) {
        console.error('[Auth] ERROR: No access token in session!');
        setUser(null);
        authUtils.removeToken();
        return false;
      }
      
      // Сохраняем токен
      authUtils.setToken(token);
      console.log('[Auth] Token saved to localStorage');
      
      // Получаем данные пользователя
      try {
        console.log('[Auth] Fetching user data for auth_id:', session.user.id);
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        console.log('[Auth] User data result:', { userData: !!userData, userError: !!userError });
          
        if (userError) {
          console.error('[Auth] Error fetching user data:', userError);
          setUser(null);
          return false;
        }
        
        if (userData) {
          const user: User = {
            id: userData.id.toString(),
            email: userData.email,
            role: userData.role,
            name: userData.username || userData.email
          };
          setUser(user);
          console.log('[Auth] User authenticated:', user);
          return true;
        } else {
          console.error('[Auth] No user data found for auth_id:', session.user.id);
          setUser(null);
          return false;
        }
      } catch (error) {
        console.error('[Auth] Error in user data fetch:', error);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('[Auth] Auth check error:', error);
      setUser(null);
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
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (userError) {
            console.error('[Auth] Error fetching user data:', userError);
            throw userError;
          }
          
          if (userData) {
            const user: User = {
              id: userData.id.toString(),
              email: userData.email,
              role: userData.role,
              name: userData.username || userData.email
            };
            setUser(user);
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
      authUtils.removeToken();
      console.log('[Auth] Logout successful');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateUser,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 
