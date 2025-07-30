import React, { useState } from 'react';
import { Button } from '@/shared/ui/atoms/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { BoloTypeSelector } from '../atoms/BoloTypeSelector';
import { BoloPrioritySelector } from '../atoms/BoloPrioritySelector';
import { BoloFormField } from '../molecules/BoloFormField';
import { useBoloManagementStore } from '../../model/store';
import { CreateBoloData } from '../../api/boloApi';
import { useToast } from '../../../../hooks/use-toast';

interface CreateBoloFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateBoloForm: React.FC<CreateBoloFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const { createBOLO, isLoading } = useBoloManagementStore();
  
  const [formData, setFormData] = useState<CreateBoloData>({
    type: 'general',
    description: '',
    vehicle: '',
    plate: '',
    reason: '',
    priority: 'medium',
    location: '',
    additionalInfo: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Причина обязательна';
    }

    if (formData.type === 'vehicle') {
      if (!formData.vehicle?.trim()) {
        newErrors.vehicle = 'Модель транспортного средства обязательна';
      }
      if (!formData.plate?.trim()) {
        newErrors.plate = 'Номерной знак обязателен';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createBOLO(formData);
      
      toast({
        title: 'BOLO создан',
        description: 'Ориентировка успешно создана',
        variant: 'default'
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать BOLO',
        variant: 'destructive'
      });
    }
  };

  const handleInputChange = (field: keyof CreateBoloData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Создать BOLO</CardTitle>
        <CardDescription>
          Создайте новую ориентировку для поиска
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Тип BOLO */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Тип BOLO <span className="text-red-500">*</span>
            </label>
            <BoloTypeSelector
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              disabled={isLoading}
            />
          </div>

          {/* Описание */}
          <BoloFormField
            label="Описание"
            name="description"
            type="textarea"
            placeholder="Подробное описание объекта поиска..."
            value={formData.description}
            onChange={(value) => handleInputChange('description', value)}
            required
            disabled={isLoading}
            error={errors.description}
          />

          {/* Поля для транспортного средства */}
          {formData.type === 'vehicle' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BoloFormField
                label="Модель транспортного средства"
                name="vehicle"
                placeholder="Например: Bravado Buffalo"
                value={formData.vehicle || ''}
                onChange={(value) => handleInputChange('vehicle', value)}
                required
                disabled={isLoading}
                error={errors.vehicle}
              />
              <BoloFormField
                label="Номерной знак"
                name="plate"
                placeholder="Например: ABC123"
                value={formData.plate || ''}
                onChange={(value) => handleInputChange('plate', value)}
                required
                disabled={isLoading}
                error={errors.plate}
              />
            </div>
          )}

          {/* Причина */}
          <BoloFormField
            label="Причина"
            name="reason"
            type="textarea"
            placeholder="Причина для поиска..."
            value={formData.reason}
            onChange={(value) => handleInputChange('reason', value)}
            required
            disabled={isLoading}
            error={errors.reason}
          />

          {/* Приоритет */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Приоритет <span className="text-red-500">*</span>
            </label>
            <BoloPrioritySelector
              value={formData.priority}
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              disabled={isLoading}
            />
          </div>

          {/* Местоположение */}
          <BoloFormField
            label="Местоположение"
            name="location"
            placeholder="Последнее известное местоположение..."
            value={formData.location || ''}
            onChange={(value) => handleInputChange('location', value)}
            disabled={isLoading}
          />

          {/* Дополнительная информация */}
          <BoloFormField
            label="Дополнительная информация"
            name="additionalInfo"
            type="textarea"
            placeholder="Дополнительные детали, направления движения и т.д."
            value={formData.additionalInfo || ''}
            onChange={(value) => handleInputChange('additionalInfo', value)}
            disabled={isLoading}
          />

          {/* Кнопки */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Создание...' : 'Создать BOLO'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 