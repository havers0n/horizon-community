import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Upload, User, Calendar, MapPin, Phone, Mail, HeartPulse } from 'lucide-react';
import { usePatientStore } from '../model/patientStore';
import { Patient, PatientGender, BloodType, PatientSearchFilters } from '../../../entities/patient';
import { Card, CardHeader } from '@/shared/ui/atoms';

// Компонент статистики пациентов
const PatientStatistics: React.FC = () => {
  const { statistics, fetchStatistics } = usePatientStore();

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  if (!statistics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-blue-900/20 border-blue-500">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm">Всего пациентов</p>
              <p className="text-2xl font-bold text-white">{statistics.totalPatients}</p>
            </div>
            <User className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </Card>

      <Card className="bg-green-900/20 border-green-500">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm">Активных пациентов</p>
              <p className="text-2xl font-bold text-white">{statistics.activePatients}</p>
            </div>
            <HeartPulse className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </Card>

      <Card className="bg-amber-900/20 border-amber-500">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-400 text-sm">Новых в этом месяце</p>
              <p className="text-2xl font-bold text-white">{statistics.newPatientsThisMonth}</p>
            </div>
            <Calendar className="h-8 w-8 text-amber-400" />
          </div>
        </div>
      </Card>

      <Card className="bg-purple-900/20 border-purple-500">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm">Средний возраст</p>
              <p className="text-2xl font-bold text-white">{statistics.averageAge.toFixed(1)}</p>
            </div>
            <User className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </Card>
    </div>
  );
};

// Компонент фильтров поиска
const SearchFilters: React.FC<{ onFiltersChange: (filters: PatientSearchFilters) => void }> = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState<PatientSearchFilters>({});

  const handleFilterChange = (key: keyof PatientSearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex items-center gap-2">
        <Filter className="h-5 w-5" />
        Фильтры поиска
      </CardHeader>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-1">
              Имя
            </label>
            <input
              type="text"
              placeholder="Имя пациента"
              value={filters.firstName || ''}
              onChange={(e) => handleFilterChange('firstName', e.target.value)}
              className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-1">
              Фамилия
            </label>
            <input
              type="text"
              placeholder="Фамилия пациента"
              value={filters.lastName || ''}
              onChange={(e) => handleFilterChange('lastName', e.target.value)}
              className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-1">
              Пол
            </label>
            <select
              value={filters.gender || ''}
              onChange={(e) => handleFilterChange('gender', e.target.value || undefined)}
              className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Все</option>
              <option value={PatientGender.MALE}>Мужской</option>
              <option value={PatientGender.FEMALE}>Женский</option>
              <option value={PatientGender.OTHER}>Другой</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-1">
              Группа крови
            </label>
            <select
              value={filters.bloodType || ''}
              onChange={(e) => handleFilterChange('bloodType', e.target.value || undefined)}
              className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Все</option>
              <option value={BloodType.A_POSITIVE}>A+</option>
              <option value={BloodType.A_NEGATIVE}>A-</option>
              <option value={BloodType.B_POSITIVE}>B+</option>
              <option value={BloodType.B_NEGATIVE}>B-</option>
              <option value={BloodType.AB_POSITIVE}>AB+</option>
              <option value={BloodType.AB_NEGATIVE}>AB-</option>
              <option value={BloodType.O_POSITIVE}>O+</option>
              <option value={BloodType.O_NEGATIVE}>O-</option>
            </select>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Компонент списка пациентов
const PatientList: React.FC = () => {
  const { patients, isLoading, error, fetchPatients } = usePatientStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = patients.filter(patient => {
    if (!searchTerm) return true;
    const lowercasedTerm = searchTerm.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(lowercasedTerm) ||
      patient.lastName.toLowerCase().includes(lowercasedTerm) ||
      patient.number.toLowerCase().includes(lowercasedTerm)
    );
  });

  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-500">
        <CardHeader className="text-red-400">Ошибка</CardHeader>
        <p className="text-red-300 p-4">{error}</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <span>Список пациентов</span>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={20} />
            <input
              type="text"
              placeholder="Поиск пациентов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-secondary-700 border border-secondary-600 rounded-md pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
            <Plus size={16} />
            Добавить
          </button>
        </div>
      </CardHeader>
      
      <div className="p-4">
        {isLoading ? (
          <div className="text-center text-secondary-400 py-8">
            Загрузка пациентов...
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="space-y-2">
            {filteredPatients.map(patient => (
              <div
                key={patient.id}
                className="bg-secondary-800 hover:bg-secondary-700 p-4 rounded-md transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary-600 flex items-center justify-center">
                      <User size={24} className="text-secondary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {patient.firstName} {patient.lastName}
                        {patient.middleName && ` ${patient.middleName}`}
                      </h3>
                      <p className="text-sm text-secondary-400">
                        #{patient.number} • {patient.dateOfBirth} • {patient.gender}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-secondary-500">
                        {patient.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={12} />
                            {patient.phone}
                          </span>
                        )}
                        {patient.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={12} />
                            {patient.email}
                          </span>
                        )}
                        {patient.address && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {patient.city || patient.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {patient.bloodType && (
                      <span className="bg-red-900/20 text-red-400 px-2 py-1 rounded text-xs">
                        {patient.bloodType}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs ${
                      patient.isActive 
                        ? 'bg-green-900/20 text-green-400' 
                        : 'bg-red-900/20 text-red-400'
                    }`}>
                      {patient.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-secondary-400 py-8">
            {searchTerm ? 'Пациенты не найдены.' : 'Нет пациентов в базе.'}
          </div>
        )}
      </div>
    </Card>
  );
};

// Основной компонент управления пациентами
export const PatientManagement: React.FC = () => {
  const { setSearchFilters } = usePatientStore();

  const handleFiltersChange = (filters: PatientSearchFilters) => {
    setSearchFilters(filters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Управление пациентами</h1>
        <div className="flex items-center gap-2">
          <button className="bg-secondary-700 hover:bg-secondary-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
            <Download size={16} />
            Экспорт
          </button>
          <button className="bg-secondary-700 hover:bg-secondary-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
            <Upload size={16} />
            Импорт
          </button>
        </div>
      </div>

      <PatientStatistics />
      <SearchFilters onFiltersChange={handleFiltersChange} />
      <PatientList />
    </div>
  );
}; 
