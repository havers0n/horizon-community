
import React, { useState } from 'react';
import type { Citizen, Vehicle } from '../types';
import { MOCK_CITIZENS, MOCK_VEHICLES } from '../constants';
import { Card, CardHeader, Modal, Button } from './ui/Theme';
import { 
    User, 
    Car, 
    Building, 
    Newspaper, 
    Ambulance, 
    PlusCircle, 
    Phone, 
    Shield, 
    Truck,
    Heart,
    BookOpen,
    LayoutDashboard,
    Users,
    FileText
} from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';

interface CitizenPortalProps {
    activeView: string;
    onViewChange: (view: string) => void;
}

// Компонент для создания штрафа
const CreateFineForm: React.FC<{ onSubmit: (fine: any) => void; onClose: () => void; }> = ({ onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        amount: '',
        reason: '',
        date: new Date().toISOString().split('T')[0],
        officer: '',
        location: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            type: 'Штраф',
            description: `Штраф $${formData.amount} - ${formData.reason}`,
            date: formData.date,
            amount: formData.amount,
            reason: formData.reason,
            officer: formData.officer,
            location: formData.location,
        });
    };

    const inputClass = "w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Сумма штрафа ($)</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Причина</label>
                <textarea name="reason" value={formData.reason} onChange={handleChange} rows={3} className={inputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Дата</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Офицер</label>
                <input type="text" name="officer" value={formData.officer} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Место</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} required />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
                <Button type="submit">Создать штраф</Button>
            </div>
        </form>
    );
};

// Компонент для создания письменного предупреждения
const CreateWarningForm: React.FC<{ onSubmit: (warning: any) => void; onClose: () => void; }> = ({ onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        reason: '',
        date: new Date().toISOString().split('T')[0],
        officer: '',
        location: '',
        description: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            type: 'Письменное предупреждение',
            description: formData.description || formData.reason,
            date: formData.date,
            reason: formData.reason,
            officer: formData.officer,
            location: formData.location,
        });
    };

    const inputClass = "w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Причина предупреждения</label>
                <input type="text" name="reason" value={formData.reason} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Описание</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClass} />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Дата</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Офицер</label>
                <input type="text" name="officer" value={formData.officer} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Место</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} required />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
                <Button type="submit">Создать предупреждение</Button>
            </div>
        </form>
    );
};

// Компонент для создания отчёта об аресте
const CreateArrestForm: React.FC<{ onSubmit: (arrest: any) => void; onClose: () => void; }> = ({ onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        charges: '',
        date: new Date().toISOString().split('T')[0],
        officer: '',
        location: '',
        description: '',
        jailTime: '',
        bail: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            type: 'Отчёт об аресте',
            description: formData.description || `Арест за: ${formData.charges}`,
            date: formData.date,
            charges: formData.charges,
            officer: formData.officer,
            location: formData.location,
            jailTime: formData.jailTime,
            bail: formData.bail,
        });
    };

    const inputClass = "w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Обвинения</label>
                <input type="text" name="charges" value={formData.charges} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Описание ареста</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClass} />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Дата ареста</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Офицер</label>
                <input type="text" name="officer" value={formData.officer} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Место ареста</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Срок заключения (дни)</label>
                <input type="number" name="jailTime" value={formData.jailTime} onChange={handleChange} className={inputClass} />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Залог ($)</label>
                <input type="number" name="bail" value={formData.bail} onChange={handleChange} className={inputClass} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
                <Button type="submit">Создать отчёт</Button>
            </div>
        </form>
    );
};

// Компонент для создания гражданского с семистраничной формой
const CreateCitizenForm: React.FC<{ onSubmit: (citizen: Citizen) => void; onClose: () => void; }> = ({ onSubmit, onClose }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        address: '',
        gender: '',
        height: '',
        weight: '',
        occupation: '',
        phoneNumber: '',
        additionalInfo: '',
        hairColor: '',
        ssn: '',
        ethnicity: '',
        eyeColor: '',
        postalCode: '',
        // Лицензии
        driverLicense: '',
        driverLicenseCategories: '',
        flightLicense: '',
        flightLicenseCategories: '',
        watercraftLicense: '',
        watercraftLicenseCategories: '',
        fishingLicense: '',
        fishingLicenseCategories: '',
        huntingLicense: '',
        huntingLicenseCategories: '',
        weaponLicense: '',
        weaponLicenseCategories: '',
        otherLicenseCategories: '',
        // Предыдущие записи
        previousRecords: [] as any[],
        // Медицинская информация
        diseases: [] as string[],
        chronicDiseases: [] as string[],
        allergies: '',
        bloodType: '',
        rhFactor: '',
        surgeries: '',
        implants: '',
    });

    const [showFineModal, setShowFineModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showArrestModal, setShowArrestModal] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newCitizen: Citizen = {
            id: `cit_${Date.now()}`,
            userId: 'user_1',
            imageUrl: `https://picsum.photos/seed/${Date.now()}/200`,
            ...formData,
        };
        onSubmit(newCitizen);
        onClose();
    };

    const addPreviousRecord = (record: any) => {
        setFormData(prev => ({
            ...prev,
            previousRecords: [...prev.previousRecords, { ...record, id: `record_${Date.now()}` }]
        }));
    };

    const removePreviousRecord = (recordId: string) => {
        setFormData(prev => ({
            ...prev,
            previousRecords: prev.previousRecords.filter(record => record.id !== recordId)
        }));
    };

    const toggleDisease = (disease: string) => {
        setFormData(prev => ({
            ...prev,
            diseases: prev.diseases.includes(disease)
                ? prev.diseases.filter(d => d !== disease)
                : [...prev.diseases, disease]
        }));
    };

    const toggleChronicDisease = (disease: string) => {
        setFormData(prev => ({
            ...prev,
            chronicDiseases: prev.chronicDiseases.includes(disease)
                ? prev.chronicDiseases.filter(d => d !== disease)
                : [...prev.chronicDiseases, disease]
        }));
    };

    const inputClass = "w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500";
    const checkboxClass = "mr-2 text-primary-500 focus:ring-primary-500";

    if (currentPage === 1) {
        return (
            <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(2); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-1">Имя</label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-1">Фамилия</label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-1">Дата рождения</label>
                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-1">Пол</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass} required>
                            <option value="">Select...</option>
                            <option value="male">Мужской</option>
                            <option value="female">Женский</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-1">Цвет волос</label>
                        <input type="text" name="hairColor" value={formData.hairColor || ''} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-1">Вес (kg)</label>
                        <input type="text" name="weight" value={formData.weight} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-1">Адрес</label>
                        <select name="address" value={formData.address} onChange={handleChange} className={inputClass} required>
                            <option value="">Select...</option>
                            <option value="Los Santos">Los Santos</option>
                            <option value="Blaine County">Blaine County</option>
                            <option value="Sandy Shores">Sandy Shores</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-1">Номер социального страхования (Опционально)</label>
                        <input type="text" name="ssn" value={formData.ssn || ''} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-1">Этническая принадлежность</label>
                        <select name="ethnicity" value={formData.ethnicity || ''} onChange={handleChange} className={inputClass}>
                            <option value="">Select...</option>
                            <option value="caucasian">Европеоидная</option>
                            <option value="african">Негроидная</option>
                            <option value="asian">Монголоидная</option>
                            <option value="hispanic">Латиноамериканская</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-1">Цвет глаз</label>
                        <input type="text" name="eyeColor" value={formData.eyeColor || ''} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-1">Рост (cm)</label>
                        <input type="text" name="height" value={formData.height} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-1">Почтовый код (Опционально)</label>
                        <input type="text" name="postalCode" value={formData.postalCode || ''} onChange={handleChange} className={inputClass} />
                    </div>
                </div>
                <div className="flex justify-between pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Отменить</Button>
                    <Button type="submit">Next →</Button>
                </div>
            </form>
        );
    }

    if (currentPage === 2) {
        return (
            <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(3); }} className="space-y-4">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-1">Номер телефона (Опционально)</label>
                        <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-1">Род занятий (Опционально)</label>
                        <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-1">Дополнительная информация (Опционально)</label>
                        <textarea name="additionalInfo" value={formData.additionalInfo} onChange={handleChange} rows={4} className={inputClass} />
                    </div>
                </div>
                <div className="flex justify-between pt-4">
                    <Button type="button" variant="secondary" onClick={() => setCurrentPage(1)}>← Previous</Button>
                    <Button type="submit">Next →</Button>
                </div>
            </form>
        );
    }

    if (currentPage === 3) {
        // Страница 3 - Лицензии
        return (
            <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(4); }} className="space-y-4">
                <div className="space-y-4">
                    {/* Водительская лицензия */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Водительская лицензия (Опционально)</label>
                            <select name="driverLicense" value={formData.driverLicense} onChange={handleChange} className={inputClass}>
                                <option value="">Select...</option>
                                <option value="valid">Действительна</option>
                                <option value="expired">Истекла</option>
                                <option value="suspended">Приостановлена</option>
                                <option value="none">Отсутствует</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Категории водительской лицензии (Опционально)</label>
                            <select name="driverLicenseCategories" value={formData.driverLicenseCategories} onChange={handleChange} className={inputClass}>
                                <option value="">Выбрать...</option>
                                <option value="A">A - Мотоциклы</option>
                                <option value="B">B - Легковые автомобили</option>
                                <option value="C">C - Грузовые автомобили</option>
                                <option value="D">D - Автобусы</option>
                                <option value="E">E - Прицепы</option>
                                <option value="A,B">A, B - Мотоциклы и легковые</option>
                                <option value="B,C">B, C - Легковые и грузовые</option>
                                <option value="A,B,C,D,E">A, B, C, D, E - Все категории</option>
                            </select>
                        </div>
                    </div>

                    {/* Летная лицензия */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Летная лицензия (Опционально)</label>
                            <select name="flightLicense" value={formData.flightLicense} onChange={handleChange} className={inputClass}>
                                <option value="">Select...</option>
                                <option value="PPL">PPL - Частный пилот</option>
                                <option value="CPL">CPL - Коммерческий пилот</option>
                                <option value="ATPL">ATPL - Транспортный пилот</option>
                                <option value="none">Отсутствует</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Категории летной лицензии (Опционально)</label>
                            <select name="flightLicenseCategories" value={formData.flightLicenseCategories} onChange={handleChange} className={inputClass}>
                                <option value="">Выбрать...</option>
                                <option value="SEP">SEP - Одномоторный поршневой</option>
                                <option value="MEP">MEP - Многомоторный поршневой</option>
                                <option value="SET">SET - Одномоторный турбовинтовой</option>
                                <option value="MET">MET - Многомоторный турбовинтовой</option>
                                <option value="SEP,MEP">SEP, MEP - Поршневые</option>
                                <option value="SET,MET">SET, MET - Турбовинтовые</option>
                            </select>
                        </div>
                    </div>

                    {/* Лицензия на водный транспорт */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Лицензия на водный транспорт (Опционально)</label>
                            <select name="watercraftLicense" value={formData.watercraftLicense} onChange={handleChange} className={inputClass}>
                                <option value="">Select...</option>
                                <option value="PWC">PWC - Гидроциклы</option>
                                <option value="BOAT">BOAT - Лодки</option>
                                <option value="YACHT">YACHT - Яхты</option>
                                <option value="COMMERCIAL">COMMERCIAL - Коммерческие суда</option>
                                <option value="none">Отсутствует</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Категории лицензий на водный транспорт (Опционально)</label>
                            <select name="watercraftLicenseCategories" value={formData.watercraftLicenseCategories} onChange={handleChange} className={inputClass}>
                                <option value="">Выбрать...</option>
                                <option value="INLAND">INLAND - Внутренние воды</option>
                                <option value="COASTAL">COASTAL - Прибрежные воды</option>
                                <option value="OCEAN">OCEAN - Океанские воды</option>
                                <option value="INLAND,COASTAL">INLAND, COASTAL - Внутренние и прибрежные</option>
                                <option value="ALL">ALL - Все категории</option>
                            </select>
                        </div>
                    </div>

                    {/* Лицензия на рыбалку */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Лицензия на рыбалку (Опционально)</label>
                            <select name="fishingLicense" value={formData.fishingLicense} onChange={handleChange} className={inputClass}>
                                <option value="">Select...</option>
                                <option value="FRESHWATER">FRESHWATER - Пресноводная рыбалка</option>
                                <option value="SALTWATER">SALTWATER - Морская рыбалка</option>
                                <option value="SPORT">SPORT - Спортивная рыбалка</option>
                                <option value="COMMERCIAL">COMMERCIAL - Коммерческая рыбалка</option>
                                <option value="none">Отсутствует</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Категории лицензии на рыбалку (Опционально)</label>
                            <select name="fishingLicenseCategories" value={formData.fishingLicenseCategories} onChange={handleChange} className={inputClass}>
                                <option value="">Выбрать...</option>
                                <option value="TROUT">TROUT - Форель</option>
                                <option value="BASS">BASS - Окунь</option>
                                <option value="SALMON">SALMON - Лосось</option>
                                <option value="TUNA">TUNA - Тунец</option>
                                <option value="ALL">ALL - Все виды</option>
                            </select>
                        </div>
                    </div>

                    {/* Лицензия на охоту */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Лицензия на охоту (Опционально)</label>
                            <select name="huntingLicense" value={formData.huntingLicense} onChange={handleChange} className={inputClass}>
                                <option value="">Select...</option>
                                <option value="SMALL_GAME">SMALL_GAME - Мелкая дичь</option>
                                <option value="BIG_GAME">BIG_GAME - Крупная дичь</option>
                                <option value="WATERFOWL">WATERFOWL - Водоплавающая дичь</option>
                                <option value="TROPHY">TROPHY - Трофейная охота</option>
                                <option value="none">Отсутствует</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Категории лицензии на охоту (Опционально)</label>
                            <select name="huntingLicenseCategories" value={formData.huntingLicenseCategories} onChange={handleChange} className={inputClass}>
                                <option value="">Выбрать...</option>
                                <option value="DEER">DEER - Олени</option>
                                <option value="BOAR">BOAR - Кабаны</option>
                                <option value="DUCK">DUCK - Утки</option>
                                <option value="BEAR">BEAR - Медведи</option>
                                <option value="ALL">ALL - Все виды</option>
                            </select>
                        </div>
                    </div>

                    {/* Лицензии на оружие */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Лицензии на оружие (Опционально)</label>
                            <select name="weaponLicense" value={formData.weaponLicense} onChange={handleChange} className={inputClass}>
                                <option value="">Select...</option>
                                <option value="HANDGUN">HANDGUN - Пистолеты</option>
                                <option value="RIFLE">RIFLE - Винтовки</option>
                                <option value="SHOTGUN">SHOTGUN - Дробовики</option>
                                <option value="CONCEALED">CONCEALED - Скрытое ношение</option>
                                <option value="none">Отсутствует</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Категории лицензий на оружие (Опционально)</label>
                            <select name="weaponLicenseCategories" value={formData.weaponLicenseCategories} onChange={handleChange} className={inputClass}>
                                <option value="">Выбрать...</option>
                                <option value="PISTOL">PISTOL - Пистолеты</option>
                                <option value="REVOLVER">REVOLVER - Револьверы</option>
                                <option value="SEMI_AUTO">SEMI_AUTO - Полуавтоматическое</option>
                                <option value="BOLT_ACTION">BOLT_ACTION - Болтовое</option>
                                <option value="PUMP_ACTION">PUMP_ACTION - Помповое</option>
                                <option value="ALL">ALL - Все категории</option>
                            </select>
                        </div>
                    </div>

                    {/* Другие категории лицензий */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-1">Другие категории лицензий (Опционально)</label>
                        <select name="otherLicenseCategories" value={formData.otherLicenseCategories} onChange={handleChange} className={inputClass}>
                            <option value="">Выбрать...</option>
                            <option value="BUSINESS">BUSINESS - Бизнес лицензия</option>
                            <option value="ALCOHOL">ALCOHOL - Продажа алкоголя</option>
                            <option value="GAMBLING">GAMBLING - Азартные игры</option>
                            <option value="SECURITY">SECURITY - Охрана</option>
                            <option value="MEDICAL">MEDICAL - Медицинская</option>
                            <option value="LEGAL">LEGAL - Юридическая</option>
                            <option value="REAL_ESTATE">REAL_ESTATE - Недвижимость</option>
                            <option value="INSURANCE">INSURANCE - Страхование</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-between pt-4">
                    <Button type="button" variant="secondary" onClick={() => setCurrentPage(2)}>← Previous</Button>
                    <Button type="submit">Next →</Button>
                </div>
            </form>
        );
    }

    if (currentPage === 4) {
        // Страница 4 - Предыдущие записи
        return (
            <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(5); }} className="space-y-4">
                <div className="space-y-4">
                    <p className="text-secondary-300 text-sm">
                        Здесь вы можете по желанию добавить предыдущие записи, которые были у этого гражданина. 
                        Это полезно, когда гражданин уже был арестован ранее.
                    </p>
                    
                    <div className="flex gap-4">
                        <Button type="button" onClick={() => setShowFineModal(true)} variant="secondary">
                            Создать штраф
                        </Button>
                        <Button type="button" onClick={() => setShowWarningModal(true)} variant="secondary">
                            Создать письменное предупреждение
                        </Button>
                        <Button type="button" onClick={() => setShowArrestModal(true)} variant="secondary">
                            Создать отчёт об аресте
                        </Button>
                    </div>

                    <div className="mt-6">
                        {formData.previousRecords.length > 0 ? (
                            <div className="space-y-2">
                                <h4 className="font-medium text-secondary-200">Добавленные записи:</h4>
                                {formData.previousRecords.map((record) => (
                                    <div key={record.id} className="flex justify-between items-center p-3 bg-secondary-800 rounded-md">
                                        <div>
                                            <p className="font-medium text-secondary-200">{record.type}</p>
                                            <p className="text-sm text-secondary-400">{record.description}</p>
                                            <p className="text-xs text-secondary-500">{record.date}</p>
                                        </div>
                                        <Button 
                                            type="button" 
                                            variant="danger" 
                                            size="sm"
                                            onClick={() => removePreviousRecord(record.id)}
                                        >
                                            Удалить
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-secondary-400 text-sm">No records selected yet</p>
                        )}
                    </div>
                </div>
                
                <div className="flex justify-between pt-4">
                    <Button type="button" variant="secondary" onClick={() => setCurrentPage(3)}>← Previous</Button>
                    <Button type="submit">Next →</Button>
                </div>

                {/* Модальные окна для создания записей */}
                <Modal isOpen={showFineModal} onClose={() => setShowFineModal(false)} title="Создание штрафа">
                    <CreateFineForm 
                        onSubmit={(fine) => {
                            addPreviousRecord(fine);
                            setShowFineModal(false);
                        }} 
                        onClose={() => setShowFineModal(false)} 
                    />
                </Modal>

                <Modal isOpen={showWarningModal} onClose={() => setShowWarningModal(false)} title="Создание письменного предупреждения">
                    <CreateWarningForm 
                        onSubmit={(warning) => {
                            addPreviousRecord(warning);
                            setShowWarningModal(false);
                        }} 
                        onClose={() => setShowWarningModal(false)} 
                    />
                </Modal>

                <Modal isOpen={showArrestModal} onClose={() => setShowArrestModal(false)} title="Создание отчёта об аресте">
                    <CreateArrestForm 
                        onSubmit={(arrest) => {
                            addPreviousRecord(arrest);
                            setShowArrestModal(false);
                        }} 
                        onClose={() => setShowArrestModal(false)} 
                    />
                </Modal>
            </form>
        );
    }

    if (currentPage === 5) {
        // Страница 5 - Медицинская информация
        return (
            <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(6); }} className="space-y-4">
                <div className="space-y-6">
                    {/* Список болезней */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-3">Список болезней (выборочно)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                'Грипп', 'ОРВИ', 'Коронавирус', 'Туберкулез', 'Гепатит A', 'Гепатит B', 'Гепатит C',
                                'ВИЧ/СПИД', 'Сифилис', 'Гонорея', 'Хламидиоз', 'Герпес', 'Ветрянка', 'Корь',
                                'Свинка', 'Краснуха', 'Дифтерия', 'Столбняк', 'Полиомиелит', 'Брюшной тиф',
                                'Дизентерия', 'Холера', 'Чума', 'Малярия', 'Лихорадка Денге', 'Желтая лихорадка'
                            ].map((disease) => (
                                <label key={disease} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.diseases.includes(disease)}
                                        onChange={() => toggleDisease(disease)}
                                        className={checkboxClass}
                                    />
                                    <span className="text-secondary-300 text-sm">{disease}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Список хронических заболеваний */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-3">Список хронических заболеваний (выборочно)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                'Сахарный диабет', 'Гипертония', 'Астма', 'Хронический бронхит', 'Эмфизема',
                                'Ишемическая болезнь сердца', 'Сердечная недостаточность', 'Аритмия',
                                'Язвенная болезнь желудка', 'Гастрит', 'Колит', 'Цирроз печени',
                                'Хронический гепатит', 'Панкреатит', 'Хроническая почечная недостаточность',
                                'Гломерулонефрит', 'Пиелонефрит', 'Ревматоидный артрит', 'Остеоартрит',
                                'Остеопороз', 'Подагра', 'Эпилепсия', 'Рассеянный склероз', 'Болезнь Паркинсона',
                                'Альцгеймер', 'Депрессия', 'Биполярное расстройство', 'Шизофрения',
                                'Аутизм', 'Синдром Дауна', 'Муковисцидоз', 'Серповидноклеточная анемия'
                            ].map((disease) => (
                                <label key={disease} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.chronicDiseases.includes(disease)}
                                        onChange={() => toggleChronicDisease(disease)}
                                        className={checkboxClass}
                                    />
                                    <span className="text-secondary-300 text-sm">{disease}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Аллергии */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-1">Аллергии (письменно)</label>
                        <textarea 
                            name="allergies" 
                            value={formData.allergies} 
                            onChange={handleChange} 
                            rows={3} 
                            className={inputClass}
                            placeholder="Укажите все известные аллергии (лекарства, продукты, вещества и т.д.)"
                        />
                    </div>

                    {/* Группа крови и резус-фактор */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Группа крови (выборочно)</label>
                            <select name="bloodType" value={formData.bloodType} onChange={handleChange} className={inputClass}>
                                <option value="">Выбрать...</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="unknown">Неизвестно</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-300 mb-1">Резус-фактор (выборочно)</label>
                            <select name="rhFactor" value={formData.rhFactor} onChange={handleChange} className={inputClass}>
                                <option value="">Выбрать...</option>
                                <option value="positive">Положительный (+)</option>
                                <option value="negative">Отрицательный (-)</option>
                                <option value="unknown">Неизвестно</option>
                            </select>
                        </div>
                    </div>

                    {/* Перенесенные операции */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-1">Перенесенные операции (письменно)</label>
                        <textarea 
                            name="surgeries" 
                            value={formData.surgeries} 
                            onChange={handleChange} 
                            rows={3} 
                            className={inputClass}
                            placeholder="Укажите все перенесенные операции с датами и описанием"
                        />
                    </div>

                    {/* Наличие имплантантов */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-300 mb-1">Наличие имплантантов (письменно)</label>
                        <textarea 
                            name="implants" 
                            value={formData.implants} 
                            onChange={handleChange} 
                            rows={3} 
                            className={inputClass}
                            placeholder="Укажите все имплантанты (кардиостимуляторы, протезы, пластины и т.д.)"
                        />
                    </div>
                </div>
                
                <div className="flex justify-between pt-4">
                    <Button type="button" variant="secondary" onClick={() => setCurrentPage(4)}>← Previous</Button>
                    <Button type="submit">Next →</Button>
                </div>
            </form>
        );
    }

    if (currentPage === 6) {
        // Страница 6 - Завершение
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                    <div className="bg-secondary-800 p-4 rounded-md">
                        <h3 className="text-lg font-medium text-secondary-200 mb-4">Проверьте введенную информацию</h3>
                        
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-medium text-secondary-300">Основная информация:</h4>
                                <p className="text-sm text-secondary-400">
                                    {formData.firstName} {formData.lastName} - {formData.dateOfBirth}
                                </p>
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-secondary-300">Медицинская информация:</h4>
                                <p className="text-sm text-secondary-400">
                                    Группа крови: {formData.bloodType || 'Не указана'} {formData.rhFactor ? `(${formData.rhFactor})` : ''}
                                </p>
                                {formData.diseases.length > 0 && (
                                    <p className="text-sm text-secondary-400">
                                        Болезни: {formData.diseases.join(', ')}
                                    </p>
                                )}
                                {formData.chronicDiseases.length > 0 && (
                                    <p className="text-sm text-secondary-400">
                                        Хронические заболевания: {formData.chronicDiseases.join(', ')}
                                    </p>
                                )}
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-secondary-300">Предыдущие записи:</h4>
                                <p className="text-sm text-secondary-400">
                                    {formData.previousRecords.length} записей добавлено
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-between pt-4">
                    <Button type="button" variant="secondary" onClick={() => setCurrentPage(5)}>← Previous</Button>
                    <Button type="submit">Создать гражданина</Button>
                </div>
            </form>
        );
    }

    return null;
};

// Компонент для создания вызова 911
const Create911CallForm: React.FC<{ onSubmit: (call: any) => void; onClose: () => void; }> = ({ onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        location: '',
        description: '',
        priority: 'medium',
        callerName: '',
        phoneNumber: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newCall = {
            id: `call_${Date.now()}`,
            ...formData,
            timestamp: new Date().toISOString(),
        };
        onSubmit(newCall);
        onClose();
    };

    const inputClass = "w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
                <Button type="submit">Отправить вызов</Button>
            </div>
        </form>
    );
};

// Компонент для регистрации оружия
const RegisterWeaponForm: React.FC<{ onSubmit: (weapon: any) => void; onClose: () => void; }> = ({ onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        weaponType: '',
        serialNumber: '',
        model: '',
        caliber: '',
        ownerName: '',
        licenseNumber: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newWeapon = {
            id: `weapon_${Date.now()}`,
            ...formData,
            registeredAt: new Date().toISOString(),
        };
        onSubmit(newWeapon);
        onClose();
    };

    const inputClass = "w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
                <Button type="submit">Зарегистрировать</Button>
            </div>
        </form>
    );
};

// Компонент для регистрации ТС
const RegisterVehicleForm: React.FC<{ onSubmit: (vehicle: Vehicle) => void; onClose: () => void; }> = ({ onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        plate: '',
        vin: '',
        model: '',
        owner: '',
        color: '',
        equipmentLevels: '',
        registrationStatus: '',
        insuranceStatus: '',
        inspectionStatus: '',
        taxStatus: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Функция для генерации случайного VIN-номера
    const generateVIN = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let vin = '';
        for (let i = 0; i < 17; i++) {
            vin += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, vin }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newVehicle: Vehicle = {
            id: `veh_${Date.now()}`,
            ownerId: 'cit_1',
            plate: formData.plate,
            vin: formData.vin,
            model: formData.model,
            color: formData.color,
            registration: formData.registrationStatus || 'valid',
            insurance: formData.insuranceStatus || 'valid',
        };
        onSubmit(newVehicle);
        onClose();
    };

    const inputClass = "w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500";

    return (
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
                        <option value="">Select...</option>
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
                        <option value="">Select...</option>
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
            
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
                <Button type="submit">Зарегистрировать</Button>
            </div>
        </form>
    );
};

// Панель управления гражданского
const CitizenDashboard: React.FC<{ onAction: (action: string) => void }> = ({ onAction }) => {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>Панель управления гражданского</CardHeader>
                <p className="text-secondary-300 mb-6">Добро пожаловать в систему управления гражданскими делами. Выберите нужное действие:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button 
                        onClick={() => onAction('createCitizen')}
                        className="h-32 flex flex-col items-center justify-center gap-3"
                    >
                        <User className="h-8 w-8" />
                        <span>Создать гражданского</span>
                    </Button>
                    
                    <Button 
                        onClick={() => onAction('create911Call')}
                        variant="secondary"
                        className="h-32 flex flex-col items-center justify-center gap-3"
                    >
                        <Phone className="h-8 w-8" />
                        <span>Создать вызов 911</span>
                    </Button>
                    
                    <Button 
                        onClick={() => onAction('registerWeapon')}
                        variant="secondary"
                        className="h-32 flex flex-col items-center justify-center gap-3"
                    >
                        <Shield className="h-8 w-8" />
                        <span>Зарегистрировать оружие</span>
                    </Button>
                    
                    <Button 
                        onClick={() => onAction('registerVehicle')}
                        variant="secondary"
                        className="h-32 flex flex-col items-center justify-center gap-3"
                    >
                        <Car className="h-8 w-8" />
                        <span>Зарегистрировать Т/С</span>
                    </Button>
                </div>
            </Card>
        </div>
    );
};

// Раздел Граждане
const CitizensSection: React.FC = () => {
    const [citizens, setCitizens] = useState(MOCK_CITIZENS);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const handleCreateCitizen = (newCitizen: Citizen) => {
        setCitizens(prev => [...prev, newCitizen]);
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex justify-between items-center">
                    <CardHeader className="mb-0">Граждане</CardHeader>
                    <Button size="sm" onClick={() => setShowCreateForm(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Создать гражданина
                    </Button>
                </div>
                <div className="space-y-4 mt-4">
                    {citizens.map(citizen => (
                        <div key={citizen.id} className="flex items-center gap-4 p-3 bg-secondary-900 rounded-md">
                            <img src={citizen.imageUrl} alt={`${citizen.firstName} ${citizen.lastName}`} className="w-12 h-12 rounded-full border-2 border-secondary-600" />
                            <div>
                                <p className="font-bold text-lg">{citizen.firstName} {citizen.lastName}</p>
                                <p className="text-sm text-secondary-400">{citizen.address}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Modal
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                title="Создание нового гражданина"
            >
                <CreateCitizenForm 
                    onSubmit={handleCreateCitizen}
                    onClose={() => setShowCreateForm(false)}
                />
            </Modal>
        </div>
    );
};

// Раздел Журнал грузоперевозок
const CargoLogSection: React.FC = () => {
    return (
        <Card>
            <CardHeader>Журнал грузоперевозок</CardHeader>
            <div className="space-y-4">
                <p className="text-secondary-400">Здесь будет отображаться журнал грузоперевозок...</p>
                <div className="p-4 bg-secondary-900 rounded-md">
                    <p className="text-sm text-secondary-300">Функция в разработке</p>
                </div>
            </div>
        </Card>
    );
};

// Раздел Компании
const CompaniesSection: React.FC = () => {
    return (
        <Card>
            <CardHeader>Компании</CardHeader>
            <div className="space-y-4">
                <p className="text-secondary-400">Управление компаниями и бизнесами...</p>
                <div className="p-4 bg-secondary-900 rounded-md">
                    <p className="text-sm text-secondary-300">Функция в разработке</p>
                </div>
            </div>
        </Card>
    );
};

// Раздел Питомцы
const PetsSection: React.FC = () => {
    return (
        <Card>
            <CardHeader>Питомцы</CardHeader>
            <div className="space-y-4">
                <p className="text-secondary-400">Регистрация и управление питомцами...</p>
                <div className="p-4 bg-secondary-900 rounded-md">
                    <p className="text-sm text-secondary-300">Функция в разработке</p>
                </div>
            </div>
        </Card>
    );
};

// Раздел Кодексы
const CodesSection: React.FC = () => {
    return (
        <Card>
            <CardHeader>Кодексы</CardHeader>
            <div className="space-y-4">
                <p className="text-secondary-400">Просмотр законов и кодексов...</p>
                <div className="p-4 bg-secondary-900 rounded-md">
                    <p className="text-sm text-secondary-300">Функция в разработке</p>
                </div>
            </div>
        </Card>
    );
};

export const CitizenPortal: React.FC<CitizenPortalProps> = ({ activeView, onViewChange }) => {
    const [showCreateCitizen, setShowCreateCitizen] = useState(false);
    const [showCreate911Call, setShowCreate911Call] = useState(false);
    const [showRegisterWeapon, setShowRegisterWeapon] = useState(false);
    const [showRegisterVehicle, setShowRegisterVehicle] = useState(false);
    const [citizens, setCitizens] = useState(MOCK_CITIZENS);
    const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
    const [calls, setCalls] = useState<any[]>([]);
    const [weapons, setWeapons] = useState<any[]>([]);

    const handleDashboardAction = (action: string) => {
        switch (action) {
            case 'createCitizen':
                setShowCreateCitizen(true);
                break;
            case 'create911Call':
                setShowCreate911Call(true);
                break;
            case 'registerWeapon':
                setShowRegisterWeapon(true);
                break;
            case 'registerVehicle':
                setShowRegisterVehicle(true);
                break;
        }
    };

    const handleCreateCitizen = (newCitizen: Citizen) => {
        setCitizens(prev => [...prev, newCitizen]);
        setShowCreateCitizen(false);
    };

    const handleCreate911Call = (newCall: any) => {
        setCalls(prev => [...prev, newCall]);
        setShowCreate911Call(false);
    };

    const handleRegisterWeapon = (newWeapon: any) => {
        setWeapons(prev => [...prev, newWeapon]);
        setShowRegisterWeapon(false);
    };

    const handleRegisterVehicle = (newVehicle: Vehicle) => {
        setVehicles(prev => [...prev, newVehicle]);
        setShowRegisterVehicle(false);
    };

    const renderActiveView = () => {
        switch (activeView) {
            case 'Панель управления':
                return <CitizenDashboard onAction={handleDashboardAction} />;
            case 'Граждане':
                return <CitizensSection />;
            case 'Журнал грузоперевозок':
                return <CargoLogSection />;
            case 'Компании':
                return <CompaniesSection />;
            case 'Питомцы':
                return <PetsSection />;
            case 'Кодексы':
                return <CodesSection />;
            default:
                return <CitizenDashboard onAction={handleDashboardAction} />;
        }
    };

    return (
        <>
            {renderActiveView()}

            {/* Модальные окна */}
            <Modal
                isOpen={showCreateCitizen}
                onClose={() => setShowCreateCitizen(false)}
                title="Создание нового гражданина"
            >
                <CreateCitizenForm 
                    onSubmit={handleCreateCitizen}
                    onClose={() => setShowCreateCitizen(false)}
                />
            </Modal>

            <Modal
                isOpen={showCreate911Call}
                onClose={() => setShowCreate911Call(false)}
                title="Создание вызова 911"
            >
                <Create911CallForm 
                    onSubmit={handleCreate911Call}
                    onClose={() => setShowCreate911Call(false)}
                />
            </Modal>

            <Modal
                isOpen={showRegisterWeapon}
                onClose={() => setShowRegisterWeapon(false)}
                title="Регистрация оружия"
            >
                <RegisterWeaponForm 
                    onSubmit={handleRegisterWeapon}
                    onClose={() => setShowRegisterWeapon(false)}
                />
            </Modal>

            <Modal
                isOpen={showRegisterVehicle}
                onClose={() => setShowRegisterVehicle(false)}
                title="Регистрация транспортного средства"
            >
                <RegisterVehicleForm 
                    onSubmit={handleRegisterVehicle}
                    onClose={() => setShowRegisterVehicle(false)}
                />
            </Modal>
        </>
    );
};
