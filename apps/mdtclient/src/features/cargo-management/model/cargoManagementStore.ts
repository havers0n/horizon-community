import { create } from 'zustand';
import type { 
    CargoManagementState, 
    CargoManagementActions, 
    CreateCargoData, 
    Cargo 
} from './types';

// Mock data for cargo
const MOCK_CARGOS: Cargo[] = [
    {
        id: 'cargo_1',
        type: 'electronics',
        description: 'Электронные компоненты для производства',
        weight: 500,
        origin: 'Los Santos Port',
        destination: 'Downtown Warehouse',
        status: 'in_transit',
        driver: 'John Smith',
        vehicle: 'Truck-001',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z',
        estimatedDelivery: '2024-01-16T18:00:00Z',
        notes: 'Хрупкий груз, требует осторожной транспортировки',
    },
    {
        id: 'cargo_2',
        type: 'furniture',
        description: 'Офисная мебель',
        weight: 1200,
        origin: 'IKEA Warehouse',
        destination: 'Business Center',
        status: 'pending',
        driver: 'Mike Johnson',
        vehicle: 'Truck-002',
        createdAt: '2024-01-14T09:00:00Z',
        updatedAt: '2024-01-14T09:00:00Z',
        estimatedDelivery: '2024-01-17T12:00:00Z',
    },
];

type CargoManagementStore = CargoManagementState & CargoManagementActions;

export const cargoManagementStore = create<CargoManagementStore>((set, get) => ({
    // State
    cargos: MOCK_CARGOS,
    selectedCargo: null,
    isLoading: false,
    error: null,
    showCreateModal: false,
    showDetailsModal: false,

    // Actions
    createCargo: async (data: CreateCargoData) => {
        set({ isLoading: true, error: null });
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const newCargo: Cargo = {
                id: `cargo_${Date.now()}`,
                ...data,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            set(state => ({
                cargos: [...state.cargos, newCargo],
                showCreateModal: false,
                isLoading: false,
            }));
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Ошибка при создании груза',
                isLoading: false 
            });
        }
    },

    deleteCargo: async (cargoId: string) => {
        set({ isLoading: true, error: null });
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            set(state => ({
                cargos: state.cargos.filter(cargo => cargo.id !== cargoId),
                selectedCargo: state.selectedCargo?.id === cargoId ? null : state.selectedCargo,
                isLoading: false,
            }));
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Ошибка при удалении груза',
                isLoading: false 
            });
        }
    },

    updateCargoStatus: async (cargoId: string, status: Cargo['status']) => {
        set({ isLoading: true, error: null });
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            set(state => ({
                cargos: state.cargos.map(cargo => 
                    cargo.id === cargoId 
                        ? { 
                            ...cargo, 
                            status, 
                            updatedAt: new Date().toISOString(),
                            actualDelivery: status === 'delivered' ? new Date().toISOString() : cargo.actualDelivery
                        }
                        : cargo
                ),
                selectedCargo: state.selectedCargo?.id === cargoId 
                    ? { ...state.selectedCargo, status, updatedAt: new Date().toISOString() }
                    : state.selectedCargo,
                isLoading: false,
            }));
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Ошибка при обновлении статуса',
                isLoading: false 
            });
        }
    },

    selectCargo: (cargo: Cargo | null) => {
        set({ selectedCargo: cargo });
    },

    setShowCreateModal: (show: boolean) => {
        set({ showCreateModal: show });
    },

    setShowDetailsModal: (show: boolean) => {
        set({ showDetailsModal: show });
    },

    loadCargos: async () => {
        set({ isLoading: true, error: null });
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            set({ 
                cargos: MOCK_CARGOS,
                isLoading: false 
            });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Ошибка при загрузке грузов',
                isLoading: false 
            });
        }
    },
}));