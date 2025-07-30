import React, { useEffect } from 'react';
import { Card, CardHeader, Button } from '@/shared/ui/atoms';
import { Building, Plus, Briefcase, Eye, Trash2 } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { companyManagementStore } from '../model/companyManagementStore';
import { CreateCompanyForm } from './CreateCompanyForm';
import { WorkInCompanyForm } from './WorkInCompanyForm';
import { CompanyDetailsModal } from './CompanyDetailsModal';
import type { Company } from '../model/types';

export const CompanyManagementWidget: React.FC = () => {
    const { t } = useLocale();
    const {
        companies,
        selectedCompany,
        isLoading,
        error,
        showCreateModal,
        showWorkModal,
        showDetailsModal,
        createCompany,
        workInCompany,
        deleteCompany,
        selectCompany,
        setShowCreateModal,
        setShowWorkModal,
        setShowDetailsModal,
        loadCompanies,
    } = companyManagementStore();

    useEffect(() => {
        loadCompanies();
    }, [loadCompanies]);

    const handleCreateCompany = async (data: any) => {
        await createCompany(data);
    };

    const handleWorkInCompany = async (data: any) => {
        await workInCompany(data);
    };

    const handleViewDetails = (company: Company) => {
        selectCompany(company);
        setShowDetailsModal(true);
    };

    const handleCloseDetails = () => {
        setShowDetailsModal(false);
        selectCompany(null);
    };

    const handleDeleteCompany = async (companyId: string) => {
        await deleteCompany(companyId);
        setShowDetailsModal(false);
        selectCompany(null);
    };

    const getIndustryLabel = (industry: string) => {
        const labels: Record<string, string> = {
            technology: 'Технологии',
            healthcare: 'Здравоохранение',
            finance: 'Финансы',
            retail: 'Розничная торговля',
            manufacturing: 'Производство',
            transportation: 'Транспорт',
            education: 'Образование',
            entertainment: 'Развлечения',
        };
        return labels[industry] || industry;
    };

    const getCompanyTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            corporation: 'Корпорация',
            llc: 'ООО',
            partnership: 'Партнерство',
            sole_proprietorship: 'ИП',
        };
        return labels[type] || type;
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-white">Управление компаниями</h3>
                </CardHeader>
                <div className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-secondary-700 rounded w-3/4"></div>
                        <div className="h-4 bg-secondary-700 rounded w-1/2"></div>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Building className="w-6 h-6 text-primary-500" />
                        <h3 className="text-lg font-semibold text-white">Управление компаниями</h3>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setShowWorkModal(true)} variant="outline" size="sm">
                            <Briefcase className="w-4 h-4 mr-2" />
                            Трудоустройство
                        </Button>
                        <Button onClick={() => setShowCreateModal(true)} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Создать компанию
                        </Button>
                    </div>
                </CardHeader>
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                    
                    {companies.length === 0 ? (
                        <div className="text-center py-8">
                            <Building className="w-12 h-12 text-secondary-500 mx-auto mb-4" />
                            <p className="text-secondary-400">Компании не найдены</p>
                            <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                                Создать первую компанию
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {companies.map((company) => (
                                <Card key={company.id} className="hover:bg-secondary-800 transition-colors">
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-semibold text-white">{company.name}</h4>
                                                <p className="text-sm text-secondary-400">
                                                    {getIndustryLabel(company.industry)} • {getCompanyTypeLabel(company.type)}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(company)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteCompany(company.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-secondary-400">Сотрудники:</span>
                                                <span className="text-white">{company.employees}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-secondary-400">CEO:</span>
                                                <span className="text-white">{company.ceo}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-secondary-400">Статус:</span>
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    company.status === 'active' 
                                                        ? 'bg-green-500/20 text-green-400' 
                                                        : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {company.status === 'active' ? 'Активна' : 'Неактивна'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            {/* Модальные окна */}
            {showCreateModal && (
                <CreateCompanyForm
                    onSubmit={handleCreateCompany}
                    onClose={() => setShowCreateModal(false)}
                />
            )}

            {showWorkModal && (
                <WorkInCompanyForm
                    companies={companies}
                    onSubmit={handleWorkInCompany}
                    onClose={() => setShowWorkModal(false)}
                />
            )}

            {showDetailsModal && selectedCompany && (
                <CompanyDetailsModal
                    company={selectedCompany}
                    onClose={handleCloseDetails}
                    onDelete={handleDeleteCompany}
                />
            )}
        </div>
    );
};
