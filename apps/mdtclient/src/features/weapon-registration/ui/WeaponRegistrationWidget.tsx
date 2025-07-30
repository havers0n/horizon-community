import React from 'react';
import { Card, CardHeader, Button } from '@/shared/ui/atoms';
import { weaponRegistrationStore } from '../model/store';

export const WeaponRegistrationWidget: React.FC = () => {
    const {
        formData,
        isLoading,
        error,
        success,
        updateFormData,
        submitForm,
    } = weaponRegistrationStore();

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
            <CardHeader>Регистрация оружия</CardHeader>
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Тип оружия</label>
                            <select name="weaponType" value={formData.weaponType} onChange={handleChange} className={inputClass} required>
                                <option value="">Выберите тип...</option>
                                <option value="pistol">Пистолет</option>
                                <option value="rifle">Винтовка</option>
                                <option value="shotgun">Дробовик</option>
                                <option value="smg">Пистолет-пулемет</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Серийный номер</label>
                            <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className={inputClass} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Модель</label>
                            <input type="text" name="model" value={formData.model} onChange={handleChange} className={inputClass} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Калибр</label>
                            <input type="text" name="caliber" value={formData.caliber} onChange={handleChange} className={inputClass} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Имя владельца</label>
                            <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} className={inputClass} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Номер лицензии</label>
                            <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className={inputClass} required />
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
