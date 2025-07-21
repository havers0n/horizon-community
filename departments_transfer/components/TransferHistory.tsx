
import React, { useContext } from 'react';
import { TransferRequest, RequestStatus } from '../types';
import { AppContext } from '../App';
import ArrowRightIcon from './icons/ArrowRightIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import ClockIcon from './icons/ClockIcon';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon';


const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
    const statusStyles = {
        [RequestStatus.APPROVED]: 'bg-green-500/20 text-green-400',
        [RequestStatus.REJECTED]: 'bg-red-500/20 text-red-400',
        [RequestStatus.REVIEWING]: 'bg-yellow-500/20 text-yellow-400',
        [RequestStatus.SENT]: 'bg-blue-500/20 text-blue-400',
    };
    
    const statusIcons: { [key in RequestStatus]: React.ReactNode } = {
        [RequestStatus.APPROVED]: <CheckCircleIcon className="w-5 h-5" />,
        [RequestStatus.REJECTED]: <XCircleIcon className="w-5 h-5" />,
        [RequestStatus.REVIEWING]: <ClockIcon className="w-5 h-5" />,
        [RequestStatus.SENT]: <PaperAirplaneIcon className="w-5 h-5" />,
    };

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${statusStyles[status]}`}>
            {statusIcons[status]}
            {status}
        </div>
    );
};

const TransferHistoryItem: React.FC<{ request: TransferRequest }> = ({ request }) => {
    return (
        <li className="bg-gray-800/50 hover:bg-gray-800 transition-colors duration-200 rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                        <span className="font-semibold text-gray-400">{request.fromDepartment}</span>
                        <ArrowRightIcon className="w-5 h-5 text-indigo-400" />
                        <span className="font-bold text-lg text-white">{request.toDepartment}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                        Подано: {request.submissionDate.toLocaleDateString()}
                    </p>
                    <p className="text-gray-300 mb-4">
                        <span className="font-semibold text-gray-400">Причина:</span> {request.reason}
                    </p>
                    {request.supervisorComment && (
                        <p className="text-yellow-300 bg-yellow-900/50 p-3 rounded-md text-sm">
                            <span className="font-semibold">Комментарий супервайзера:</span> {request.supervisorComment}
                        </p>
                    )}
                </div>
                <div className="flex-shrink-0">
                    <StatusBadge status={request.status} />
                </div>
            </div>
        </li>
    );
};


const TransferHistory: React.FC = () => {
    const { currentUser, requests } = useContext(AppContext);
    
    if (!currentUser) return null;

    const userRequests = requests
        .filter((req) => req.userId === currentUser.id)
        .sort((a, b) => b.submissionDate.getTime() - a.submissionDate.getTime());

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
            <h3 className="text-2xl font-bold text-indigo-400 mb-6">История переводов</h3>
            {userRequests.length > 0 ? (
                <ul className="space-y-4">
                    {userRequests.map((req) => (
                        <TransferHistoryItem key={req.id} request={req} />
                    ))}
                </ul>
            ) : (
                <div className="text-center py-10 px-4 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-400">У вас еще нет заявок на перевод.</p>
                </div>
            )}
        </div>
    );
};

export default TransferHistory;
