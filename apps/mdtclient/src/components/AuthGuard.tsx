import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from '../features/auth/ui/LoginForm';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Показываем загрузку пока проверяем авторизацию
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован, показываем форму входа
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Если пользователь авторизован, показываем основной контент
  return <>{children}</>;
}; 