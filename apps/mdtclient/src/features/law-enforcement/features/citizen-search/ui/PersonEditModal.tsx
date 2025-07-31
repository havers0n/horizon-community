// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useState } from 'react';
import { X, Save, User, MapPin, Calendar, Hash, Phone, Briefcase, FileText } from 'lucide-react';
import { Modal } from '@/shared/ui/atoms';
import { Button, Input, Select, Textarea } from '@/shared/ui/atoms';
import type { Citizen } from '@/shared';

interface PersonEditModalProps {
  person: Citizen & { ssn?: string; flags?: string[]; addressFlags?: string[] };
  onClose: () => void;
  onSave: (updatedPerson: any) => void;
}

export const PersonEditModal: React.FC<PersonEditModalProps> = ({
  person,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    firstName: person.firstName,
    lastName: person.lastName,
    dateOfBirth: person.dateOfBirth,
    ssn: person.ssn || '',
    gender: person.gender || '',
    ethnicity: 'Американоидная',
    hairColor: person.weight || '',
    eyeColor: person.height || '',
    weight: person.weight || '',
    height: person.height || '',
    address: person.address,
    phoneNumber: '',
    occupation: person.occupation || '',
    additionalInfo: '',
    // Лицензии
    driverLicense: '',
    driverLicenseCategory: '',
    pilotLicense: '',
    pilotLicenseCategory: '',
    watercraftLicense: '',
    watercraftLicenseCategory: '',
    fishingLicense: '',
    fishingLicenseCategory: '',
    huntingLicense: '',
    huntingLicenseCategory: '',
    weaponLicense: '',
    weaponLicenseCategory: '',
    // Медицинская информация
    diseases: '',
    chronicConditions: '',
    allergies: '',
    bloodType: '',
    rhFactor: '',
    surgeries: '',
    implants: '',
    // Баллы лицензий
    driverLicensePoints: 0,
    pilotLicensePoints: 0,
    watercraftLicensePoints: 0,
    fishingLicensePoints: 0,
    huntingLicensePoints: 0,
    weaponLicensePoints: 0,
    // Флаги
    flags: person.flags || [],
    addressFlags: person.addressFlags || []
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    const updatedPerson = {
      ...person,
      ...formData
    };
    onSave(updatedPerson);
  };

  const genderOptions = [
    { value: 'male', label: 'Мужской' },
    { value: 'female', label: 'Женский' }
  ];

  const bloodTypeOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ];

  const rhFactorOptions = [
    { value: 'positive', label: 'Положительный' },
    { value: 'negative', label: 'Отрицательный' }
  ];

  const flagOptions = [
    { value: 'dangerous', label: 'Опасный' },
    { value: 'wanted', label: 'В розыске' },
    { value: 'restricted', label: 'Ограниченный доступ' },
    { value: 'vip', label: 'VIP' }
  ];

  return (
    <Modal isOpen={true} onClose={onClose} title="Редактирование гражданина">
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Основная информация */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Основная информация
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">Имя *</label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Введите имя"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">Фамилия *</label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Введите фамилию"
              />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-white mb-2">Дата рождения *</label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="ssn" className="block text-sm font-medium text-white mb-2">Номер социального страхования</label>
              <Input
                id="ssn"
                value={formData.ssn}
                onChange={(e) => handleInputChange('ssn', e.target.value)}
                placeholder="###-##-####"
                disabled
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-white mb-2">Пол *</label>
              <Select
                id="gender"
                value={formData.gender}
                onValueChange={(value) => handleInputChange('gender', value)}
              >
                <option value="">Выберите пол</option>
                {genderOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="ethnicity" className="block text-sm font-medium text-white mb-2">Этническая принадлежность *</label>
              <Input
                id="ethnicity"
                value={formData.ethnicity}
                onChange={(e) => handleInputChange('ethnicity', e.target.value)}
                placeholder="Введите этническую принадлежность"
              />
            </div>
            <div>
              <label htmlFor="hairColor" className="block text-sm font-medium text-white mb-2">Цвет волос *</label>
              <Input
                id="hairColor"
                value={formData.hairColor}
                onChange={(e) => handleInputChange('hairColor', e.target.value)}
                placeholder="Введите цвет волос"
              />
            </div>
            <div>
              <label htmlFor="eyeColor" className="block text-sm font-medium text-white mb-2">Цвет глаз *</label>
              <Input
                id="eyeColor"
                value={formData.eyeColor}
                onChange={(e) => handleInputChange('eyeColor', e.target.value)}
                placeholder="Введите цвет глаз"
              />
            </div>
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-white mb-2">Вес (кг) *</label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="Введите вес"
              />
            </div>
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-white mb-2">Рост (см) *</label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder="Введите рост"
              />
            </div>
          </div>
        </div>

        {/* Контактная информация */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Контактная информация
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-white mb-2">Адрес</label>
              <Input
                id="address"
                value={formData.address ? `${formData.address.street}, ${formData.address.city}` : ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Введите адрес"
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-white mb-2">Номер телефона</label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="Введите номер телефона"
              />
            </div>
            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-white mb-2">Род занятий</label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                placeholder="Введите род занятий"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-white mb-2">Дополнительная информация</label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', (e.target as HTMLTextAreaElement).value)}
                placeholder="Введите дополнительную информацию"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Медицинская информация */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Медицинская информация
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bloodType" className="block text-sm font-medium text-white mb-2">Группа крови</label>
              <Select
                id="bloodType"
                value={formData.bloodType}
                onValueChange={(value) => handleInputChange('bloodType', value)}
              >
                <option value="">Выберите группу крови</option>
                {bloodTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="rhFactor" className="block text-sm font-medium text-white mb-2">Резус-фактор</label>
              <Select
                id="rhFactor"
                value={formData.rhFactor}
                onValueChange={(value) => handleInputChange('rhFactor', value)}
              >
                <option value="">Выберите резус-фактор</option>
                {rhFactorOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="allergies" className="block text-sm font-medium text-white mb-2">Аллергии</label>
              <Input
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="Введите аллергии"
              />
            </div>
            <div>
              <label htmlFor="surgeries" className="block text-sm font-medium text-white mb-2">Перенесенные операции</label>
              <Input
                id="surgeries"
                value={formData.surgeries}
                onChange={(e) => handleInputChange('surgeries', e.target.value)}
                placeholder="Введите перенесенные операции"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="implants" className="block text-sm font-medium text-white mb-2">Наличие имплантатов</label>
              <Input
                id="implants"
                value={formData.implants}
                onChange={(e) => handleInputChange('implants', e.target.value)}
                placeholder="Введите информацию об имплантатах"
              />
            </div>
          </div>
        </div>

        {/* Флаги */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Флаги и предупреждения
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Флаги гражданина</label>
              <div className="space-y-2">
                {flagOptions.map(flag => (
                  <label key={flag.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.flags.includes(flag.value)}
                      onChange={(e) => {
                        const newFlags = e.target.checked
                          ? [...formData.flags, flag.value]
                          : formData.flags.filter(f => f !== flag.value);
                        handleInputChange('flags', newFlags);
                      }}
                      className="rounded border-secondary-600"
                    />
                    <span className="text-sm text-secondary-300">{flag.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Флаги адреса</label>
              <div className="space-y-2">
                {flagOptions.map(flag => (
                  <label key={flag.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.addressFlags.includes(flag.value)}
                      onChange={(e) => {
                        const newFlags = e.target.checked
                          ? [...formData.addressFlags, flag.value]
                          : formData.addressFlags.filter(f => f !== flag.value);
                        handleInputChange('addressFlags', newFlags);
                      }}
                      className="rounded border-secondary-600"
                    />
                    <span className="text-sm text-secondary-300">{flag.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex justify-end gap-3 pt-6 border-t border-secondary-700">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Отмена
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Сохранить изменения
          </Button>
        </div>
      </div>
    </Modal>
  );
};
