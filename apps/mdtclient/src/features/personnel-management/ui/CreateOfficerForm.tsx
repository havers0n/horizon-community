import React, { useState } from 'react';
import { Card, CardHeader, Button } from '../../../shared/ui/atoms';
import { useLocale } from '@/shared/contexts/LocaleContext';

interface CreateOfficerFormProps {
    onSubmit: (officer: any) => void;
    onClose: () => void;
}

interface OfficerData {
    badgeNumber: string;
    callsignSymbol1: string;
    callsignSymbol2: string;
    department: string;
    subdivision: string;
}

const CreateOfficerForm: React.FC<CreateOfficerFormProps> = ({ onSubmit, onClose }) => {
    const { t } = useLocale();
    const [formData, setFormData] = useState<OfficerData>({
        badgeNumber: '',
        callsignSymbol1: '',
        callsignSymbol2: '',
        department: '',
        subdivision: ''
    });

    const generateBadgeNumber = () => {
        const randomNum = Math.floor(Math.random() * 9999) + 1000;
        setFormData(prev => ({
            ...prev,
            badgeNumber: randomNum.toString()
        }));
    };

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
            dateCreated: new Date().toISOString(),
            status: 'active'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <CardHeader>{t('officers.createOfficer')}</CardHeader>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('officers.badgeNumber')} *
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="badgeNumber"
                                    value={formData.badgeNumber}
                                    onChange={handleChange}
                                    className="flex-1 p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                    required
                                />
                                <Button
                                    type="button"
                                    onClick={generateBadgeNumber}
                                    variant="secondary"
                                    size="sm"
                                >
                                    {t('officers.generate')}
                                </Button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('officers.department')} *
                            </label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                required
                            >
                                <option value="">{t('common.select')}</option>
                                <option value="police">{t('departments.police')}</option>
                                <option value="sheriff">{t('departments.sheriff')}</option>
                                <option value="state">{t('departments.state')}</option>
                                <option value="fbi">{t('departments.fbi')}</option>
                                <option value="highway">{t('departments.highway')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('officers.callsignSymbol1')} *
                            </label>
                            <input
                                type="text"
                                name="callsignSymbol1"
                                value={formData.callsignSymbol1}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('officers.callsignSymbol2')} *
                            </label>
                            <input
                                type="text"
                                name="callsignSymbol2"
                                value={formData.callsignSymbol2}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-200 mb-1">
                            {t('officers.subdivision')} *
                        </label>
                        <select
                            name="subdivision"
                            value={formData.subdivision}
                            onChange={handleChange}
                            className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                            required
                        >
                            <option value="">{t('common.select')}</option>
                            <option value="patrol">{t('subdivisions.patrol')}</option>
                            <option value="detective">{t('subdivisions.detective')}</option>
                            <option value="traffic">{t('subdivisions.traffic')}</option>
                            <option value="swat">{t('subdivisions.swat')}</option>
                            <option value="k9">{t('subdivisions.k9')}</option>
                            <option value="narcotics">{t('subdivisions.narcotics')}</option>
                            <option value="internal_affairs">{t('subdivisions.internal_affairs')}</option>
                            <option value="community_service">{t('subdivisions.community_service')}</option>
                        </select>
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
                            {t('officers.createOfficer')}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CreateOfficerForm;
