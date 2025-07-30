import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User } from 'lucide-react';
import { useShiftStore, ShiftType } from '../model/shiftStore';
import { Card, CardHeader } from '@/shared/ui/atoms';

// Компонент календаря смен
export const ShiftCalendar: React.FC = () => {
  const { shifts, fetchShifts } = useShiftStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // Получение недели для текущей даты
  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  // Получение смен для конкретного дня
  const getShiftsForDay = (date: Date) => {
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.startTime);
      return shiftDate.toDateString() === date.toDateString();
    });
  };

  // Форматирование времени
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Получение цвета для типа смены
  const getShiftColor = (type: ShiftType) => {
    switch (type) {
      case ShiftType.DAY: return 'bg-blue-500';
      case ShiftType.NIGHT: return 'bg-purple-500';
      case ShiftType.SWING: return 'bg-amber-500';
      case ShiftType.OVERTIME: return 'bg-red-500';
      case ShiftType.ON_CALL: return 'bg-green-500';
      case ShiftType.HOLIDAY: return 'bg-pink-500';
      default: return 'bg-secondary-500';
    }
  };

  // Получение текста для типа смены
  const getShiftTypeText = (type: ShiftType) => {
    switch (type) {
      case ShiftType.DAY: return 'Д';
      case ShiftType.NIGHT: return 'Н';
      case ShiftType.SWING: return 'В';
      case ShiftType.OVERTIME: return 'С';
      case ShiftType.ON_CALL: return 'Д';
      case ShiftType.HOLIDAY: return 'П';
      default: return '?';
    }
  };

  // Навигация по неделям
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const weekDates = getWeekDates(currentDate);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Календарь смен
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'week' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
              }`}
            >
              Неделя
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'month' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
              }`}
            >
              Месяц
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className="bg-secondary-700 hover:bg-secondary-600 text-white p-2 rounded transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goToToday}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            Сегодня
          </button>
          <button
            onClick={goToNextWeek}
            className="bg-secondary-700 hover:bg-secondary-600 text-white p-2 rounded transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </CardHeader>

      <div className="p-4">
        {/* Заголовок недели */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            {weekStart.toLocaleDateString('ru-RU', { 
              day: 'numeric', 
              month: 'long' 
            })} - {weekEnd.toLocaleDateString('ru-RU', { 
              day: 'numeric', 
              month: 'long',
              year: 'numeric'
            })}
          </h3>
        </div>

        {/* Календарная сетка */}
        <div className="grid grid-cols-8 gap-1">
          {/* Заголовки дней недели */}
          <div className="p-2 text-center text-sm font-medium text-secondary-400">
            Время
          </div>
          {weekDates.map((date, index) => (
            <div key={index} className="p-2 text-center">
              <div className="text-sm font-medium text-secondary-300">
                {date.toLocaleDateString('ru-RU', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-bold ${
                date.toDateString() === new Date().toDateString() 
                  ? 'text-primary-400' 
                  : 'text-white'
              }`}>
                {date.getDate()}
              </div>
            </div>
          ))}

          {/* Временные слоты */}
          {Array.from({ length: 24 }, (_, hour) => (
            <React.Fragment key={hour}>
              {/* Время */}
              <div className="p-1 text-xs text-secondary-500 text-right pr-2 border-r border-secondary-700">
                {hour.toString().padStart(2, '0')}:00
              </div>
              
              {/* Ячейки для каждого дня */}
              {weekDates.map((date, dayIndex) => {
                const dayShifts = getShiftsForDay(date);
                const hourShifts = dayShifts.filter(shift => {
                  const shiftHour = new Date(shift.startTime).getHours();
                  return shiftHour === hour;
                });

                return (
                  <div 
                    key={dayIndex} 
                    className="p-1 min-h-[40px] border-b border-secondary-700 relative"
                  >
                    {hourShifts.map((shift, shiftIndex) => (
                      <div
                        key={shift.id}
                        className={`absolute left-0 right-0 mx-1 px-1 py-0.5 text-xs text-white rounded ${
                          getShiftColor(shift.shiftType)
                        } cursor-pointer hover:opacity-80 transition-opacity`}
                        style={{
                          top: `${shiftIndex * 20}px`,
                          zIndex: shiftIndex + 1
                        }}
                        title={`${shift.employeeName} - ${formatTime(shift.startTime)}-${formatTime(shift.endTime)}`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="font-bold">{getShiftTypeText(shift.shiftType)}</span>
                          <span className="truncate">{shift.employeeName.split(' ')[0]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Легенда */}
        <div className="mt-6 p-4 bg-secondary-800 rounded-md">
          <h4 className="text-sm font-medium text-secondary-300 mb-3">Легенда</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(ShiftType).map(type => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${getShiftColor(type)}`}></div>
                <span className="text-sm text-secondary-400">
                  {type === ShiftType.DAY && 'Дневная'}
                  {type === ShiftType.NIGHT && 'Ночная'}
                  {type === ShiftType.SWING && 'Вечерняя'}
                  {type === ShiftType.OVERTIME && 'Сверхурочная'}
                  {type === ShiftType.ON_CALL && 'Дежурство'}
                  {type === ShiftType.HOLIDAY && 'Праздничная'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
