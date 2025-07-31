// @ts-nocheck - TODO: Remove after major refactoring is complete
// Patient Entity - UI Layer
// Компонент карточки пациента

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Button } from '@/shared/ui/atoms/Button';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Droplets, 
  Heart, 
  AlertTriangle,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Patient, PatientGender, BloodType } from '@/shared/types';

interface PatientCardProps {
  patient: Patient;
  variant?: 'default' | 'compact';
  onClick?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
  className?: string;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  variant = 'default',
  onClick,
  onEdit,
  onDelete,
  className = ''
}) => {
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

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const hasAllergies = patient.allergies.length > 0;
  const hasMedicalConditions = patient.medicalConditions.length > 0;
  const hasEmergencyContacts = patient.emergencyContacts.length > 0;

  if (variant === 'compact') {
    return (
      <Card 
        className={`cursor-pointer hover:shadow-md transition-shadow ${className}`}
        onClick={() => onClick?.(patient)}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
              {getInitials(patient.firstName, patient.lastName)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold truncate">
                  {patient.firstName} {patient.lastName}
                </h3>
                {getGenderIcon(patient.gender)}
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>№{patient.number}</span>
                <span>•</span>
                <span>{getAge(patient.dateOfBirth)} лет</span>
                {patient.bloodType && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className={`text-xs ${getBloodTypeColor(patient.bloodType)}`}>
                      {patient.bloodType}
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <Badge variant="outline" className={`text-xs ${getStatusColor(patient.isActive)}`}>
                {patient.isActive ? 'Активен' : 'Неактивен'}
              </Badge>
              
              {hasAllergies && (
                <AlertTriangle className="w-4 h-4 text-orange-500" title="Есть аллергии" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
              {getInitials(patient.firstName, patient.lastName)}
            </div>
            
            <div>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>{patient.firstName} {patient.lastName}</span>
                {getGenderIcon(patient.gender)}
              </CardTitle>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                <span>№{patient.number}</span>
                <span>•</span>
                <span>{getAge(patient.dateOfBirth)} лет</span>
                <span>•</span>
                <span>{new Date(patient.dateOfBirth).toLocaleDateString('ru-RU')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={getStatusColor(patient.isActive)}>
              {patient.isActive ? 'Активен' : 'Неактивен'}
            </Badge>
            
            {patient.bloodType && (
              <Badge variant="outline" className={getBloodTypeColor(patient.bloodType)}>
                <Droplets className="w-3 h-3 mr-1" />
                {patient.bloodType}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Контактная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {patient.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{patient.phone}</span>
            </div>
          )}
          
          {patient.email && (
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="truncate">{patient.email}</span>
            </div>
          )}
          
          {patient.address && (
            <div className="flex items-center space-x-2 text-sm md:col-span-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="truncate">{patient.address}</span>
            </div>
          )}
        </div>

        {/* Физические параметры */}
        {(patient.height || patient.weight) && (
          <div className="flex items-center space-x-4 text-sm">
            {patient.height && (
              <span>Рост: {patient.height} см</span>
            )}
            {patient.weight && (
              <span>Вес: {patient.weight} кг</span>
            )}
            {patient.height && patient.weight && (
              <span>
                ИМТ: {((patient.weight / Math.pow(patient.height / 100, 2))).toFixed(1)}
              </span>
            )}
          </div>
        )}

        {/* Медицинская информация */}
        <div className="space-y-2">
          {hasAllergies && (
            <div className="flex items-center space-x-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-orange-700">
                Аллергии: {patient.allergies.length} {patient.allergies.length === 1 ? 'запись' : 'записей'}
              </span>
            </div>
          )}
          
          {hasMedicalConditions && (
            <div className="flex items-center space-x-2 text-sm">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-red-700">
                Состояния: {patient.medicalConditions.length} {patient.medicalConditions.length === 1 ? 'запись' : 'записей'}
              </span>
            </div>
          )}
          
          {patient.medications.length > 0 && (
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-blue-700">
                Лекарства: {patient.medications.length} {patient.medications.length === 1 ? 'препарат' : 'препаратов'}
              </span>
            </div>
          )}
        </div>

        {/* Контакты для экстренной связи */}
        {hasEmergencyContacts && (
          <div className="text-sm">
            <div className="font-medium text-gray-700 mb-1">Контакты для экстренной связи:</div>
            <div className="space-y-1">
              {patient.emergencyContacts.slice(0, 2).map((contact) => (
                <div key={contact.id} className="flex items-center justify-between">
                  <span className="truncate">{contact.name} ({contact.relationship})</span>
                  <span className="text-gray-500">{contact.phone}</span>
                </div>
              ))}
              {patient.emergencyContacts.length > 2 && (
                <span className="text-gray-500 text-xs">
                  +{patient.emergencyContacts.length - 2} еще
                </span>
              )}
            </div>
          </div>
        )}

        {/* Действия */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onClick?.(patient)}
              className="flex items-center space-x-1"
            >
              <Eye className="w-4 h-4" />
              <span>Просмотр</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-1">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(patient);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(patient);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
