export interface Application {
  id: number
  type: string
  status: string
  authorId: number
  data?: any
  createdAt: string
  updatedAt: string
  reviewComment?: string
  author?: {
    id: number
    username: string
    rank: string
    department?: {
      id: number
      name: string
    }
  }
}

export interface ApplicationStats {
  totalApplications: number
  approvedApplications: number
  pendingApplications: number
  rejectedApplications: number
  totalDays: number
}

export interface DepartmentStats {
  name: string
  totalLeaves: number
  approvedLeaves: number
  pendingLeaves: number
  totalDays: number
  leaveTypes: Record<string, number>
}

export interface LeaveApplication extends Application {
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'unpaid'
  data: {
    startDate: string
    endDate: string
    reason: string
    daysRequested: number
  }
}

export interface JointApplication extends Application {
  type: 'joint_position'
  data: {
    primaryDepartmentId: number
    secondaryDepartmentId: number
    reason: string
    experience: string
    availability: string
  }
}

export interface TransferApplication extends Application {
  type: 'transfer'
  data: {
    fromDepartment: string
    toDepartment: string
    reason: string
    experience: string
  }
} 