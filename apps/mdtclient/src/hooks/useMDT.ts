import type { Units, Calls911, Bolos } from '@roleplay-identity/db-types';
import { useState } from 'react';

// Моковые данные для демонстрации
const MOCK_UNITS: Units[] = [
  {
    id: '1',
    name: '1-ADAM-12',
    type: 'patrol',
    status: 'available',
    department_id: 1,
    location: 'Downtown',
    updated_at: new Date().toISOString(),
    callsign: '1-ADAM-12',
    created_at: new Date().toISOString(),
    user_id: '',
    character_id: null,
    is_panic: false,
    radio_channel: null,
    badge_number: null,
  },
  {
    id: '2',
    name: '1-BOY-12',
    type: 'patrol',
    status: 'busy',
    department_id: 1,
    location: 'Westside',
    updated_at: new Date().toISOString(),
    callsign: '1-BOY-12',
    created_at: new Date().toISOString(),
    user_id: '',
    character_id: null,
    is_panic: false,
    radio_channel: null,
    badge_number: null,
  },
];

const MOCK_CALLS: Calls911[] = [
  {
    id: '1',
    caller: 'John Doe',
    location: '123 Main St',
    description: 'Domestic disturbance',
    priority: 'high',
    status: 'active',
    assigned_units: ['1'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    type: 'emergency',
    department_id: null,
    full_address: null,
    position: null,
    short_id: null,
    title: null,
    character_id: null,
  },
];

const MOCK_BOLOS: Bolos[] = [
  {
    id: '1',
    type: 'vehicle',
    reason: 'Stolen vehicle',
    priority: 'high',
    status: 'active',
    location: 'Downtown',
    created_at: new Date().toISOString(),
    subject_name: null,
    subject_description: null,
    vehicle_plate: 'ABC123',
    vehicle_description: 'Toyota Camry',
    author_character_id: '1',
    author_full_name: 'Dispatch Officer',
    title: 'Stolen vehicle',
    description: 'Stolen vehicle',
    updated_at: new Date().toISOString(),
    department_id: null,
  },
];

export function useMDTUnits() {
  const [units, setUnits] = useState<Units[]>(MOCK_UNITS);
  const [loading, setLoading] = useState(false);

  const updateUnitStatus = (unitId: string, status: Units['status']) => {
    setUnits((prev) =>
      prev.map((unit) =>
        unit.id === unitId ? { ...unit, status, updated_at: new Date().toISOString() } : unit
      )
    );
  };

  return {
    units,
    loading,
    updateUnitStatus,
  };
}

export function useMDTCalls() {
  const [calls, setCalls] = useState<Calls911[]>(MOCK_CALLS);
  const [loading, setLoading] = useState(false);

  const assignUnitToCall = (callId: string, unitId: string) => {
    setCalls((prev) =>
      prev.map((call) =>
        call.id === callId
          ? { ...call, assigned_units: [...(call.assigned_units || []), unitId] }
          : call
      )
    );
  };

  return {
    calls,
    loading,
    assignUnitToCall,
  };
}

export function useMDTBOLOs() {
  const [bolos, setBolos] = useState<Bolos[]>(MOCK_BOLOS);
  const [loading, setLoading] = useState(false);

  const createBOLO = (bolo: Omit<Bolos, 'id' | 'created_at' | 'updated_at'>) => {
    const newBOLO: Bolos = {
      ...bolo,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setBolos((prev) => [...prev, newBOLO]);
  };

  return {
    bolos,
    loading,
    createBOLO,
  };
} 