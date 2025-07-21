
import React, { useState, useContext } from 'react';
import { Department } from '../types';
import { AppContext } from '../App';

const TransferRequestForm: React.FC = () => {
    const { currentUser, createRequest, addNotification } = useContext(AppContext);
    const [toDepartment, setToDepartment] = useState<Department | ''>('');
    const [reason, setReason] = useState('');
    const [documentationRead, setDocumentationRead] = useState(false);

    if (!currentUser) return null;

    const availableDepartments = Object.values(Department).filter(
        (dept) => dept !== currentUser.department
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!toDepartment || !reason || !documentationRead) {
            addNotification('Пожалуйста, заполните все поля.', 'error');
            return;
        }
        createRequest({
            toDepartment,
            reason,
            documentationRead,
        });
        addNotification('Заявка на перевод успешно отправлена.', 'success');
        setToDepartment('');
        setReason('');
        setDocumentationRead(false);
    };

    const isFormValid = toDepartment && reason && documentationRead;

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
            <h3 className="text-2xl font-bold text-indigo-400 mb-6">Создать заявку на перевод</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-300 mb-2">Целевой департамент</label>
                    <select
                        id="department"
                        value={toDepartment}
                        onChange={(e) => setToDepartment(e.target.value as Department)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="" disabled>Выберите департамент...</option>
                        {availableDepartments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-2">Причина перевода</label>
                    <textarea
                        id="reason"
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Кратко опишите причину вашего желания перевестись..."
                    />
                </div>
                <div className="flex items-center">
                    <input
                        id="documentation"
                        type="checkbox"
                        checked={documentationRead}
                        onChange={(e) => setDocumentationRead(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="documentation" className="ml-3 block text-sm text-gray-300">
                        Я ознакомился с документацией департамента, в который хочу перевестись.
                    </label>
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={!isFormValid}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Отправить заявку
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransferRequestForm;
