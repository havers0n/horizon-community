
import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { TransferRequest, User, RequestStatus } from '../types';
import ArrowRightIcon from './icons/ArrowRightIcon';

const SupervisorDashboard: React.FC = () => {
    const { currentUser, users, requests, decideOnRequest, addNotification } = useContext(AppContext);
    const [rejectionReason, setRejectionReason] = useState('');
    const [requestToReject, setRequestToReject] = useState<number | null>(null);

    if (!currentUser || !currentUser.isSupervisor) {
        return <div className="text-center p-8 text-red-400">Доступ запрещен. Эта страница только для супервайзеров.</div>;
    }

    const pendingRequests = requests.filter(
        (req) => req.fromDepartment === currentUser.department && (req.status === RequestStatus.SENT || req.status === RequestStatus.REVIEWING)
    );

    const getUserById = (id: number): User | undefined => users.find(u => u.id === id);

    const handleApprove = (requestId: number) => {
        decideOnRequest(requestId, RequestStatus.APPROVED);
        addNotification('Заявка одобрена.', 'success');
    };

    const handleReject = () => {
        if (requestToReject === null || !rejectionReason) return;
        decideOnRequest(requestToReject, RequestStatus.REJECTED, rejectionReason);
        addNotification('Заявка отклонена.', 'info');
        setRequestToReject(null);
        setRejectionReason('');
    };
    
    const openRejectModal = (requestId: number) => {
        setRequestToReject(requestId);
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Панель супервайзера</h2>
            <p className="text-gray-400 mb-8">Заявки на перевод из вашего департамента ({currentUser.department}), ожидающие рассмотрения.</p>

            {pendingRequests.length > 0 ? (
                <ul className="space-y-6">
                    {pendingRequests.map((req) => {
                        const user = getUserById(req.userId);
                        return (
                            <li key={req.id} className="bg-gray-900/70 rounded-lg p-6 shadow-lg">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-xl text-white mb-2">{user?.name || 'Неизвестный пользователь'}</h4>
                                        <div className="flex items-center gap-3 text-gray-400 mb-4">
                                            <span>{req.fromDepartment}</span>
                                            <ArrowRightIcon className="w-5 h-5 text-cyan-400" />
                                            <span className="font-semibold text-gray-300">{req.toDepartment}</span>
                                        </div>
                                        <p className="text-gray-300 bg-gray-800 p-3 rounded-md">
                                            <span className="font-semibold text-gray-400">Причина:</span> {req.reason}
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row md:flex-col gap-3 justify-end items-stretch md:items-end">
                                        <button onClick={() => handleApprove(req.id)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors whitespace-nowrap">
                                            Одобрить
                                        </button>
                                        <button onClick={() => openRejectModal(req.id)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors whitespace-nowrap">
                                            Отклонить
                                        </button>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="text-center py-10 px-4 bg-gray-900/50 rounded-lg">
                    <p className="text-gray-400">Нет ожидающих заявок на перевод.</p>
                </div>
            )}
            
            {/* Rejection Modal */}
            {requestToReject !== null && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md mx-4">
                        <h3 className="text-xl font-bold text-white mb-4">Причина отклонения</h3>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Укажите причину отклонения заявки..."
                        />
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={() => setRequestToReject(null)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md transition-colors">
                                Отмена
                            </button>
                            <button onClick={handleReject} disabled={!rejectionReason} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                Отклонить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupervisorDashboard;

