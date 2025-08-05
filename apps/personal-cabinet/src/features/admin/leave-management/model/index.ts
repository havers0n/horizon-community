// Model types and interfaces for admin leave management
export interface LeaveRequest {
  id: string
  employeeName: string
  employeeId: string
  department: string
  leaveType: 'vacation' | 'sick' | 'personal' | 'other'
  startDate: Date
  endDate: Date
  status: 'pending' | 'approved' | 'rejected'
  reason: string
  submittedAt: Date
} 