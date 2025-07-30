import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Unit {
  id: string;
  name: string;
  department: string;
  status: 'available' | 'busy' | 'enRoute' | 'onScene' | 'unavailable' | 'panic';
  location?: string;
  callSign: string;
  vehicle?: string;
  qualifications?: string[];
  rank?: string;
  division?: string;
}

interface UnitManagementState {
  units: Unit[];
  isLoading: boolean;
  error: string | null;
}

interface UnitManagementActions {
  addUnit: (unit: Unit) => void;
  updateUnitStatus: (unitId: string, status: Unit['status']) => void;
  updateUnit: (unitId: string, updates: Partial<Unit>) => void;
  removeUnit: (unitId: string) => void;
  setUnits: (units: Unit[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getUnitsByDepartment: (department: string) => Unit[];
  getUnitsByStatus: (status: Unit['status']) => Unit[];
}

type UnitManagementStore = UnitManagementState & UnitManagementActions;

export const useUnitManagementStore = create<UnitManagementStore>()(
  devtools(
    (set, get) => ({
      // State
      units: [
        {
          id: '1',
          name: 'John Doe',
          department: 'LSPD',
          status: 'available',
          callSign: '1-ADAM-12',
          vehicle: 'LSPD Cruiser #12',
          qualifications: ['Patrol', 'Traffic'],
          rank: 'Officer',
          division: 'Patrol Division'
        },
        {
          id: '2',
          name: 'Jane Smith',
          department: 'BCSO',
          status: 'enRoute',
          callSign: '2-LINCOLN-5',
          vehicle: 'BCSO SUV #5',
          qualifications: ['K-9', 'SWAT'],
          rank: 'Deputy',
          division: 'K-9 Unit'
        },
        {
          id: '3',
          name: 'Mike Johnson',
          department: 'LSFD',
          status: 'onScene',
          callSign: 'E-15',
          vehicle: 'Fire Engine #15',
          qualifications: ['Firefighter', 'EMT'],
          rank: 'Firefighter',
          division: 'Engine Company'
        }
      ],
      isLoading: false,
      error: null,

      // Actions
      addUnit: (unit) => set((state) => ({ 
        units: [...state.units, unit] 
      })),

      updateUnitStatus: (unitId, status) => set((state) => ({ 
        units: state.units.map(unit => 
          unit.id === unitId ? { ...unit, status } : unit
        ) 
      })),

      updateUnit: (unitId, updates) => set((state) => ({ 
        units: state.units.map(unit => 
          unit.id === unitId ? { ...unit, ...updates } : unit
        ) 
      })),

      removeUnit: (unitId) => set((state) => ({ 
        units: state.units.filter(unit => unit.id !== unitId) 
      })),

      setUnits: (units) => set({ units }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      getUnitsByDepartment: (department) => {
        const { units } = get();
        return units.filter(unit => unit.department === department);
      },

      getUnitsByStatus: (status) => {
        const { units } = get();
        return units.filter(unit => unit.status === status);
      }
    }),
    {
      name: 'unit-management-store'
    }
  )
); 