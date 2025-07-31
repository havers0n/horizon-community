export interface Call911 {
  id: string;
  caller: string;
  location: string;
  description: string;
  priority: CallPriority;
  status: CallStatus;
  assignedUnits: string[];
  createdAt: string;
  updatedAt: string;
  type: CallType;
  notes?: string;
}

export type CallPriority = 'low' | 'medium' | 'high' | 'critical';
export type CallStatus = 'pending' | 'active' | 'resolved' | 'closed';
export type CallType = 'emergency' | 'non-emergency' | 'traffic' | 'medical' | 'fire';

export interface BOLO {
  id: string;
  type: BOLOType;
  description: string;
  priority: CallPriority;
  status: 'active' | 'resolved';
  createdAt: string;
  expiresAt?: string;
  author: string;
  vehicle?: {
    plate: string;
    model: string;
    color: string;
  };
  person?: {
    name: string;
    description: string;
  };
}

export type BOLOType = 'person' | 'vehicle' | 'general';

export interface DispatchStatus {
  id: string;
  userId: string;
  status: DispatchStatusType;
  timestamp: string;
  location?: string;
  notes?: string;
}

export type DispatchStatusType = 
  | 'operator'
  | 'traffic'
  | 'active-control'
  | 'unavailable';

export type UnitStatus = 'available' | 'busy' | 'enRoute' | 'onScene' | 'unavailable' | 'panic';

export interface DispatchUnit {
  id: string;
  unitNumber: string;
  status: UnitStatus;
  location: string;
  lastUpdate: string;
  assignedCalls: string[];
} 