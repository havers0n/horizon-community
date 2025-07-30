import React from 'react';
import { Card, CardHeader, Button } from '../../../shared/ui/atoms';
import { useLocale } from '@/shared/contexts/LocaleContext';

interface CompanyDetailsModalProps {
    company: any;
    onClose: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({ company, onClose, onEdit, onDelete }) => {
    const { t } = useLocale();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'text-green-400';
            case 'inactive':
                return 'text-red-400';
            case 'pending':
                return 'text-yellow-400';
            default:
                return 'text-secondary-300';
        }
    };

    const getCompanyTypeLabel = (type: string) => {
        const types: { [key: string]: string } = {
            corporation: 'Корпорация',
            llc: 'ООО',
            partnership: 'Партнерство',
            sole_proprietorship: 'ИП',
            nonprofit: 'Некоммерческая организация',
            government: 'Государственная организация'
        };
        return types[type] || type;
    };

    const getIndustryLabel = (industry: string) => {
        const industries: { [key: string]: string } = {
            technology: 'Технологии',
            healthcare: 'Здравоохранение',
            finance: 'Финансы',
            retail: 'Розничная торговля',
            manufacturing: 'Производство',
            construction: 'Строительство',
            transportation: 'Транспорт',
            education: 'Образование',
            entertainment: 'Развлечения',
            food: 'Пищевая промышленность',
            automotive: 'Автомобильная промышленность',
            energy: 'Энергетика',
            real_estate: 'Недвижимость',
            legal: 'Юридические услуги',
            consulting: 'Консалтинг',
            other: 'Другое'
        };
        return industries[industry] || industry;
    };

    const getPositionLabel = (position: string) => {
        const positions: { [key: string]: string } = {
            ceo: 'Генеральный директор',
            manager: 'Менеджер',
            employee: 'Сотрудник',
            intern: 'Стажер',
            consultant: 'Консультант',
            director: 'Директор',
            supervisor: 'Руководитель',
            specialist: 'Специалист',
            assistant: 'Ассистент',
            other: 'Другое'
        };
        return positions[position] || position;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <CardHeader>{t('companies.companyDetails')}</CardHeader>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.companyName')}
                            </label>
                            <p className="text-white">{company.companyName}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.status')}
                            </label>
                            <p className={`${getStatusColor(company.status)} font-medium`}>
                                {t(`companies.${company.status}`)}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.companyType')}
                            </label>
                            <p className="text-white">{getCompanyTypeLabel(company.companyType)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.industry')}
                            </label>
                            <p className="text-white">{getIndustryLabel(company.industry)}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-200 mb-1">
                            {t('companies.description')}
                        </label>
                        <p className="text-white bg-secondary-800 p-3 rounded-md">{company.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.address')}
                            </label>
                            <p className="text-white">{company.address}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.phone')}
                            </label>
                            <p className="text-white">{company.phone}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.email')}
                            </label>
                            <p className="text-white">{company.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.website')}
                            </label>
                            <p className="text-white">{company.website}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.dateCreated')}
                            </label>
                            <p className="text-white">{formatDate(company.dateCreated)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('companies.employees')}
                            </label>
                            <p className="text-white">{company.employees || 0}</p>
                        </div>
                    </div>

                    <div className="flex justify-between pt-4">
                        <div className="flex gap-2">
                            {onEdit && (
                                <Button
                                    onClick={onEdit}
                                    variant="secondary"
                                >
                                    {t('companies.editCompany')}
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    onClick={onDelete}
                                    variant="secondary"
                                    className="text-red-400 hover:text-red-300"
                                >
                                    {t('companies.deleteCompany')}
                                </Button>
                            )}
                        </div>
                        <Button
                            onClick={onClose}
                        >
                            {t('common.close')}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CompanyDetailsModal;
