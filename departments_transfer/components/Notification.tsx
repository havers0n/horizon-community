
import React, { useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationProps {
    id: number;
    message: string;
    type: NotificationType;
    onDismiss: (id: number) => void;
}

const Notification: React.FC<NotificationProps> = ({ id, message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(id);
        }, 5000);

        return () => clearTimeout(timer);
    }, [id, onDismiss]);

    const baseClasses = "flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800";
    const typeClasses = {
        success: 'dark:bg-green-800/50 dark:text-green-300 border-l-4 border-green-500',
        error: 'dark:bg-red-800/50 dark:text-red-300 border-l-4 border-red-500',
        info: 'dark:bg-blue-800/50 dark:text-blue-300 border-l-4 border-blue-500',
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
            <div className="ms-3 text-sm font-normal">{message}</div>
            <button
                type="button"
                className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
                onClick={() => onDismiss(id)}
                aria-label="Close"
            >
                <span className="sr-only">Close</span>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
            </button>
        </div>
    );
};

export const NotificationContainer: React.FC<{ notifications: Omit<NotificationProps, 'onDismiss'>[], onDismiss: (id: number) => void }> = ({ notifications, onDismiss }) => {
    return (
        <div className="fixed top-5 right-5 z-50 space-y-2">
            {notifications.map((notification) => (
                <Notification key={notification.id} {...notification} onDismiss={onDismiss} />
            ))}
        </div>
    );
}
