export interface Character {
  id: number
  firstName: string
  lastName: string
  type: 'civilian' | 'leo' | 'fire' | 'ems'
  insuranceNumber: string
  address: string
  dob: string
  licenses: Record<string, string>
  medicalInfo: Record<string, any>
  mugshotUrl?: string
  isUnit: boolean
  unitInfo?: any
  records?: CharacterRecord[]
}

export interface CharacterRecord {
  id: number
  type: 'arrest' | 'ticket' | 'warning'
  charges: string[]
  description: string
  date: string
  officer: Character
}

export interface Vehicle {
  id: number
  plate: string
  vin: string
  model: string
  color: string
  registration: string
  insurance: string
  owner: Character
}

export interface Weapon {
  id: number
  serialNumber: string
  model: string
  registration: string
  owner: Character
} 