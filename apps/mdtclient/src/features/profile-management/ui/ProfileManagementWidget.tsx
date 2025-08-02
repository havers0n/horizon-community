// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useEffect } from 'react';
import { Card, CardHeader, Button } from '@/shared/ui/atoms';
import { User, Edit, Phone, Mail, MapPin, Heart, Shield, Car, Gun } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { profileManagementStore } from '../model/profileManagementStore';
import { ProfileEditForm } from './ProfileEditForm';
import type { CitizenProfile } from '../model/types';

export const ProfileManagementWidget: React.FC = () => {
    const { t } = useLocale();
    const {
        profile,
        isLoading,
        error,
        showEditModal,
        isEditing,
        loadProfile,
        updateProfile,
        setShowEditModal,
        resetError,
    } = profileManagementStore();

    useEffect(() => {
        // Загружаем профиль для демонстрации (в реальном приложении ID будет передан)
        loadProfile('citizen_1');
    }, [loadProfile]);

    const handleUpdateProfile = async (data: any) => {
        await updateProfile(data);
    };

    const getGenderLabel = (gender: string) => {
        const labels: Record<string, string> = {
            male: 'Мужской',
            female: 'Женский',
            other: 'Другой',
        };
        return labels[gender] || gender;
    };

    if (isLoading && !profile) {
        return (
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-white">Профиль гражданина</h3>
                </CardHeader>
                <div className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-secondary-700 rounded w-3/4"></div>
                        <div className="h-4 bg-secondary-700 rounded w-1/2"></div>
                    </div>
                </div>
            </Card>
        );
    }

    if (!profile) {
        return (
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-white">Профиль гражданина</h3>
                </CardHeader>
                <div className="p-6 text-center">
                    <User className="w-12 h-12 text-secondary-500 mx-auto mb-4" />
                    <p className="text-secondary-400">Профиль не найден</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <User className="w-6 h-6 text-primary-500" />
                        <h3 className="text-lg font-semibold text-white">Профиль гражданина</h3>
                    </div>
                    <Button onClick={() => setShowEditModal(true)} size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Редактировать
                    </Button>
                </CardHeader>
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                            <p className="text-red-400 text-sm">{error}</p>
                            <Button onClick={resetError} variant="ghost" size="sm" className="mt-2">
                                Закрыть
                            </Button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Основная информация */}
                        <div className="space-y-4">
                            <h4 className="text-md font-medium text-white border-b border-secondary-700 pb-2">
                                Основная информация
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-secondary-400">Полное имя:</span>
                                    <span className="text-white">{profile.firstName} {profile.lastName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-400">Дата рождения:</span>
                                    <span className="text-white">
                                        {new Date(profile.dateOfBirth).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-400">Пол:</span>
                                    <span className="text-white">{getGenderLabel(profile.gender)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-400">Национальность:</span>
                                    <span className="text-white">{profile.nationality}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-400">Профессия:</span>
                                    <span className="text-white">{profile.occupation}</span>
                                </div>
                            </div>
                        </div>

                        {/* Контактная информация */}
                        <div className="space-y-4">
                            <h4 className="text-md font-medium text-white border-b border-secondary-700 pb-2">
                                Контактная информация
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-secondary-400" />
                                    <span className="text-white">{profile.address}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-secondary-400" />
                                    <span className="text-white">{profile.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-secondary-400" />
                                    <span className="text-white">{profile.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Экстренный контакт */}
                        <div className="space-y-4">
                            <h4 className="text-md font-medium text-white border-b border-secondary-700 pb-2">
                                Экстренный контакт
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-secondary-400">Имя:</span>
                                    <span className="text-white">{profile.emergencyContact.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-400">Телефон:</span>
                                    <span className="text-white">{profile.emergencyContact.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-400">Отношение:</span>
                                    <span className="text-white">{profile.emergencyContact.relationship}</span>
                                </div>
                            </div>
                        </div>

                        {/* Медицинская информация */}
                        <div className="space-y-4">
                            <h4 className="text-md font-medium text-white border-b border-secondary-700 pb-2">
                                Медицинская информация
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-secondary-400">Группа крови:</span>
                                    <span className="text-white">{profile.medicalInfo.bloodType}</span>
                                </div>
                                <div>
                                    <span className="text-secondary-400">Аллергии:</span>
                                    <div className="mt-1">
                                        {profile.medicalInfo.allergies.length > 0 ? (
                                            profile.medicalInfo.allergies.map((allergy, index) => (
                                                <span key={index} className="inline-block bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs mr-1 mb-1">
                                                    {allergy}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-white text-sm">Нет</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-secondary-400">Хронические заболевания:</span>
                                    <div className="mt-1">
                                        {profile.medicalInfo.chronicDiseases.length > 0 ? (
                                            profile.medicalInfo.chronicDiseases.map((disease, index) => (
                                                <span key={index} className="inline-block bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs mr-1 mb-1">
                                                    {disease}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-white text-sm">Нет</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Правовые записи */}
                        <div className="space-y-4">
                            <h4 className="text-md font-medium text-white border-b border-secondary-700 pb-2">
                                Правовые записи
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-secondary-400">Штрафы:</span>
                                    <span className="text-white">{profile.legalRecords.fines.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-400">Предупреждения:</span>
                                    <span className="text-white">{profile.legalRecords.warnings.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-400">Аресты:</span>
                                    <span className="text-white">{profile.legalRecords.arrests.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Транспорт и оружие */}
                        <div className="space-y-4">
                            <h4 className="text-md font-medium text-white border-b border-secondary-700 pb-2">
                                Транспорт и оружие
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Car className="w-4 h-4 text-secondary-400" />
                                    <span className="text-white">Транспортных средств: {profile.vehicles.length}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Gun className="w-4 h-4 text-secondary-400" />
                                    <span className="text-white">Зарегистрированного оружия: {profile.weapons.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-secondary-700">
                        <div className="flex justify-between text-sm text-secondary-400">
                            <span>Создан: {new Date(profile.createdAt).toLocaleDateString()}</span>
                            <span>Обновлен: {new Date(profile.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Модальное окно редактирования */}
            {showEditModal && profile && (
                <ProfileEditForm
                    profile={profile}
                    onSubmit={handleUpdateProfile}
                    onClose={() => setShowEditModal(false)}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};
