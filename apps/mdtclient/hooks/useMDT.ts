import { useState, useEffect, useCallback } from 'react';
import { MDTUnit, MDTCall911, Signal, SignalNotification, CreateUnitData, CreateCallData, CreateSignalData, UpdateUnitData, UpdateCallData, UpdateSignalData, Location } from '../services/api';
import { MOCK_UNITS, MOCK_CALLS, MOCK_SIGNALS } from '../constants';

// === MDT UNITS HOOK ===
export const useMDTUnits = () => {
  const [units, setUnits] = useState<MDTUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ВРЕМЕННО: используем mock данные вместо API
      // const response = await apiService.getMDTUnits();
      // if (response.success && response.data) {
      //   setUnits(response.data);
      // } else {
      //   setError(response.error || 'Failed to fetch units');
      // }
      
      // Mock данные
      setTimeout(() => {
        setUnits(MOCK_UNITS as any);
        setLoading(false);
      }, 500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, []);

  const createUnit = useCallback(async (unitData: CreateUnitData) => {
    try {
      setError(null);
      // ВРЕМЕННО: mock создание юнита
      const newUnit: MDTUnit = {
        id: `unit_${Date.now()}`,
        characterId: unitData.characterId,
        unitNumber: unitData.unitNumber,
        departmentId: unitData.departmentId,
        status: unitData.status || 'available',
        location: unitData.location,
        vehicleId: unitData.vehicleId,
        isPanic: false,
        lastUpdate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      
      setUnits(prev => [...prev, newUnit]);
      return { success: true, data: newUnit };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  const updateUnitStatus = useCallback(async (unitId: string, status: string) => {
    try {
      setError(null);
      // ВРЕМЕННО: mock обновление статуса
      setUnits(prev => prev.map(unit => 
        unit.id === unitId ? { ...unit, status, lastUpdate: new Date().toISOString() } : unit
      ));
      
      const updatedUnit = units.find(u => u.id === unitId);
      return { success: true, data: updatedUnit };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [units]);

  const updateUnitLocation = useCallback(async (unitId: string, location: Location) => {
    try {
      setError(null);
      // ВРЕМЕННО: mock обновление локации
      setUnits(prev => prev.map(unit => 
        unit.id === unitId ? { ...unit, location, lastUpdate: new Date().toISOString() } : unit
      ));
      
      const updatedUnit = units.find(u => u.id === unitId);
      return { success: true, data: updatedUnit };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [units]);

  const activatePanic = useCallback(async (unitId: string) => {
    try {
      setError(null);
      // ВРЕМЕННО: mock активация паники
      setUnits(prev => prev.map(unit => 
        unit.id === unitId ? { ...unit, isPanic: true, lastUpdate: new Date().toISOString() } : unit
      ));
      
      const updatedUnit = units.find(u => u.id === unitId);
      return { success: true, data: updatedUnit };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [units]);

  const deactivatePanic = useCallback(async (unitId: string) => {
    try {
      setError(null);
      // ВРЕМЕННО: mock деактивация паники
      setUnits(prev => prev.map(unit => 
        unit.id === unitId ? { ...unit, isPanic: false, lastUpdate: new Date().toISOString() } : unit
      ));
      
      const updatedUnit = units.find(u => u.id === unitId);
      return { success: true, data: updatedUnit };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [units]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  return {
    units,
    loading,
    error,
    fetchUnits,
    createUnit,
    updateUnitStatus,
    updateUnitLocation,
    activatePanic,
    deactivatePanic,
  };
};

// === MDT CALLS HOOK ===
export const useMDTCalls = () => {
  const [calls, setCalls] = useState<MDTCall911[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalls = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ВРЕМЕННО: используем mock данные
      setTimeout(() => {
        setCalls(MOCK_CALLS as any);
        setLoading(false);
      }, 500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, []);

  const createCall = useCallback(async (callData: CreateCallData) => {
    try {
      setError(null);
      // ВРЕМЕННО: mock создание вызова
      const newCall: MDTCall911 = {
        id: `call_${Date.now()}`,
        callerName: callData.callerName,
        callerPhone: callData.callerPhone,
        location: callData.location,
        description: callData.description,
        type: callData.type,
        priority: callData.priority || 1,
        status: callData.status || 'pending',
        assignedUnits: [],
        patientInfo: callData.patientInfo,
        fireInfo: callData.fireInfo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setCalls(prev => [...prev, newCall]);
      return { success: true, data: newCall };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  const updateCall = useCallback(async (callId: string, callData: UpdateCallData) => {
    try {
      setError(null);
      // ВРЕМЕННО: mock обновление вызова
      setCalls(prev => prev.map(call => 
        call.id === callId ? { ...call, ...callData, updatedAt: new Date().toISOString() } : call
      ));
      
      const updatedCall = calls.find(c => c.id === callId);
      return { success: true, data: updatedCall };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [calls]);

  const assignUnitsToCall = useCallback(async (callId: string, unitIds: number[]) => {
    try {
      setError(null);
      // ВРЕМЕННО: mock назначение юнитов
      setCalls(prev => prev.map(call => 
        call.id === callId ? { ...call, assignedUnits: unitIds, updatedAt: new Date().toISOString() } : call
      ));
      
      const updatedCall = calls.find(c => c.id === callId);
      return { success: true, data: updatedCall };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [calls]);

  const updateCallStatus = useCallback(async (callId: string, status: string) => {
    try {
      setError(null);
      // ВРЕМЕННО: mock обновление статуса вызова
      setCalls(prev => prev.map(call => 
        call.id === callId ? { ...call, status, updatedAt: new Date().toISOString() } : call
      ));
      
      const updatedCall = calls.find(c => c.id === callId);
      return { success: true, data: updatedCall };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [calls]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  return {
    calls,
    loading,
    error,
    fetchCalls,
    createCall,
    updateCall,
    assignUnitsToCall,
    updateCallStatus,
  };
};

// === MDT SIGNALS HOOK ===
export const useMDTSignals = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSignals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ВРЕМЕННО: используем mock данные
      setTimeout(() => {
        setSignals(MOCK_SIGNALS as any);
        setLoading(false);
      }, 500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, []);

  const createSignal = useCallback(async (signalData: CreateSignalData) => {
    try {
      setError(null);
      // ВРЕМЕННО: mock создание сигнала
      const newSignal: Signal = {
        id: `signal_${Date.now()}`,
        title: signalData.title,
        description: signalData.description,
        type: signalData.type,
        authorId: signalData.authorId,
        authorName: 'Current User',
        priority: signalData.priority || 'medium',
        location: signalData.location,
        coordinates: signalData.coordinates,
        isActive: signalData.isActive !== false,
        expiresAt: signalData.expiresAt,
        createdAt: new Date().toISOString(),
      };
      
      setSignals(prev => [...prev, newSignal]);
      return { success: true, data: newSignal };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  const updateSignal = useCallback(async (signalId: string, signalData: UpdateSignalData) => {
    try {
      setError(null);
      // ВРЕМЕННО: mock обновление сигнала
      setSignals(prev => prev.map(signal => 
        signal.id === signalId ? { ...signal, ...signalData } : signal
      ));
      
      const updatedSignal = signals.find(s => s.id === signalId);
      return { success: true, data: updatedSignal };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [signals]);

  const revokeSignal = useCallback(async (signalId: string) => {
    try {
      setError(null);
      // ВРЕМЕННО: mock отзыв сигнала
      setSignals(prev => prev.map(signal => 
        signal.id === signalId ? { ...signal, isActive: false } : signal
      ));
      
      return { success: true, data: { message: 'Signal revoked successfully' } };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  const notifySignal = useCallback(async (signalId: string) => {
    try {
      setError(null);
      // ВРЕМЕННО: mock уведомление о сигнале
      return { success: true, data: { message: 'Signal notification sent successfully' } };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  return {
    signals,
    loading,
    error,
    fetchSignals,
    createSignal,
    updateSignal,
    revokeSignal,
    notifySignal,
  };
};

// === MDT NOTIFICATIONS HOOK ===
export const useMDTNotifications = () => {
  const [notifications, setNotifications] = useState<SignalNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ВРЕМЕННО: используем mock данные
      setTimeout(() => {
        setNotifications([]);
        setLoading(false);
      }, 500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      setError(null);
      // ВРЕМЕННО: mock отметка как прочитанное
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ));
      
      const updatedNotification = notifications.find(n => n.id === notificationId);
      return { success: true, data: updatedNotification };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markNotificationAsRead,
  };
};

// === MDT DASHBOARD HOOK ===
export const useMDTDashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ВРЕМЕННО: используем mock данные
      setTimeout(() => {
        setDashboardData({
          activeUnits: 5,
          activeCalls: 3,
          activeSignals: 2,
          recentActivity: []
        });
        setLoading(false);
      }, 500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboardData,
    loading,
    error,
    fetchDashboard,
  };
}; 