// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useState } from 'react';
import { Button } from '@/shared/ui/atoms';
import type { LegalRecord } from '../model/types';

interface CreateArrestFormProps {
    onSubmit: (arrest: LegalRecord) => void;
    onClose: () => void;
}

export const CreateArrestForm: React.FC<CreateArrestFormProps> = ({ onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        charges: '',
        date: new Date().toISOString().split('T')[0],
        officer: '',
        location: '',
        description: '',
        jailTime: '',
        bail: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const arrest: LegalRecord = {
            id: `record_${Date.now()}`,
            type: 'Отчёт об аресте',
            description: formData.description || `Арест за: ${formData.charges}`,
            date: formData.date,
            charges: formData.charges,
            officer: formData.officer,
            location: formData.location,
            jailTime: formData.jailTime,
            bail: formData.bail,
        };
        onSubmit(arrest);
    };

    const inputClass = "w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Обвинения</label>
                <input type="text" name="charges" value={formData.charges} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Описание ареста</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClass} />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Дата ареста</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Офицер</label>
                <input type="text" name="officer" value={formData.officer} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Место ареста</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Срок заключения (дни)</label>
                <input type="number" name="jailTime" value={formData.jailTime} onChange={handleChange} className={inputClass} />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Залог ($)</label>
                <input type="number" name="bail" value={formData.bail} onChange={handleChange} className={inputClass} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
                <Button type="submit">Создать отчёт</Button>
            </div>
        </form>
    );
};
