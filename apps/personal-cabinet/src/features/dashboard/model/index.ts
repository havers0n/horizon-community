export interface DashboardStats {
  activeSessions: number
  documents: number
  timeSpent: string
  productivity: number
}

export interface Activity {
  id: string
  userId: string
  type: 'profile_update' | 'document_upload' | 'login' | 'logout'
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  href: string
  color: string
} 