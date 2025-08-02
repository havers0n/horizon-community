import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/atoms';
import { Button } from '@/shared/ui/atoms/Button';
import { Input } from '@/shared/ui/atoms/Input';
import { Label } from '@/shared/ui/atoms/Label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/atoms/Select';
import { Badge } from '@/shared/ui/atoms/Badge';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Character, UpdateCharacterRequest } from '@/shared/types';
import { Edit, Save, X, Loader2, User, MapPin, Phone, Calendar, Briefcase } from 'lucide-react';

interface CharacterDetailsFormProps {
  characterId: string;
  onSuccess?: (character: Character) => void;
  onCancel?: () => void;
  isReadOnly?: boolean;
}

export const CharacterDetailsForm: React.FC<CharacterDetailsFormProps> = ({
  characterId,
  onSuccess,
  onCancel,
  isReadOnly = false
}) => {
  const { toast } = useToast();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<UpdateCharacterRequest>({});

  // Загружаем данные персонажа
  useEffect(() => {
    const loadCharacter = async () => {
      try {
        const characterData = await apiService.getCitizenById(characterId);
        setCharacter(characterData);
        setFormData(characterData);
      } catch (error) {
        console.error('Error loading character:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить данные персонажа',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacter();
  }, [characterId, toast]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'Имя обязательно';
    }

    if (!formData.lastName?.trim()) {
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

  const handleInputChange = (field: keyof UpdateCharacterRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const updatedCharacter = await apiService.updateCitizen(characterId, formData);
      setCharacter(updatedCharacter);
      setIsEditing(false);
      
      toast({
        title: 'Успешно',
        description: 'Данные персонажа обновлены',
        variant: 'default'
      });

      if (onSuccess) {
        onSuccess(updatedCharacter);
      }
    } catch (error) {
      console.error('Error updating character:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить данные персонажа',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getCharacterStatus = (character: Character) => {
    if (character.dead) return { label: 'Мертв', color: 'bg-red-100 text-red-800' };
    if (character.missing) return { label: 'Пропал', color: 'bg-yellow-100 text-yellow-800' };
    if (character.arrested) return { label: 'Арестован', color: 'bg-orange-100 text-orange-800' };
    if (character.isUnit && character.isActive) return { label: 'Активен', color: 'bg-green-100 text-green-800' };
    if (character.isUnit && !character.isActive) return { label: 'Неактивен', color: 'bg-gray-100 text-gray-800' };
    return { label: 'Гражданский', color: 'bg-blue-100 text-blue-800' };
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!character) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="text-center py-12">
          <p className="text-gray-500">Персонаж не найден</p>
        </CardContent>
      </Card>
    );
  }

  const status = getCharacterStatus(character);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {character.firstName} {character.lastName}
            </CardTitle>
            <CardDescription>
              ID: {character.id}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={status.color}>
              {status.label}
            </Badge>
            {!isReadOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isSaving}
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                {isEditing ? 'Отмена' : 'Редактировать'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Основная информация</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Введите имя"
                  error={errors.firstName}
                  disabled={!isEditing || isReadOnly}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Введите фамилию"
                  error={errors.lastName}
                  disabled={!isEditing || isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Дата рождения *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  error={errors.dateOfBirth}
                  disabled={!isEditing || isReadOnly}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Пол</Label>
                <Select
                  value={formData.gender || ''}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  disabled={!isEditing || isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите пол" />
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
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <textarea
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Введите полный адрес"
                  disabled={!isEditing || isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Телефон</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber || ''}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="Введите номер телефона"
                    disabled={!isEditing || isReadOnly}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="occupation">Профессия</Label>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <Input
                    id="occupation"
                    value={formData.occupation || ''}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    placeholder="Введите профессию"
                    disabled={!isEditing || isReadOnly}
                  />
                </div>
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
                  disabled={!isEditing || isReadOnly}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weight">Вес</Label>
                <Input
                  id="weight"
                  value={formData.weight || ''}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="Например: 70 кг"
                  disabled={!isEditing || isReadOnly}
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
                  disabled={!isEditing || isReadOnly}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eyeColor">Цвет глаз</Label>
                <Input
                  id="eyeColor"
                  value={formData.eyeColor || ''}
                  onChange={(e) => handleInputChange('eyeColor', e.target.value)}
                  placeholder="Например: Голубые"
                  disabled={!isEditing || isReadOnly}
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
                disabled={!isEditing || isReadOnly}
              />
            </div>
          </div>

          {/* Метаданные */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Метаданные</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Дата создания</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {new Date(character.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Последнее обновление</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {new Date(character.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Действия */}
          {isEditing && !isReadOnly && (
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Отмена
              </Button>
              
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Сохранить
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}; 