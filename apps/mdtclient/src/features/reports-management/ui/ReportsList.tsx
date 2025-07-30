import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Input } from '@/shared/ui/atoms/Input';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Report {
  id: string;
  title: string;
  type: 'arrest' | 'citation' | 'warning' | 'incident';
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  officer: string;
  date: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export const ReportsList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Моковые данные для демонстрации
  const mockReports: Report[] = [
    {
      id: '1',
      title: 'Арест за превышение скорости',
      type: 'arrest',
      status: 'approved',
      officer: 'Офицер Петров',
      date: '2024-01-15',
      description: 'Гражданин превысил скорость на 30 км/ч в жилой зоне',
      priority: 'medium'
    },
    {
      id: '2',
      title: 'Штраф за парковку',
      type: 'citation',
      status: 'submitted',
      officer: 'Офицер Сидорова',
      date: '2024-01-14',
      description: 'Парковка в запрещенном месте',
      priority: 'low'
    },
    {
      id: '3',
      title: 'Предупреждение за нарушение ПДД',
      type: 'warning',
      status: 'draft',
      officer: 'Офицер Козлов',
      date: '2024-01-13',
      description: 'Проезд на красный свет',
      priority: 'high'
    },
    {
      id: '4',
      title: 'Инцидент с участием ТС',
      type: 'incident',
      status: 'approved',
      officer: 'Офицер Иванов',
      date: '2024-01-12',
      description: 'ДТП на перекрестке',
      priority: 'high'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'arrest': return 'bg-red-500';
      case 'citation': return 'bg-yellow-500';
      case 'warning': return 'bg-orange-500';
      case 'incident': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'submitted': return 'bg-blue-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4" />;
      case 'submitted': return <AlertTriangle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.officer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || report.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопки */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Отчеты</h2>
          <p className="text-secondary-400">Управление отчетами и документами</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Создать отчет
        </Button>
      </div>

      {/* Фильтры и поиск */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск по названию, описанию или офицеру..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
            >
              <option value="all">Все типы</option>
              <option value="arrest">Аресты</option>
              <option value="citation">Штрафы</option>
              <option value="warning">Предупреждения</option>
              <option value="incident">Инциденты</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
            >
              <option value="all">Все статусы</option>
              <option value="draft">Черновики</option>
              <option value="submitted">Отправлены</option>
              <option value="approved">Одобрены</option>
              <option value="rejected">Отклонены</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Список отчетов */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:bg-secondary-800/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                    <Badge variant="outline" className={getPriorityColor(report.priority)}>
                      {report.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-secondary-400 mb-3">{report.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-secondary-400" />
                      <span className="text-secondary-400">{report.officer}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-secondary-400" />
                      <span className="text-secondary-400">{report.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getTypeColor(report.type)}>
                    {report.type}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(report.status)}>
                    {getStatusIcon(report.status)}
                    <span className="ml-1">{report.status}</span>
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  Просмотр
                </Button>
                <Button variant="outline" size="sm">
                  Редактировать
                </Button>
                <Button variant="outline" size="sm">
                  Экспорт
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Сообщение об отсутствии результатов */}
      {filteredReports.length === 0 && (searchQuery || selectedType !== 'all' || selectedStatus !== 'all') && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-secondary-400" />
            <h3 className="text-lg font-semibold text-white mb-2">Отчеты не найдены</h3>
            <p className="text-secondary-400">Попробуйте изменить параметры поиска</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
