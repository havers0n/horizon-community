import React from 'react';
import { Input } from '@/shared/ui/atoms';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/atoms';
import { Textarea } from '@/shared/ui/atoms';
import { Checkbox } from '@/shared/ui/atoms';

interface MedicalInfoStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export const MedicalInfoStep: React.FC<MedicalInfoStepProps> = ({ formData, updateFormData }) => {
  const medicalInfo = formData.medicalInfo || {};

  const handleMedicalInfoChange = (field: string, value: any) => {
    updateFormData({
      medicalInfo: {
        ...medicalInfo,
        [field]: value,
      },
    });
  };

  const handleAllergyChange = (allergy: string, checked: boolean) => {
    const currentAllergies = medicalInfo.allergies || [];
    const newAllergies = checked 
      ? [...currentAllergies, allergy]
      : currentAllergies.filter((a: string) => a !== allergy);
    
    handleMedicalInfoChange('allergies', newAllergies);
  };

  const handleConditionChange = (condition: string, checked: boolean) => {
    const currentConditions = medicalInfo.conditions || [];
    const newConditions = checked 
      ? [...currentConditions, condition]
      : currentConditions.filter((c: string) => c !== condition);
    
    handleMedicalInfoChange('conditions', newConditions);
  };

  const handleMedicationChange = (medication: string, checked: boolean) => {
    const currentMedications = medicalInfo.medications || [];
    const newMedications = checked 
      ? [...currentMedications, medication]
      : currentMedications.filter((m: string) => m !== medication);
    
    handleMedicalInfoChange('medications', newMedications);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Медицинская информация</h3>
        <p className="text-slate-400 mb-6">
          Заполните медицинскую информацию о персонаже
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Группа крови */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Группа крови
          </label>
          <Select
            value={medicalInfo.bloodType || ''}
            onValueChange={(value) => handleMedicalInfoChange('bloodType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите группу крови" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
              <SelectItem value="O+">O+</SelectItem>
              <SelectItem value="O-">O-</SelectItem>
              <SelectItem value="unknown">Неизвестно</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Резус-фактор */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Резус-фактор
          </label>
          <Select
            value={medicalInfo.rhFactor || ''}
            onValueChange={(value) => handleMedicalInfoChange('rhFactor', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите резус-фактор" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="positive">Положительный (+)</SelectItem>
              <SelectItem value="negative">Отрицательный (-)</SelectItem>
              <SelectItem value="unknown">Неизвестно</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Вес */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Вес (кг)
          </label>
          <Input
            type="number"
            value={medicalInfo.weight || ''}
            onChange={(e) => handleMedicalInfoChange('weight', e.target.value)}
            placeholder="70"
            min="30"
            max="200"
          />
        </div>

        {/* Рост */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Рост (см)
          </label>
          <Input
            type="number"
            value={medicalInfo.height || ''}
            onChange={(e) => handleMedicalInfoChange('height', e.target.value)}
            placeholder="170"
            min="100"
            max="250"
          />
        </div>
      </div>

      {/* Аллергии */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Аллергии</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Checkbox
              id="allergy_penicillin"
              checked={medicalInfo.allergies?.includes('penicillin') || false}
              onCheckedChange={(checked) => handleAllergyChange('penicillin', checked)}
            />
            <label htmlFor="allergy_penicillin" className="text-sm text-slate-300 ml-2">
              Пенициллин
            </label>

            <Checkbox
              id="allergy_aspirin"
              checked={medicalInfo.allergies?.includes('aspirin') || false}
              onCheckedChange={(checked) => handleAllergyChange('aspirin', checked)}
            />
            <label htmlFor="allergy_aspirin" className="text-sm text-slate-300 ml-2">
              Аспирин
            </label>

            <Checkbox
              id="allergy_peanuts"
              checked={medicalInfo.allergies?.includes('peanuts') || false}
              onCheckedChange={(checked) => handleAllergyChange('peanuts', checked)}
            />
            <label htmlFor="allergy_peanuts" className="text-sm text-slate-300 ml-2">
              Арахис
            </label>

            <Checkbox
              id="allergy_latex"
              checked={medicalInfo.allergies?.includes('latex') || false}
              onCheckedChange={(checked) => handleAllergyChange('latex', checked)}
            />
            <label htmlFor="allergy_latex" className="text-sm text-slate-300 ml-2">
              Латекс
            </label>
          </div>

          <div className="space-y-3">
            <Checkbox
              id="allergy_shellfish"
              checked={medicalInfo.allergies?.includes('shellfish') || false}
              onCheckedChange={(checked) => handleAllergyChange('shellfish', checked)}
            />
            <label htmlFor="allergy_shellfish" className="text-sm text-slate-300 ml-2">
              Морепродукты
            </label>

            <Checkbox
              id="allergy_eggs"
              checked={medicalInfo.allergies?.includes('eggs') || false}
              onCheckedChange={(checked) => handleAllergyChange('eggs', checked)}
            />
            <label htmlFor="allergy_eggs" className="text-sm text-slate-300 ml-2">
              Яйца
            </label>

            <Checkbox
              id="allergy_milk"
              checked={medicalInfo.allergies?.includes('milk') || false}
              onCheckedChange={(checked) => handleAllergyChange('milk', checked)}
            />
            <label htmlFor="allergy_milk" className="text-sm text-slate-300 ml-2">
              Молоко
            </label>

            <Checkbox
              id="allergy_soy"
              checked={medicalInfo.allergies?.includes('soy') || false}
              onCheckedChange={(checked) => handleAllergyChange('soy', checked)}
            />
            <label htmlFor="allergy_soy" className="text-sm text-slate-300 ml-2">
              Соя
            </label>
          </div>
        </div>

        {/* Другие аллергии */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Другие аллергии
          </label>
          <textarea
            value={medicalInfo.otherAllergies || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleMedicalInfoChange('otherAllergies', e.target.value)}
            placeholder="Укажите другие аллергии..."
            rows={3}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Медицинские состояния */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Медицинские состояния</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Checkbox
              id="condition_diabetes"
              checked={medicalInfo.conditions?.includes('diabetes') || false}
              onCheckedChange={(checked) => handleConditionChange('diabetes', checked)}
            />
            <label htmlFor="condition_diabetes" className="text-sm text-slate-300 ml-2">
              Диабет
            </label>

            <Checkbox
              id="condition_hypertension"
              checked={medicalInfo.conditions?.includes('hypertension') || false}
              onCheckedChange={(checked) => handleConditionChange('hypertension', checked)}
            />
            <label htmlFor="condition_hypertension" className="text-sm text-slate-300 ml-2">
              Гипертония
            </label>

            <Checkbox
              id="condition_asthma"
              checked={medicalInfo.conditions?.includes('asthma') || false}
              onCheckedChange={(checked) => handleConditionChange('asthma', checked)}
            />
            <label htmlFor="condition_asthma" className="text-sm text-slate-300 ml-2">
              Астма
            </label>

            <Checkbox
              id="condition_heart_disease"
              checked={medicalInfo.conditions?.includes('heart_disease') || false}
              onCheckedChange={(checked) => handleConditionChange('heart_disease', checked)}
            />
            <label htmlFor="condition_heart_disease" className="text-sm text-slate-300 ml-2">
              Болезни сердца
            </label>
          </div>

          <div className="space-y-3">
            <Checkbox
              id="condition_epilepsy"
              checked={medicalInfo.conditions?.includes('epilepsy') || false}
              onCheckedChange={(checked) => handleConditionChange('epilepsy', checked)}
            />
            <label htmlFor="condition_epilepsy" className="text-sm text-slate-300 ml-2">
              Эпилепсия
            </label>

            <Checkbox
              id="condition_cancer"
              checked={medicalInfo.conditions?.includes('cancer') || false}
              onCheckedChange={(checked) => handleConditionChange('cancer', checked)}
            />
            <label htmlFor="condition_cancer" className="text-sm text-slate-300 ml-2">
              Рак
            </label>

            <Checkbox
              id="condition_hiv"
              checked={medicalInfo.conditions?.includes('hiv') || false}
              onCheckedChange={(checked) => handleConditionChange('hiv', checked)}
            />
            <label htmlFor="condition_hiv" className="text-sm text-slate-300 ml-2">
              ВИЧ/СПИД
            </label>

            <Checkbox
              id="condition_mental_health"
              checked={medicalInfo.conditions?.includes('mental_health') || false}
              onCheckedChange={(checked) => handleConditionChange('mental_health', checked)}
            />
            <label htmlFor="condition_mental_health" className="text-sm text-slate-300 ml-2">
              Психические расстройства
            </label>
          </div>
        </div>

        {/* Другие состояния */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Другие медицинские состояния
          </label>
          <textarea
            value={medicalInfo.otherConditions || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleMedicalInfoChange('otherConditions', e.target.value)}
            placeholder="Укажите другие медицинские состояния..."
            rows={3}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Лекарства */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Принимаемые лекарства</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Checkbox
              id="medication_insulin"
              checked={medicalInfo.medications?.includes('insulin') || false}
              onCheckedChange={(checked) => handleMedicationChange('insulin', checked)}
            />
            <label htmlFor="medication_insulin" className="text-sm text-slate-300 ml-2">
              Инсулин
            </label>

            <Checkbox
              id="medication_blood_pressure"
              checked={medicalInfo.medications?.includes('blood_pressure') || false}
              onCheckedChange={(checked) => handleMedicationChange('blood_pressure', checked)}
            />
            <label htmlFor="medication_blood_pressure" className="text-sm text-slate-300 ml-2">
              Препараты от давления
            </label>

            <Checkbox
              id="medication_antidepressants"
              checked={medicalInfo.medications?.includes('antidepressants') || false}
              onCheckedChange={(checked) => handleMedicationChange('antidepressants', checked)}
            />
            <label htmlFor="medication_antidepressants" className="text-sm text-slate-300 ml-2">
              Антидепрессанты
            </label>
          </div>

          <div className="space-y-3">
            <Checkbox
              id="medication_anticoagulants"
              checked={medicalInfo.medications?.includes('anticoagulants') || false}
              onCheckedChange={(checked) => handleMedicationChange('anticoagulants', checked)}
            />
            <label htmlFor="medication_anticoagulants" className="text-sm text-slate-300 ml-2">
              Антикоагулянты
            </label>

            <Checkbox
              id="medication_steroids"
              checked={medicalInfo.medications?.includes('steroids') || false}
              onCheckedChange={(checked) => handleMedicationChange('steroids', checked)}
            />
            <label htmlFor="medication_steroids" className="text-sm text-slate-300 ml-2">
              Стероиды
            </label>

            <Checkbox
              id="medication_chemotherapy"
              checked={medicalInfo.medications?.includes('chemotherapy') || false}
              onCheckedChange={(checked) => handleMedicationChange('chemotherapy', checked)}
            />
            <label htmlFor="medication_chemotherapy" className="text-sm text-slate-300 ml-2">
              Химиотерапия
            </label>
          </div>
        </div>

        {/* Другие лекарства */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Другие принимаемые лекарства
          </label>
          <textarea
            value={medicalInfo.otherMedications || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleMedicalInfoChange('otherMedications', e.target.value)}
            placeholder="Укажите другие принимаемые лекарства..."
            rows={3}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Дополнительная информация */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Дополнительная медицинская информация
        </label>
        <textarea
          value={medicalInfo.notes || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleMedicalInfoChange('notes', e.target.value)}
          placeholder="Дополнительная медицинская информация..."
          rows={4}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}; 