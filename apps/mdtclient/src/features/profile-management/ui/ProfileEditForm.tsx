// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Button } from '@/shared/ui/atoms';
import { useLocale } from '@/shared/contexts/LocaleContext';
import type { CitizenProfile, ProfileUpdateData } from '@/shared/types';

interface ProfileEditFormProps {
    profile: CitizenProfile;
    onSubmit: (data: ProfileUpdateData) => void;
    onClose: () => void;
    isLoading: boolean;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ 
    profile, 
    onSubmit, 
    onClose, 
    isLoading 
}) => {
    const { t } = useLocale();
    const [formData, setFormData] = useState<ProfileUpdateData>({
        firstName: profile.firstName,
        lastName: profile.lastName,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        nationality: profile.nationality,
        address: profile.address,
        phone: profile.phone,
        email: profile.email,
        occupation: profile.occupation,
        emergencyContact: { ...profile.emergencyContact },
        medicalInfo: { ...profile.medicalInfo },
    });

    useEffect(() => {
        setFormData({
            firstName: profile.firstName,
            lastName: profile.lastName,
            dateOfBirth: profile.dateOfBirth,
            gender: profile.gender,
            nationality: profile.nationality,
            address: profile.address,
            phone: profile.phone,
            email: profile.email,
            occupation: profile.occupation,
            emergencyContact: { ...profile.emergencyContact },
            medicalInfo: { ...profile.medicalInfo },
        });
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEmergencyContactChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            emergencyContact: {
                ...prev.emergencyContact!,
                [field]: value,
            },
        }));
    };

    const handleMedicalInfoChange = (field: string, value: string | string[]) => {
        setFormData(prev => ({
            ...prev,
            medicalInfo: {
                ...prev.medicalInfo!,
                [field]: value,
            },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const inputClass = "w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500";

    return (
        <Card className="w-full max-w-4xl">
            <CardHeader>
                <h3 className="text-lg font-semibold text-white">Редактировать профиль</h3>
            </CardHeader>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Основная информация */}
                <div>
                    <h4 className="text-md font-medium text-white mb-4">Основная информация</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Имя</label>
                            <input 
                                type="text" 
                                name="firstName" 
                                value={formData.firstName} 
                                onChange={handleChange} 
                                className={inputClass} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Фамилия</label>
                            <input 
                                type="text" 
                                name="lastName" 
                                value={formData.lastName} 
                                onChange={handleChange} 
                                className={inputClass} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Дата рождения</label>
                            <input 
                                type="date" 
                                name="dateOfBirth" 
                                value={formData.dateOfBirth} 
                                onChange={handleChange} 
                                className={inputClass} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Пол</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass} required>
                                <option value="male">Мужской</option>
                                <option value="female">Женский</option>
                                <option value="other">Другой</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Национальность</label>
                            <input 
                                type="text" 
                                name="nationality" 
                                value={formData.nationality} 
                                onChange={handleChange} 
                                className={inputClass} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Профессия</label>
                            <input 
                                type="text" 
                                name="occupation" 
                                value={formData.occupation} 
                                onChange={handleChange} 
                                className={inputClass} 
                                required 
                            />
                        </div>
                    </div>
                </div>

                {/* Контактная информация */}
                <div>
                    <h4 className="text-md font-medium text-white mb-4">Контактная информация</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Адрес</label>
                            <input 
                                type="text" 
                                name="address" 
                                value={formData.address} 
                                onChange={handleChange} 
                                className={inputClass} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Телефон</label>
                            <input 
                                type="tel" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                className={inputClass} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Email</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                className={inputClass} 
                                required 
                            />
                        </div>
                    </div>
                </div>

                {/* Экстренный контакт */}
                <div>
                    <h4 className="text-md font-medium text-white mb-4">Экстренный контакт</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Имя</label>
                            <input 
                                type="text" 
                                value={formData.emergencyContact?.name || ''} 
                                onChange={(e) => handleEmergencyContactChange('name', e.target.value)} 
                                className={inputClass} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Телефон</label>
                            <input 
                                type="tel" 
                                value={formData.emergencyContact?.phone || ''} 
                                onChange={(e) => handleEmergencyContactChange('phone', e.target.value)} 
                                className={inputClass} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Отношение</label>
                            <input 
                                type="text" 
                                value={formData.emergencyContact?.relationship || ''} 
                                onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)} 
                                className={inputClass} 
                                required 
                            />
                        </div>
                    </div>
                </div>

                {/* Медицинская информация */}
                <div>
                    <h4 className="text-md font-medium text-white mb-4">Медицинская информация</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Группа крови</label>
                            <select 
                                value={formData.medicalInfo?.bloodType || ''} 
                                onChange={(e) => handleMedicalInfoChange('bloodType', e.target.value)} 
                                className={inputClass} 
                                required
                            >
                                <option value="">Выберите группу крови</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Аллергии</label>
                            <input 
                                type="text" 
                                value={formData.medicalInfo?.allergies?.join(', ') || ''} 
                                onChange={(e) => handleMedicalInfoChange('allergies', e.target.value.split(', ').filter(Boolean))} 
                                className={inputClass} 
                                placeholder="Введите через запятую"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Хронические заболевания</label>
                            <input 
                                type="text" 
                                value={formData.medicalInfo?.chronicDiseases?.join(', ') || ''} 
                                onChange={(e) => handleMedicalInfoChange('chronicDiseases', e.target.value.split(', ').filter(Boolean))} 
                                className={inputClass} 
                                placeholder="Введите через запятую"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Лекарства</label>
                            <input 
                                type="text" 
                                value={formData.medicalInfo?.medications?.join(', ') || ''} 
                                onChange={(e) => handleMedicalInfoChange('medications', e.target.value.split(', ').filter(Boolean))} 
                                className={inputClass} 
                                placeholder="Введите через запятую"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                        Отмена
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};
