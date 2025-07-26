import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Plus, User } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { z } from 'zod';

const createCharacterSchema = z.object({
  type: z.enum(['civilian', 'leo', 'fire', 'ems']),
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  dob: z.string().min(1, 'Дата рождения обязательна'),
  address: z.string().min(1, 'Адрес обязателен'),
  licenses: z.record(z.string()).optional(),
  medicalInfo: z.record(z.any()).optional(),
  mugshotUrl: z.string().optional(),
  isUnit: z.boolean().default(false),
  unitInfo: z.record(z.any()).optional(),
});

type CreateCharacterData = z.infer<typeof createCharacterSchema>;

interface CreateCharacterModalProps {
  onCharacterCreated: () => void;
}

const CreateCharacterModal: React.FC<CreateCharacterModalProps> = ({ onCharacterCreated }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCharacterData>({
    type: 'civilian',
    firstName: '',
    lastName: '',
    dob: '',
    address: '',
    licenses: {},
    medicalInfo: {},
    isUnit: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Валидация данных
      const validatedData = createCharacterSchema.parse(formData);
      
      const response = await fetch('/api/cad/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(validatedData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка создания персонажа');
      }

      const newCharacter = await response.json();
      
      toast({
        title: "Персонаж создан",
        description: `${newCharacter.firstName} ${newCharacter.lastName} успешно создан`,
      });

      setOpen(false);
      setFormData({
        type: 'civilian',
        firstName: '',
        lastName: '',
        dob: '',
        address: '',
        licenses: {},
        medicalInfo: {},
        isUnit: false,
      });
      
      onCharacterCreated();
      
    } catch (error) {
      console.error('Failed to create character:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Не удалось создать персонажа',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateCharacterData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLicenseChange = (licenseType: string, status: string) => {
    setFormData(prev => ({
      ...prev,
      licenses: {
        ...prev.licenses,
        [licenseType]: status
      }
    }));
  };

  const getCharacterTypeLabel = (type: string) => {
    switch (type) {
      case 'civilian': return 'Гражданский';
      case 'leo': return 'Полиция';
      case 'fire': return 'Пожарная служба';
      case 'ems': return 'Скорая помощь';
      default: return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Создать персонажа
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Создать нового персонажа</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Основная информация</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Имя *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Имя"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">Фамилия *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Фамилия"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Тип персонажа *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="civilian">Гражданский</SelectItem>
                    <SelectItem value="leo">Полиция</SelectItem>
                    <SelectItem value="fire">Пожарная служба</SelectItem>
                    <SelectItem value="ems">Скорая помощь</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="dob">Дата рождения *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Адрес *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Полный адрес"
                required
              />
            </div>
          </div>

          {/* Лицензии */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Лицензии</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Водительские права</Label>
                <Select
                  value={formData.licenses?.driver || 'none'}
                  onValueChange={(value) => handleLicenseChange('driver', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Нет</SelectItem>
                    <SelectItem value="valid">Действительны</SelectItem>
                    <SelectItem value="expired">Истекли</SelectItem>
                    <SelectItem value="suspended">Приостановлены</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Оружейная лицензия</Label>
                <Select
                  value={formData.licenses?.weapon || 'none'}
                  onValueChange={(value) => handleLicenseChange('weapon', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Нет</SelectItem>
                    <SelectItem value="valid">Действительна</SelectItem>
                    <SelectItem value="expired">Истекла</SelectItem>
                    <SelectItem value="suspended">Приостановлена</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Медицинская лицензия</Label>
                <Select
                  value={formData.licenses?.medical || 'none'}
                  onValueChange={(value) => handleLicenseChange('medical', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Нет</SelectItem>
                    <SelectItem value="valid">Действительна</SelectItem>
                    <SelectItem value="expired">Истекла</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Пилотная лицензия</Label>
                <Select
                  value={formData.licenses?.pilot || 'none'}
                  onValueChange={(value) => handleLicenseChange('pilot', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Нет</SelectItem>
                    <SelectItem value="valid">Действительна</SelectItem>
                    <SelectItem value="expired">Истекла</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Медицинская информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Медицинская информация</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bloodType">Группа крови</Label>
                <Select
                  value={formData.medicalInfo?.bloodType || ''}
                  onValueChange={(value) => handleInputChange('medicalInfo', {
                    ...formData.medicalInfo,
                    bloodType: value
                  })}
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
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="allergies">Аллергии</Label>
                <Input
                  id="allergies"
                  value={formData.medicalInfo?.allergies || ''}
                  onChange={(e) => handleInputChange('medicalInfo', {
                    ...formData.medicalInfo,
                    allergies: e.target.value
                  })}
                  placeholder="Аллергии (через запятую)"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="medicalHistory">Медицинская история</Label>
              <Textarea
                id="medicalHistory"
                value={formData.medicalInfo?.history || ''}
                onChange={(e) => handleInputChange('medicalInfo', {
                  ...formData.medicalInfo,
                  history: e.target.value
                })}
                placeholder="Важные медицинские факты..."
                rows={3}
              />
            </div>
          </div>

          {/* Юнит информация */}
          {formData.type !== 'civilian' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isUnit"
                  checked={formData.isUnit}
                  onCheckedChange={(checked) => handleInputChange('isUnit', checked)}
                />
                <Label htmlFor="isUnit">Является юнитом (может выходить на смену)</Label>
              </div>
              
              {formData.isUnit && (
                <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                  <h4 className="font-medium">Информация о юните</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="badgeNumber">Номер жетона</Label>
                      <Input
                        id="badgeNumber"
                        value={formData.unitInfo?.badgeNumber || ''}
                        onChange={(e) => handleInputChange('unitInfo', {
                          ...formData.unitInfo,
                          badgeNumber: e.target.value
                        })}
                        placeholder="Номер жетона"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="rank">Звание</Label>
                      <Input
                        id="rank"
                        value={formData.unitInfo?.rank || ''}
                        onChange={(e) => handleInputChange('unitInfo', {
                          ...formData.unitInfo,
                          rank: e.target.value
                        })}
                        placeholder="Звание"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="division">Подразделение</Label>
                    <Input
                      id="division"
                      value={formData.unitInfo?.division || ''}
                      onChange={(e) => handleInputChange('unitInfo', {
                        ...formData.unitInfo,
                        division: e.target.value
                      })}
                      placeholder="Подразделение"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Фото */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Фото</h3>
            
            <div>
              <Label htmlFor="mugshotUrl">URL фотографии</Label>
              <Input
                id="mugshotUrl"
                type="url"
                value={formData.mugshotUrl || ''}
                onChange={(e) => handleInputChange('mugshotUrl', e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Создание...' : 'Создать персонажа'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCharacterModal; 