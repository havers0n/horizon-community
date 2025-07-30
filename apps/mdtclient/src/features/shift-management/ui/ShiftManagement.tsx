import React, { useState, useEffect } from 'react';
import { Plus, Clock, Calendar, User, Filter, Play, Square, Edit, Trash2 } from 'lucide-react';
import { useShiftStore, ShiftType, ShiftStatus } from '../model/shiftStore';
import { Card, CardHeader } from '@/shared/ui/atoms';

// Компонент статистики смен
const ShiftStatistics: React.FC = () => {
  const { statistics, fetchStatistics } = useShiftStore();

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  if (!statistics) return null;

  const getStatusColor = (status: ShiftStatus) => {
    switch (status) {
      case ShiftStatus.COMPLETED: return 'text-green-400';
      case ShiftStatus.IN_PROGRESS: return 'text-blue-400';
      case ShiftStatus.SCHEDULED: return 'text-amber-400';
      case ShiftStatus.CANCELLED: return 'text-red-400';
      default: return 'text-secondary-400';
    }
  };

  const getTypeColor = (type: ShiftType) => {
    switch (type) {
      case ShiftType.DAY: return 'text-blue-400';
      case ShiftType.NIGHT: return 'text-purple-400';
      case ShiftType.SWING: return 'text-amber-400';
      case ShiftType.OVERTIME: return 'text-red-400';
      case ShiftType.ON_CALL: return 'text-green-400';
      case ShiftType.HOLIDAY: return 'text-pink-400';
      default: return 'text-secondary-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-blue-900/20 border-blue-500">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm">Всего смен</p>
              <p className="text-2xl font-bold text-white">{statistics.totalShifts}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </Card>

      <Card className="bg-green-900/20 border-green-500">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm">Завершенных</p>
              <p className="text-2xl font-bold text-white">{statistics.completedShifts}</p>
            </div>
            <Square className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </Card>

      <Card className="bg-amber-900/20 border-amber-500">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-400 text-sm">Активных</p>
              <p className="text-2xl font-bold text-white">{statistics.activeShifts}</p>
            </div>
            <Play className="h-8 w-8 text-amber-400" />
          </div>
        </div>
      </Card>

      <Card className="bg-purple-900/20 border-purple-500">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm">Всего часов</p>
              <p className="text-2xl font-bold text-white">{statistics.totalHours.toFixed(1)}</p>
            </div>
            <Clock className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </Card>
    </div>
  );
};

// Компонент фильтров
const ShiftFilters: React.FC = () => {
  const { setFilters } = useShiftStore();
  const [filters, setLocalFilters] = useState({
    shiftType: '',
    status: '',
    department: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setLocalFilters(newFilters);
    
    const apiFilters: any = {};
    if (newFilters.shiftType) apiFilters.shiftType = newFilters.shiftType as ShiftType;
    if (newFilters.status) apiFilters.status = newFilters.status as ShiftStatus;
    if (newFilters.department) apiFilters.department = newFilters.department;
    
    setFilters(apiFilters);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex items-center gap-2">
        <Filter className="h-5 w-5" />
        Фильтры смен
      </CardHeader>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-1">
              Тип смены
            </label>
            <select
              value={filters.shiftType}
              onChange={(e) => handleFilterChange('shiftType', e.target.value)}
              className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Все типы</option>
              <option value={ShiftType.DAY}>Дневная</option>
              <option value={ShiftType.NIGHT}>Ночная</option>
              <option value={ShiftType.SWING}>Вечерняя</option>
              <option value={ShiftType.OVERTIME}>Сверхурочная</option>
              <option value={ShiftType.ON_CALL}>Дежурство</option>
              <option value={ShiftType.HOLIDAY}>Праздничная</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-1">
              Статус
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Все статусы</option>
              <option value={ShiftStatus.SCHEDULED}>Запланирована</option>
              <option value={ShiftStatus.IN_PROGRESS}>В процессе</option>
              <option value={ShiftStatus.COMPLETED}>Завершена</option>
              <option value={ShiftStatus.CANCELLED}>Отменена</option>
              <option value={ShiftStatus.NO_SHOW}>Неявка</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-1">
              Департамент
            </label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Все департаменты</option>
              <option value="EMS">EMS</option>
              <option value="FD">FD</option>
              <option value="LEO">LEO</option>
            </select>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Компонент списка смен
const ShiftList: React.FC = () => {
  const { shifts, isLoading, error, fetchShifts, startShift, endShift, deleteShift } = useShiftStore();

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: ShiftStatus) => {
    switch (status) {
      case ShiftStatus.COMPLETED: return 'bg-green-900/20 text-green-400 border-green-500';
      case ShiftStatus.IN_PROGRESS: return 'bg-blue-900/20 text-blue-400 border-blue-500';
      case ShiftStatus.SCHEDULED: return 'bg-amber-900/20 text-amber-400 border-amber-500';
      case ShiftStatus.CANCELLED: return 'bg-red-900/20 text-red-400 border-red-500';
      case ShiftStatus.NO_SHOW: return 'bg-gray-900/20 text-gray-400 border-gray-500';
      default: return 'bg-secondary-900/20 text-secondary-400 border-secondary-500';
    }
  };

  const getTypeColor = (type: ShiftType) => {
    switch (type) {
      case ShiftType.DAY: return 'bg-blue-900/20 text-blue-400';
      case ShiftType.NIGHT: return 'bg-purple-900/20 text-purple-400';
      case ShiftType.SWING: return 'bg-amber-900/20 text-amber-400';
      case ShiftType.OVERTIME: return 'bg-red-900/20 text-red-400';
      case ShiftType.ON_CALL: return 'bg-green-900/20 text-green-400';
      case ShiftType.HOLIDAY: return 'bg-pink-900/20 text-pink-400';
      default: return 'bg-secondary-900/20 text-secondary-400';
    }
  };

  const getStatusText = (status: ShiftStatus) => {
    switch (status) {
      case ShiftStatus.COMPLETED: return 'Завершена';
      case ShiftStatus.IN_PROGRESS: return 'В процессе';
      case ShiftStatus.SCHEDULED: return 'Запланирована';
      case ShiftStatus.CANCELLED: return 'Отменена';
      case ShiftStatus.NO_SHOW: return 'Неявка';
      default: return 'Неизвестно';
    }
  };

  const getTypeText = (type: ShiftType) => {
    switch (type) {
      case ShiftType.DAY: return 'Дневная';
      case ShiftType.NIGHT: return 'Ночная';
      case ShiftType.SWING: return 'Вечерняя';
      case ShiftType.OVERTIME: return 'Сверхурочная';
      case ShiftType.ON_CALL: return 'Дежурство';
      case ShiftType.HOLIDAY: return 'Праздничная';
      default: return 'Неизвестно';
    }
  };

  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-500">
        <CardHeader className="text-red-400">Ошибка</CardHeader>
        <p className="text-red-300 p-4">{error}</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <span>Список смен</span>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
          <Plus size={16} />
          Добавить смену
        </button>
      </CardHeader>
      
      <div className="p-4">
        {isLoading ? (
          <div className="text-center text-secondary-400 py-8">
            Загрузка смен...
          </div>
        ) : shifts.length > 0 ? (
          <div className="space-y-3">
            {shifts.map(shift => (
              <div
                key={shift.id}
                className="bg-secondary-800 hover:bg-secondary-700 p-4 rounded-md transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary-600 flex items-center justify-center">
                      <User size={24} className="text-secondary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{shift.employeeName}</h3>
                      <p className="text-sm text-secondary-400">
                        {shift.position} • {shift.department}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-secondary-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(shift.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(shift.shiftType)}`}>
                      {getTypeText(shift.shiftType)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(shift.status)}`}>
                      {getStatusText(shift.status)}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      {shift.status === ShiftStatus.SCHEDULED && (
                        <button
                          onClick={() => startShift(shift.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded transition-colors"
                          title="Начать смену"
                        >
                          <Play size={14} />
                        </button>
                      )}
                      
                      {shift.status === ShiftStatus.IN_PROGRESS && (
                        <button
                          onClick={() => endShift(shift.id)}
                          className="bg-green-600 hover:bg-green-700 text-white p-1 rounded transition-colors"
                          title="Завершить смену"
                        >
                          <Square size={14} />
                        </button>
                      )}
                      
                      <button
                        className="bg-secondary-600 hover:bg-secondary-700 text-white p-1 rounded transition-colors"
                        title="Редактировать"
                      >
                        <Edit size={14} />
                      </button>
                      
                      <button
                        onClick={() => deleteShift(shift.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-1 rounded transition-colors"
                        title="Удалить"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {shift.notes && (
                  <div className="mt-3 pt-3 border-t border-secondary-700">
                    <p className="text-sm text-secondary-400">{shift.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-secondary-400 py-8">
            Нет смен в расписании.
          </div>
        )}
      </div>
    </Card>
  );
};

// Основной компонент управления сменами
export const ShiftManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Управление сменами</h1>
      </div>

      <ShiftStatistics />
      <ShiftFilters />
      <ShiftList />
    </div>
  );
}; 
