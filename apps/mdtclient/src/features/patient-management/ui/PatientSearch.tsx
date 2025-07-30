import React, { useState, useEffect } from 'react';
import { Search, HeartPulse, Pill, ShieldAlert, Activity, FileText, User, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { usePatientStore } from '../model/patientStore';
import { Patient, PatientGender, BloodType } from '../../../entities/patient';
import { Card, CardHeader } from '@/shared/ui/atoms';

// Компонент для отображения медицинской информации
const MedicalInfoCard: React.FC<{ patient: Patient }> = ({ patient }) => (
  <Card className="bg-secondary-900">
    <CardHeader className="!text-lg !mb-3 flex items-center gap-2 text-amber-400">
      <HeartPulse size={22}/> Медицинская информация
    </CardHeader>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div className="flex items-start gap-3">
        <ShieldAlert className="text-red-400 mt-1 h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-secondary-300">Аллергии</p>
          <p className="text-secondary-200">
            {patient.allergies.length > 0 
              ? patient.allergies.map(a => a.allergen).join(', ')
              : 'Нет данных'
            }
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Activity className="text-blue-400 mt-1 h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-secondary-300">Хронические заболевания</p>
          <p className="text-secondary-200">
            {patient.medicalConditions.length > 0 
              ? patient.medicalConditions.map(c => c.condition).join(', ')
              : 'Нет данных'
            }
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Pill className="text-green-400 mt-1 h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-secondary-300">Медикаменты</p>
          <p className="text-secondary-200">
            {patient.medications.length > 0 
              ? patient.medications.map(m => m.name).join(', ')
              : 'Нет данных'
            }
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <FileText className="text-secondary-400 mt-1 h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-secondary-300">Заметки</p>
          <p className="text-secondary-200">{patient.notes || 'Нет данных'}</p>
        </div>
      </div>
    </div>
  </Card>
);

// Компонент для отображения детальной информации о пациенте
const PatientDetails: React.FC<{ patient: Patient }> = ({ patient }) => (
  <Card className="col-span-12 lg:col-span-8">
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-32 h-32 rounded-lg bg-secondary-700 flex items-center justify-center border-2 border-secondary-600">
        <User size={48} className="text-secondary-400" />
      </div>
      <div className="flex-grow">
        <h3 className="text-3xl font-bold text-white">
          {patient.firstName} {patient.lastName}
          {patient.middleName && ` ${patient.middleName}`}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mt-3 text-sm text-secondary-300">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-secondary-400" />
            <span><strong className="text-secondary-400">Дата рождения:</strong> {patient.dateOfBirth}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-secondary-400" />
            <span><strong className="text-secondary-400">Пол:</strong> {patient.gender}</span>
          </div>
          <div className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-secondary-400" />
            <span><strong className="text-secondary-400">Группа крови:</strong> {patient.bloodType || 'N/A'}</span>
          </div>
          {patient.height && (
            <div className="flex items-center gap-2">
              <span><strong className="text-secondary-400">Рост:</strong> {patient.height} см</span>
            </div>
          )}
          {patient.weight && (
            <div className="flex items-center gap-2">
              <span><strong className="text-secondary-400">Вес:</strong> {patient.weight} кг</span>
            </div>
          )}
          {patient.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-secondary-400" />
              <span><strong className="text-secondary-400">Телефон:</strong> {patient.phone}</span>
            </div>
          )}
          {patient.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-secondary-400" />
              <span><strong className="text-secondary-400">Email:</strong> {patient.email}</span>
            </div>
          )}
          {patient.address && (
            <div className="col-span-2 md:col-span-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-secondary-400" />
              <span><strong className="text-secondary-400">Адрес:</strong> {patient.address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
    <div className="mt-6">
      <MedicalInfoCard patient={patient} />
    </div>
  </Card>
);

// Основной компонент поиска пациентов
export const PatientSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { 
    patients, 
    selectedPatient, 
    isLoading, 
    error,
    fetchPatients, 
    setSelectedPatient 
  } = usePatientStore();

  // Загрузка пациентов при монтировании компонента
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Фильтрация пациентов по поисковому запросу
  const filteredPatients = patients.filter(patient => {
    if (!searchTerm) return true;
    const lowercasedTerm = searchTerm.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(lowercasedTerm) ||
      patient.lastName.toLowerCase().includes(lowercasedTerm) ||
      patient.number.toLowerCase().includes(lowercasedTerm)
    );
  });

  // Обработка выбора пациента
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  if (error) {
    return (
      <div className="col-span-12">
        <Card className="bg-red-900/20 border-red-500">
          <CardHeader className="text-red-400">Ошибка</CardHeader>
          <p className="text-red-300">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Панель поиска */}
      <div className="col-span-12 lg:col-span-4">
        <Card className="h-full flex flex-col">
          <CardHeader>Поиск пациентов</CardHeader>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={20} />
            <input
              type="text"
              placeholder="Поиск по имени или номеру..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary-700 border border-secondary-600 rounded-md pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          {/* Список пациентов */}
          <div className="space-y-2 overflow-y-auto flex-grow">
            {isLoading ? (
              <div className="text-center text-secondary-400 py-4">
                Загрузка пациентов...
              </div>
            ) : filteredPatients.length > 0 ? (
              filteredPatients.map(patient => (
                <button
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient)}
                  className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-3 ${
                    selectedPatient?.id === patient.id 
                      ? 'bg-primary-600/80' 
                      : 'bg-secondary-800 hover:bg-secondary-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-secondary-600 flex items-center justify-center">
                    <User size={20} className="text-secondary-400" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-white">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-xs text-secondary-400">
                      #{patient.number} • {patient.dateOfBirth}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center text-secondary-400 pt-4">
                {searchTerm ? 'Пациенты не найдены.' : 'Нет пациентов в базе.'}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Детальная информация о пациенте */}
      {selectedPatient ? (
        <PatientDetails patient={selectedPatient} />
      ) : (
        <div className="col-span-12 lg:col-span-8 flex items-center justify-center">
          <Card>
            <p className="text-secondary-400">Выберите пациента для просмотра информации.</p>
          </Card>
        </div>
      )}
    </div>
  );
}; 
