import { Call911, DispatchStatus } from '@/entities/dispatch';

export interface CallManagementState {
  calls: Call911[];
  incomingCall: Call911 | null;
  showIncomingModal: boolean;
  callResponse: 'pending' | 'accepted' | 'rejected' | null;
  currentStatus: DispatchStatus;
  loading: boolean;
  error: string | null;
}

export interface CallManagementActions {
  acceptCall: (callId: string) => void;
  rejectCall: (callId: string) => void;
  updateCallStatus: (callId: string, status: Call911['status']) => void;
  setCurrentStatus: (status: DispatchStatus) => void;
  loadCalls: () => Promise<void>;
  createCall: (callData: Omit<Call911, 'id' | 'createdAt'>) => Promise<void>;
}

export interface CallManagementStore extends CallManagementState, CallManagementActions {} 