export interface ReportTemplate {
  id: number
  title: string
  body: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  departmentId: number | null
  variables: string[]
  tags: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  usageCount: number
  authorId: number
}

export interface Report {
  id: number
  title: string
  content: string
  templateId: number
  authorId: number
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  supervisorComment?: string
  fileUrl?: string
  createdAt: string
  updatedAt: string
  author?: {
    id: number
    username: string
    email: string
    department: number | null
  }
}

export interface ReportWithAuthor extends Report {
  author: {
    id: number
    username: string
    email: string
    department: number | null
  }
} 