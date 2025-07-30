import React, { useState } from 'react';
import { Button } from '@/shared/ui/atoms/Button';
import { Card } from '@/shared/ui/atoms/Card';
import { Modal } from '@/shared/ui/atoms/Modal';
import { Users, Eye, Edit, Trash2, Plus, Search, Filter, User, Shield, Phone, Mail } from 'lucide-react';
import { EmsPersonnel, EmsRank } from '../model/types';
import { usePersonnelStore } from '../model/store';

interface EmsPersonnelListProps {
  personnel?: EmsPersonnel[];
  onEdit?: (personnel: EmsPersonnel) => void;
  onDelete?: (personnelId: string) => void;
  onCreate?: () => void;
  maxItems?: number;
  showCreateButton?: boolean;
}

const PersonnelDetailsModal: React.FC<{ 
  personnel: EmsPersonnel; 
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ personnel, onClose, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getRankLabel = (rank: EmsRank) => {
    const rankLabels: Record<EmsRank, string> = {
      paramedic: 'Парамедик',
      emt_basic: 'EMT Basic',
      emt_intermediate: 'EMT Intermediate',
      emt_advanced: 'EMT Advanced',
      firefighter: 'Пожарный',
      firefighter_ii: 'Пожарный II',
      engineer: 'Инженер',
      lieutenant: 'Лейтенант',
      captain: 'Капитан',
      battalion_chief: 'Начальник батальона',
      deputy_chief: 'Заместитель начальника',
      chief: 'Начальник'
    };
    return rankLabels[rank] || rank;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-gray-400';
      case 'suspended': return 'text-yellow-400';
      case 'terminated': return 'text-red-400';
      default: return 'text-secondary-400';
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Детали сотрудника">
      <div className="space-y-6">
        {/* Основная информация */}
        <div className="flex items-center gap-4 pb-4 border-b border-secondary-700">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {personnel.firstName} {personnel.lastName}
            </h3>
            <p className="text-sm text-secondary-400">
              {getRankLabel(personnel.rank)} • {personnel.badgeNumber}
            </p>
            <p className={`text-sm ${getStatusColor(personnel.employmentInfo.status)}`}>
              {personnel.employmentInfo.status === 'active' ? 'Активен' : 
               personnel.employmentInfo.status === 'inactive' ? 'Неактивен' :
               personnel.employmentInfo.status === 'suspended' ? 'Приостановлен' : 'Уволен'}
            </p>
          </div>
        </div>

        {/* Контактная информация */}
        <div>
          <h4 className="font-semibold text-secondary-200 mb-3">Контактная информация</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-secondary-400" />
              <span className="text-sm text-secondary-300">{personnel.contactInfo.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-secondary-400" />
              <span className="text-sm text-secondary-300">{personnel.contactInfo.email}</span>
            </div>
          </div>
          <div className="mt-3 p-3 bg-secondary-800 rounded">
            <h5 className="text-sm font-medium text-secondary-300 mb-1">Экстренный контакт</h5>
            <p className="text-sm text-secondary-400">
              {personnel.contactInfo.emergencyContact.name} ({personnel.contactInfo.emergencyContact.relationship})
            </p>
            <p className="text-sm text-secondary-400">{personnel.contactInfo.emergencyContact.phone}</p>
          </div>
        </div>

        {/* Информация о работе */}
        <div>
          <h4 className="font-semibold text-secondary-200 mb-3">Информация о работе</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-secondary-300">Отдел: </span>
              <span className="text-sm text-secondary-400">{personnel.department}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-secondary-300">Должность: </span>
              <span className="text-sm text-secondary-400">{personnel.employmentInfo.position}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-secondary-300">Дата найма: </span>
              <span className="text-sm text-secondary-400">{formatDate(personnel.employmentInfo.hireDate)}</span>
            </div>
            {personnel.employmentInfo.supervisor && (
              <div>
                <span className="text-sm font-medium text-secondary-300">Руководитель: </span>
                <span className="text-sm text-secondary-400">{personnel.employmentInfo.supervisor}</span>
              </div>
            )}
          </div>
        </div>

        {/* Квалификации */}
        {personnel.qualifications.length > 0 && (
          <div>
            <h4 className="font-semibold text-secondary-200 mb-3">Квалификации</h4>
            <div className="space-y-2">
              {personnel.qualifications.map(qual => (
                <div key={qual.id} className="p-3 bg-secondary-800 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-medium text-white">{qual.name}</h5>
                      <p className="text-xs text-secondary-400">{qual.issuingAuthority}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      qual.status === 'active' ? 'bg-green-600/20 text-green-400' :
                      qual.status === 'expired' ? 'bg-red-600/20 text-red-400' :
                      'bg-yellow-600/20 text-yellow-400'
                    }`}>
                      {qual.status === 'active' ? 'Активна' : 
                       qual.status === 'expired' ? 'Истекла' : 'Ожидает'}
                    </span>
                  </div>
                  {qual.expiryDate && (
                    <p className="text-xs text-secondary-500 mt-1">
                      Истекает: {formatDate(qual.expiryDate)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Сертификации */}
        {personnel.certifications.length > 0 && (
          <div>
            <h4 className="font-semibold text-secondary-200 mb-3">Сертификации</h4>
            <div className="space-y-2">
              {personnel.certifications.map(cert => (
                <div key={cert.id} className="p-3 bg-secondary-800 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-medium text-white">{cert.name}</h5>
                      <p className="text-xs text-secondary-400">{cert.issuingAuthority}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      cert.status === 'active' ? 'bg-green-600/20 text-green-400' :
                      cert.status === 'expired' ? 'bg-red-600/20 text-red-400' :
                      'bg-yellow-600/20 text-yellow-400'
                    }`}>
                      {cert.status === 'active' ? 'Активна' : 
                       cert.status === 'expired' ? 'Истекла' : 'Ожидает'}
                    </span>
                  </div>
                  {cert.expiryDate && (
                    <p className="text-xs text-secondary-500 mt-1">
                      Истекает: {formatDate(cert.expiryDate)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Действия */}
        <div className="flex gap-2 pt-4 border-t border-secondary-700">
          {onEdit && (
            <Button onClick={onEdit} variant="secondary" className="flex-1">
              <Edit className="mr-2 h-4 w-4" />
              Редактировать
            </Button>
          )}
          {onDelete && (
            <Button onClick={onDelete} variant="danger" className="flex-1">
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить
            </Button>
          )}
          <Button onClick={onClose} variant="secondary">
            Закрыть
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const EmsPersonnelList: React.FC<EmsPersonnelListProps> = ({
  personnel: externalPersonnel,
  onEdit,
  onDelete,
  onCreate,
  maxItems,
  showCreateButton = true
}) => {
  const { personnel: storePersonnel, deletePersonnel } = usePersonnelStore();
  const [selectedPersonnel, setSelectedPersonnel] = useState<EmsPersonnel | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRank, setFilterRank] = useState<string>('');

  // Используем внешние данные или из store
  const personnel = externalPersonnel || storePersonnel;
  
  // Фильтрация
  const filteredPersonnel = personnel.filter(person => {
    const matchesSearch = searchQuery === '' || 
      person.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRank = filterRank === '' || person.rank === filterRank;
    
    return matchesSearch && matchesRank;
  });
  
  const displayPersonnel = maxItems ? filteredPersonnel.slice(0, maxItems) : filteredPersonnel;

  const handleViewDetails = (person: EmsPersonnel) => {
    setSelectedPersonnel(person);
    setViewMode('details');
  };

  const handleCloseDetails = () => {
    setSelectedPersonnel(null);
    setViewMode('list');
  };

  const handleEditPersonnel = () => {
    if (selectedPersonnel && onEdit) {
      onEdit(selectedPersonnel);
    }
    handleCloseDetails();
  };

  const handleDeletePersonnel = () => {
    if (selectedPersonnel) {
      if (onDelete) {
        onDelete(selectedPersonnel.id);
      } else {
        deletePersonnel(selectedPersonnel.id);
      }
    }
    handleCloseDetails();
  };

  const getRankLabel = (rank: EmsRank) => {
    const rankLabels: Record<EmsRank, string> = {
      paramedic: 'Парамедик',
      emt_basic: 'EMT Basic',
      emt_intermediate: 'EMT Intermediate',
      emt_advanced: 'EMT Advanced',
      firefighter: 'Пожарный',
      firefighter_ii: 'Пожарный II',
      engineer: 'Инженер',
      lieutenant: 'Лейтенант',
      captain: 'Капитан',
      battalion_chief: 'Начальник батальона',
      deputy_chief: 'Заместитель начальника',
      chief: 'Начальник'
    };
    return rankLabels[rank] || rank;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'inactive': return 'bg-gray-600';
      case 'suspended': return 'bg-yellow-600';
      case 'terminated': return 'bg-red-600';
      default: return 'bg-secondary-600';
    }
  };

  if (viewMode === 'details' && selectedPersonnel) {
    return (
      <PersonnelDetailsModal
        personnel={selectedPersonnel}
        onClose={handleCloseDetails}
        onEdit={onEdit ? handleEditPersonnel : undefined}
        onDelete={onDelete ? handleDeletePersonnel : undefined}
      />
    );
  }

  return (
    <Card>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="font-semibold">Персонал EMS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary-400">
              {personnel.length} сотрудников
            </span>
            {showCreateButton && onCreate && (
              <Button onClick={onCreate} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Добавить
              </Button>
            )}
          </div>
        </div>

        {/* Поиск и фильтры */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Поиск по имени или номеру..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white"
            />
          </div>
          <select
            value={filterRank}
            onChange={(e) => setFilterRank(e.target.value)}
            className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white"
          >
            <option value="">Все звания</option>
            <option value="paramedic">Парамедик</option>
            <option value="emt_basic">EMT Basic</option>
            <option value="emt_intermediate">EMT Intermediate</option>
            <option value="emt_advanced">EMT Advanced</option>
            <option value="firefighter">Пожарный</option>
            <option value="firefighter_ii">Пожарный II</option>
            <option value="engineer">Инженер</option>
            <option value="lieutenant">Лейтенант</option>
            <option value="captain">Капитан</option>
            <option value="battalion_chief">Начальник батальона</option>
            <option value="deputy_chief">Заместитель начальника</option>
            <option value="chief">Начальник</option>
          </select>
        </div>
        
        <div className="space-y-3">
          {displayPersonnel.length > 0 ? (
            displayPersonnel.map(person => (
              <div 
                key={person.id} 
                className="p-4 bg-secondary-800 rounded-lg border border-secondary-700 hover:bg-secondary-800/50 transition-colors cursor-pointer"
                onClick={() => handleViewDetails(person)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {person.firstName} {person.lastName}
                      </h3>
                      <p className="text-sm text-secondary-400">
                        {getRankLabel(person.rank)} • {person.badgeNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(person.employmentInfo.status)}`}>
                      {person.employmentInfo.status === 'active' ? 'Активен' : 
                       person.employmentInfo.status === 'inactive' ? 'Неактивен' :
                       person.employmentInfo.status === 'suspended' ? 'Приостановлен' : 'Уволен'}
                    </span>
                    <Button size="sm" variant="secondary">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-sm text-secondary-300">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span>{person.department}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{person.contactInfo.phone}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-secondary-500">
                    <span>Найм: {new Date(person.employmentInfo.hireDate).toLocaleDateString('ru-RU')}</span>
                    <span>Квалификаций: {person.qualifications.length}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-secondary-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Сотрудники не найдены</p>
              <p className="text-sm mt-1">
                {searchQuery || filterRank ? 'Попробуйте изменить параметры поиска' : 'Добавьте первого сотрудника для начала работы'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}; 
