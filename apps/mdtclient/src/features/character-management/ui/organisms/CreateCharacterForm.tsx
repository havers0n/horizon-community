import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/atoms';
import { Button } from '@/shared/ui/atoms/Button';
import { Input } from '@/shared/ui/atoms/Input';
import { Label } from '@/shared/ui/atoms/Label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/atoms/Select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/shared/contexts/AuthContext';
import { apiService } from '@/services/api';
import { CreateCharacterRequest } from '@/shared/types';
import { UserPlus, Loader2 } from 'lucide-react';

interface CreateCharacterFormProps {
  onSuccess?: (character: any) => void;
  onCancel?: () => void;
}

export const CreateCharacterForm: React.FC<CreateCharacterFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const { user, refreshCharacters } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<CreateCharacterRequest>({
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
    mugshotUrl: '',
    licenses: {},
    medicalInfo: {},
    flags: [],
    addressFlags: [],
    dead: false,
    missing: false,
    arrested: false,
    isUnit: false,
    badgeNumber: '',
    callsign: '',
    callsign2: '',
    departmentId: undefined,
    divisionId: undefined,
    rankId: undefined,
    hireDate: '',
    terminationDate: '',
    isActive: false,
    suspended: false,
    whitelistStatus: 'none',
    radioChannelId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Дата рождения обязательна';
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'Адрес обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateCharacterRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      toast({
        title: 'Ошибка',
        description: 'Пользователь не авторизован',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Добавляем ownerId к данным персонажа
      const characterData = {
        ...formData,
        ownerId: user.id
      };

      const newCharacter = await apiService.createCitizen(characterData);
      
      toast({
        title: 'Успешно',
        description: 'Персонаж создан успешно',
        variant: 'default'
      });

      // Обновляем список персонажей
      await refreshCharacters();

      if (onSuccess) {
        onSuccess(newCharacter);
      }
    } catch (error) {
      console.error('Error creating character:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать персонажа. Попробуйте еще раз.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Создать нового персонажа
        </CardTitle>
        <CardDescription>
          Заполните основную информацию о персонаже
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Основная информация</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Введите имя"
                  error={errors.firstName}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Введите фамилию"
                  error={errors.lastName}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Дата рождения *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  error={errors.dateOfBirth}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Пол</Label>
                <Select
                  value={formData.gender || ''}
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите пол">
                      {formData.gender || ''}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Мужской</SelectItem>
                    <SelectItem value="female">Женский</SelectItem>
                    <SelectItem value="other">Другой</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Адрес *</Label>
              <textarea
                id="address"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Введите полный адрес"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Телефон</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Введите номер телефона"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="occupation">Профессия</Label>
                <Input
                  id="occupation"
                  value={formData.occupation || ''}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  placeholder="Введите профессию"
                />
              </div>
            </div>
          </div>

          {/* Физические характеристики */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Физические характеристики</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Рост</Label>
                <Input
                  id="height"
                  value={formData.height || ''}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder="Например: 175 см"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weight">Вес</Label>
                <Input
                  id="weight"
                  value={formData.weight || ''}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="Например: 70 кг"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hairColor">Цвет волос</Label>
                <Input
                  id="hairColor"
                  value={formData.hairColor || ''}
                  onChange={(e) => handleInputChange('hairColor', e.target.value)}
                  placeholder="Например: Каштановые"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eyeColor">Цвет глаз</Label>
                <Input
                  id="eyeColor"
                  value={formData.eyeColor || ''}
                  onChange={(e) => handleInputChange('eyeColor', e.target.value)}
                  placeholder="Например: Голубые"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ethnicity">Национальность</Label>
              <Input
                id="ethnicity"
                value={formData.ethnicity || ''}
                onChange={(e) => handleInputChange('ethnicity', e.target.value)}
                placeholder="Введите национальность"
              />
            </div>
          </div>

          {/* Действия */}
          <div className="flex items-center justify-end gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Отмена
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Создать персонажа
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 