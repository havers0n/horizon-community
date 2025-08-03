// Типы для системы переводов между департаментами
export enum RequestStatus {
  SENT = 'sent',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface TransferRequest {
  id: number;
  userId: number;
  fromDepartment: string;
  toDepartment: string;
  reason: string;
  status: RequestStatus;
  submissionDate: Date;
  reviewDate?: Date;
  reviewerId?: number;
  rejectionReason?: string;
  supervisorComment?: string;
}

export interface LocalUser {
  id: number;
  name: string;
  department: string;
  isSupervisor: boolean;
}

export enum Department {
  LSPD = 'LSPD',
  BCSO = 'BCSO',
  LSFD = 'LSFD',
  SAMS = 'SAMS',
  SAFR = 'SAFR',
  DD = 'DD',
  CD = 'CD'
}

// Типы для контекста приложения
export interface AppContextType {
  currentUser: LocalUser | null;
  users: LocalUser[];
  requests: TransferRequest[];
  createRequest: (request: Omit<TransferRequest, 'id' | 'status' | 'submissionDate'>) => void;
  decideOnRequest: (requestId: number, status: RequestStatus, reason?: string) => void;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
} 