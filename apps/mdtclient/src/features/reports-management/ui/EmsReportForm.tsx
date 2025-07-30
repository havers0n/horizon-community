import React, { useState } from 'react';
import { Button } from '@/shared/ui/atoms/Button';
import { Card } from '@/shared/ui/atoms/Card';
import { Modal } from '@/shared/ui/atoms/Modal';
import { FileText, PlusCircle, Stethoscope, Flame, Save, X, ArrowLeft } from 'lucide-react';
import { EmsReport, MedicalReportData, FireReportData } from '../model/types';
import { useReportsStore } from '../model/store';

interface EmsReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCall?: any; // TODO: Replace with proper call type
  onSave?: (report: EmsReport) => void;
}

export const EmsReportForm: React.FC<EmsReportFormProps> = ({
  isOpen,
  onClose,
  selectedCall,
  onSave
}) => {
  const { addReport } = useReportsStore();
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [reportType, setReportType] = useState<'medical' | 'fire' | 'rescue'>('medical');
  
  const [medicalData, setMedicalData] = useState<MedicalReportData>({
    patientName: selectedCall?.patientInfo?.name || '',
    incidentLocation: selectedCall?.location || '',
    incidentTime: selectedCall?.timestamp ? new Date(selectedCall.timestamp).toISOString().slice(0, 16) : '',
    incidentType: '',
    description: selectedCall?.description || '',
    treatmentProvided: '',
    medications: [],
    vitalSigns: {
      heartRate: selectedCall?.patientInfo?.vitalSigns?.heartRate || 0,
      bloodPressure: selectedCall?.patientInfo?.vitalSigns?.bloodPressure || '',
      temperature: selectedCall?.patientInfo?.vitalSigns?.temperature || 0,
      oxygenSaturation: selectedCall?.patientInfo?.vitalSigns?.oxygenSaturation || 0
    },
    outcome: '',
    disposition: ''
  });

  const [fireData, setFireData] = useState<FireReportData>({
    incidentLocation: selectedCall?.location || '',
    incidentTime: selectedCall?.timestamp ? new Date(selectedCall.timestamp).toISOString().slice(0, 16) : '',
    incidentType: '',
    description: selectedCall?.description || '',
    structureType: '',
    fireOrigin: '',
    damage: '',
    cause: '',
    outcome: '',
    evacuationRequired: false,
    hazards: []
  });

  const handleMedicalDataChange = (field: keyof MedicalReportData, value: any) => {
    setMedicalData(prev => ({ ...prev, [field]: value }));
  };

  const handleVitalSignsChange = (field: keyof MedicalReportData['vitalSigns'], value: any) => {
    setMedicalData(prev => ({
      ...prev,
      vitalSigns: { ...prev.vitalSigns, [field]: value }
    }));
  };

  const handleFireDataChange = (field: keyof FireReportData, value: any) => {
    setFireData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMedication = () => {
    const medication = prompt('Введите название медикамента:');
    if (medication) {
      setMedicalData(prev => ({
        ...prev,
        medications: [...prev.medications, medication]
      }));
    }
  };

  const handleRemoveMedication = (index: number) => {
    setMedicalData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleAddHazard = () => {
    const hazard = prompt('Введите тип опасности:');
    if (hazard) {
      setFireData(prev => ({
        ...prev,
        hazards: [...prev.hazards, hazard]
      }));
    }
  };

  const handleRemoveHazard = (index: number) => {
    setFireData(prev => ({
      ...prev,
      hazards: prev.hazards.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const reportData: EmsReport = {
      id: `report_${Date.now()}`,
      type: reportType,
      author: 'Current User', // TODO: Get from auth context
      authorId: 'current_user_id',
      callId: selectedCall?.id || '',
      incidentLocation: reportType === 'medical' ? medicalData.incidentLocation : fireData.incidentLocation,
      incidentTime: reportType === 'medical' ? medicalData.incidentTime : fireData.incidentTime,
      incidentType: reportType === 'medical' ? medicalData.incidentType : fireData.incidentType,
      description: reportType === 'medical' ? medicalData.description : fireData.description,
      outcome: reportType === 'medical' ? medicalData.outcome : fireData.outcome,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(reportType === 'medical' && {
        patientName: medicalData.patientName,
        treatmentProvided: medicalData.treatmentProvided,
        medications: medicalData.medications,
        vitalSigns: medicalData.vitalSigns,
        disposition: medicalData.disposition
      }),
      ...(reportType === 'fire' && {
        fireDetails: {
          structureType: fireData.structureType,
          fireOrigin: fireData.fireOrigin,
          damage: fireData.damage,
          cause: fireData.cause
        }
      })
    };

    addReport(reportData);
    if (onSave) {
      onSave(reportData);
    }
    onClose();
  };

  const renderTypeSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="secondary" size="sm" onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          Отмена
        </Button>
        <h3 className="text-lg font-semibold">Выберите тип отчета</h3>
      </div>
      
      <div className="grid gap-4">
        <div 
          className="p-4 border border-secondary-600 rounded-md hover:bg-secondary-800 cursor-pointer"
          onClick={() => {
            setReportType('medical');
            setStep('form');
          }}
        >
          <div className="flex items-center gap-3">
            <Stethoscope className="h-6 w-6 text-blue-400" />
            <div>
              <h4 className="font-semibold text-white">Медицинский отчет</h4>
              <p className="text-sm text-secondary-400">Отчет о медицинском инциденте</p>
            </div>
          </div>
        </div>
        
        <div 
          className="p-4 border border-secondary-600 rounded-md hover:bg-secondary-800 cursor-pointer"
          onClick={() => {
            setReportType('fire');
            setStep('form');
          }}
        >
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-red-400" />
            <div>
              <h4 className="font-semibold text-white">Пожарный отчет</h4>
              <p className="text-sm text-secondary-400">Отчет о пожаре</p>
            </div>
          </div>
        </div>
        
        <div 
          className="p-4 border border-secondary-600 rounded-md hover:bg-secondary-800 cursor-pointer"
          onClick={() => {
            setReportType('rescue');
            setStep('form');
          }}
        >
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-green-400" />
            <div>
              <h4 className="font-semibold text-white">Спасательный отчет</h4>
              <p className="text-sm text-secondary-400">Отчет о спасательной операции</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMedicalForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button type="button" variant="secondary" size="sm" onClick={() => setStep('type')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
        <h3 className="text-lg font-semibold">Медицинский отчет</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-300 mb-1">Имя пациента</label>
          <input
            type="text"
            value={medicalData.patientName}
            onChange={(e) => handleMedicalDataChange('patientName', e.target.value)}
            className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-300 mb-1">Место инцидента</label>
          <input
            type="text"
            value={medicalData.incidentLocation}
            onChange={(e) => handleMedicalDataChange('incidentLocation', e.target.value)}
            className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-300 mb-1">Время инцидента</label>
          <input
            type="datetime-local"
            value={medicalData.incidentTime}
            onChange={(e) => handleMedicalDataChange('incidentTime', e.target.value)}
            className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-300 mb-1">Тип инцидента</label>
          <select
            value={medicalData.incidentType}
            onChange={(e) => handleMedicalDataChange('incidentType', e.target.value)}
            className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
            required
          >
            <option value="">Выберите тип</option>
            <option value="cardiac_arrest">Остановка сердца</option>
            <option value="trauma">Травма</option>
            <option value="medical_emergency">Медицинская экстренная ситуация</option>
            <option value="respiratory_distress">Дыхательная недостаточность</option>
            <option value="stroke">Инсульт</option>
            <option value="overdose">Передозировка</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-300 mb-1">Описание</label>
        <textarea
          value={medicalData.description}
          onChange={(e) => handleMedicalDataChange('description', e.target.value)}
          rows={3}
          className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-300 mb-1">Оказанное лечение</label>
        <textarea
          value={medicalData.treatmentProvided}
          onChange={(e) => handleMedicalDataChange('treatmentProvided', e.target.value)}
          rows={3}
          className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-secondary-300">Медикаменты</label>
          <Button type="button" variant="secondary" size="sm" onClick={handleAddMedication}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить
          </Button>
        </div>
        <div className="space-y-2">
          {medicalData.medications.map((med, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={med}
                readOnly
                className="flex-1 bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
              />
              <Button 
                type="button" 
                variant="danger" 
                size="sm"
                onClick={() => handleRemoveMedication(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <div className="p-4 space-y-4">
          <h4 className="font-semibold">Жизненные показатели</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">Пульс (уд/мин)</label>
              <input
                type="number"
                value={medicalData.vitalSigns.heartRate}
                onChange={(e) => handleVitalSignsChange('heartRate', parseInt(e.target.value) || 0)}
                className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">Давление</label>
              <input
                type="text"
                value={medicalData.vitalSigns.bloodPressure}
                onChange={(e) => handleVitalSignsChange('bloodPressure', e.target.value)}
                placeholder="120/80"
                className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">Температура (°C)</label>
              <input
                type="number"
                step="0.1"
                value={medicalData.vitalSigns.temperature}
                onChange={(e) => handleVitalSignsChange('temperature', parseFloat(e.target.value) || 0)}
                className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">Сатурация (%)</label>
              <input
                type="number"
                value={medicalData.vitalSigns.oxygenSaturation}
                onChange={(e) => handleVitalSignsChange('oxygenSaturation', parseInt(e.target.value) || 0)}
                className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-300 mb-1">Исход</label>
          <select
            value={medicalData.outcome}
            onChange={(e) => handleMedicalDataChange('outcome', e.target.value)}
            className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
            required
          >
            <option value="">Выберите исход</option>
            <option value="stable">Стабильное состояние</option>
            <option value="critical">Критическое состояние</option>
            <option value="deceased">Летальный исход</option>
            <option value="recovered">Выздоровление</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-300 mb-1">Расположение</label>
          <select
            value={medicalData.disposition}
            onChange={(e) => handleMedicalDataChange('disposition', e.target.value)}
            className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
            required
          >
            <option value="">Выберите расположение</option>
            <option value="hospital">Госпитализация</option>
            <option value="released">Выписан</option>
            <option value="transferred">Переведен</option>
            <option value="refused">Отказался от помощи</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          Сохранить отчет
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          Отмена
        </Button>
      </div>
    </form>
  );

  const renderFireForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button type="button" variant="secondary" size="sm" onClick={() => setStep('type')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
        <h3 className="text-lg font-semibold">Пожарный отчет</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-300 mb-1">Место пожара</label>
          <input
            type="text"
            value={fireData.incidentLocation}
            onChange={(e) => handleFireDataChange('incidentLocation', e.target.value)}
            className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-300 mb-1">Время пожара</label>
          <input
            type="datetime-local"
            value={fireData.incidentTime}
            onChange={(e) => handleFireDataChange('incidentTime', e.target.value)}
            className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-300 mb-1">Тип пожара</label>
          <select
            value={fireData.incidentType}
            onChange={(e) => handleFireDataChange('incidentType', e.target.value)}
            className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
            required
          >
            <option value="">Выберите тип</option>
            <option value="structure_fire">Пожар в здании</option>
            <option value="vehicle_fire">Пожар транспортного средства</option>
            <option value="wildfire">Лесной пожар</option>
            <option value="electrical_fire">Электрический пожар</option>
            <option value="chemical_fire">Химический пожар</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-300 mb-1">Тип конструкции</label>
          <select
            value={fireData.structureType}
            onChange={(e) => handleFireDataChange('structureType', e.target.value)}
            className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
            required
          >
            <option value="">Выберите тип</option>
            <option value="residential">Жилой дом</option>
            <option value="commercial">Коммерческое здание</option>
            <option value="industrial">Промышленное здание</option>
            <option value="vehicle">Транспортное средство</option>
            <option value="other">Другое</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-300 mb-1">Описание</label>
        <textarea
          value={fireData.description}
          onChange={(e) => handleFireDataChange('description', e.target.value)}
          rows={3}
          className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-300 mb-1">Место возникновения</label>
          <input
            type="text"
            value={fireData.fireOrigin}
            onChange={(e) => handleFireDataChange('fireOrigin', e.target.value)}
            className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-300 mb-1">Причина</label>
          <input
            type="text"
            value={fireData.cause}
            onChange={(e) => handleFireDataChange('cause', e.target.value)}
            className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-300 mb-1">Ущерб</label>
        <textarea
          value={fireData.damage}
          onChange={(e) => handleFireDataChange('damage', e.target.value)}
          rows={3}
          className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-secondary-300">Опасности</label>
          <Button type="button" variant="secondary" size="sm" onClick={handleAddHazard}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить
          </Button>
        </div>
        <div className="space-y-2">
          {fireData.hazards.map((hazard, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={hazard}
                readOnly
                className="flex-1 bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
              />
              <Button 
                type="button" 
                variant="danger" 
                size="sm"
                onClick={() => handleRemoveHazard(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="evacuationRequired"
          checked={fireData.evacuationRequired}
          onChange={(e) => handleFireDataChange('evacuationRequired', e.target.checked)}
          className="rounded border-secondary-600 bg-secondary-700"
        />
        <label htmlFor="evacuationRequired" className="text-sm font-medium text-secondary-300">
          Требовалась эвакуация
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-300 mb-1">Исход</label>
        <select
          value={fireData.outcome}
          onChange={(e) => handleFireDataChange('outcome', e.target.value)}
          className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white"
          required
        >
          <option value="">Выберите исход</option>
          <option value="contained">Пожар локализован</option>
          <option value="extinguished">Пожар потушен</option>
          <option value="controlled">Пожар под контролем</option>
          <option value="spreading">Пожар распространяется</option>
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          Сохранить отчет
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          Отмена
        </Button>
      </div>
    </form>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Создание отчета EMS">
      <div className="max-h-[80vh] overflow-y-auto">
        {step === 'type' && renderTypeSelection()}
        {step === 'form' && reportType === 'medical' && renderMedicalForm()}
        {step === 'form' && (reportType === 'fire' || reportType === 'rescue') && renderFireForm()}
      </div>
    </Modal>
  );
}; 
