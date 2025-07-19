import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { setAuthState, clearAuthState, getAuthState } from '@/lib/auth';

interface User {
  id: string;
  email: string;
  username?: string;
  role?: string;
  status?: string;
  user_metadata?: {
    role?: string;
  };
  app_metadata?: {
    role?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем, есть ли сохраненный пользователь в localStorage
    const authState = getAuthState();
    if (authState.user) {
      setUser(authState.user as unknown as User);
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Определяем роль пользователя по email
    let role = 'candidate'; // по умолчанию
    let username = email.split('@')[0]; // извлекаем username из email
    let userId = 1; // ID по умолчанию
    
    if (email === 'admin@horizon.com') {
      role = 'admin';
      username = 'admin';
      userId = 1; // предполагаемый ID админа
    } else if (email === 'supervisor@horizon.com') {
      role = 'supervisor';
      username = 'supervisor_test';
      userId = 6; // предполагаемый ID супервайзера
    } else if (email === 'john.doe@horizon.com') {
      role = 'member';
      username = 'john_doe';
      userId = 2; // предполагаемый ID участника
    } else if (email === 'jane.smith@horizon.com') {
      role = 'member';
      username = 'jane_smith';
      userId = 3; // предполагаемый ID участника
    } else if (email === 'candidate@horizon.com') {
      role = 'candidate';
      username = 'candidate_test';
      userId = 19; // реальный ID из базы данных
    } else if (email === 'guest@horizon.com') {
      role = 'candidate'; // guest имеет роль candidate со статусом guest
      username = 'guest_user';
      userId = 5; // предполагаемый ID гостя
    }
    
    const mockUser: User = {
      id: userId.toString(), // используем строковый ID для совместимости
      email: email,
      username: username,
      role: role,
      status: 'active',
      user_metadata: {
        role: role
      },
      app_metadata: {
        role: role
      }
    };
    
    setUser(mockUser);
    
    // Сохраняем в правильном формате для getAuthState
    const token = `mock-token-${userId}-${Date.now()}`;
    setAuthState(mockUser as any, token);
    
    console.log('🔐 Токен сохранен:', token);
    console.log('🔐 localStorage auth_token:', localStorage.getItem('auth_token'));
    console.log('Logged in as:', role, mockUser);
  };

  const signUp = async (email: string, password: string, username: string) => {
    // При регистрации всегда создаем кандидата
    const mockUser: User = {
      id: '19', // используем ID candidate для новых пользователей
      email: email,
      username: username,
      role: 'candidate',
      status: 'active',
      user_metadata: {
        role: 'candidate'
      },
      app_metadata: {
        role: 'candidate'
      }
    };
    
    setUser(mockUser);
    
    // Сохраняем в правильном формате для getAuthState
    const token = `mock-token-19-${Date.now()}`;
    setAuthState(mockUser as any, token);
    
    console.log('Registered as candidate:', mockUser);
  };

  const signOut = async () => {
    setUser(null);
    clearAuthState();
    console.log('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

