import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppContextType, LocalUser, TransferRequest, RequestStatus } from '../types';

// Создаем контекст с дефолтными значениями
const AppContext = createContext<AppContextType | undefined>(undefined);

// Провайдер контекста
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null);
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [requests, setRequests] = useState<TransferRequest[]>([]);

  const createRequest = (request: Omit<TransferRequest, 'id' | 'status' | 'submissionDate'>) => {
    const newRequest: TransferRequest = {
      ...request,
      id: Date.now(), // Простая генерация ID
      status: RequestStatus.SENT,
      submissionDate: new Date()
    };
    setRequests(prev => [...prev, newRequest]);
  };

  const decideOnRequest = (requestId: number, status: RequestStatus, reason?: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status, 
            reviewDate: new Date(),
            rejectionReason: reason 
          }
        : req
    ));
  };

  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    // Простая реализация уведомлений
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const value: AppContextType = {
    currentUser,
    users,
    requests,
    createRequest,
    decideOnRequest,
    addNotification
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Хук для использования контекста
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export { AppContext }; 