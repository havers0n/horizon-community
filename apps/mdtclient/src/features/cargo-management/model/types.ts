export interface Cargo {
    id: string;
    type: string;
    description: string;
    weight: number;
    origin: string;
    destination: string;
    status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
    driver: string;
    vehicle: string;
    createdAt: string;
    updatedAt: string;
    estimatedDelivery: string;
    actualDelivery?: string;
    notes?: string;
}

export interface CreateCargoData {
    type: string;
    description: string;
    weight: number;
    origin: string;
    destination: string;
    driver: string;
    vehicle: string;
    estimatedDelivery: string;
    notes?: string;
}

export interface CargoManagementState {
    cargos: Cargo[];
    selectedCargo: Cargo | null;
    isLoading: boolean;
    error: string | null;
    showCreateModal: boolean;
    showDetailsModal: boolean;
}

export interface CargoManagementActions {
    createCargo: (data: CreateCargoData) => Promise<void>;
    deleteCargo: (cargoId: string) => Promise<void>;
    updateCargoStatus: (cargoId: string, status: Cargo['status']) => Promise<void>;
    selectCargo: (cargo: Cargo | null) => void;
    setShowCreateModal: (show: boolean) => void;
    setShowDetailsModal: (show: boolean) => void;
    loadCargos: () => Promise<void>;
}