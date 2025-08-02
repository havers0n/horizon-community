import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/shared/ui/atoms';
import { Button } from '@/shared/ui/atoms';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { ApiService } from '@/services/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { BasicInfoStep } from './registration-steps/BasicInfoStep';
import { AdditionalInfoStep } from './registration-steps/AdditionalInfoStep';
import { LicensesStep } from './registration-steps/LicensesStep';
import { PropertyStep } from './registration-steps/PropertyStep';
import { MedicalInfoStep } from './registration-steps/MedicalInfoStep';
import type { Character, CreateCharacterRequest } from '@/shared/types';

interface CitizenRegistrationWizardProps {
  onComplete: (character: Character) => void;
  onCancel: () => void;
}

interface FormData extends CreateCharacterRequest {
  // Дополнительные поля для формы
  confirmPassword?: string;
  termsAccepted?: boolean;
}

const steps = [
  { id: 1, title: 'Основная информация', component: BasicInfoStep },
  { id: 2, title: 'Дополнительная информация', component: AdditionalInfoStep },
  { id: 3, title: 'Лицензии', component: LicensesStep },
  { id: 4, title: 'Транспорт и оружие', component: PropertyStep },
  { id: 5, title: 'Медицинская карта', component: MedicalInfoStep },
];

export const CitizenRegistrationWizard: React.FC<CitizenRegistrationWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    ethnicity: '',
    height: '',
    weight: '',
    hairColor: '',
    eyeColor: '',
    address: '',
    phoneNumber: '',
    postal: '',
    occupation: '',
    licenses: {},
    medicalInfo: {},
    flags: [],
    addressFlags: [],
    dead: false,
    missing: false,
    arrested: false,
  });

  const apiService = new ApiService();
  
  const createCharacterMutation = useMutation({
    mutationFn: (data: CreateCharacterRequest) => apiService.createCitizen(data),
    onSuccess: (character) => {
      onComplete(character);
    },
    onError: (error) => {
      console.error('Error creating character:', error);
      // Здесь можно добавить toast уведомление об ошибке
    },
  });

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }

    const characterData: CreateCharacterRequest = {
      ...formData,
      // Удаляем поля, которые не должны попадать в БД
      confirmPassword: undefined,
      termsAccepted: undefined,
    };

    createCharacterMutation.mutate(characterData);
  };

  const isLastStep = currentStep === steps.length;
  const isFirstStep = currentStep === 1;
  const isLoading = createCharacterMutation.isPending;

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Регистрация гражданина</h2>
            <Button variant="ghost" onClick={onCancel}>
              Отмена
            </Button>
          </div>
          
          {/* Прогресс */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep > step.id 
                      ? 'bg-green-500 text-white' 
                      : currentStep === step.id 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-slate-700 text-slate-400'
                  }`}>
                    {currentStep > step.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-slate-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400">
              Шаг {currentStep} из {steps.length}: {steps[currentStep - 1].title}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <div className="min-h-[400px]">
            <CurrentStepComponent
              formData={formData}
              updateFormData={updateFormData}
            />
          </div>

          {/* Навигационные кнопки */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep || isLoading}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>

            <div className="flex items-center gap-3">
              {isLastStep ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Создать персонажа
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  Далее
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 