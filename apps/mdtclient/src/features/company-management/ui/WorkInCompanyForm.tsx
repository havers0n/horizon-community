import React, { useState } from 'react';
import { Card, CardHeader, Button } from '../../../shared/ui/atoms';
import { useLocale } from '@/shared/contexts/LocaleContext';

interface WorkInCompanyFormProps {
    onSubmit: (employment: any) => void;
    onClose: () => void;
    companies: any[];
    characters: any[];
}

interface EmploymentData {
    companyId: string;
    characterId: string;
    position: string;
    startDate: string;
    salary: string;
    status: string;
}

const WorkInCompanyForm: React.FC<WorkInCompanyFormProps> = ({ onSubmit, onClose, companies, characters }) => {
    const { t } = useLocale();
    const [formData, setFormData] = useState<EmploymentData>({
        companyId: '',
        characterId: '',
        position: '',
        startDate: '',
        salary: '',
        status: 'active'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            id: Date.now().toString(),
            dateCreated: new Date().toISOString()
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <CardHeader>{t('companies.workInCompany')}</CardHeader>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.company')} *
                            </label>
                            <select
                                name="companyId"
                                value={formData.companyId}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                required
                            >
                                <option value="">{t('common.select')}</option>
                                {companies.map(company => (
                                    <option key={company.id} value={company.id}>
                                        {company.companyName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.character')} *
                            </label>
                            <select
                                name="characterId"
                                value={formData.characterId}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                required
                            >
                                <option value="">{t('common.select')}</option>
                                {characters.map(character => (
                                    <option key={character.id} value={character.id}>
                                        {character.firstName} {character.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.position')} *
                            </label>
                            <select
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                required
                            >
                                <option value="">{t('common.select')}</option>
                                <option value="ceo">{t('companies.positions.ceo')}</option>
                                <option value="manager">{t('companies.positions.manager')}</option>
                                <option value="employee">{t('companies.positions.employee')}</option>
                                <option value="intern">{t('companies.positions.intern')}</option>
                                <option value="consultant">{t('companies.positions.consultant')}</option>
                                <option value="director">{t('companies.positions.director')}</option>
                                <option value="supervisor">{t('companies.positions.supervisor')}</option>
                                <option value="specialist">{t('companies.positions.specialist')}</option>
                                <option value="assistant">{t('companies.positions.assistant')}</option>
                                <option value="other">{t('companies.positions.other')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.status')}
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                            >
                                <option value="active">{t('companies.statuses.active')}</option>
                                <option value="inactive">{t('companies.statuses.inactive')}</option>
                                <option value="suspended">{t('companies.statuses.suspended')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.startDate')} *
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.salary')} *
                            </label>
                            <input
                                type="number"
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="secondary"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit">
                            {t('companies.workInCompany')}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default WorkInCompanyForm;
