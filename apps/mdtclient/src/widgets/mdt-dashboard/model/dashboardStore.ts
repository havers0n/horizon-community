import { DispatchApi } from '@/shared/api/dispatch';
import type { Bolos, Calls911, Units } from '@roleplay-identity/db-types';
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { authUtils } from '../../../lib/auth';
import { useRealTime } from '../../../../hooks/useRealTime';
import { useEffect } from 'react';

// Временные константы для WebSocket событий (пока не подключена схема)
const WEBSOCKET_EVENTS = {
  NEW_CALL: 'call:new',
  CALL_STATUS_UPDATE: 'call:status_update',
  CALL_COMPLETED: 'call:completed',
  NEW_BOLO: 'bolo:new',
  BOLO_UPDATE: 'bolo:update',
  BOLO_REMOVED: 'bolo:removed',
  UNIT_STATUS_UPDATE: 'unit:status_update',
} as const;

// Типы для состояния дашборда
interface DashboardState {
  // Основные данные
  currentOfficer: Units | null;
  activeCalls: Calls911[];
  activeBolos: Bolos[];

  // Состояние загрузки
  isLoading: boolean;
  error: string | null;

  // Статистика
  stats: {
    totalCalls: number;
    activeIncidents: number;
    availableUnits: number;
    pendingCalls: number;
    completedCalls: number;
  };

  // Флаги состояния
  isInitialized: boolean;
  lastUpdate: string;
}

// Действия для управления состоянием
interface DashboardActions {
  // Инициализация и загрузка данных
  fetchDashboardData: () => Promise<void>;
  initializeDashboard: () => Promise<void>;

  // Управление офицером
  setCurrentOfficer: (officer: Units | null) => void;
  changeOfficerStatus: (newStatus: Units['status']) => Promise<void>;

  // Управление вызовами
  setActiveCalls: (calls: Calls911[]) => void;
  addCall: (call: Calls911) => void;
  updateCall: (callId: string, updates: Partial<Calls911>) => void;
  removeCall: (callId: string) => void;

  // Управление BOLO
  setActiveBolos: (bolos: Bolos[]) => void;
  addBolo: (bolo: Bolos) => void;
  updateBolo: (boloId: string, updates: Partial<Bolos>) => void;
  removeBolo: (boloId: string) => void;

  // Управление состоянием
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setStats: (stats: DashboardState['stats']) => void;

  // Очистка состояния
  reset: () => void;
}

// Полный тип стора
type DashboardStore = DashboardState & DashboardActions;

// Начальное состояние
const initialState: DashboardState = {
  currentOfficer: null,
  activeCalls: [],
  activeBolos: [],
  isLoading: false,
  error: null,
  stats: {
    totalCalls: 0,
    activeIncidents: 0,
    availableUnits: 0,
    pendingCalls: 0,
    completedCalls: 0,
  },
  isInitialized: false,
  lastUpdate: new Date().toISOString(),
};

// WebSocket Event Type
interface WebSocketEvent<T> {
  type: string;
  data: T;
}

// Создание стора с Zustand
export const useDashboardStore = create<DashboardStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // Инициализация дашборда
      initializeDashboard: async () => {
        const { setLoading, setError, fetchDashboardData } = get();

        try {
          setLoading(true);
          setError(null);

          await fetchDashboardData();

          set({ isInitialized: true });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Ошибка инициализации дашборда';
          setError(errorMessage);
          console.error('Dashboard initialization error:', error);
        } finally {
          setLoading(false);
        }
      },

      // Загрузка всех данных дашборда
      fetchDashboardData: async () => {
        const { setLoading, setError, setActiveCalls, setActiveBolos, setStats, setCurrentOfficer } =
          get();

        try {
          setLoading(true);
          setError(null);

          // Проверяем аутентификацию перед загрузкой данных
          const token = authUtils.getToken();

          if (!token) {
            setError('Требуется авторизация');
            setLoading(false);
            return;
          }

          // Параллельная загрузка всех данных
          const [callsResponse, bolosResponse, statsResponse, unitsResponse] =
            await Promise.allSettled([
              DispatchApi.getActiveCalls(),
              DispatchApi.getActiveBolos(),
              DispatchApi.getDispatchStats(),
              DispatchApi.getActiveUnits(),
            ]);

          // Обработка результатов вызовов
          if (callsResponse.status === 'fulfilled') {
            if (Array.isArray(callsResponse.value)) {
              setActiveCalls(callsResponse.value);
            } else {
              console.warn('Unexpected calls response format:', callsResponse.value);
              setActiveCalls([]);
            }
          } else {
            console.error('Failed to fetch calls:', callsResponse.reason);
            setActiveCalls([]);
          }

          // Обработка результатов BOLO
          if (bolosResponse.status === 'fulfilled') {
            if (Array.isArray(bolosResponse.value)) {
              setActiveBolos(bolosResponse.value);
            } else {
              console.warn('Unexpected BOLOs response format:', bolosResponse.value);
              setActiveBolos([]);
            }
          } else {
            console.error('Failed to fetch BOLOs:', bolosResponse.reason);
            setActiveBolos([]);
          }

          // Обработка статистики
          if (statsResponse.status === 'fulfilled') {
            if (statsResponse.value && typeof statsResponse.value === 'object') {
              const apiStats = statsResponse.value as any;
              setStats({
                totalCalls: apiStats.activeCallsCount || 0,
                activeIncidents: apiStats.activeBolosCount || 0,
                availableUnits: apiStats.activeUnitsCount || 0,
                pendingCalls: apiStats.pendingCallsCount || 0,
                completedCalls: 0,
              });
            } else {
              console.warn('Unexpected stats response format:', statsResponse.value);
              setStats(initialState.stats);
            }
          } else {
            console.error('Failed to fetch stats:', statsResponse.reason);
            setStats(initialState.stats);
          }

          // Обработка юнитов (поиск текущего офицера)
          if (unitsResponse.status === 'fulfilled') {
            if (Array.isArray(unitsResponse.value)) {
              const currentOfficer =
                unitsResponse.value.find((unit) => unit.status === 'available') || null;
              setCurrentOfficer(currentOfficer);
            } else {
              console.warn('Unexpected units response format:', unitsResponse.value);
              setCurrentOfficer(null);
            }
          } else {
            console.error('Failed to fetch units:', unitsResponse.reason);
            setCurrentOfficer(null);
          }

          set({ lastUpdate: new Date().toISOString() });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки данных';
          setError(errorMessage);
          console.error('Dashboard data fetch error:', error);

          // Устанавливаем пустые значения при ошибке
          setActiveCalls([]);
          setActiveBolos([]);
          setStats(initialState.stats);
          setCurrentOfficer(null);
        } finally {
          setLoading(false);
        }
      },

      // Управление текущим офицером
      setCurrentOfficer: (officer) => {
        set({ currentOfficer: officer });
      },

      changeOfficerStatus: async (newStatus) => {
        const { currentOfficer, setCurrentOfficer, setError } = get();

        if (!currentOfficer) {
          setError('Текущий офицер не определен');
          return;
        }

        try {
          await DispatchApi.updateUnitStatus(currentOfficer.id, newStatus);
          setCurrentOfficer({ ...currentOfficer, status: newStatus });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Ошибка изменения статуса';
          setError(errorMessage);
          console.error('Status change error:', error);
        }
      },

      // Управление вызовами
      setActiveCalls: (calls) => {
        set({ activeCalls: calls });
      },

      addCall: (call) => {
        set((state) => ({
          activeCalls: [...state.activeCalls, call],
          stats: {
            ...state.stats,
            totalCalls: state.stats.totalCalls + 1,
            pendingCalls: state.stats.pendingCalls + 1,
          },
        }));
      },

      updateCall: (callId, updates) => {
        set((state) => ({
          activeCalls: state.activeCalls.map((call) =>
            call.id === callId ? { ...call, ...updates } : call
          ),
        }));
      },

      removeCall: (callId) => {
        set((state) => ({
          activeCalls: state.activeCalls.filter((call) => call.id !== callId),
          stats: {
            ...state.stats,
            pendingCalls: Math.max(0, state.stats.pendingCalls - 1),
            completedCalls: state.stats.completedCalls + 1,
          },
        }));
      },

      // Управление BOLO
      setActiveBolos: (bolos) => {
        set({ activeBolos: bolos });
      },

      addBolo: (bolo) => {
        set((state) => ({
          activeBolos: [...state.activeBolos, bolo],
        }));
      },

      updateBolo: (boloId, updates) => {
        set((state) => ({
          activeBolos: state.activeBolos.map((bolo) =>
            bolo.id === boloId ? { ...bolo, ...updates } : bolo
          ),
        }));
      },

      removeBolo: (boloId) => {
        set((state) => ({
          activeBolos: state.activeBolos.filter((bolo) => bolo.id !== boloId),
        }));
      },

      // Управление состоянием
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      setStats: (stats) => {
        set({ stats });
      },

      // Сброс состояния
      reset: () => {
        set(initialState);
      },
    })),
    {
      name: 'dashboard-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Хук для Real-Time обновлений
export const useDashboardRealTime = () => {
  const { addCall, updateCall, removeCall, addBolo, updateBolo, removeBolo, setCurrentOfficer } =
    useDashboardStore();

  const { onEvent, offEvent } = useRealTime(['dashboard', 'calls', 'bolos', 'units']);

  // Обработчики Real-Time событий
  useEffect(() => {
    // Обработка новых вызовов
    const handleNewCall = (event: WebSocketEvent<Calls911>) => {
      if (event.type === WEBSOCKET_EVENTS.NEW_CALL) {
        addCall(event.data);
      }
    };

    // Обработка обновлений вызовов
    const handleCallUpdate = (event: WebSocketEvent<{ callId: string; status: Calls911['status'] }>) => {
      if (event.type === WEBSOCKET_EVENTS.CALL_STATUS_UPDATE) {
        updateCall(event.data.callId, { status: event.data.status });
      }
    };

    // Обработка завершения вызовов
    const handleCallComplete = (event: WebSocketEvent<{ callId: string }>) => {
      if (event.type === WEBSOCKET_EVENTS.CALL_COMPLETED) {
        removeCall(event.data.callId);
      }
    };

    // Обработка новых BOLO
    const handleNewBolo = (event: WebSocketEvent<Bolos>) => {
      if (event.type === WEBSOCKET_EVENTS.NEW_BOLO) {
        addBolo(event.data);
      }
    };

    // Обработка обновлений BOLO
    const handleBoloUpdate = (event: WebSocketEvent<{ boloId: string; updates: Partial<Bolos> }>) => {
      if (event.type === WEBSOCKET_EVENTS.BOLO_UPDATE) {
        updateBolo(event.data.boloId, event.data.updates);
      }
    };

    // Обработка удаления BOLO
    const handleBoloRemove = (event: WebSocketEvent<{ boloId: string }>) => {
      if (event.type === WEBSOCKET_EVENTS.BOLO_REMOVED) {
        removeBolo(event.data.boloId);
      }
    };

    // Обработка обновлений юнитов
    const handleUnitUpdate = (event: WebSocketEvent<Units>) => {
      if (event.type === WEBSOCKET_EVENTS.UNIT_STATUS_UPDATE) {
        const { currentOfficer } = useDashboardStore.getState();
        if (currentOfficer && currentOfficer.id === event.data.id) {
          setCurrentOfficer(event.data);
        }
      }
    };

    // Регистрируем обработчики
    onEvent(WEBSOCKET_EVENTS.NEW_CALL, handleNewCall as (event: unknown) => void);
    onEvent(WEBSOCKET_EVENTS.CALL_STATUS_UPDATE, handleCallUpdate as (event: unknown) => void);
    onEvent(WEBSOCKET_EVENTS.CALL_COMPLETED, handleCallComplete as (event: unknown) => void);
    onEvent(WEBSOCKET_EVENTS.NEW_BOLO, handleNewBolo as (event: unknown) => void);
    onEvent(WEBSOCKET_EVENTS.BOLO_UPDATE, handleBoloUpdate as (event: unknown) => void);
    onEvent(WEBSOCKET_EVENTS.BOLO_REMOVED, handleBoloRemove as (event: unknown) => void);
    onEvent(WEBSOCKET_EVENTS.UNIT_STATUS_UPDATE, handleUnitUpdate as (event: unknown) => void);

    // Очистка обработчиков
    return () => {
      offEvent(WEBSOCKET_EVENTS.NEW_CALL);
      offEvent(WEBSOCKET_EVENTS.CALL_STATUS_UPDATE);
      offEvent(WEBSOCKET_EVENTS.CALL_COMPLETED);
      offEvent(WEBSOCKET_EVENTS.NEW_BOLO);
      offEvent(WEBSOCKET_EVENTS.BOLO_UPDATE);
      offEvent(WEBSOCKET_EVENTS.BOLO_REMOVED);
      offEvent(WEBSOCKET_EVENTS.UNIT_STATUS_UPDATE);
    };
  }, [
    onEvent,
    offEvent,
    addCall,
    updateCall,
    removeCall,
    addBolo,
    updateBolo,
    removeBolo,
    setCurrentOfficer,
  ]);

  return null; // Этот хук не возвращает данных, только настраивает подписки
};

// Селекторы для оптимизации производительности
export const useDashboardSelectors = () => {
  const currentOfficer = useDashboardStore((state) => state.currentOfficer);
  const activeCalls = useDashboardStore((state) => state.activeCalls);
  const activeBolos = useDashboardStore((state) => state.activeBolos);
  const isLoading = useDashboardStore((state) => state.isLoading);
  const error = useDashboardStore((state) => state.error);
  const stats = useDashboardStore((state) => state.stats);
  const isInitialized = useDashboardStore((state) => state.isInitialized);

  return {
    currentOfficer,
    activeCalls,
    activeBolos,
    isLoading,
    error,
    stats,
    isInitialized,
  };
};

// Хук для действий дашборда
export const useDashboardActions = () => {
  const fetchDashboardData = useDashboardStore((state) => state.fetchDashboardData);
  const initializeDashboard = useDashboardStore((state) => state.initializeDashboard);
  const changeOfficerStatus = useDashboardStore((state) => state.changeOfficerStatus);
  const reset = useDashboardStore((state) => state.reset);

  return {
    fetchDashboardData,
    initializeDashboard,
    changeOfficerStatus,
    reset,
  };
};