// @ts-nocheck - TODO: Remove after major refactoring is complete
import { useState, useEffect } from 'react';
import type { Unit, Call911, BOLO } from '@/shared/types';

// Моковые данные для демонстрации
const MOCK_UNITS: Unit[] = [
  {
    id: '1',
    name: '1-ADAM-12',
    type: 'patrol',
    status: 'available',
    departmentId: 1,
    location: 'Downtown',
    lastUpdate: new Date().toISOString(),
    callsign: '1-ADAM-12'
  },
  {
    id: '2',
    name: '1-BOY-12',
    type: 'patrol',
    status: 'busy',
    departmentId: 1,
    location: 'Westside',
    lastUpdate: new Date().toISOString(),
    callsign: '1-BOY-12'
  }
];

const MOCK_CALLS: Call911[] = [
  {
    id: '1',
    caller: 'John Doe',
    location: '123 Main St',
    description: 'Domestic disturbance',
    priority: 'high',
    status: 'active',
    assignedUnits: ['1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: 'emergency'
  }
];

const MOCK_BOLOS: BOLO[] = [
  {
    id: '1',
    type: 'vehicle',
    description: 'Stolen vehicle',
    priority: 'high',
    status: 'active',
    createdAt: new Date().toISOString(),
    author: 'Dispatch',
    vehicle: {
      plate: 'ABC123',
      model: 'Toyota Camry',
      color: 'Red'
    }
  }
];

export function useMDTUnits() {
  const [units, setUnits] = useState<Unit[]>(MOCK_UNITS);
  const [loading, setLoading] = useState(false);

  const updateUnitStatus = (unitId: string, status: Unit['status']) => {
    setUnits(prev => prev.map(unit => 
      unit.id === unitId ? { ...unit, status, lastUpdate: new Date().toISOString() } : unit
    ));
  };

  return {
    units,
    loading,
    updateUnitStatus
  };
}

export function useMDTCalls() {
  const [calls, setCalls] = useState<Call911[]>(MOCK_CALLS);
  const [loading, setLoading] = useState(false);

  const assignUnitToCall = (callId: string, unitId: string) => {
    setCalls(prev => prev.map(call => 
      call.id === callId 
        ? { ...call, assignedUnits: [...call.assignedUnits, unitId] }
        : call
    ));
  };

  return {
    calls,
    loading,
    assignUnitToCall
  };
}

export function useMDTBOLOs() {
  const [bolos, setBolos] = useState<BOLO[]>(MOCK_BOLOS);
  const [loading, setLoading] = useState(false);

  const createBOLO = (bolo: Omit<BOLO, 'id' | 'createdAt'>) => {
    const newBOLO: BOLO = {
      ...bolo,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setBolos(prev => [...prev, newBOLO]);
  };

  return {
    bolos,
    loading,
    createBOLO
  };
} 