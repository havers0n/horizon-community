// Patient Entity - UI Layer
// Компонент списка пациентов

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { Input } from '@/shared/ui/atoms/Input';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Select } from '@/shared/ui/atoms/Select';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Grid, 
  List, 
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplets,
  Heart,
  AlertTriangle
} from 'lucide-react';
import { Patient, PatientGender, BloodType, PatientSearchFilters } from '../model/types';
import { PatientCard } from './PatientCard';

interface PatientListProps {
  patients: Patient[];
  loading?: boolean;
  viewMode?: 'table' | 'cards';
  onPatientClick?: (patient: Patient) => void;
  onPatientEdit?: (patient: Patient) => void;
  onPatientDelete?: (patient: Patient) => void;
  onSearch?: (filters: PatientSearchFilters) => void;
  onExport?: (format: 'csv' | 'json' | 'pdf' | 'excel') => void;
  onCreateNew?: () => void;
  className?: string;
}

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  loading = false,
  viewMode = 'table',
  onPatientClick,
  onPatientEdit,
  onPatientDelete,
  onSearch,
  onExport,
  onCreateNew,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<PatientGender | 'all'>('all');
  const [bloodTypeFilter, setBloodTypeFilter] = useState<BloodType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [hasAllergiesFilter, setHasAllergiesFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [currentViewMode, setCurrentViewMode] = useState<'table' | 'cards'>(viewMode);

  // Фильтрация пациентов
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      // Поиск по тексту
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          patient.firstName.toLowerCase().includes(searchLower) ||
          patient.lastName.toLowerCase().includes(searchLower) ||
          patient.number.toLowerCase().includes(searchLower) ||
          patient.phone?.toLowerCase().includes(searchLower) ||
          patient.email?.toLowerCase().includes(searchLower) ||
          patient.city?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Фильтр по полу
      if (genderFilter !== 'all' && patient.gender !== genderFilter) {
        return false;
      }

      // Фильтр по группе крови
      if (bloodTypeFilter !== 'all' && patient.bloodType !== bloodTypeFilter) {
        return false;
      }

      // Фильтр по статусу
      if (statusFilter === 'active' && !patient.isActive) {
        return false;
      }
      if (statusFilter === 'inactive' && patient.isActive) {
        return false;
      }

      // Фильтр по аллергиям
      if (hasAllergiesFilter === 'yes' && patient.allergies.length === 0) {
        return false;
      }
      if (hasAllergiesFilter === 'no' && patient.allergies.length > 0) {
        return false;
      }

      return true;
    });
  }, [patients, searchTerm, genderFilter, bloodTypeFilter, statusFilter, hasAllergiesFilter]);

  const handleSearch = () => {
    const filters: PatientSearchFilters = {};
    
    if (searchTerm) {
      filters.firstName = searchTerm;
    }
    if (genderFilter !== 'all') {
      filters.gender = genderFilter;
    }
    if (bloodTypeFilter !== 'all') {
      filters.bloodType = bloodTypeFilter;
    }
    if (statusFilter !== 'all') {
      filters.isActive = statusFilter === 'active';
    }
    if (hasAllergiesFilter !== 'all') {
      filters.hasAllergies = hasAllergiesFilter === 'yes';
    }

    onSearch?.(filters);
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getGenderIcon = (gender: PatientGender) => {
    switch (gender) {
      case PatientGender.MALE:
        return <Heart className="w-4 h-4 text-blue-500" />;
      case PatientGender.FEMALE:
        return <Heart className="w-4 h-4 text-pink-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBloodTypeColor = (bloodType: BloodType) => {
    switch (bloodType) {
      case BloodType.A_POSITIVE:
      case BloodType.A_NEGATIVE:
        return 'bg-red-100 text-red-800 border-red-200';
      case BloodType.B_POSITIVE:
      case BloodType.B_NEGATIVE:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case BloodType.AB_POSITIVE:
      case BloodType.AB_NEGATIVE:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case BloodType.O_POSITIVE:
      case BloodType.O_NEGATIVE:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Загрузка пациентов...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Пациенты</span>
            <Badge variant="secondary">{filteredPatients.length}</Badge>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentViewMode(currentViewMode === 'table' ? 'cards' : 'table')}
            >
              {currentViewMode === 'table' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </Button>
            
            {onExport && (
              <Select onValueChange={(value) => onExport(value as 'csv' | 'json' | 'pdf' | 'excel')}>
                <Select.Trigger className="w-32">
                  <Select.Value placeholder="Экспорт" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="csv">CSV</Select.Item>
                  <Select.Item value="json">JSON</Select.Item>
                  <Select.Item value="pdf">PDF</Select.Item>
                  <Select.Item value="excel">Excel</Select.Item>
                </Select.Content>
              </Select>
            )}
            
            {onCreateNew && (
              <Button onClick={onCreateNew} className="flex items-center space-x-1">
                <Plus className="w-4 h-4" />
                <span>Новый пациент</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Фильтры */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2">
            <Input
              placeholder="Поиск по имени, номеру, телефону..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full"
            />
          </div>
          
          <Select value={genderFilter} onValueChange={(value) => setGenderFilter(value as PatientGender | 'all')}>
            <Select.Trigger>
              <Select.Value placeholder="Пол" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">Все</Select.Item>
              <Select.Item value={PatientGender.MALE}>Мужской</Select.Item>
              <Select.Item value={PatientGender.FEMALE}>Женский</Select.Item>
              <Select.Item value={PatientGender.OTHER}>Другой</Select.Item>
            </Select.Content>
          </Select>
          
          <Select value={bloodTypeFilter} onValueChange={(value) => setBloodTypeFilter(value as BloodType | 'all')}>
            <Select.Trigger>
              <Select.Value placeholder="Группа крови" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">Все</Select.Item>
              {Object.values(BloodType).map(type => (
                <Select.Item key={type} value={type}>{type}</Select.Item>
              ))}
            </Select.Content>
          </Select>
          
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}>
            <Select.Trigger>
              <Select.Value placeholder="Статус" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">Все</Select.Item>
              <Select.Item value="active">Активные</Select.Item>
              <Select.Item value="inactive">Неактивные</Select.Item>
            </Select.Content>
          </Select>
          
          <Select value={hasAllergiesFilter} onValueChange={(value) => setHasAllergiesFilter(value as 'all' | 'yes' | 'no')}>
            <Select.Trigger>
              <Select.Value placeholder="Аллергии" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">Все</Select.Item>
              <Select.Item value="yes">С аллергиями</Select.Item>
              <Select.Item value="no">Без аллергий</Select.Item>
            </Select.Content>
          </Select>
        </div>

        {/* Результаты */}
        {currentViewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Пациент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Номер
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Возраст
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Контакты
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Группа крови
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Аллергии
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        {getGenderIcon(patient.gender)}
                        <div>
                          <div className="font-medium">
                            {patient.firstName} {patient.lastName}
                          </div>
                          {patient.middleName && (
                            <div className="text-sm text-gray-500">{patient.middleName}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="font-mono text-sm">№{patient.number}</span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{getAge(patient.dateOfBirth)} лет</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        {patient.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{patient.phone}</span>
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="truncate max-w-32">{patient.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.bloodType && (
                        <Badge variant="outline" className={getBloodTypeColor(patient.bloodType)}>
                          <Droplets className="w-3 h-3 mr-1" />
                          {patient.bloodType}
                        </Badge>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Badge variant={patient.isActive ? 'default' : 'secondary'}>
                        {patient.isActive ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.allergies.length > 0 ? (
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="text-sm text-orange-700">
                            {patient.allergies.length}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Нет</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPatientClick?.(patient)}
                        >
                          Просмотр
                        </Button>
                        {onPatientEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPatientEdit(patient)}
                          >
                            Изменить
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                variant="compact"
                onClick={onPatientClick}
                onEdit={onPatientEdit}
                onDelete={onPatientDelete}
              />
            ))}
          </div>
        )}

        {/* Пустое состояние */}
        {filteredPatients.length === 0 && (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Пациенты не найдены</h3>
            <p className="text-gray-500 mb-4">
              Попробуйте изменить параметры поиска или создать нового пациента
            </p>
            {onCreateNew && (
              <Button onClick={onCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Создать пациента
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
