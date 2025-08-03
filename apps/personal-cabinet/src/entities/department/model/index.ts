export interface Department {
  id: string
  name: string
  fullName: string
  description?: string
  logoUrl?: string
  gallery?: string[]
  head?: string
  contacts?: {
    phone?: string
    email?: string
    address?: string
  }
  stats?: {
    totalOfficers?: number
    activeUnits?: number
    responseTime?: string
  }
}

export interface Division {
  id: string
  name: string
  description?: string
}

export interface Asset {
  type: '3d-model' | 'image' | 'video'
  url: string
  description?: string
}

export interface DepartmentDetails extends Department {
  divisions?: Division[]
  assets?: Asset[]
}

export interface DepartmentDisplay {
  id: string
  name: string
  fullName: string
  description: string
  logoUrl?: string
  gallery?: string[]
} 