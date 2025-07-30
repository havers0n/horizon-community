export interface PenalCode {
    id: string;
    title: string;
    fine: number;
    jailTime: number;
}

export interface AdminStats {
    totalUsers: number;
    activeUnits: number;
    reportsToday: number;
    cadVersion: string;
}

export interface CADSettings {
    enableBleeter: boolean;
    enableTowTaxi: boolean;
    enablePanicButton: boolean;
}