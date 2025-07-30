import { create } from 'zustand';
import { EmsPersonnel, EmsPersonnelSearchParams } from './types';

interface PersonnelState {
  personnel: EmsPersonnel[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setPersonnel: (personnel: EmsPersonnel[]) => void;
  addPersonnel: (personnel: EmsPersonnel) => void;
  updatePersonnel: (id: string, updates: Partial<EmsPersonnel>) => void;
  deletePersonnel: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getPersonnelByRank: (rank: string) => EmsPersonnel[];
  getPersonnelByDepartment: (department: string) => EmsPersonnel[];
  getPersonnelByStatus: (status: string) => EmsPersonnel[];
  getActivePersonnel: () => EmsPersonnel[];
  getPersonnelByUnit: (unitId: string) => EmsPersonnel[];
}

export const usePersonnelStore = create<PersonnelState>((set, get) => ({
  personnel: [],
  loading: false,
  error: null,
  
  setPersonnel: (personnel) => set({ personnel }),
  
  addPersonnel: (personnel) => set((state) => ({
    personnel: [personnel, ...state.personnel]
  })),
  
  updatePersonnel: (id, updates) => set((state) => ({
    personnel: state.personnel.map(person => 
      person.id === id ? { ...person, ...updates, updatedAt: new Date().toISOString() } : person
    )
  })),
  
  deletePersonnel: (id) => set((state) => ({
    personnel: state.personnel.filter(person => person.id !== id)
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  getPersonnelByRank: (rank) => get().personnel.filter(person => person.rank === rank),
  
  getPersonnelByDepartment: (department) => get().personnel.filter(person => person.department === department),
  
  getPersonnelByStatus: (status) => get().personnel.filter(person => person.employmentInfo.status === status),
  
  getActivePersonnel: () => get().personnel.filter(person => person.employmentInfo.status === 'active'),
  
  getPersonnelByUnit: (unitId) => get().personnel.filter(person => person.unitId === unitId),
})); 