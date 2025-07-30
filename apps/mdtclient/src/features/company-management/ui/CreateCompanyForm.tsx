import React, { useState } from 'react';
import { Card, CardHeader, Button } from '../../../shared/ui/atoms';
import { useLocale } from '@/shared/contexts/LocaleContext';

interface CreateCompanyFormProps {
    onSubmit: (company: any) => void;
    onClose: () => void;
}

interface CompanyData {
    companyName: string;
    companyType: string;
    industry: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    website: string;
}

const CreateCompanyForm: React.FC<CreateCompanyFormProps> = ({ onSubmit, onClose }) => {
    const { t } = useLocale();
    const [formData, setFormData] = useState<CompanyData>({
        companyName: '',
        companyType: '',
        industry: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        website: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
            dateCreated: new Date().toISOString(),
            status: 'active',
            employees: 0
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <CardHeader>{t('companies.createCompany')}</CardHeader>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.companyName')} *
                            </label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.companyType')} *
                            </label>
                            <select
                                name="companyType"
                                value={formData.companyType}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                required
                            >
                                <option value="">{t('common.select')}</option>
                                <option value="corporation">{t('companies.types.corporation')}</option>
                                <option value="llc">{t('companies.types.llc')}</option>
                                <option value="partnership">{t('companies.types.partnership')}</option>
                                <option value="sole_proprietorship">{t('companies.types.sole_proprietorship')}</option>
                                <option value="nonprofit">{t('companies.types.nonprofit')}</option>
                                <option value="government">{t('companies.types.government')}</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-200 mb-1">
                            {t('companies.industry')} *
                        </label>
                        <select
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                            className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                            required
                        >
                            <option value="">{t('common.select')}</option>
                            <option value="technology">{t('companies.industries.technology')}</option>
                            <option value="healthcare">{t('companies.industries.healthcare')}</option>
                            <option value="finance">{t('companies.industries.finance')}</option>
                            <option value="retail">{t('companies.industries.retail')}</option>
                            <option value="manufacturing">{t('companies.industries.manufacturing')}</option>
                            <option value="construction">{t('companies.industries.construction')}</option>
                            <option value="transportation">{t('companies.industries.transportation')}</option>
                            <option value="education">{t('companies.industries.education')}</option>
                            <option value="entertainment">{t('companies.industries.entertainment')}</option>
                            <option value="food">{t('companies.industries.food')}</option>
                            <option value="automotive">{t('companies.industries.automotive')}</option>
                            <option value="energy">{t('companies.industries.energy')}</option>
                            <option value="real_estate">{t('companies.industries.real_estate')}</option>
                            <option value="legal">{t('companies.industries.legal')}</option>
                            <option value="consulting">{t('companies.industries.consulting')}</option>
                            <option value="other">{t('companies.industries.other')}</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-200 mb-1">
                            {t('companies.description')} *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.address')} *
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.phone')} *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.email')} *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.website')}
                            </label>
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
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
                            {t('companies.createCompany')}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CreateCompanyForm;
