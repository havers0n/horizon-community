// Patient Entity - UI Layer
// Компонент детального просмотра пациента

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { Badge } from '@/shared/ui/atoms/Badge';
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Droplets, 
  Heart, 
  AlertTriangle,
  FileText,
  Pill,
  Activity,
  Users,
  Thermometer,
  Activity as ActivityIcon,
  Eye,
  X,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  Patient, 
  MedicalRecord, 
  PatientGender, 
  BloodType, 
  VisitType, 
  DiagnosisSeverity, 
  TreatmentType, 
  AllergySeverity, 
  MedicationRoute,
  LabTestCategory,
  ImagingStudyType
} from '../model/types';

interface PatientDetailsProps {
  patient: Patient;
  medicalRecords?: MedicalRecord[];
  onBack?: () => void;
  onEdit?: (patient: Patient) => void;
  onExport?: (format: 'pdf' | 'json') => void;
  className?: string;
}

export const PatientDetails: React.FC<PatientDetailsProps> = ({
  patient,
  medicalRecords = [],
  onBack,
  onEdit,
  onExport,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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

  const getVisitTypeColor = (visitType: VisitType) => {
    switch (visitType) {
      case VisitType.EMERGENCY:
        return 'bg-red-100 text-red-800 border-red-200';
      case VisitType.URGENT_CARE:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case VisitType.SURGERY:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityColor = (severity: DiagnosisSeverity) => {
    switch (severity) {
      case DiagnosisSeverity.CRITICAL:
        return 'bg-red-100 text-red-800 border-red-200';
      case DiagnosisSeverity.SEVERE:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case DiagnosisSeverity.MODERATE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case DiagnosisSeverity.MILD:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAllergySeverityColor = (severity: AllergySeverity) => {
    switch (severity) {
      case AllergySeverity.LIFE_THREATENING:
        return 'bg-red-100 text-red-800 border-red-200';
      case AllergySeverity.SEVERE:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case AllergySeverity.MODERATE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case AllergySeverity.MILD:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          )}
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-lg font-semibold text-blue-600">
                {getInitials(patient.firstName, patient.lastName)}
              </span>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold flex items-center space-x-2">
                <span>{patient.firstName} {patient.lastName}</span>
                {getGenderIcon(patient.gender)}
              </h1>
              <p className="text-gray-500">
                №{patient.number} • {getAge(patient.dateOfBirth)} лет • {formatDate(patient.dateOfBirth)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant={patient.isActive ? 'default' : 'secondary'}>
            {patient.isActive ? 'Активен' : 'Неактивен'}
          </Badge>
          
          {patient.bloodType && (
            <Badge variant="outline" className={getBloodTypeColor(patient.bloodType)}>
              <Droplets className="w-3 h-3 mr-1" />
              {patient.bloodType}
            </Badge>
          )}
          
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(patient)}>
              <Edit className="w-4 h-4 mr-2" />
              Изменить
            </Button>
          )}
          
          {onExport && (
            <Button variant="outline" size="sm" onClick={() => onExport('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              Экспорт
            </Button>
          )}
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <Button
              variant={activeTab === 'overview' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('overview')}
              className="flex-1"
            >
              Обзор
            </Button>
            <Button
              variant={activeTab === 'medical-records' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('medical-records')}
              className="flex-1"
            >
              Медицинские записи
            </Button>
            <Button
              variant={activeTab === 'allergies' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('allergies')}
              className="flex-1"
            >
              Аллергии
            </Button>
            <Button
              variant={activeTab === 'medications' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('medications')}
              className="flex-1"
            >
              Лекарства
            </Button>
            <Button
              variant={activeTab === 'emergency-contacts' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('emergency-contacts')}
              className="flex-1"
            >
              Контакты
            </Button>
            <Button
              variant={activeTab === 'vital-signs' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('vital-signs')}
              className="flex-1"
            >
              Жизненные показатели
            </Button>
            <Button
              variant={activeTab === 'insurance' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('insurance')}
              className="flex-1"
            >
              Страхование
            </Button>
          </div>
        </div>
      </div>

      {/* Обзор */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Основная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Основная информация</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Имя</label>
                    <p className="text-sm">{patient.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Фамилия</label>
                    <p className="text-sm">{patient.lastName}</p>
                  </div>
                  {patient.middleName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Отчество</label>
                      <p className="text-sm">{patient.middleName}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Пол</label>
                    <div className="flex items-center space-x-1">
                      {getGenderIcon(patient.gender)}
                      <span className="text-sm">
                        {patient.gender === PatientGender.MALE ? 'Мужской' : 
                         patient.gender === PatientGender.FEMALE ? 'Женский' : 'Другой'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Возраст</label>
                    <p className="text-sm">{getAge(patient.dateOfBirth)} лет</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Дата рождения</label>
                    <p className="text-sm">{formatDate(patient.dateOfBirth)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Контактная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="w-5 h-5" />
                  <span>Контактная информация</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{patient.phone}</span>
                  </div>
                )}
                {patient.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{patient.email}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{patient.address}</span>
                  </div>
                )}
                {patient.city && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{patient.city}, {patient.state} {patient.zipCode}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Физические параметры */}
            {(patient.height || patient.weight) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Физические параметры</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {patient.height && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Рост</label>
                        <p className="text-sm">{patient.height} см</p>
                      </div>
                    )}
                    {patient.weight && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Вес</label>
                        <p className="text-sm">{patient.weight} кг</p>
                      </div>
                    )}
                    {patient.height && patient.weight && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-500">ИМТ</label>
                        <p className="text-sm">
                          {((patient.weight / Math.pow(patient.height / 100, 2))).toFixed(1)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Медицинские состояния */}
            {patient.medicalConditions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>Медицинские состояния</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {patient.medicalConditions.map((condition) => (
                      <div key={condition.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{condition.condition}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant={condition.isActive ? 'default' : 'secondary'}>
                            {condition.isActive ? 'Активно' : 'Неактивно'}
                          </Badge>
                          {condition.isControlled && (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Контролируется
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Медицинские записи */}
      {activeTab === 'medical-records' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Медицинские записи ({medicalRecords.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medicalRecords.length > 0 ? (
                <div className="space-y-4">
                  {medicalRecords.map((record) => (
                    <Card key={record.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={getVisitTypeColor(record.visitType)}>
                              {record.visitType === VisitType.EMERGENCY ? 'Экстренно' :
                               record.visitType === VisitType.URGENT_CARE ? 'Срочно' :
                               record.visitType === VisitType.SURGERY ? 'Хирургия' : 'Обычно'}
                            </Badge>
                            <span className="text-sm font-medium">№{record.recordNumber}</span>
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(record.visitDate)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{record.attendingPhysician} • {record.department}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {record.symptoms.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Симптомы</label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {record.symptoms.map((symptom, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {symptom}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {record.diagnosis && record.diagnosis.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Диагнозы</label>
                            <div className="space-y-1 mt-1">
                              {record.diagnosis.map((diagnosis) => (
                                <div key={diagnosis.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div>
                                    <span className="text-sm font-medium">{diagnosis.diagnosis}</span>
                                    <span className="text-xs text-gray-500 ml-2">({diagnosis.icd10Code})</span>
                                  </div>
                                  <Badge variant="outline" className={getSeverityColor(diagnosis.severity)}>
                                    {diagnosis.severity === DiagnosisSeverity.CRITICAL ? 'Критический' :
                                     diagnosis.severity === DiagnosisSeverity.SEVERE ? 'Тяжелый' :
                                     diagnosis.severity === DiagnosisSeverity.MODERATE ? 'Умеренный' : 'Легкий'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {record.treatments.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Лечение</label>
                            <div className="space-y-1 mt-1">
                              {record.treatments.map((treatment) => (
                                <div key={treatment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div>
                                    <span className="text-sm font-medium">{treatment.description}</span>
                                    <span className="text-xs text-gray-500 ml-2">
                                      {treatment.treatmentType === TreatmentType.MEDICATION ? 'Лекарство' :
                                       treatment.treatmentType === TreatmentType.SURGERY ? 'Хирургия' :
                                       treatment.treatmentType === TreatmentType.PHYSICAL_THERAPY ? 'Физиотерапия' : 'Другое'}
                                    </span>
                                  </div>
                                  <Badge variant={treatment.isCompleted ? 'default' : 'secondary'}>
                                    {treatment.isCompleted ? 'Завершено' : 'В процессе'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {record.notes && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Заметки</label>
                            <p className="text-sm mt-1">{record.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Медицинские записи отсутствуют</h3>
                  <p className="text-gray-500">У пациента пока нет медицинских записей</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Аллергии */}
      {activeTab === 'allergies' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Аллергии ({patient.allergies.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.allergies.length > 0 ? (
                <div className="space-y-4">
                  {patient.allergies.map((allergy) => (
                    <Card key={allergy.id} className="border-l-4 border-l-red-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-red-100 text-red-800">
                              {allergy.allergen}
                            </Badge>
                            <span className="text-sm font-medium">Реакция: {allergy.reaction}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                          <Badge variant="outline" className={getAllergySeverityColor(allergy.severity)}>
                            {allergy.severity === AllergySeverity.LIFE_THREATENING ? 'Угрожает жизни' :
                             allergy.severity === AllergySeverity.SEVERE ? 'Тяжелая' :
                             allergy.severity === AllergySeverity.MODERATE ? 'Умеренная' : 'Легкая'}
                          </Badge>
                          <span>Статус: {allergy.isActive ? 'Активна' : 'Неактивна'}</span>
                        </div>
                        {allergy.notes && (
                          <p className="text-sm mt-2">{allergy.notes}</p>
                        )}
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Аллергии отсутствуют</h3>
                  <p className="text-gray-500">У пациента не зарегистрировано аллергий</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Лекарства */}
      {activeTab === 'medications' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Pill className="w-5 h-5" />
                <span>Лекарства ({patient.medications.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.medications.length > 0 ? (
                <div className="space-y-4">
                  {patient.medications.map((medication) => (
                    <Card key={medication.id} className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-purple-100 text-purple-800">
                              {medication.name}
                            </Badge>
                            <span className="text-sm font-medium">Дозировка: {medication.dosage}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                          <span>Частота: {medication.frequency}</span>
                          <span>Способ: {medication.route === MedicationRoute.ORAL ? 'Перорально' :
                           medication.route === MedicationRoute.INTRAVENOUS ? 'Внутривенно' :
                           medication.route === MedicationRoute.INTRAMUSCULAR ? 'Внутримышечно' :
                           medication.route === MedicationRoute.TOPICAL ? 'Местно' : 'Другое'}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          <div>Начало: {formatDate(medication.startDate)}</div>
                          {medication.endDate && (
                            <div>Окончание: {formatDate(medication.endDate)}</div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                          <span>Статус: {medication.isActive ? 'Активно' : 'Неактивно'}</span>
                          <span>Назначил: {medication.prescribedBy}</span>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Лекарства отсутствуют</h3>
                  <p className="text-gray-500">Пациент не принимает лекарства</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Контакты для экстренной связи */}
      {activeTab === 'emergency-contacts' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Контакты для экстренной связи ({patient.emergencyContacts.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.emergencyContacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patient.emergencyContacts.map((contact) => (
                    <Card key={contact.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{contact.name}</h4>
                              {contact.isPrimary && (
                                <Badge variant="default" className="text-xs">Основной</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{contact.relationship}</p>
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{contact.phone}</span>
                            </div>
                            {contact.email && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span>{contact.email}</span>
                              </div>
                            )}
                            {contact.address && (
                              <div className="flex items-center space-x-2 text-sm">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{contact.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Контакты отсутствуют</h3>
                  <p className="text-gray-500">Не указаны контакты для экстренной связи</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Жизненные показатели */}
      {activeTab === 'vital-signs' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ActivityIcon className="w-5 h-5" />
                <span>Жизненные показатели</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {medicalRecords.map((record) => (
                  <Card key={record.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Запись №{record.recordNumber}</span>
                        <span className="text-xs text-gray-500">{formatDate(record.visitDate)}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {record.vitalSigns.temperature && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Thermometer className="w-4 h-4 text-red-500" />
                            <span className="text-sm">Температура</span>
                          </div>
                          <span className="text-sm font-medium">{record.vitalSigns.temperature}°C</span>
                        </div>
                      )}
                      
                      {record.vitalSigns.bloodPressure && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Давление</span>
                          <span className="text-sm font-medium">
                            {record.vitalSigns.bloodPressure.systolic}/{record.vitalSigns.bloodPressure.diastolic} мм рт.ст.
                          </span>
                        </div>
                      )}
                      
                      {record.vitalSigns.heartRate && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Пульс</span>
                          <span className="text-sm font-medium">{record.vitalSigns.heartRate} уд/мин</span>
                        </div>
                      )}
                      
                      {record.vitalSigns.respiratoryRate && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Дыхание</span>
                          <span className="text-sm font-medium">{record.vitalSigns.respiratoryRate} вдох/мин</span>
                        </div>
                      )}
                      
                      {record.vitalSigns.oxygenSaturation && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Сатурация</span>
                          <span className="text-sm font-medium">{record.vitalSigns.oxygenSaturation}%</span>
                        </div>
                      )}
                      
                      {record.vitalSigns.painLevel && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Боль (0-10)</span>
                          <span className="text-sm font-medium">{record.vitalSigns.painLevel}/10</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Страхование */}
      {activeTab === 'insurance' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Страхование</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.insurance ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Страховая компания</label>
                      <p className="text-sm">{patient.insurance.provider}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Номер полиса</label>
                      <p className="text-sm font-mono">{patient.insurance.policyNumber}</p>
                    </div>
                    {patient.insurance.groupNumber && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Групповой номер</label>
                        <p className="text-sm">{patient.insurance.groupNumber}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Дата начала</label>
                      <p className="text-sm">{formatDate(patient.insurance.effectiveDate)}</p>
                    </div>
                    {patient.insurance.expirationDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Дата окончания</label>
                        <p className="text-sm">{formatDate(patient.insurance.expirationDate)}</p>
                      </div>
                    )}
                    {patient.insurance.copay && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Совместная оплата</label>
                        <p className="text-sm">${patient.insurance.copay}</p>
                      </div>
                    )}
                    {patient.insurance.deductible && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Франшиза</label>
                        <p className="text-sm">${patient.insurance.deductible}</p>
                      </div>
                    )}
                  </div>
                  
                  {patient.insurance.notes && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Заметки</label>
                      <p className="text-sm mt-1">{patient.insurance.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Страхование не указано</h3>
                  <p className="text-gray-500">Информация о страховании отсутствует</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}; 
