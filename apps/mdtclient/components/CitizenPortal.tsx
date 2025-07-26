
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

// Компонент для создания гражданского с двухстраничной формой
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
    });

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

    const inputClass = "w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500";

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

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <Button type="submit">Создать</Button>
            </div>
        </form>
    );
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
        color: '',
        registration: 'valid',
        insurance: 'valid',
        stolen: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
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
            registration: formData.registration,
            insurance: formData.insurance,
        };
        onSubmit(newVehicle);
        onClose();
    };

    const inputClass = "w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-1">Номерной знак</label>
                    <input type="text" name="plate" value={formData.plate} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-1">VIN</label>
                    <input type="text" name="vin" value={formData.vin} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-1">Модель</label>
                    <input type="text" name="model" value={formData.model} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-1">Цвет</label>
                    <input type="text" name="color" value={formData.color} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-1">Регистрация</label>
                    <select name="registration" value={formData.registration} onChange={handleChange} className={inputClass}>
                        <option value="valid">Действительна</option>
                        <option value="expired">Истекла</option>
                        <option value="stolen">Украдена</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-1">Страховка</label>
                    <select name="insurance" value={formData.insurance} onChange={handleChange} className={inputClass}>
                        <option value="valid">Действительна</option>
                        <option value="expired">Истекла</option>
                    </select>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" name="stolen" checked={formData.stolen} onChange={handleChange} className="mr-2" />
                    <label className="text-sm text-secondary-300">Украден</label>
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
