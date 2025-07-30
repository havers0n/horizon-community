import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BoloApi, CreateBoloData, UpdateBoloData } from '../api/boloApi';

export interface BOLO {
  id: string;
  type: 'vehicle' | 'person' | 'general' | 'test_type';
  description: string;
  vehicle?: string;
  plate?: string;
  reason: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  issuedBy: string;
  status: 'active' | 'resolved' | 'expired';
  location?: string;
  additionalInfo?: string;
}

interface BoloManagementState {
  bolos: BOLO[];
  isLoading: boolean;
  error: string | null;
}

interface BoloManagementActions {
  // API Actions
  fetchBOLOs: () => Promise<void>;
  createBOLO: (data: CreateBoloData) => Promise<void>;
  updateBOLO: (boloId: string, data: UpdateBoloData) => Promise<void>;
  deleteBOLO: (boloId: string) => Promise<void>;
  
  // Local Actions
  addBOLO: (bolo: BOLO) => void;
  updateBOLOLocal: (boloId: string, updates: Partial<BOLO>) => void;
  removeBOLOLocal: (boloId: string) => void;
  setBOLOs: (bolos: BOLO[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Selectors
  getBOLOsByType: (type: BOLO['type']) => BOLO[];
  getActiveBOLOs: () => BOLO[];
  getBOLOsByPriority: (priority: BOLO['priority']) => BOLO[];
}

type BoloManagementStore = BoloManagementState & BoloManagementActions;

export const useBoloManagementStore = create<BoloManagementStore>()(
  devtools(
    (set, get) => ({
      // State
      bolos: [],
      isLoading: false,
      error: null,

      // API Actions
      fetchBOLOs: async () => {
        set({ isLoading: true, error: null });
        try {
          const bolos = await BoloApi.getBolos();
          set({ bolos, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch BOLOs', 
            isLoading: false 
          });
        }
      },

      createBOLO: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const newBolo = await BoloApi.createBolo(data);
          set((state) => ({ 
            bolos: [newBolo, ...state.bolos], 
            isLoading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create BOLO', 
            isLoading: false 
          });
        }
      },

      updateBOLO: async (boloId, data) => {
        set({ isLoading: true, error: null });
        try {
          const updatedBolo = await BoloApi.updateBolo(boloId, data);
          set((state) => ({ 
            bolos: state.bolos.map(bolo => 
              bolo.id === boloId ? updatedBolo : bolo
            ), 
            isLoading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update BOLO', 
            isLoading: false 
          });
        }
      },

      deleteBOLO: async (boloId) => {
        set({ isLoading: true, error: null });
        try {
          await BoloApi.deleteBolo(boloId);
          set((state) => ({ 
            bolos: state.bolos.filter(bolo => bolo.id !== boloId), 
            isLoading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete BOLO', 
            isLoading: false 
          });
        }
      },

      // Local Actions
      addBOLO: (bolo) => set((state) => ({ 
        bolos: [...state.bolos, bolo] 
      })),

      updateBOLOLocal: (boloId, updates) => set((state) => ({ 
        bolos: state.bolos.map(bolo => 
          bolo.id === boloId ? { ...bolo, ...updates } : bolo
        ) 
      })),

      removeBOLOLocal: (boloId) => set((state) => ({ 
        bolos: state.bolos.filter(bolo => bolo.id !== boloId) 
      })),

      setBOLOs: (bolos) => set({ bolos }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      // Selectors
      getBOLOsByType: (type) => {
        const { bolos } = get();
        return bolos.filter(bolo => bolo.type === type);
      },

      getActiveBOLOs: () => {
        const { bolos } = get();
        return bolos.filter(bolo => bolo.status === 'active');
      },

      getBOLOsByPriority: (priority) => {
        const { bolos } = get();
        return bolos.filter(bolo => bolo.priority === priority);
      }
    }),
    {
      name: 'bolo-management-store'
    }
  )
); 