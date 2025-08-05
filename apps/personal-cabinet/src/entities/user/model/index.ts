export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  bio?: string
  avatar?: string
  createdAt: string
  updatedAt: string
  username?: string
  role?: string
  departmentId?: string
  status?: string
  rank?: string
  isSupervisor?: boolean
}

export interface Profile {
  id: string
  userId: string
  firstName: string
  lastName: string
  phone?: string
  bio?: string
  avatar?: string
  settings: UserSettings
}

export interface UserSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  darkMode: boolean
  autoSave: boolean
  language: 'ru' | 'en'
}

// Типы для системы переводов между департаментами
export enum RequestStatus {
  SENT = 'sent',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface TransferRequest {
  id: number
  userId: number
  fromDepartment: string
  toDepartment: string
  reason: string
  status: RequestStatus
  submissionDate: Date
  reviewDate?: Date
  reviewerId?: number
  rejectionReason?: string
  supervisorComment?: string
}

export interface LocalUser {
  id: number
  name: string
  department: string
  isSupervisor: boolean
}

export enum UserDepartment {
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
  currentUser: LocalUser | null
  users: LocalUser[]
  requests: TransferRequest[]
  createRequest: (request: Omit<TransferRequest, 'id' | 'status' | 'submissionDate'>) => void
  decideOnRequest: (requestId: number, status: RequestStatus, reason?: string) => void
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void
} 