// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useState } from 'react';
import { Card, CardHeader, Button, Modal, Input, Select, Textarea, Checkbox } from '../../../shared/ui/atoms';
import { FileText, Car, Shield, Plus, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import { MOCK_PENAL_CODES, INCIDENT_TYPES } from '../model/constants';
import { useLawEnforcementStore } from '../model/store';
import type { LawReportFormData, LawReport } from '@/shared/types';

interface LawReportFormProps {
  onSubmit: (report: LawReport) => void;
  onClose: () => void;
}

export const LawReportForm: React.FC<LawReportFormProps> = ({ onSubmit, onClose }) => {
  const { t } = useLocale();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<LawReportFormData>({
    citizenName: '',
    incidentAddress: '',
    incidentTime: '',
    incidentType: '',
    penalCode: '',
    sanctionType: 'warning',
    description: '',
    seizedItems: [],
    suspectVehicle: undefined,
    suspectWeapon: undefined
  });

  const [newSeizedItem, setNewSeizedItem] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVehicleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      suspectVehicle: {
        ...prev.suspectVehicle,
        [field]: value
      } as any
    }));
  };

  const handleWeaponChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      suspectWeapon: {
        ...prev.suspectWeapon,
        [field]: value
      } as any
    }));
  };

  const addSeizedItem = () => {
    if (newSeizedItem.trim()) {
      setFormData(prev => ({
        ...prev,
        seizedItems: [...prev.seizedItems, newSeizedItem.trim()]
      }));
      setNewSeizedItem('');
    }
  };

  const removeSeizedItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      seizedItems: prev.seizedItems.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const report: LawReport = {
      id: `law_report_${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString(),
      author: user?.username || 'Unknown Officer'
    };
    
    onSubmit(report);
  };

  const nextPage = () => {
    if (currentPage < 2) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const isFirstPageValid = () => {
    return formData.citizenName && formData.incidentAddress && formData.incidentTime && 
           formData.incidentType && formData.penalCode && formData.description;
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Составить отчет">
      <form onSubmit={handleSubmit} className="space-y-6">
        {currentPage === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">
                Имя гражданского *
              </label>
              <Input
                type="text"
                name="citizenName"
                value={formData.citizenName}
                onChange={handleChange}
                placeholder="Введите полное имя"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">
                Адрес инцидента *
              </label>
              <Input
                type="text"
                name="incidentAddress"
                value={formData.incidentAddress}
                onChange={handleChange}
                placeholder="Введите адрес инцидента"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">
                Время инцидента *
              </label>
              <Input
                type="datetime-local"
                name="incidentTime"
                value={formData.incidentTime}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">
                Тип инцидента *
              </label>
              <Select
                name="incidentType"
                value={formData.incidentType}
                onChange={handleChange}
                required
              >
                <option value="">Выберите тип инцидента</option>
                {INCIDENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">
                Статья *
              </label>
              <Select
                name="penalCode"
                value={formData.penalCode}
                onChange={handleChange}
                required
              >
                <option value="">Выберите статью</option>
                {MOCK_PENAL_CODES.map(code => (
                  <option key={code.id} value={code.title}>
                    {code.title} - Штраф: ${code.fine}, Тюрьма: {code.jailTime} мин
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">
                Тип санкции *
              </label>
              <Select
                name="sanctionType"
                value={formData.sanctionType}
                onChange={handleChange}
                required
              >
                <option value="warning">Предупреждение</option>
                <option value="arrest">Арест</option>
                <option value="fine">Штраф</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">
                Краткое описание ситуации *
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Опишите детали инцидента"
                required
              />
            </div>
          </div>
        )}

        {currentPage === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">
                Транспорт подозреваемого (опционально)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="Номерной знак"
                  value={formData.suspectVehicle?.plate || ''}
                  onChange={(e) => handleVehicleChange('plate', e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Модель"
                  value={formData.suspectVehicle?.model || ''}
                  onChange={(e) => handleVehicleChange('model', e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Цвет"
                  value={formData.suspectVehicle?.color || ''}
                  onChange={(e) => handleVehicleChange('color', e.target.value)}
                />
              </div>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <Checkbox
                    checked={formData.suspectVehicle?.isImpounded || false}
                    onChange={(e) => handleVehicleChange('isImpounded', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-secondary-300">Эвакуирован</span>
                </label>
                <label className="flex items-center">
                  <Checkbox
                    checked={formData.suspectVehicle?.isStolen || false}
                    onChange={(e) => handleVehicleChange('isStolen', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-secondary-300">Угнанное транспортное средство</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">
                Изъятые вещи
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  value={newSeizedItem}
                  onChange={(e) => setNewSeizedItem(e.target.value)}
                  placeholder="Введите изъятый предмет"
                  className="flex-1"
                />
                <Button type="button" onClick={addSeizedItem} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {formData.seizedItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-secondary-800 p-2 rounded">
                    <span className="text-white">{item}</span>
                    <Button
                      type="button"
                      onClick={() => removeSeizedItem(index)}
                      variant="danger"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">
                Оружие подозреваемого (опционально)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="Серийный номер"
                  value={formData.suspectWeapon?.serialNumber || ''}
                  onChange={(e) => handleWeaponChange('serialNumber', e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Модель"
                  value={formData.suspectWeapon?.model || ''}
                  onChange={(e) => handleWeaponChange('model', e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Тип оружия"
                  value={formData.suspectWeapon?.type || ''}
                  onChange={(e) => handleWeaponChange('type', e.target.value)}
                />
              </div>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <Checkbox
                    checked={formData.suspectWeapon?.hasSerialNumber || false}
                    onChange={(e) => handleWeaponChange('hasSerialNumber', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-secondary-300">Имеет серийный номер</span>
                </label>
                <label className="flex items-center">
                  <Checkbox
                    checked={formData.suspectWeapon?.isRegistered || false}
                    onChange={(e) => handleWeaponChange('isRegistered', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-secondary-300">Зарегистрировано</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Button type="button" onClick={prevPage} variant="secondary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад
              </Button>
            )}
            <Button type="button" onClick={onClose} variant="secondary">
              Отмена
            </Button>
          </div>
          <div className="flex gap-2">
            {currentPage < 2 && (
              <Button 
                type="button" 
                onClick={nextPage} 
                disabled={!isFirstPageValid()}
              >
                Далее
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {currentPage === 2 && (
              <Button type="submit">
                <FileText className="mr-2 h-4 w-4" />
                Составить отчет
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
