import React from 'react';
import { Input } from '@/shared/ui/atoms';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/atoms';
import { Checkbox } from '@/shared/ui/atoms';
import { DataGenerator } from '@/shared/utils/dataGeneration';

interface PropertyStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export const PropertyStep: React.FC<PropertyStepProps> = ({ formData, updateFormData }) => {
  const vehicles = formData.vehicles || [];
  const weapons = formData.weapons || [];

  const addVehicle = () => {
    const newVehicle = {
      id: Date.now().toString(),
      plate: '',
      vin: '',
      model: '',
      make: '',
      year: '',
      color: '',
      bodyType: '',
      mileage: '',
      engineSize: '',
      registration: 'valid',
      insurance: 'valid',
      stolen: false,
    };
    updateFormData({ vehicles: [...vehicles, newVehicle] });
  };

  const updateVehicle = (index: number, field: string, value: any) => {
    const updatedVehicles = [...vehicles];
    updatedVehicles[index] = { ...updatedVehicles[index], [field]: value };
    updateFormData({ vehicles: updatedVehicles });
  };

  const removeVehicle = (index: number) => {
    const updatedVehicles = vehicles.filter((_: any, i: number) => i !== index);
    updateFormData({ vehicles: updatedVehicles });
  };

  const addWeapon = () => {
    const newWeapon = {
      id: Date.now().toString(),
      serialNumber: '',
      model: '',
      type: '',
      caliber: '',
      status: 'registered',
      registrationDate: new Date().toISOString().split('T')[0],
      notes: '',
    };
    updateFormData({ weapons: [...weapons, newWeapon] });
  };

  const updateWeapon = (index: number, field: string, value: any) => {
    const updatedWeapons = [...weapons];
    updatedWeapons[index] = { ...updatedWeapons[index], [field]: value };
    updateFormData({ weapons: updatedWeapons });
  };

  const removeWeapon = (index: number) => {
    const updatedWeapons = weapons.filter((_: any, i: number) => i !== index);
    updateFormData({ weapons: updatedWeapons });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Транспорт и оружие</h3>
        <p className="text-slate-400 mb-6">
          Укажите транспортные средства и оружие, принадлежащие персонажу
        </p>
      </div>

      {/* Транспортные средства */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-white">Транспортные средства</h4>
          <button
            type="button"
            onClick={addVehicle}
            className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
          >
            Добавить транспорт
          </button>
        </div>

        {vehicles.length === 0 && (
          <p className="text-slate-400 text-center py-8">
            Транспортные средства не добавлены
          </p>
        )}

        {vehicles.map((vehicle: any, index: number) => (
          <div key={vehicle.id} className="border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-sm font-medium text-white">
                Транспорт #{index + 1}
              </h5>
              <button
                type="button"
                onClick={() => removeVehicle(index)}
                className="text-red-400 hover:text-red-300"
              >
                Удалить
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Номер */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Номер *
                </label>
                <div className="flex gap-2">
                  <Input
                    value={vehicle.plate}
                    onChange={(e) => updateVehicle(index, 'plate', e.target.value)}
                    placeholder="ABC 123"
                  />
                  <button
                    type="button"
                    onClick={() => updateVehicle(index, 'plate', DataGenerator.generatePlateNumber())}
                    className="px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
                  >
                    Генерировать
                  </button>
                </div>
              </div>

              {/* VIN */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  VIN *
                </label>
                <div className="flex gap-2">
                  <Input
                    value={vehicle.vin}
                    onChange={(e) => updateVehicle(index, 'vin', e.target.value)}
                    placeholder="1HGBH41JXMN109186"
                  />
                  <button
                    type="button"
                    onClick={() => updateVehicle(index, 'vin', DataGenerator.generateVIN())}
                    className="px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
                  >
                    Генерировать
                  </button>
                </div>
              </div>

              {/* Марка */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Марка
                </label>
                <Select
                  value={vehicle.make}
                  onValueChange={(value) => updateVehicle(index, 'make', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите марку" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BMW">BMW</SelectItem>
                    <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                    <SelectItem value="Audi">Audi</SelectItem>
                    <SelectItem value="Toyota">Toyota</SelectItem>
                    <SelectItem value="Honda">Honda</SelectItem>
                    <SelectItem value="Ford">Ford</SelectItem>
                    <SelectItem value="Chevrolet">Chevrolet</SelectItem>
                    <SelectItem value="Dodge">Dodge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Модель */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Модель *
                </label>
                <Input
                  value={vehicle.model}
                  onChange={(e) => updateVehicle(index, 'model', e.target.value)}
                  placeholder="Введите модель"
                />
              </div>

              {/* Год */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Год
                </label>
                <Input
                  type="number"
                  value={vehicle.year}
                  onChange={(e) => updateVehicle(index, 'year', e.target.value)}
                  placeholder="2020"
                  min="1900"
                  max="2024"
                />
              </div>

              {/* Цвет */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Цвет
                </label>
                <Select
                  value={vehicle.color}
                  onValueChange={(value) => updateVehicle(index, 'color', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите цвет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Red">Красный</SelectItem>
                    <SelectItem value="Blue">Синий</SelectItem>
                    <SelectItem value="Green">Зелёный</SelectItem>
                    <SelectItem value="Black">Чёрный</SelectItem>
                    <SelectItem value="White">Белый</SelectItem>
                    <SelectItem value="Silver">Серебристый</SelectItem>
                    <SelectItem value="Gray">Серый</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Регистрация */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Регистрация
                </label>
                <Select
                  value={vehicle.registration}
                  onValueChange={(value) => updateVehicle(index, 'registration', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="valid">Действительна</SelectItem>
                    <SelectItem value="invalid">Недействительна</SelectItem>
                    <SelectItem value="expired">Истекла</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Страховка */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Страховка
                </label>
                <Select
                  value={vehicle.insurance}
                  onValueChange={(value) => updateVehicle(index, 'insurance', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="valid">Действительна</SelectItem>
                    <SelectItem value="invalid">Недействительна</SelectItem>
                    <SelectItem value="expired">Истекла</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Угнан */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`stolen_${vehicle.id}`}
                  checked={vehicle.stolen || false}
                  onCheckedChange={(checked) => updateVehicle(index, 'stolen', checked)}
                />
                <label htmlFor={`stolen_${vehicle.id}`} className="text-sm text-slate-300">
                  Угнан
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Оружие */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-white">Оружие</h4>
          <button
            type="button"
            onClick={addWeapon}
            className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
          >
            Добавить оружие
          </button>
        </div>

        {weapons.length === 0 && (
          <p className="text-slate-400 text-center py-8">
            Оружие не добавлено
          </p>
        )}

        {weapons.map((weapon: any, index: number) => (
          <div key={weapon.id} className="border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-sm font-medium text-white">
                Оружие #{index + 1}
              </h5>
              <button
                type="button"
                onClick={() => removeWeapon(index)}
                className="text-red-400 hover:text-red-300"
              >
                Удалить
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Серийный номер */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Серийный номер *
                </label>
                <div className="flex gap-2">
                  <Input
                    value={weapon.serialNumber}
                    onChange={(e) => updateWeapon(index, 'serialNumber', e.target.value)}
                    placeholder="ABC12345"
                  />
                  <button
                    type="button"
                    onClick={() => updateWeapon(index, 'serialNumber', DataGenerator.generateSerialNumber())}
                    className="px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
                  >
                    Генерировать
                  </button>
                </div>
              </div>

              {/* Модель */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Модель *
                </label>
                <Input
                  value={weapon.model}
                  onChange={(e) => updateWeapon(index, 'model', e.target.value)}
                  placeholder="Введите модель"
                />
              </div>

              {/* Тип */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Тип
                </label>
                <Select
                  value={weapon.type}
                  onValueChange={(value) => updateWeapon(index, 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pistol">Пистолет</SelectItem>
                    <SelectItem value="Revolver">Револьвер</SelectItem>
                    <SelectItem value="Rifle">Винтовка</SelectItem>
                    <SelectItem value="Shotgun">Дробовик</SelectItem>
                    <SelectItem value="SMG">Пистолет-пулемёт</SelectItem>
                    <SelectItem value="Assault Rifle">Штурмовая винтовка</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Калибр */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Калибр
                </label>
                <Select
                  value={weapon.caliber}
                  onValueChange={(value) => updateWeapon(index, 'caliber', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите калибр" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9mm">9mm</SelectItem>
                    <SelectItem value=".45 ACP">.45 ACP</SelectItem>
                    <SelectItem value=".40 S&W">.40 S&W</SelectItem>
                    <SelectItem value=".38 Special">.38 Special</SelectItem>
                    <SelectItem value=".357 Magnum">.357 Magnum</SelectItem>
                    <SelectItem value=".223 Remington">.223 Remington</SelectItem>
                    <SelectItem value=".308 Winchester">.308 Winchester</SelectItem>
                    <SelectItem value="12 Gauge">12 Gauge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Статус */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Статус
                </label>
                <Select
                  value={weapon.status}
                  onValueChange={(value) => updateWeapon(index, 'status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="registered">Зарегистрировано</SelectItem>
                    <SelectItem value="stolen">Украдено</SelectItem>
                    <SelectItem value="confiscated">Конфисковано</SelectItem>
                    <SelectItem value="illegal">Нелегальное</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Дата регистрации */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Дата регистрации
                </label>
                <Input
                  type="date"
                  value={weapon.registrationDate}
                  onChange={(e) => updateWeapon(index, 'registrationDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 