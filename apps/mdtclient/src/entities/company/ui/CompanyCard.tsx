// @ts-nocheck - TODO: Remove after major refactoring is complete
import React from 'react';
import { Company } from '@/shared/types';
import { Card, CardHeader, CardContent, CardTitle, Badge, Button } from '@/shared/ui/atoms';
import { Building2, Calendar, MapPin, User, Mail, Phone, Globe, Users, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

interface CompanyCardProps {
  company: Company;
  onViewDetails?: (company: Company) => void;
  onEdit?: (company: Company) => void;
  variant?: 'default' | 'compact';
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onViewDetails,
  onEdit,
  variant = 'default'
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'suspended': return 'warning';
      case 'dissolved': return 'destructive';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      corporation: 'Корпорация',
      llc: 'ООО',
      partnership: 'Партнерство',
      sole_proprietorship: 'ИП',
      non_profit: 'НКО',
      government: 'Госучреждение'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getIndustryLabel = (industry: string) => {
    const labels = {
      technology: 'Технологии',
      healthcare: 'Здравоохранение',
      finance: 'Финансы',
      retail: 'Розничная торговля',
      manufacturing: 'Производство',
      construction: 'Строительство',
      transportation: 'Транспорт',
      education: 'Образование',
      other: 'Другое'
    };
    return labels[industry as keyof typeof labels] || industry;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-sm">{company.name}</h3>
                <p className="text-xs text-gray-600">{getIndustryLabel(company.industry)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusColor(company.status)} size="sm">
                {company.status}
              </Badge>
              {company.violations.some(v => v.status === 'pending') && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-lg">{company.name}</CardTitle>
              <p className="text-sm text-gray-600">{company.legalName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {company.violations.some(v => v.status === 'pending') && (
              <Badge variant="destructive" size="sm">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Нарушения
              </Badge>
            )}
            <Badge variant={getStatusColor(company.status)} size="sm">
              {company.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Основная информация */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            <span>Тип: {getTypeLabel(company.type)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>Отрасль: {getIndustryLabel(company.industry)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Основана: {formatDate(company.foundedDate)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>Сотрудников: {formatNumber(company.financial.employeeCount)}</span>
          </div>
        </div>

        {/* Финансовая информация */}
        {company.financial.annualRevenue && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">Годовой доход:</span>
              </div>
              <span className="font-semibold text-green-600">
                {formatCurrency(company.financial.annualRevenue)}
              </span>
            </div>
          </div>
        )}

        {/* Контактная информация */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{company.contact.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{company.contact.phone}</span>
          </div>
          {company.contact.website && (
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-blue-600">{company.contact.website}</span>
            </div>
          )}
        </div>

        {/* Адрес */}
        <div className="flex items-start space-x-2">
          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
          <div className="text-sm">
            <p>{company.address.street}</p>
            <p>{company.address.city}, {company.address.state} {company.address.zipCode}</p>
          </div>
        </div>

        {/* Руководство */}
        <div className="border-t pt-3">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">{company.leadership.ceo.name}</p>
              <p className="text-xs text-gray-600">{company.leadership.ceo.title}</p>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-semibold text-blue-600">
              {company.licenses.filter(l => l.status === 'active').length}
            </div>
            <div className="text-gray-600">Лицензии</div>
          </div>
          <div>
            <div className="font-semibold text-orange-600">
              {company.violations.filter(v => v.status === 'pending').length}
            </div>
            <div className="text-gray-600">Нарушения</div>
          </div>
          <div>
            <div className="font-semibold text-green-600">
              {company.inspections.filter(i => i.result === 'pass').length}
            </div>
            <div className="text-gray-600">Инспекции</div>
          </div>
        </div>

        {/* Действия */}
        <div className="flex space-x-2 pt-2">
          {onViewDetails && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails(company)}
              className="flex-1"
            >
              Подробности
            </Button>
          )}
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(company)}
              className="flex-1"
            >
              Редактировать
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 
