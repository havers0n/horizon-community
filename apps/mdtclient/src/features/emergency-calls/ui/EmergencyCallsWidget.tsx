// @ts-nocheck - TODO: Remove after major refactoring is complete
import React from 'react';
import { Card, CardHeader, Button } from '@/shared/ui/atoms';
import { emergencyCallsStore } from '../model/store';
import type { EmergencyCall } from '@/shared/types';

export const EmergencyCallsWidget: React.FC = () => {
    const {
        calls,
        formData,
        isLoading,
        error,
        success,
        updateFormData,
        submitCall,
        updateCallStatus,
        deleteCall,
    } = emergencyCallsStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        updateFormData({ [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitCall();
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'emergency':
                return 'bg-red-500';
            case 'high':
                return 'bg-orange-500';
            case 'medium':
                return 'bg-yellow-500';
            case 'low':
                return 'bg-green-500';
            default:
                return 'bg-secondary-500';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500';
            case 'dispatched':
                return 'bg-blue-500';
            case 'in-progress':
                return 'bg-orange-500';
            case 'completed':
                return 'bg-green-500';
            case 'cancelled':
                return 'bg-red-500';
            default:
                return 'bg-secondary-500';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Ожидает';
            case 'dispatched':
                return 'Отправлен';
            case 'in-progress':
                return 'В работе';
            case 'completed':
                return 'Завершен';
            case 'cancelled':
                return 'Отменен';
            default:
                return status;
        }
    };

    const inputClass = "w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500";

    return (
        <div className="space-y-6">
            {/* Форма создания вызова */}
            <Card>
                <CardHeader>Создать вызов 911</CardHeader>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-300 mb-1">Местоположение</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-300 mb-1">Описание ситуации</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={inputClass} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-300 mb-1">Приоритет</label>
                                <select name="priority" value={formData.priority} onChange={handleChange} className={inputClass}>
                                    <option value="low">Низкий</option>
                                    <option value="medium">Средний</option>
                                    <option value="high">Высокий</option>
                                    <option value="emergency">Экстренный</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-300 mb-1">Имя звонящего (Опционально)</label>
                                <input type="text" name="callerName" value={formData.callerName} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-300 mb-1">Номер телефона (Опционально)</label>
                                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={inputClass} />
                            </div>
                        </div>
                        
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}
                        
                        {success && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3">
                                <p className="text-green-400 text-sm">{success}</p>
                            </div>
                        )}
                        
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Отправка...' : 'Отправить вызов'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>

            {/* Список вызовов */}
            <Card>
                <CardHeader>История вызовов 911</CardHeader>
                <div className="p-6">
                    {calls.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-secondary-400">Вызовы не найдены</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {calls.map((call) => (
                                <div key={call.id} className="bg-secondary-800 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(call.priority)}`}></div>
                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(call.status)}`}></div>
                                            <h3 className="text-white font-medium">
                                                Вызов #{call.id.split('_')[1]}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white text-sm">{call.callerName || 'Анонимный'}</p>
                                            <p className="text-secondary-400 text-xs">
                                                {new Date(call.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <p className="text-secondary-300 text-sm">
                                            <span className="font-medium">Местоположение:</span> {call.location}
                                        </p>
                                        <p className="text-secondary-300 text-sm">
                                            <span className="font-medium">Описание:</span> {call.description}
                                        </p>
                                        <p className="text-secondary-300 text-sm">
                                            <span className="font-medium">Приоритет:</span> {call.priority}
                                        </p>
                                        <p className="text-secondary-300 text-sm">
                                            <span className="font-medium">Статус:</span> {getStatusLabel(call.status)}
                                        </p>
                                        {call.phoneNumber && (
                                            <p className="text-secondary-300 text-sm">
                                                <span className="font-medium">Телефон:</span> {call.phoneNumber}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="flex gap-2 mt-4">
                                        <select
                                            value={call.status}
                                            onChange={(e) => updateCallStatus(call.id, e.target.value as EmergencyCall['status'])}
                                            className="px-3 py-1 bg-secondary-700 border border-secondary-600 rounded-md text-white text-sm focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="pending">Ожидает</option>
                                            <option value="dispatched">Отправлен</option>
                                            <option value="in-progress">В работе</option>
                                            <option value="completed">Завершен</option>
                                            <option value="cancelled">Отменен</option>
                                        </select>
                                        <Button
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            onClick={() => deleteCall(call.id)}
                                        >
                                            Удалить
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
