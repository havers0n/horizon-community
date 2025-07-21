
import React, { useContext } from 'react';
import { AppContext } from '../App';
import TransferRequestForm from './TransferRequestForm';
import TransferHistory from './TransferHistory';
import UserIcon from './icons/UserIcon';
import { RequestStatus } from '../types';

const ProfilePage: React.FC = () => {
    const { currentUser, requests } = useContext(AppContext);

    if (!currentUser) return null;
    
    const hasPendingRequest = requests.some(
        req => req.userId === currentUser.id && (req.status === RequestStatus.SENT || req.status === RequestStatus.REVIEWING)
    );

    return (
        <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 flex items-center gap-4">
                <UserIcon className="w-16 h-16 text-indigo-400"/>
                <div>
                    <h2 className="text-3xl font-bold text-white">{currentUser.name}</h2>
                    <p className="text-lg text-gray-400">Департамент: <span className="font-semibold text-indigo-300">{currentUser.department}</span></p>
                    {currentUser.isSupervisor && (
                         <span className="mt-1 inline-block bg-cyan-500/20 text-cyan-300 px-3 py-1 text-xs font-bold rounded-full">
                           Супервайзер
                         </span>
                    )}
                </div>
            </div>
            
            {hasPendingRequest ? (
                <div className="bg-yellow-900/50 text-yellow-300 p-4 rounded-lg text-center">
                    У вас уже есть активная заявка на перевод. Вы сможете подать новую после того, как по текущей будет принято решение.
                </div>
            ) : (
                <TransferRequestForm />
            )}

            <TransferHistory />
        </div>
    );
};

export default ProfilePage;
