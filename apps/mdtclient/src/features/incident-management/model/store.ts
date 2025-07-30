import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Incident {
  id: string;
  type: string;
  location: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'inProgress' | 'resolved';
  timestamp: string;
  assignedUnits?: string[];
  caller?: string;
  phone?: string;
  coordinates?: { x: number; y: number; z: number };
  notes?: string;
}

interface IncidentManagementState {
  incidents: Incident[];
  isLoading: boolean;
  error: string | null;
}

interface IncidentManagementActions {
  addIncident: (incident: Incident) => void;
  updateIncident: (incidentId: string, updates: Partial<Incident>) => void;
  removeIncident: (incidentId: string) => void;
  setIncidents: (incidents: Incident[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getIncidentsByStatus: (status: Incident['status']) => Incident[];
  getIncidentsByPriority: (priority: Incident['priority']) => Incident[];
  getActiveIncidents: () => Incident[];
}

type IncidentManagementStore = IncidentManagementState & IncidentManagementActions;

export const useIncidentManagementStore = create<IncidentManagementStore>()(
  devtools(
    (set, get) => ({
      // State
      incidents: [
        {
          id: '1',
          type: 'Traffic Stop',
          location: 'Random Street',
          description: 'A new emergency just happened.',
          priority: 'medium',
          status: 'pending',
          timestamp: '19:41:50',
          assignedUnits: ['1-ADAM-12'],
          caller: 'Anonymous',
          phone: '911'
        },
        {
          id: '2',
          type: 'Shots Fired',
          location: 'Intersection of Power St and Innocence Blvd',
          description: 'Reports of shots fired.',
          priority: 'high',
          status: 'assigned',
          timestamp: '14:12:31',
          assignedUnits: ['1-ADAM-12', '1-ADAM-14'],
          caller: 'John Smith',
          phone: '555-0123'
        }
      ],
      isLoading: false,
      error: null,

      // Actions
      addIncident: (incident) => set((state) => ({ 
        incidents: [...state.incidents, incident] 
      })),

      updateIncident: (incidentId, updates) => set((state) => ({ 
        incidents: state.incidents.map(incident => 
          incident.id === incidentId ? { ...incident, ...updates } : incident
        ) 
      })),

      removeIncident: (incidentId) => set((state) => ({ 
        incidents: state.incidents.filter(incident => incident.id !== incidentId) 
      })),

      setIncidents: (incidents) => set({ incidents }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      getIncidentsByStatus: (status) => {
        const { incidents } = get();
        return incidents.filter(incident => incident.status === status);
      },

      getIncidentsByPriority: (priority) => {
        const { incidents } = get();
        return incidents.filter(incident => incident.priority === priority);
      },

      getActiveIncidents: () => {
        const { incidents } = get();
        return incidents.filter(incident => 
          incident.status === 'pending' || 
          incident.status === 'assigned' || 
          incident.status === 'inProgress'
        );
      }
    }),
    {
      name: 'incident-management-store'
    }
  )
); 