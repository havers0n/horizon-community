
import React, { useState, useMemo } from 'react';
import { MOCK_CITIZENS } from '../constants';
import type { Citizen, MedicalInfo } from '../types';
import { Card, CardHeader } from './ui/Theme';
import { Search, HeartPulse, Pill, ShieldAlert, Activity, FileText } from 'lucide-react';

const MedicalInfoCard: React.FC<{ info: MedicalInfo }> = ({ info }) => (
    <Card className="bg-secondary-900">
        <CardHeader className="!text-lg !mb-3 flex items-center gap-2 text-amber-400"><HeartPulse size={22}/> Медицинская информация</CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
                <ShieldAlert className="text-red-400 mt-1 h-5 w-5 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-secondary-300">Аллергии</p>
                    <p className="text-secondary-200">{info.allergies?.join(', ') || 'Нет данных'}</p>
                </div>
            </div>
             <div className="flex items-start gap-3">
                <Activity className="text-blue-400 mt-1 h-5 w-5 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-secondary-300">Хронические заболевания</p>
                    <p className="text-secondary-200">{info.conditions?.join(', ') || 'Нет данных'}</p>
                </div>
            </div>
             <div className="flex items-start gap-3">
                <Pill className="text-green-400 mt-1 h-5 w-5 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-secondary-300">Медикаменты</p>
                    <p className="text-secondary-200">{info.medications?.join(', ') || 'Нет данных'}</p>
                </div>
            </div>
            <div className="flex items-start gap-3">
                <FileText className="text-secondary-400 mt-1 h-5 w-5 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-secondary-300">Заметки</p>
                    <p className="text-secondary-200">{info.notes || 'Нет данных'}</p>
                </div>
            </div>
        </div>
    </Card>
);

const PatientDetails: React.FC<{ patient: Citizen }> = ({ patient }) => (
    <Card className="col-span-12 lg:col-span-8">
        <div className="flex flex-col md:flex-row gap-6">
            <img src={patient.imageUrl} alt={`${patient.firstName} ${patient.lastName}`} className="w-32 h-32 rounded-lg object-cover border-2 border-secondary-600"/>
            <div className="flex-grow">
                <h3 className="text-3xl font-bold text-white">{patient.firstName} {patient.lastName}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mt-3 text-sm text-secondary-300">
                    <p><strong className="text-secondary-400">Дата рождения:</strong> {patient.dateOfBirth}</p>
                    <p><strong className="text-secondary-400">Пол:</strong> {patient.gender}</p>
                    <p><strong className="text-secondary-400">Рост:</strong> {patient.height}</p>
                    <p><strong className="text-secondary-400">Вес:</strong> {patient.weight}</p>
                    <p><strong className="text-secondary-400">Группа крови:</strong> {patient.medicalInfo?.bloodType || 'N/A'}</p>
                    <p className="col-span-2 md:col-span-3"><strong className="text-secondary-400">Адрес:</strong> {patient.address}</p>
                </div>
            </div>
        </div>
        {patient.medicalInfo && <div className="mt-6"><MedicalInfoCard info={patient.medicalInfo} /></div>}
    </Card>
);


export const PatientSearch: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Citizen | null>(MOCK_CITIZENS[0] ?? null);

    const filteredCitizens = useMemo(() => {
        if (!searchTerm) {
            return MOCK_CITIZENS;
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return MOCK_CITIZENS.filter(cit =>
            cit.firstName.toLowerCase().includes(lowercasedTerm) ||
            cit.lastName.toLowerCase().includes(lowercasedTerm)
        );
    }, [searchTerm]);

    return (
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4">
                <Card className="h-full flex flex-col">
                    <CardHeader>Поиск по пациентам</CardHeader>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={20} />
                        <input
                            type="text"
                            placeholder="Поиск по имени..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-secondary-700 border border-secondary-600 rounded-md pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="space-y-2 overflow-y-auto flex-grow">
                        {filteredCitizens.length > 0 ? (
                            filteredCitizens.map(cit => (
                                <button key={cit.id} onClick={() => setSelectedPatient(cit)} className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-3 ${selectedPatient?.id === cit.id ? 'bg-primary-600/80' : 'bg-secondary-800 hover:bg-secondary-700'}`}>
                                    <img src={cit.imageUrl} alt={cit.firstName} className="w-10 h-10 rounded-full"/>
                                    <div>
                                        <p className="font-semibold text-white">{cit.firstName} {cit.lastName}</p>
                                        <p className="text-xs text-secondary-400">{cit.dateOfBirth}</p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <p className="text-center text-secondary-400 pt-4">Пациенты не найдены.</p>
                        )}
                    </div>
                </Card>
            </div>
            {selectedPatient ? (
                <PatientDetails patient={selectedPatient} />
            ) : (
                <div className="col-span-12 lg:col-span-8 flex items-center justify-center">
                    <Card><p className="text-secondary-400">Выберите пациента для просмотра информации.</p></Card>
                </div>
            )}
        </div>
    );
};