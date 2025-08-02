import React from 'react';
import { Input } from '@/shared/ui/atoms';
import { Textarea } from '@/shared/ui/atoms';
import { Checkbox } from '@/shared/ui/atoms';

interface AdditionalInfoStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export const AdditionalInfoStep: React.FC<AdditionalInfoStepProps> = ({ formData, updateFormData }) => {
  const handleFlagChange = (flag: string, checked: boolean) => {
    const currentFlags = formData.flags || [];
    const newFlags = checked 
      ? [...currentFlags, flag]
      : currentFlags.filter((f: string) => f !== flag);
    
    updateFormData({ flags: newFlags });
  };

  const handleAddressFlagChange = (flag: string, checked: boolean) => {
    const currentFlags = formData.addressFlags || [];
    const newFlags = checked 
      ? [...currentFlags, flag]
      : currentFlags.filter((f: string) => f !== flag);
    
    updateFormData({ addressFlags: newFlags });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Дополнительная информация</h3>
        <p className="text-slate-400 mb-6">
          Заполните дополнительную информацию о персонаже
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Email
          </label>
          <Input
            type="email"
            value={formData.email || ''}
            onChange={(e) => updateFormData({ email: e.target.value })}
            placeholder="example@email.com"
          />
        </div>

        {/* Дополнительный телефон */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Дополнительный телефон
          </label>
          <Input
            value={formData.additionalPhone || ''}
            onChange={(e) => updateFormData({ additionalPhone: e.target.value })}
            placeholder="+1-555-987-6543"
          />
        </div>

        {/* Альтернативный адрес */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Альтернативный адрес
          </label>
          <Input
            value={formData.alternativeAddress || ''}
            onChange={(e) => updateFormData({ alternativeAddress: e.target.value })}
            placeholder="Введите альтернативный адрес"
          />
        </div>

        {/* Примечания */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Примечания
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData({ notes: e.target.value })}
            placeholder="Дополнительная информация о персонаже..."
            rows={4}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Флаги персонажа */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Флаги персонажа</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Checkbox
              id="dead"
              checked={formData.dead || false}
              onCheckedChange={(checked) => updateFormData({ dead: checked })}
            />
            <label htmlFor="dead" className="text-sm text-slate-300 ml-2">
              Умерший
            </label>

            <Checkbox
              id="missing"
              checked={formData.missing || false}
              onCheckedChange={(checked) => updateFormData({ missing: checked })}
            />
            <label htmlFor="missing" className="text-sm text-slate-300 ml-2">
              Пропавший без вести
            </label>

            <Checkbox
              id="arrested"
              checked={formData.arrested || false}
              onCheckedChange={(checked) => updateFormData({ arrested: checked })}
            />
            <label htmlFor="arrested" className="text-sm text-slate-300 ml-2">
              Арестован
            </label>
          </div>

          <div className="space-y-3">
            <Checkbox
              id="dangerous"
              checked={formData.flags?.includes('dangerous') || false}
              onCheckedChange={(checked) => handleFlagChange('dangerous', checked)}
            />
            <label htmlFor="dangerous" className="text-sm text-slate-300 ml-2">
              Опасный
            </label>

            <Checkbox
              id="armed"
              checked={formData.flags?.includes('armed') || false}
              onCheckedChange={(checked) => handleFlagChange('armed', checked)}
            />
            <label htmlFor="armed" className="text-sm text-slate-300 ml-2">
              Вооружённый
            </label>

            <Checkbox
              id="mentally_ill"
              checked={formData.flags?.includes('mentally_ill') || false}
              onCheckedChange={(checked) => handleFlagChange('mentally_ill', checked)}
            />
            <label htmlFor="mentally_ill" className="text-sm text-slate-300 ml-2">
              Психически нестабильный
            </label>
          </div>
        </div>
      </div>

      {/* Флаги адреса */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Флаги адреса</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Checkbox
              id="address_verified"
              checked={formData.addressFlags?.includes('verified') || false}
              onCheckedChange={(checked) => handleAddressFlagChange('verified', checked)}
            />
            <label htmlFor="address_verified" className="text-sm text-slate-300 ml-2">
              Адрес проверен
            </label>

            <Checkbox
              id="address_fake"
              checked={formData.addressFlags?.includes('fake') || false}
              onCheckedChange={(checked) => handleAddressFlagChange('fake', checked)}
            />
            <label htmlFor="address_fake" className="text-sm text-slate-300 ml-2">
              Фальшивый адрес
            </label>
          </div>

          <div className="space-y-3">
            <Checkbox
              id="address_homeless"
              checked={formData.addressFlags?.includes('homeless') || false}
              onCheckedChange={(checked) => handleAddressFlagChange('homeless', checked)}
            />
            <label htmlFor="address_homeless" className="text-sm text-slate-300 ml-2">
              Бездомный
            </label>

            <Checkbox
              id="address_temporary"
              checked={formData.addressFlags?.includes('temporary') || false}
              onCheckedChange={(checked) => handleAddressFlagChange('temporary', checked)}
            />
            <label htmlFor="address_temporary" className="text-sm text-slate-300 ml-2">
              Временный адрес
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}; 