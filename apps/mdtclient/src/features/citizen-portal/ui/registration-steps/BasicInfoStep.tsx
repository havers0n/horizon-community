import React from 'react';
import { Input } from '@/shared/ui/atoms';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/atoms';
import { DataGenerator } from '@/shared/utils/dataGeneration';

interface BasicInfoStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ formData, updateFormData }) => {
  const handleGeneratePhone = () => {
    updateFormData({ phoneNumber: DataGenerator.generatePhoneNumber() });
  };

  const handleGenerateAddress = async () => {
    if (formData.postal) {
      const address = await DataGenerator.generateAddressFromPostal(formData.postal);
      updateFormData({ address });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Основная информация</h3>
        <p className="text-slate-400 mb-6">
          Заполните основную информацию о персонаже
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Имя и фамилия */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Имя *
          </label>
          <Input
            value={formData.firstName}
            onChange={(e) => updateFormData({ firstName: e.target.value })}
            placeholder="Введите имя"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Фамилия *
          </label>
          <Input
            value={formData.lastName}
            onChange={(e) => updateFormData({ lastName: e.target.value })}
            placeholder="Введите фамилию"
            required
          />
        </div>

        {/* Дата рождения */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Дата рождения *
          </label>
          <Input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
            required
          />
        </div>

        {/* Пол */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Пол
          </label>
          <Select
            value={formData.gender}
            onValueChange={(value) => updateFormData({ gender: value })}
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

        {/* Этническая принадлежность */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Этническая принадлежность
          </label>
          <Select
            value={formData.ethnicity}
            onValueChange={(value) => updateFormData({ ethnicity: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите этническую принадлежность" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="caucasian">Европеоидная</SelectItem>
              <SelectItem value="african">Негроидная</SelectItem>
              <SelectItem value="asian">Монголоидная</SelectItem>
              <SelectItem value="hispanic">Латиноамериканская</SelectItem>
              <SelectItem value="middle_eastern">Ближневосточная</SelectItem>
              <SelectItem value="mixed">Смешанная</SelectItem>
              <SelectItem value="other">Другая</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Рост */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Рост (см)
          </label>
          <Input
            type="number"
            value={formData.height}
            onChange={(e) => updateFormData({ height: e.target.value })}
            placeholder="170"
            min="100"
            max="250"
          />
        </div>

        {/* Вес */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Вес (кг)
          </label>
          <Input
            type="number"
            value={formData.weight}
            onChange={(e) => updateFormData({ weight: e.target.value })}
            placeholder="70"
            min="30"
            max="200"
          />
        </div>

        {/* Цвет волос */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Цвет волос
          </label>
          <Select
            value={formData.hairColor}
            onValueChange={(value) => updateFormData({ hairColor: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите цвет волос" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="black">Чёрный</SelectItem>
              <SelectItem value="brown">Коричневый</SelectItem>
              <SelectItem value="blonde">Светлый</SelectItem>
              <SelectItem value="red">Рыжий</SelectItem>
              <SelectItem value="gray">Седой</SelectItem>
              <SelectItem value="white">Белый</SelectItem>
              <SelectItem value="other">Другой</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Цвет глаз */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Цвет глаз
          </label>
          <Select
            value={formData.eyeColor}
            onValueChange={(value) => updateFormData({ eyeColor: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите цвет глаз" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brown">Коричневый</SelectItem>
              <SelectItem value="blue">Голубой</SelectItem>
              <SelectItem value="green">Зелёный</SelectItem>
              <SelectItem value="hazel">Ореховый</SelectItem>
              <SelectItem value="gray">Серый</SelectItem>
              <SelectItem value="other">Другой</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Телефон */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Номер телефона
          </label>
          <div className="flex gap-2">
            <Input
              value={formData.phoneNumber}
              onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
              placeholder="+1-555-123-4567"
            />
            <button
              type="button"
              onClick={handleGeneratePhone}
              className="px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
            >
              Генерировать
            </button>
          </div>
        </div>

        {/* Почтовый индекс */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Почтовый индекс
          </label>
          <Input
            value={formData.postal}
            onChange={(e) => updateFormData({ postal: e.target.value })}
            placeholder="90210"
            maxLength={5}
          />
        </div>

        {/* Адрес */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Адрес
          </label>
          <div className="flex gap-2">
            <Input
              value={formData.address}
              onChange={(e) => updateFormData({ address: e.target.value })}
              placeholder="Введите адрес"
              className="flex-1"
            />
            <button
              type="button"
              onClick={handleGenerateAddress}
              disabled={!formData.postal}
              className="px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Генерировать
            </button>
          </div>
        </div>

        {/* Профессия */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Профессия
          </label>
          <Input
            value={formData.occupation}
            onChange={(e) => updateFormData({ occupation: e.target.value })}
            placeholder="Введите профессию"
          />
        </div>
      </div>
    </div>
  );
}; 