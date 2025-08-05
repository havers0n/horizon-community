import React, { useState } from 'react';
import { Button } from '@/shared/ui/atoms/Button';
import { Card } from '@/shared/ui/atoms/Card';
import { Modal } from '@/shared/ui/atoms/Modal';
import { Users, Eye, Edit, Trash2, Plus, Search, Filter, User, Shield, Phone, Mail } from 'lucide-react';
import type { Characters, EmsProfiles, Json } from '@roleplay-identity/db-types';
import { usePersonnelStore } from '../model/store';

// Правильный тип для EMS персонала, основанный на реальных типах из БД
type EmsPersonnelWithDetails = Characters & EmsProfiles & {
  // Дополнительные данные, которые могут быть получены через JOIN
  department_name?: string;
  division_name?: string;
  rank_name?: string;
  // Квалификации из character_qualifications
  qualifications?: Array<{
    id: string;
    qualification_id: string;
    qualification_name: string;
    obtained_date: string;
    expires_date: string | null;
    issued_by_character_id: string | null;
  }>;
};

interface EmsPersonnelListProps {
  personnel?: EmsPersonnelWithDetails[];
  onEdit?: (personnel: EmsPersonnelWithDetails) => void;
  onDelete?: (personnelId: string) => void;
  onCreate?: () => void;
  maxItems?: number;
  showCreateButton?: boolean;
}

const PersonnelDetailsModal: React.FC<{ 
  personnel: EmsPersonnelWithDetails; 
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ personnel, onClose, onEdit, onDelete }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getRankLabel = (rankId: string) => {
    // В реальном приложении здесь должна быть логика получения названия ранга по ID
    const rankLabels: Record<string, string> = {
      'paramedic': 'Парамедик',
      'emt_basic': 'EMT Basic',
      'emt_intermediate': 'EMT Intermediate',
      'emt_advanced': 'EMT Advanced',
      'firefighter': 'Пожарный',
      'firefighter_ii': 'Пожарный II',
      'engineer': 'Инженер',
      'lieutenant': 'Лейтенант',
      'captain': 'Капитан',
      'battalion_chief': 'Начальник батальона',
      'deputy_chief': 'Заместитель начальника',
      'chief': 'Начальник'
    };
    return rankLabels[rankId] || rankId;
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-gray-400';
      case 'suspended': return 'text-yellow-400';
      case 'terminated': return 'text-red-400';
      default: return 'text-secondary-400';
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'inactive': return 'Неактивен';
      case 'suspended': return 'Приостановлен';
      case 'terminated': return 'Уволен';
      default: return 'Неизвестно';
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
              {personnel.first_name} {personnel.last_name}
            </h3>
            <p className="text-sm text-secondary-400">
              {getRankLabel(personnel.rank_id)} • {personnel.id}
            </p>
            <p className={`text-sm ${getStatusColor(personnel.status)}`}>
              {getStatusLabel(personnel.status)}
            </p>
          </div>
        </div>

        {/* Контактная информация */}
        <div>
          <h4 className="font-semibold text-secondary-200 mb-3">Контактная информация</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-secondary-400" />
              <span className="text-sm text-secondary-300">{personnel.phone_number || 'Не указано'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-secondary-400" />
              <span className="text-sm text-secondary-300">{personnel.occupation || 'Не указано'}</span>
            </div>
          </div>
          {personnel.address && (
            <div className="mt-3 p-3 bg-secondary-800 rounded">
              <h5 className="text-sm font-medium text-secondary-300 mb-1">Адрес</h5>
              <p className="text-sm text-secondary-400">{personnel.address}</p>
            </div>
          )}
        </div>

        {/* Информация о работе */}
        <div>
          <h4 className="font-semibold text-secondary-200 mb-3">Информация о работе</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-secondary-300">Отдел ID: </span>
              <span className="text-sm text-secondary-400">{personnel.department_id}</span>
            </div>
            {personnel.division_id && (
              <div>
                <span className="text-sm font-medium text-secondary-300">Подразделение ID: </span>
                <span className="text-sm text-secondary-400">{personnel.division_id}</span>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-secondary-300">Звание: </span>
              <span className="text-sm text-secondary-400">{getRankLabel(personnel.rank_id)}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-secondary-300">Дата создания профиля: </span>
              <span className="text-sm text-secondary-400">{formatDate(personnel.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Лицензии и медицинская информация */}
        {(personnel.licenses || personnel.medical_info) && (
          <div>
            <h4 className="font-semibold text-secondary-200 mb-3">Дополнительная информация</h4>
            {personnel.licenses && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-secondary-300 mb-1">Лицензии</h5>
                <div className="p-3 bg-secondary-800 rounded">
                  <pre className="text-sm text-secondary-400">{JSON.stringify(personnel.licenses, null, 2)}</pre>
                </div>
              </div>
            )}
            {personnel.medical_info && (
              <div>
                <h5 className="text-sm font-medium text-secondary-300 mb-1">Медицинская информация</h5>
                <div className="p-3 bg-secondary-800 rounded">
                  <pre className="text-sm text-secondary-400">{JSON.stringify(personnel.medical_info, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Квалификации */}
        {personnel.qualifications && personnel.qualifications.length > 0 && (
          <div>
            <h4 className="font-semibold text-secondary-200 mb-3">Квалификации</h4>
            <div className="space-y-2">
              {personnel.qualifications.map(qual => (
                <div key={qual.id} className="p-3 bg-secondary-800 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-medium text-white">{qual.qualification_name}</h5>
                      <p className="text-xs text-secondary-400">ID: {qual.qualification_id}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-green-600/20 text-green-400">
                      Активна
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-secondary-500">
                    <p>Получена: {formatDate(qual.obtained_date)}</p>
                    {qual.expires_date && (
                      <p>Истекает: {formatDate(qual.expires_date)}</p>
                    )}
                  </div>
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
  const [selectedPersonnel, setSelectedPersonnel] = useState<EmsPersonnelWithDetails | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRank, setFilterRank] = useState<string>('');

  // Используем внешние данные или из store
  const personnel = externalPersonnel || storePersonnel;
  
  // Фильтрация
  const filteredPersonnel = personnel.filter(person => {
    const matchesSearch = searchQuery === '' || 
      person.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRank = filterRank === '' || person.rank_id === filterRank;
    
    return matchesSearch && matchesRank;
  });
  
  const displayPersonnel = maxItems ? filteredPersonnel.slice(0, maxItems) : filteredPersonnel;

  const handleViewDetails = (person: EmsPersonnelWithDetails) => {
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

  const getRankLabel = (rankId: string) => {
    const rankLabels: Record<string, string> = {
      'paramedic': 'Парамедик',
      'emt_basic': 'EMT Basic',
      'emt_intermediate': 'EMT Intermediate',
      'emt_advanced': 'EMT Advanced',
      'firefighter': 'Пожарный',
      'firefighter_ii': 'Пожарный II',
      'engineer': 'Инженер',
      'lieutenant': 'Лейтенант',
      'captain': 'Капитан',
      'battalion_chief': 'Начальник батальона',
      'deputy_chief': 'Заместитель начальника',
      'chief': 'Начальник'
    };
    return rankLabels[rankId] || rankId;
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'inactive': return 'bg-gray-600';
      case 'suspended': return 'bg-yellow-600';
      case 'terminated': return 'bg-red-600';
      default: return 'bg-secondary-600';
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'inactive': return 'Неактивен';
      case 'suspended': return 'Приостановлен';
      case 'terminated': return 'Уволен';
      default: return 'Неизвестно';
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
              placeholder="Поиск по имени или ID..."
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
                        {person.first_name} {person.last_name}
                      </h3>
                      <p className="text-sm text-secondary-400">
                        {getRankLabel(person.rank_id)} • {person.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(person.status)}`}>
                      {getStatusLabel(person.status)}
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
                      <span>Отдел: {person.department_id}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{person.phone_number || 'Телефон не указан'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-secondary-500">
                    <span>Создан: {formatDate(person.created_at)}</span>
                    <span>Квалификаций: {person.qualifications?.length || 0}</span>
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
