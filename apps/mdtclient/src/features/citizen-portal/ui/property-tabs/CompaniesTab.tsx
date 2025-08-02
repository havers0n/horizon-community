import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/atoms';
import { Button } from '@/shared/ui/atoms';
import { Building, Plus, Edit, Trash2, Search, Users, DollarSign, Calendar } from 'lucide-react';
import { Character } from '@/shared/types';

interface CompaniesTabProps {
  character: Character;
}

interface Company {
  id: string;
  name: string;
  type: string;
  registrationNumber: string;
  address: string;
  ownerId: string;
  employees: number;
  revenue: number;
  foundedDate: string;
  status: 'active' | 'inactive' | 'suspended';
  description: string;
}

export const CompaniesTab: React.FC<CompaniesTabProps> = ({ character }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Моковые данные для компаний
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: '1',
      name: 'ООО "ТехноСтрой"',
      type: 'Строительная компания',
      registrationNumber: '1234567890',
      address: 'ул. Строителей, 15, Лос-Сантос',
      ownerId: character.id,
      employees: 25,
      revenue: 1500000,
      foundedDate: '2020-03-15',
      status: 'active',
      description: 'Строительная компания, специализирующаяся на жилом и коммерческом строительстве.'
    },
    {
      id: '2',
      name: 'ИП "АвтоСервис"',
      type: 'Автосервис',
      registrationNumber: '0987654321',
      address: 'пр. Автомобильный, 42, Лос-Сантос',
      ownerId: character.id,
      employees: 8,
      revenue: 450000,
      foundedDate: '2021-07-22',
      status: 'active',
      description: 'Автосервис полного цикла с диагностикой и ремонтом всех марок автомобилей.'
    }
  ]);

  // Фильтруем компании по поисковому запросу
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCompany = (data: Omit<Company, 'id'>) => {
    const newCompany: Company = {
      ...data,
      id: Date.now().toString(),
    };
    setCompanies([...companies, newCompany]);
    setShowAddForm(false);
  };

  const handleUpdateCompany = (id: string, data: Partial<Company>) => {
    setCompanies(companies.map(company => 
      company.id === id ? { ...company, ...data } : company
    ));
    setEditingCompany(null);
  };

  const handleDeleteCompany = (companyId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту компанию?')) {
      setCompanies(companies.filter(company => company.id !== companyId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'inactive': return 'text-slate-400';
      case 'suspended': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активна';
      case 'inactive': return 'Неактивна';
      case 'suspended': return 'Приостановлена';
      default: return 'Неизвестно';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и поиск */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Компании</h3>
          <p className="text-slate-400">
            Управление компаниями {character.firstName} {character.lastName}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Зарегистрировать компанию
        </Button>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Поиск по названию, типу или номеру регистрации..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Список компаний */}
      {filteredCompanies.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Building className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">
              {searchQuery ? 'Компании не найдены' : 'Нет зарегистрированных компаний'}
            </p>
            {!searchQuery && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Зарегистрировать первую компанию
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:bg-slate-800/50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary-500" />
                    <div>
                      <h4 className="font-semibold text-white">{company.name}</h4>
                      <p className="text-sm text-slate-400">{company.type}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingCompany(company)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCompany(company.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Рег. номер:</span>
                    <span className="text-white font-mono">{company.registrationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Статус:</span>
                    <span className={getStatusColor(company.status)}>
                      {getStatusText(company.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Сотрудники:</span>
                    <span className="text-white flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {company.employees}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Доход:</span>
                    <span className="text-green-400 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatCurrency(company.revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Основана:</span>
                    <span className="text-white flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(company.foundedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-3 p-2 bg-slate-800/50 rounded text-xs">
                    <span className="text-slate-400">Описание:</span>
                    <p className="text-white mt-1">{company.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Форма добавления/редактирования */}
      {showAddForm && (
        <CompanyForm
          onSubmit={handleAddCompany}
          onCancel={() => setShowAddForm(false)}
          company={editingCompany}
          onUpdate={handleUpdateCompany}
        />
      )}
    </div>
  );
};

// Компонент формы для добавления/редактирования компании
interface CompanyFormProps {
  onSubmit: (data: Omit<Company, 'id'>) => void;
  onCancel: () => void;
  company?: Company | null;
  onUpdate: (id: string, data: Partial<Company>) => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ onSubmit, onCancel, company, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    type: company?.type || '',
    registrationNumber: company?.registrationNumber || '',
    address: company?.address || '',
    employees: company?.employees || 1,
    revenue: company?.revenue || 0,
    foundedDate: company?.foundedDate || new Date().toISOString().split('T')[0],
    status: company?.status || 'active',
    description: company?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (company) {
      onUpdate(company.id, formData);
    } else {
      onSubmit(formData as Omit<Company, 'id'>);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h4 className="text-lg font-semibold text-white">
          {company ? 'Редактировать компанию' : 'Зарегистрировать компанию'}
        </h4>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Название компании *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Тип деятельности *
              </label>
              <input
                type="text"
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Регистрационный номер *
              </label>
              <input
                type="text"
                required
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Адрес *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Количество сотрудников
              </label>
              <input
                type="number"
                min="1"
                value={formData.employees}
                onChange={(e) => setFormData({ ...formData, employees: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Годовой доход (USD)
              </label>
              <input
                type="number"
                min="0"
                value={formData.revenue}
                onChange={(e) => setFormData({ ...formData, revenue: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Дата основания
              </label>
              <input
                type="date"
                value={formData.foundedDate}
                onChange={(e) => setFormData({ ...formData, foundedDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Статус
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">Активна</option>
                <option value="inactive">Неактивна</option>
                <option value="suspended">Приостановлена</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Описание деятельности
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Описание деятельности компании..."
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit">
              {company ? 'Сохранить изменения' : 'Зарегистрировать компанию'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 