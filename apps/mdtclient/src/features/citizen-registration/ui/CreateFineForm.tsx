import React, { useState } from 'react';
import { Button } from '@/shared/ui/atoms';
import type { LegalRecord } from '../model/types';

interface CreateFineFormProps {
    onSubmit: (fine: LegalRecord) => void;
    onClose: () => void;
}

export const CreateFineForm: React.FC<CreateFineFormProps> = ({ onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        amount: '',
        reason: '',
        date: new Date().toISOString().split('T')[0],
        officer: '',
        location: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fine: LegalRecord = {
            id: `record_${Date.now()}`,
            type: 'Штраф',
            description: `Штраф $${formData.amount} - ${formData.reason}`,
            date: formData.date,
            amount: formData.amount,
            reason: formData.reason,
            officer: formData.officer,
            location: formData.location,
        };
        onSubmit(fine);
    };

    const inputClass = "w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Сумма штрафа ($)</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Причина</label>
                <textarea name="reason" value={formData.reason} onChange={handleChange} rows={3} className={inputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Дата</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Офицер</label>
                <input type="text" name="officer" value={formData.officer} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Место</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} required />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
                <Button type="submit">Создать штраф</Button>
            </div>
        </form>
    );
};
