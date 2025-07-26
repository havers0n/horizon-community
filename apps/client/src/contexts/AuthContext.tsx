import React, { createContext, useContext, useEffect, useState } from 'react';
import { setAuthState, clearAuthState, getAuthState, getAuthHeaders } from '@/lib/auth';
import type { User } from '@shared/schema';

interface AuthContextType {
  user: Omit<User, 'passwordHash'> | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'passwordHash'> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // При инициализации проверяем токен и получаем пользователя
    const { token } = getAuthState();
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } as Record<string, string>,
        credentials: 'include',
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Не удалось получить пользователя');
          return res.json();
        })
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => {
          setUser(null);
          clearAuthState();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Ошибка входа');
    }
    const { user, session } = await res.json();
    setUser(user);
    setAuthState(user, session?.access_token || session?.accessToken || '');
  };

  const signUp = async (email: string, password: string, username: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Ошибка регистрации');
    }
    const { user, session } = await res.json();
    setUser(user);
    setAuthState(user, session?.access_token || session?.accessToken || '');
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } as Record<string, string>,
        credentials: 'include',
      });
    } catch {}
    setUser(null);
    clearAuthState();
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

