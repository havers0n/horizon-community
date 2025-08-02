import React from 'react';
import { Input } from '@/shared/ui/atoms';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/atoms';
import { Checkbox } from '@/shared/ui/atoms';
import { DataGenerator } from '@/shared/utils/dataGeneration';

interface LicensesStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export const LicensesStep: React.FC<LicensesStepProps> = ({ formData, updateFormData }) => {
  const licenses = formData.licenses || {};

  const handleLicenseChange = (licenseType: string, field: string, value: any) => {
    const updatedLicenses = {
      ...licenses,
      [licenseType]: {
        ...licenses[licenseType],
        [field]: value,
      },
    };
    updateFormData({ licenses: updatedLicenses });
  };

  const handleGenerateLicenseNumber = (licenseType: string) => {
    handleLicenseChange(licenseType, 'number', DataGenerator.generateLicenseNumber());
  };

  const licenseTypes = [
    { id: 'driver', name: 'Водительские права', fields: ['number', 'class', 'expiry'] },
    { id: 'weapon', name: 'Лицензия на оружие', fields: ['number', 'type', 'expiry'] },
    { id: 'hunting', name: 'Охотничья лицензия', fields: ['number', 'expiry'] },
    { id: 'fishing', name: 'Рыболовная лицензия', fields: ['number', 'expiry'] },
    { id: 'business', name: 'Бизнес-лицензия', fields: ['number', 'type', 'expiry'] },
    { id: 'medical', name: 'Медицинская лицензия', fields: ['number', 'specialty', 'expiry'] },
    { id: 'law', name: 'Адвокатская лицензия', fields: ['number', 'expiry'] },
    { id: 'pilot', name: 'Пилотская лицензия', fields: ['number', 'class', 'expiry'] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Лицензии</h3>
        <p className="text-slate-400 mb-6">
          Укажите лицензии, которыми обладает персонаж
        </p>
      </div>

      <div className="space-y-6">
        {licenseTypes.map((licenseType) => (
          <div key={licenseType.id} className="border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <Checkbox
                id={`license_${licenseType.id}`}
                checked={licenses[licenseType.id]?.active || false}
                onCheckedChange={(checked) => 
                  handleLicenseChange(licenseType.id, 'active', checked)
                }
              />
              <label 
                htmlFor={`license_${licenseType.id}`} 
                className="text-md font-medium text-white"
              >
                {licenseType.name}
              </label>
            </div>

            {licenses[licenseType.id]?.active && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                {/* Номер лицензии */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Номер лицензии
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={licenses[licenseType.id]?.number || ''}
                      onChange={(e) => 
                        handleLicenseChange(licenseType.id, 'number', e.target.value)
                      }
                      placeholder="Введите номер"
                    />
                    <button
                      type="button"
                      onClick={() => handleGenerateLicenseNumber(licenseType.id)}
                      className="px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
                    >
                      Генерировать
                    </button>
                  </div>
                </div>

                {/* Класс/Тип лицензии */}
                {licenseType.fields.includes('class') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Класс
                    </label>
                    <Select
                      value={licenses[licenseType.id]?.class || ''}
                      onValueChange={(value) => 
                        handleLicenseChange(licenseType.id, 'class', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите класс" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {licenseType.fields.includes('type') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Тип
                    </label>
                    <Select
                      value={licenses[licenseType.id]?.type || ''}
                      onValueChange={(value) => 
                        handleLicenseChange(licenseType.id, 'type', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        {licenseType.id === 'weapon' && (
                          <>
                            <SelectItem value="concealed">Скрытое ношение</SelectItem>
                            <SelectItem value="open">Открытое ношение</SelectItem>
                            <SelectItem value="hunting">Охотничье</SelectItem>
                          </>
                        )}
                        {licenseType.id === 'business' && (
                          <>
                            <SelectItem value="retail">Розничная торговля</SelectItem>
                            <SelectItem value="restaurant">Ресторан</SelectItem>
                            <SelectItem value="service">Услуги</SelectItem>
                            <SelectItem value="manufacturing">Производство</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {licenseType.fields.includes('specialty') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Специализация
                    </label>
                    <Select
                      value={licenses[licenseType.id]?.specialty || ''}
                      onValueChange={(value) => 
                        handleLicenseChange(licenseType.id, 'specialty', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите специализацию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cardiology">Кардиология</SelectItem>
                        <SelectItem value="neurology">Неврология</SelectItem>
                        <SelectItem value="surgery">Хирургия</SelectItem>
                        <SelectItem value="pediatrics">Педиатрия</SelectItem>
                        <SelectItem value="emergency">Экстренная медицина</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Дата истечения */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Дата истечения
                  </label>
                  <Input
                    type="date"
                    value={licenses[licenseType.id]?.expiry || ''}
                    onChange={(e) => 
                      handleLicenseChange(licenseType.id, 'expiry', e.target.value)
                    }
                  />
                </div>

                {/* Статус */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Статус
                  </label>
                  <Select
                    value={licenses[licenseType.id]?.status || 'valid'}
                    onValueChange={(value) => 
                      handleLicenseChange(licenseType.id, 'status', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="valid">Действительна</SelectItem>
                      <SelectItem value="expired">Истекла</SelectItem>
                      <SelectItem value="suspended">Приостановлена</SelectItem>
                      <SelectItem value="revoked">Отозвана</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 