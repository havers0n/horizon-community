export interface EmergencyCallFormData {
    location: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'emergency';
    callerName: string;
    phoneNumber: string;
}

export interface EmergencyCall extends EmergencyCallFormData {
    id: string;
    timestamp: string;
    status: 'pending' | 'dispatched' | 'in-progress' | 'completed' | 'cancelled';
}

export interface EmergencyCallsState {
    calls: EmergencyCall[];
    formData: EmergencyCallFormData;
    isLoading: boolean;
    error: string | null;
    success: string | null;
}

export interface EmergencyCallsActions {
    updateFormData: (data: Partial<EmergencyCallFormData>) => void;
    resetForm: () => void;
    submitCall: () => Promise<void>;
    updateCallStatus: (callId: string, status: EmergencyCall['status']) => void;
    deleteCall: (callId: string) => void;
}