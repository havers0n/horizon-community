// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/atoms/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/atoms/Select';
import { BoloTypeSelector } from '../atoms/BoloTypeSelector';
import { BoloPrioritySelector } from '../atoms/BoloPrioritySelector';
import { BoloFormField } from '../molecules/BoloFormField';
import { useBoloManagementStore } from '../../model/store';
import { CreateBoloData } from '../../api/boloApi';
import { useToast } from '../../../../hooks/use-toast';
import { useAuth } from '@/shared/contexts/AuthContext';

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
  const { activeCharacter, characters, user, refreshCharacters } = useAuth();
  
  // Отладочная информация
  console.log('[CreateBoloForm] activeCharacter:', activeCharacter);
  console.log('[CreateBoloForm] characters:', characters);
  console.log('[CreateBoloForm] characters length:', characters?.length);
  console.log('[CreateBoloForm] user:', user);
  
  console.log('[CreateBoloForm] isLoading:', isLoading);
  
  // Временное решение: если нет активного персонажа, но есть персонажи, выбираем первого
  useEffect(() => {
    if (!activeCharacter && characters && characters.length > 0) {
      console.log('[CreateBoloForm] Auto-selecting first character:', characters[0]);
      // Здесь нужно вызвать setActiveCharacter, но у нас нет доступа к нему
      // Пока просто показываем предупреждение
    }
  }, [activeCharacter, characters]);

  const [formData, setFormData] = useState<Omit<CreateBoloData, 'authorCharacterId'>>({
    type: 'general',
    reason: '',
    subjectName: '',
    subjectDescription: '',
    vehicleDescription: '',
    vehiclePlate: '',
    location: '',
    priority: 'medium'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    console.log('[CreateBoloForm] Validating form...');
    console.log('[CreateBoloForm] Form data for validation:', formData);
    
    const newErrors: Record<string, string> = {};

    if (!formData.reason.trim()) {
      newErrors.reason = 'Причина обязательна';
      console.log('[CreateBoloForm] Validation error: reason is empty');
    }

    if (formData.type === 'vehicle') {
      if (!formData.vehicleDescription?.trim()) {
        newErrors.vehicleDescription = 'Описание транспортного средства обязательно';
        console.log('[CreateBoloForm] Validation error: vehicleDescription is empty');
      }
      if (!formData.vehiclePlate?.trim()) {
        newErrors.vehiclePlate = 'Номерной знак обязателен';
        console.log('[CreateBoloForm] Validation error: vehiclePlate is empty');
      }
    }

    if (formData.type === 'person') {
      if (!formData.subjectName?.trim()) {
        newErrors.subjectName = 'Имя субъекта обязательно';
        console.log('[CreateBoloForm] Validation error: subjectName is empty');
      }
      if (!formData.subjectDescription?.trim()) {
        newErrors.subjectDescription = 'Описание субъекта обязательно';
        console.log('[CreateBoloForm] Validation error: subjectDescription is empty');
      }
    }

    if (formData.type === 'general' && !formData.subjectDescription?.trim()) {
      newErrors.subjectDescription = 'Описание обязательно';
      console.log('[CreateBoloForm] Validation error: subjectDescription is empty for general type');
    }

    console.log('[CreateBoloForm] Validation errors:', newErrors);
    console.log('[CreateBoloForm] Validation result:', Object.keys(newErrors).length === 0);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[CreateBoloForm] Form submitted');
    console.log('[CreateBoloForm] Form data:', formData);
    console.log('[CreateBoloForm] Current character:', activeCharacter);
    console.log('[CreateBoloForm] User:', user);
    
    if (!validateForm()) {
      console.log('[CreateBoloForm] Form validation failed');
      return;
    }

    // Проверяем наличие активного персонажа
    if (!activeCharacter) {
      console.log('[CreateBoloForm] No active character found');
      toast({
        title: 'Ошибка',
        description: 'Не выбран активный персонаж. Пожалуйста, выберите персонажа в настройках профиля.',
        variant: 'destructive'
      });
      return;
    }

    // Используем ID активного персонажа (уже string)
    const authorId = activeCharacter.id;
    
    console.log('[CreateBoloForm] Author ID:', authorId);
    
    if (!authorId) {
      console.log('[CreateBoloForm] No author ID found');
      toast({
        title: 'Ошибка',
        description: 'Не удалось определить автора BOLO. Пожалуйста, войдите в систему.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const boloData: CreateBoloData = {
        ...formData,
        authorCharacterId: authorId
      };

      console.log('[CreateBoloForm] Submitting BOLO data:', boloData);
      console.log('[CreateBoloForm] BOLO data JSON:', JSON.stringify(boloData, null, 2));

      await createBOLO(boloData);
      
      console.log('[CreateBoloForm] BOLO created successfully');
      
      toast({
        title: 'BOLO создан',
        description: 'Ориентировка успешно создана',
        variant: 'default'
      });

      onSuccess?.();
    } catch (error) {
      console.error('[CreateBoloForm] Error creating BOLO:', error);
      console.error('[CreateBoloForm] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      
      let errorMessage = 'Не удалось создать BOLO';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleInputChange = (field: keyof Omit<CreateBoloData, 'authorCharacterId'>, value: string) => {
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
          {/* Селектор персонажа (если персонажи загружены, но активный не выбран) */}
          {characters && characters.length > 0 && !activeCharacter && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Выберите персонажа <span className="text-red-500">*</span>
              </label>
              <Select
                value=""
                onValueChange={(value) => {
                  const character = characters.find(char => char.id === value);
                  if (character) {
                    // Временно сохраняем выбранного персонажа в localStorage
                    localStorage.setItem('tempActiveCharacterId', character.id);
                    window.location.reload(); // Перезагружаем страницу для применения изменений
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите персонажа для создания BOLO" />
                </SelectTrigger>
                <SelectContent>
                  {characters.map((character) => (
                    <SelectItem key={character.id} value={character.id}>
                      {character.firstName} {character.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Выберите персонажа, от имени которого будет создан BOLO
              </p>
            </div>
          )}

          {/* Информация о выбранном персонаже */}
          {activeCharacter && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-800">Выбранный персонаж:</span>
                <span className="text-sm text-blue-600">
                  {activeCharacter.firstName} {activeCharacter.lastName}
                </span>
              </div>
            </div>
          )}

          {/* Сообщение, если персонажи не загрузились */}
          {!characters || characters.length === 0 ? (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800">Персонажи не загружены</p>
                  <p className="text-xs text-yellow-600">Нажмите кнопку для обновления</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => refreshCharacters()}
                  className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                >
                  Обновить
                </Button>
              </div>
            </div>
          ) : null}

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

          {/* Поля для персонажа */}
          {formData.type === 'person' && (
            <div className="space-y-4">
              <BoloFormField
                label="Имя субъекта"
                name="subjectName"
                placeholder="Имя и фамилия..."
                value={formData.subjectName || ''}
                onChange={(value) => handleInputChange('subjectName', value)}
                required
                disabled={isLoading}
                error={errors.subjectName}
              />
              <BoloFormField
                label="Описание субъекта"
                name="subjectDescription"
                type="textarea"
                placeholder="Подробное описание внешности, одежды..."
                value={formData.subjectDescription || ''}
                onChange={(value) => handleInputChange('subjectDescription', value)}
                required
                disabled={isLoading}
                error={errors.subjectDescription}
              />
            </div>
          )}

          {/* Поля для транспортного средства */}
          {formData.type === 'vehicle' && (
            <div className="space-y-4">
              <BoloFormField
                label="Описание транспортного средства"
                name="vehicleDescription"
                placeholder="Модель, цвет, особенности..."
                value={formData.vehicleDescription || ''}
                onChange={(value) => handleInputChange('vehicleDescription', value)}
                required
                disabled={isLoading}
                error={errors.vehicleDescription}
              />
              <BoloFormField
                label="Номерной знак"
                name="vehiclePlate"
                placeholder="Например: ABC123"
                value={formData.vehiclePlate || ''}
                onChange={(value) => handleInputChange('vehiclePlate', value)}
                required
                disabled={isLoading}
                error={errors.vehiclePlate}
              />
            </div>
          )}

          {/* Описание для общего типа */}
          {formData.type === 'general' && (
            <BoloFormField
              label="Описание"
              name="subjectDescription"
              type="textarea"
              placeholder="Подробное описание объекта поиска..."
              value={formData.subjectDescription || ''}
              onChange={(value) => handleInputChange('subjectDescription', value)}
              required
              disabled={isLoading}
              error={errors.subjectDescription}
            />
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
              value={formData.priority || 'medium'}
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
          
          {/* Отладочная информация */}
          <div className="mt-4 p-2 bg-gray-800 rounded text-xs">
            <p>Debug Info:</p>
            <p>User: {user?.email || 'None'}</p>
            <p>Active Character: {activeCharacter ? `${activeCharacter.firstName} ${activeCharacter.lastName}` : 'None'}</p>
            <p>Author ID: {activeCharacter?.id?.toString() || user?.id || 'None'}</p>
            <p>Is loading: {isLoading ? 'Yes' : 'No'}</p>
            <p>Button disabled: {isLoading ? 'Yes' : 'No'}</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 