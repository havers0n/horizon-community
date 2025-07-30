import React from 'react';
import { Card, CardHeader, Modal, Button } from '@/shared/ui/atoms';
import { citizenRegistrationStore } from '../model/store';
import { CreateFineForm } from './CreateFineForm';
import { CreateWarningForm } from './CreateWarningForm';
import { CreateArrestForm } from './CreateArrestForm';
import type { LegalRecord } from '../model/types';

export const CitizenRegistrationWidget: React.FC = () => {
    const {
        currentPage,
        formData,
        isLoading,
        error,
        showFineModal,
        showWarningModal,
        showArrestModal,
        setCurrentPage,
        updateFormData,
        addPreviousRecord,
        removePreviousRecord,
        toggleDisease,
        toggleChronicDisease,
        setShowFineModal,
        setShowWarningModal,
        setShowArrestModal,
        submitForm,
    } = citizenRegistrationStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        updateFormData({ [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitForm();
    };

    const inputClass = "w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500";
    const checkboxClass = "mr-2 text-primary-500 focus:ring-primary-500";

    // Страница 1 - Основная информация
    if (currentPage === 1) {
        return (
            <Card>
                <CardHeader>Регистрация гражданина - Основная информация</CardHeader>
                <div className="p-6">
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
                                    <option value="">Выбрать...</option>
                                    <option value="male">Мужской</option>
                                    <option value="female">Женский</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-300 mb-1">Цвет волос</label>
                                <input type="text" name="hairColor" value={formData.hairColor} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-300 mb-1">Вес (kg)</label>
                                <input type="text" name="weight" value={formData.weight} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-300 mb-1">Адрес</label>
                                <select name="address" value={formData.address} onChange={handleChange} className={inputClass} required>
                                    <option value="">Выбрать...</option>
                                    <option value="Los Santos">Los Santos</option>
                                    <option value="Blaine County">Blaine County</option>
                                    <option value="Sandy Shores">Sandy Shores</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-300 mb-1">SSN (Опционально)</label>
                                <input type="text" name="ssn" value={formData.ssn} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-300 mb-1">Этническая принадлежность</label>
                                <select name="ethnicity" value={formData.ethnicity} onChange={handleChange} className={inputClass}>
                                    <option value="">Выбрать...</option>
                                    <option value="caucasian">Европеоидная</option>
                                    <option value="african">Негроидная</option>
                                    <option value="asian">Монголоидная</option>
                                    <option value="hispanic">Латиноамериканская</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-300 mb-1">Цвет глаз</label>
                                <input type="text" name="eyeColor" value={formData.eyeColor} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-300 mb-1">Рост (cm)</label>
                                <input type="text" name="height" value={formData.height} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-300 mb-1">Почтовый код (Опционально)</label>
                                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className={inputClass} />
                            </div>
                        </div>
                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="secondary" onClick={() => window.history.back()}>Отменить</Button>
                            <Button type="submit">Далее →</Button>
                        </div>
                    </form>
                </div>
            </Card>
        );
    }

    // Страница 2 - Дополнительная информация
    if (currentPage === 2) {
        return (
            <Card>
                <CardHeader>Регистрация гражданина - Дополнительная информация</CardHeader>
                <div className="p-6">
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
                            <Button type="button" variant="secondary" onClick={() => setCurrentPage(1)}>← Назад</Button>
                            <Button type="submit">Далее →</Button>
                        </div>
                    </form>
                </div>
            </Card>
        );
    }

    // Страница 3 - Лицензии
    if (currentPage === 3) {
        return (
            <Card>
                <CardHeader>Регистрация гражданина - Лицензии</CardHeader>
                <div className="p-6">
                    <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(4); }} className="space-y-4">
                        <div className="space-y-4">
                            {/* Водительская лицензия */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-300 mb-1">Водительская лицензия</label>
                                    <select name="driverLicense" value={formData.driverLicense} onChange={handleChange} className={inputClass}>
                                        <option value="">Выбрать...</option>
                                        <option value="valid">Действительна</option>
                                        <option value="expired">Истекла</option>
                                        <option value="suspended">Приостановлена</option>
                                        <option value="none">Отсутствует</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-300 mb-1">Категории водительской лицензии</label>
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
                                    <label className="block text-sm font-medium text-secondary-300 mb-1">Летная лицензия</label>
                                    <select name="flightLicense" value={formData.flightLicense} onChange={handleChange} className={inputClass}>
                                        <option value="">Выбрать...</option>
                                        <option value="PPL">PPL - Частный пилот</option>
                                        <option value="CPL">CPL - Коммерческий пилот</option>
                                        <option value="ATPL">ATPL - Транспортный пилот</option>
                                        <option value="none">Отсутствует</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-300 mb-1">Категории летной лицензии</label>
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

                            {/* Остальные лицензии */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-300 mb-1">Лицензия на водный транспорт</label>
                                    <select name="watercraftLicense" value={formData.watercraftLicense} onChange={handleChange} className={inputClass}>
                                        <option value="">Выбрать...</option>
                                        <option value="PWC">PWC - Гидроциклы</option>
                                        <option value="BOAT">BOAT - Лодки</option>
                                        <option value="YACHT">YACHT - Яхты</option>
                                        <option value="COMMERCIAL">COMMERCIAL - Коммерческие суда</option>
                                        <option value="none">Отсутствует</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-300 mb-1">Лицензия на рыбалку</label>
                                    <select name="fishingLicense" value={formData.fishingLicense} onChange={handleChange} className={inputClass}>
                                        <option value="">Выбрать...</option>
                                        <option value="FRESHWATER">FRESHWATER - Пресноводная рыбалка</option>
                                        <option value="SALTWATER">SALTWATER - Морская рыбалка</option>
                                        <option value="SPORT">SPORT - Спортивная рыбалка</option>
                                        <option value="COMMERCIAL">COMMERCIAL - Коммерческая рыбалка</option>
                                        <option value="none">Отсутствует</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-300 mb-1">Лицензия на охоту</label>
                                    <select name="huntingLicense" value={formData.huntingLicense} onChange={handleChange} className={inputClass}>
                                        <option value="">Выбрать...</option>
                                        <option value="SMALL_GAME">SMALL_GAME - Мелкая дичь</option>
                                        <option value="BIG_GAME">BIG_GAME - Крупная дичь</option>
                                        <option value="WATERFOWL">WATERFOWL - Водоплавающая дичь</option>
                                        <option value="TROPHY">TROPHY - Трофейная охота</option>
                                        <option value="none">Отсутствует</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-300 mb-1">Лицензии на оружие</label>
                                    <select name="weaponLicense" value={formData.weaponLicense} onChange={handleChange} className={inputClass}>
                                        <option value="">Выбрать...</option>
                                        <option value="HANDGUN">HANDGUN - Пистолеты</option>
                                        <option value="RIFLE">RIFLE - Винтовки</option>
                                        <option value="SHOTGUN">SHOTGUN - Дробовики</option>
                                        <option value="CONCEALED">CONCEALED - Скрытое ношение</option>
                                        <option value="none">Отсутствует</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="secondary" onClick={() => setCurrentPage(2)}>← Назад</Button>
                            <Button type="submit">Далее →</Button>
                        </div>
                    </form>
                </div>
            </Card>
        );
    }

    // Страница 4 - Предыдущие записи
    if (currentPage === 4) {
        return (
            <Card>
                <CardHeader>Регистрация гражданина - Предыдущие записи</CardHeader>
                <div className="p-6">
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
                                    <p className="text-secondary-400 text-sm">Записи не добавлены</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="secondary" onClick={() => setCurrentPage(3)}>← Назад</Button>
                            <Button type="submit">Далее →</Button>
                        </div>
                    </form>
                </div>
            </Card>
        );
    }

    // Страница 5 - Медицинская информация
    if (currentPage === 5) {
        return (
            <Card>
                <CardHeader>Регистрация гражданина - Медицинская информация</CardHeader>
                <div className="p-6">
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
                                    <label className="block text-sm font-medium text-secondary-300 mb-1">Группа крови</label>
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
                                    <label className="block text-sm font-medium text-secondary-300 mb-1">Резус-фактор</label>
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
                            <Button type="button" variant="secondary" onClick={() => setCurrentPage(4)}>← Назад</Button>
                            <Button type="submit">Далее →</Button>
                        </div>
                    </form>
                </div>
            </Card>
        );
    }

    // Страница 6 - Завершение
    if (currentPage === 6) {
        return (
            <Card>
                <CardHeader>Регистрация гражданина - Проверка информации</CardHeader>
                <div className="p-6">
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
                        
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}
                        
                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="secondary" onClick={() => setCurrentPage(5)}>← Назад</Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Создание...' : 'Создать гражданина'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        );
    }

    return null;
};

// Модальные окна для создания записей
export const CitizenRegistrationModals: React.FC = () => {
    const {
        showFineModal,
        showWarningModal,
        showArrestModal,
        setShowFineModal,
        setShowWarningModal,
        setShowArrestModal,
        addPreviousRecord,
    } = citizenRegistrationStore();

    const handleFineSubmit = (fine: LegalRecord) => {
        addPreviousRecord(fine);
        setShowFineModal(false);
    };

    const handleWarningSubmit = (warning: LegalRecord) => {
        addPreviousRecord(warning);
        setShowWarningModal(false);
    };

    const handleArrestSubmit = (arrest: LegalRecord) => {
        addPreviousRecord(arrest);
        setShowArrestModal(false);
    };

    return (
        <>
            <Modal isOpen={showFineModal} onClose={() => setShowFineModal(false)} title="Создание штрафа">
                <CreateFineForm 
                    onSubmit={handleFineSubmit} 
                    onClose={() => setShowFineModal(false)} 
                />
            </Modal>

            <Modal isOpen={showWarningModal} onClose={() => setShowWarningModal(false)} title="Создание письменного предупреждения">
                <CreateWarningForm 
                    onSubmit={handleWarningSubmit} 
                    onClose={() => setShowWarningModal(false)} 
                />
            </Modal>

            <Modal isOpen={showArrestModal} onClose={() => setShowArrestModal(false)} title="Создание отчёта об аресте">
                <CreateArrestForm 
                    onSubmit={handleArrestSubmit} 
                    onClose={() => setShowArrestModal(false)} 
                />
            </Modal>
        </>
    );
};
