
import React, { useState, createContext, useMemo } from 'react';
import { Department, RequestStatus, TransferRequest, User } from './types';
import ProfilePage from './components/ProfilePage';
import SupervisorDashboard from './components/SupervisorDashboard';
import { NotificationContainer, NotificationType } from './components/Notification';
import type { NotificationProps } from './components/Notification';

// --- Mock Data ---
const initialUsers: User[] = [
    { id: 1, name: 'Иван Петров', department: Department.PD, isSupervisor: false },
    { id: 2, name: 'Мария Сидорова', department: Department.FD, isSupervisor: false },
    { id: 3, name: 'Сергей Кузнецов', department: Department.PD, isSupervisor: true },
    { id: 4, name: 'Анна Васильева', department: Department.FD, isSupervisor: true },
];

const initialRequests: TransferRequest[] = [
    {
        id: 1,
        userId: 1,
        fromDepartment: Department.PD,
        toDepartment: Department.FD,
        reason: 'Хочу сменить род деятельности, тушение пожаров мне ближе.',
        documentationRead: true,
        status: RequestStatus.APPROVED,
        submissionDate: new Date(2023, 10, 15),
        decisionDate: new Date(2023, 10, 16),
        supervisorComment: 'Одобрено. Удачи в новом департаменте.'
    },
    {
        id: 2,
        userId: 2,
        fromDepartment: Department.FD,
        toDepartment: Department.DD,
        reason: 'Давно хотел попробовать себя в роли диспетчера.',
        documentationRead: true,
        status: RequestStatus.REJECTED,
        submissionDate: new Date(2024, 1, 20),
        decisionDate: new Date(2024, 1, 21),
        supervisorComment: 'Недостаточно опыта для данной позиции. Попробуйте через полгода.'
    }
];

// --- App Context ---
interface AppContextType {
    currentUser: User | null;
    users: User[];
    requests: TransferRequest[];
    setCurrentUser: (user: User) => void;
    createRequest: (data: { toDepartment: Department, reason: string, documentationRead: boolean }) => void;
    decideOnRequest: (requestId: number, decision: RequestStatus, comment?: string) => void;
    addNotification: (message: string, type: NotificationType) => void;
}

export const AppContext = createContext<AppContextType>(null!);

const App: React.FC = () => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [requests, setRequests] = useState<TransferRequest[]>(initialRequests);
    const [currentUser, setCurrentUser] = useState<User | null>(users[0]);
    const [activeTab, setActiveTab] = useState<'profile' | 'supervisor'>('profile');
    const [notifications, setNotifications] = useState<Omit<NotificationProps, 'onDismiss'>[]>([]);

    const addNotification = (message: string, type: NotificationType) => {
        setNotifications(prev => [...prev, { id: Date.now(), message, type }]);
    };
    
    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const createRequest = ({ toDepartment, reason, documentationRead }: { toDepartment: Department, reason: string, documentationRead: boolean }) => {
        if (!currentUser) return;
        const newRequest: TransferRequest = {
            id: Date.now(),
            userId: currentUser.id,
            fromDepartment: currentUser.department,
            toDepartment,
            reason,
            documentationRead,
            status: RequestStatus.SENT,
            submissionDate: new Date(),
        };
        setRequests(prev => [...prev, newRequest]);
    };

    const decideOnRequest = (requestId: number, decision: RequestStatus, comment?: string) => {
        setRequests(prevRequests =>
            prevRequests.map(req => {
                if (req.id === requestId) {
                    // If approved, update the user's department
                    if (decision === RequestStatus.APPROVED) {
                        setUsers(prevUsers =>
                            prevUsers.map(u =>
                                u.id === req.userId ? { ...u, department: req.toDepartment } : u
                            )
                        );
                        // Logged-in user's department needs to be updated too if it's them
                        if (currentUser && currentUser.id === req.userId) {
                            setCurrentUser(prev => prev ? {...prev, department: req.toDepartment} : null);
                        }
                    }
                    return { ...req, status: decision, supervisorComment: comment, decisionDate: new Date() };
                }
                return req;
            })
        );
    };
    
    const contextValue = useMemo(() => ({
        currentUser, users, requests, setCurrentUser, createRequest, decideOnRequest, addNotification
    }), [currentUser, users, requests]);


    return (
        <AppContext.Provider value={contextValue}>
            <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
                <NotificationContainer notifications={notifications} onDismiss={removeNotification} />
                <div className="max-w-4xl mx-auto">
                    <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                            Система переводов
                        </h1>
                        <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-lg">
                            <span className="text-sm font-medium text-gray-400 pl-2">Пользователь:</span>
                             <select
                                value={currentUser?.id}
                                onChange={(e) => {
                                  const selectedUser = users.find(u => u.id === parseInt(e.target.value));
                                  if (selectedUser) {
                                      setCurrentUser(selectedUser);
                                      // reset tab to profile when user changes
                                      setActiveTab('profile');
                                  }
                                }}
                                className="bg-gray-700 border-gray-600 rounded-md py-1 px-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                            </select>
                        </div>
                    </header>
                    
                    {currentUser && (
                        <div className="mb-8">
                            <div className="border-b border-gray-700">
                                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                    <button onClick={() => setActiveTab('profile')} className={`${activeTab === 'profile' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>
                                        Мой профиль
                                    </button>
                                    {currentUser.isSupervisor && (
                                        <button onClick={() => setActiveTab('supervisor')} className={`${activeTab === 'supervisor' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>
                                            Панель супервайзера
                                        </button>
                                    )}
                                </nav>
                            </div>
                        </div>
                    )}

                    <main>
                       {activeTab === 'profile' && <ProfilePage />}
                       {activeTab === 'supervisor' && currentUser?.isSupervisor && <SupervisorDashboard />}
                    </main>
                </div>
            </div>
        </AppContext.Provider>
    );
};

export default App;
