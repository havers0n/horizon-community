import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Типы для смен
export interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  startTime: string; // ISO date
  endTime: string; // ISO date
  shiftType: ShiftType;
  status: ShiftStatus;
  department: string;
  position: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftSchedule {
  id: string;
  weekStart: string; // ISO date
  weekEnd: string; // ISO date
  shifts: Shift[];
  totalHours: number;
  overtimeHours: number;
  createdAt: string;
}

export interface ShiftStatistics {
  totalShifts: number;
  completedShifts: number;
  activeShifts: number;
  upcomingShifts: number;
  totalHours: number;
  averageShiftDuration: number;
  shiftsByType: Record<ShiftType, number>;
  shiftsByStatus: Record<ShiftStatus, number>;
}

export enum ShiftType {
  DAY = 'day',
  NIGHT = 'night',
  SWING = 'swing',
  OVERTIME = 'overtime',
  ON_CALL = 'on_call',
  HOLIDAY = 'holiday'
}

export enum ShiftStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export interface ShiftFilters {
  employeeId?: string;
  shiftType?: ShiftType;
  status?: ShiftStatus;
  department?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface CreateShiftParams {
  employeeId: string;
  startTime: string;
  endTime: string;
  shiftType: ShiftType;
  department: string;
  position: string;
  notes?: string;
}

export interface UpdateShiftParams {
  startTime?: string;
  endTime?: string;
  shiftType?: ShiftType;
  status?: ShiftStatus;
  notes?: string;
}

interface ShiftState {
  // Состояние
  shifts: Shift[];
  currentShift: Shift | null;
  isLoading: boolean;
  error: string | null;
  statistics: ShiftStatistics | null;
  filters: ShiftFilters;
  
  // Действия
  fetchShifts: (filters?: ShiftFilters) => Promise<void>;
  fetchShiftById: (id: string) => Promise<void>;
  createShift: (shift: CreateShiftParams) => Promise<void>;
  updateShift: (id: string, updates: UpdateShiftParams) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  startShift: (id: string) => Promise<void>;
  endShift: (id: string) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  setCurrentShift: (shift: Shift | null) => void;
  setFilters: (filters: ShiftFilters) => void;
  clearError: () => void;
}

// Моковые данные для демонстрации
const mockShifts: Shift[] = [
  {
    id: '1',
    employeeId: 'emp1',
    employeeName: 'Иван Петров',
    startTime: '2024-01-15T08:00:00Z',
    endTime: '2024-01-15T20:00:00Z',
    shiftType: ShiftType.DAY,
    status: ShiftStatus.COMPLETED,
    department: 'EMS',
    position: 'Парамедик',
    notes: 'Обычная дневная смена',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T20:00:00Z'
  },
  {
    id: '2',
    employeeId: 'emp2',
    employeeName: 'Мария Сидорова',
    startTime: '2024-01-15T20:00:00Z',
    endTime: '2024-01-16T08:00:00Z',
    shiftType: ShiftType.NIGHT,
    status: ShiftStatus.COMPLETED,
    department: 'EMS',
    position: 'Парамедик',
    notes: 'Ночная смена',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z'
  },
  {
    id: '3',
    employeeId: 'emp1',
    employeeName: 'Иван Петров',
    startTime: '2024-01-16T08:00:00Z',
    endTime: '2024-01-16T20:00:00Z',
    shiftType: ShiftType.DAY,
    status: ShiftStatus.IN_PROGRESS,
    department: 'EMS',
    position: 'Парамедик',
    notes: 'Текущая смена',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z'
  }
];

export const useShiftStore = create<ShiftState>()(
  devtools(
    (set, get) => ({
      // Начальное состояние
      shifts: mockShifts,
      currentShift: null,
      isLoading: false,
      error: null,
      statistics: null,
      filters: {},

      // Получение списка смен
      fetchShifts: async (filters?: ShiftFilters) => {
        set({ isLoading: true, error: null });
        try {
          // Имитация API вызова
          await new Promise(resolve => setTimeout(resolve, 500));
          const filtersToUse = filters || get().filters;
          let filteredShifts = [...mockShifts];
          
          if (filtersToUse.employeeId) {
            filteredShifts = filteredShifts.filter(s => s.employeeId === filtersToUse.employeeId);
          }
          if (filtersToUse.shiftType) {
            filteredShifts = filteredShifts.filter(s => s.shiftType === filtersToUse.shiftType);
          }
          if (filtersToUse.status) {
            filteredShifts = filteredShifts.filter(s => s.status === filtersToUse.status);
          }
          
          set({ shifts: filteredShifts, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Ошибка при загрузке смен',
            isLoading: false 
          });
        }
      },

      // Получение смены по ID
      fetchShiftById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          const shift = mockShifts.find(s => s.id === id);
          if (!shift) throw new Error('Смена не найдена');
          set({ currentShift: shift, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Ошибка при загрузке смены',
            isLoading: false 
          });
        }
      },

      // Создание новой смены
      createShift: async (shiftData) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          const newShift: Shift = {
            id: Date.now().toString(),
            ...shiftData,
            employeeName: 'Новый сотрудник', // В реальном приложении получать из API
            status: ShiftStatus.SCHEDULED,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          set(state => ({
            shifts: [...state.shifts, newShift],
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Ошибка при создании смены',
            isLoading: false 
          });
        }
      },

      // Обновление смены
      updateShift: async (id: string, updates) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          const updatedShift = mockShifts.map(s => 
            s.id === id 
              ? { ...s, ...updates, updatedAt: new Date().toISOString() }
              : s
          );
          set(state => ({
            shifts: updatedShift,
            currentShift: state.currentShift?.id === id ? updatedShift.find(s => s.id === id) || null : state.currentShift,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Ошибка при обновлении смены',
            isLoading: false 
          });
        }
      },

      // Удаление смены
      deleteShift: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          set(state => ({
            shifts: state.shifts.filter(s => s.id !== id),
            currentShift: state.currentShift?.id === id ? null : state.currentShift,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Ошибка при удалении смены',
            isLoading: false 
          });
        }
      },

      // Начало смены
      startShift: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          const updatedShifts = mockShifts.map(s => 
            s.id === id 
              ? { ...s, status: ShiftStatus.IN_PROGRESS, updatedAt: new Date().toISOString() }
              : s
          );
          set(state => ({
            shifts: updatedShifts,
            currentShift: state.currentShift?.id === id ? updatedShifts.find(s => s.id === id) || null : state.currentShift,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Ошибка при начале смены',
            isLoading: false 
          });
        }
      },

      // Завершение смены
      endShift: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          const updatedShifts = mockShifts.map(s => 
            s.id === id 
              ? { ...s, status: ShiftStatus.COMPLETED, updatedAt: new Date().toISOString() }
              : s
          );
          set(state => ({
            shifts: updatedShifts,
            currentShift: state.currentShift?.id === id ? updatedShifts.find(s => s.id === id) || null : state.currentShift,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Ошибка при завершении смены',
            isLoading: false 
          });
        }
      },

      // Получение статистики
      fetchStatistics: async () => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          const shifts = get().shifts;
          const statistics: ShiftStatistics = {
            totalShifts: shifts.length,
            completedShifts: shifts.filter(s => s.status === ShiftStatus.COMPLETED).length,
            activeShifts: shifts.filter(s => s.status === ShiftStatus.IN_PROGRESS).length,
            upcomingShifts: shifts.filter(s => s.status === ShiftStatus.SCHEDULED).length,
            totalHours: shifts.reduce((total, shift) => {
              const duration = new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime();
              return total + duration / (1000 * 60 * 60);
            }, 0),
            averageShiftDuration: 12, // Моковое значение
            shiftsByType: {
              [ShiftType.DAY]: shifts.filter(s => s.shiftType === ShiftType.DAY).length,
              [ShiftType.NIGHT]: shifts.filter(s => s.shiftType === ShiftType.NIGHT).length,
              [ShiftType.SWING]: shifts.filter(s => s.shiftType === ShiftType.SWING).length,
              [ShiftType.OVERTIME]: shifts.filter(s => s.shiftType === ShiftType.OVERTIME).length,
              [ShiftType.ON_CALL]: shifts.filter(s => s.shiftType === ShiftType.ON_CALL).length,
              [ShiftType.HOLIDAY]: shifts.filter(s => s.shiftType === ShiftType.HOLIDAY).length,
            },
            shiftsByStatus: {
              [ShiftStatus.SCHEDULED]: shifts.filter(s => s.status === ShiftStatus.SCHEDULED).length,
              [ShiftStatus.IN_PROGRESS]: shifts.filter(s => s.status === ShiftStatus.IN_PROGRESS).length,
              [ShiftStatus.COMPLETED]: shifts.filter(s => s.status === ShiftStatus.COMPLETED).length,
              [ShiftStatus.CANCELLED]: shifts.filter(s => s.status === ShiftStatus.CANCELLED).length,
              [ShiftStatus.NO_SHOW]: shifts.filter(s => s.status === ShiftStatus.NO_SHOW).length,
            }
          };
          set({ statistics, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Ошибка при загрузке статистики',
            isLoading: false 
          });
        }
      },

      // Установка текущей смены
      setCurrentShift: (shift) => {
        set({ currentShift: shift });
      },

      // Установка фильтров
      setFilters: (filters) => {
        set({ filters });
      },

      // Очистка ошибки
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'shift-store',
    }
  )
); 