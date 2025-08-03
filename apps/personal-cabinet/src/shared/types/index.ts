// User types
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
}

// Profile types
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

// Settings types
export interface UserSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  darkMode: boolean
  autoSave: boolean
  language: 'ru' | 'en'
}

// Activity types
export interface Activity {
  id: string
  userId: string
  type: 'profile_update' | 'document_upload' | 'login' | 'logout'
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

// Dashboard types
export interface DashboardStats {
  activeSessions: number
  documents: number
  timeSpent: string
  productivity: number
} 