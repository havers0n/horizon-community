import React from 'react';
import { Card, CardHeader, Button } from '@/shared/ui/atoms';
import { vehicleRegistrationStore } from '../model/store';

export const VehicleRegistrationWidget: React.FC = () => {
    const {
        formData,
        isLoading,
        error,
        success,
        updateFormData,
        submitForm,
        generateVIN,
    } = vehicleRegistrationStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        updateFormData({ [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitForm();
    };

    const inputClass = "w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500";

    return (
        <Card>
            <CardHeader>Регистрация транспортного средства</CardHeader>
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Номерной знак</label>
                            <input type="text" name="plate" value={formData.plate} onChange={handleChange} className={inputClass} required />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Модель</label>
                            <select name="model" value={formData.model} onChange={handleChange} className={inputClass} required>
                                <option value="">Выбрать...</option>
                                <option value="Adder">Adder</option>
                                <option value="Zentorno">Zentorno</option>
                                <option value="T20">T20</option>
                                <option value="Osiris">Osiris</option>
                                <option value="X80">X80</option>
                                <option value="RE-7B">RE-7B</option>
                                <option value="811">811</option>
                                <option value="Vagner">Vagner</option>
                                <option value="Autarch">Autarch</option>
                                <option value="Tezeract">Tezeract</option>
                                <option value="Deveste Eight">Deveste Eight</option>
                                <option value="Emerus">Emerus</option>
                                <option value="Krieger">Krieger</option>
                                <option value="S80RR">S80RR</option>
                                <option value="F1">F1</option>
                                <option value="BR8">BR8</option>
                                <option value="DR1">DR1</option>
                                <option value="PR4">PR4</option>
                                <option value="R88">R88</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Владелец</label>
                            <select name="owner" value={formData.owner} onChange={handleChange} className={inputClass} required>
                                <option value="">Выбрать...</option>
                                <option value="John Doe">John Doe</option>
                                <option value="Jane Smith">Jane Smith</option>
                                <option value="Mike Johnson">Mike Johnson</option>
                                <option value="Sarah Wilson">Sarah Wilson</option>
                                <option value="David Brown">David Brown</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Цвет</label>
                            <input type="text" name="color" value={formData.color} onChange={handleChange} className={inputClass} required />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Уровни Оснащенности (Опционально)</label>
                            <select name="equipmentLevels" value={formData.equipmentLevels} onChange={handleChange} className={inputClass}>
                                <option value="">Выбрать...</option>
                                <option value="Basic">Basic - Базовое</option>
                                <option value="Standard">Standard - Стандартное</option>
                                <option value="Premium">Premium - Премиум</option>
                                <option value="Luxury">Luxury - Люкс</option>
                                <option value="Sport">Sport - Спортивное</option>
                                <option value="Off-road">Off-road - Внедорожное</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">VIN (Опционально)</label>
                            <div className="flex gap-2">
                                <input type="text" name="vin" value={formData.vin} onChange={handleChange} className={inputClass} placeholder="Введите VIN или сгенерируйте автоматически" />
                                <Button type="button" onClick={generateVIN} variant="secondary" className="whitespace-nowrap">
                                    Генерировать VIN
                                </Button>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Статус регистрации</label>
                            <select name="registrationStatus" value={formData.registrationStatus} onChange={handleChange} className={inputClass} required>
                                <option value="">Выбрать...</option>
                                <option value="valid">Действительна</option>
                                <option value="expired">Истекла</option>
                                <option value="suspended">Приостановлена</option>
                                <option value="revoked">Аннулирована</option>
                                <option value="pending">В обработке</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Статус страховки</label>
                            <select name="insuranceStatus" value={formData.insuranceStatus} onChange={handleChange} className={inputClass} required>
                                <option value="">Выбрать...</option>
                                <option value="valid">Действительна</option>
                                <option value="expired">Истекла</option>
                                <option value="suspended">Приостановлена</option>
                                <option value="cancelled">Отменена</option>
                                <option value="pending">В обработке</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Статус инспекции (Опционально)</label>
                            <select name="inspectionStatus" value={formData.inspectionStatus} onChange={handleChange} className={inputClass}>
                                <option value="">Выбрать...</option>
                                <option value="passed">Пройдена</option>
                                <option value="failed">Не пройдена</option>
                                <option value="pending">В ожидании</option>
                                <option value="overdue">Просрочена</option>
                                <option value="exempt">Освобождена</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Статус налогов (Опционально)</label>
                            <select name="taxStatus" value={formData.taxStatus} onChange={handleChange} className={inputClass}>
                                <option value="">Выбрать...</option>
                                <option value="paid">Оплачены</option>
                                <option value="unpaid">Не оплачены</option>
                                <option value="partial">Частично оплачены</option>
                                <option value="overdue">Просрочены</option>
                                <option value="exempt">Освобождены</option>
                            </select>
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
                        <Button type="button" variant="secondary" onClick={() => window.history.back()}>Отмена</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Регистрация...' : 'Зарегистрировать'}
                        </Button>
                    </div>
                </form>
            </div>
        </Card>
    );
};
