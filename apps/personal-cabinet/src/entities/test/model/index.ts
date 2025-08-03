export interface Test {
  id: number
  title: string
  description: string
  durationMinutes: number
  questionsCount: number
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  isActive: boolean
  createdAt: string
  totalAttempts: number
  passRate: number
  questions?: Question[]
}

export interface Question {
  id: string
  question: string
  type: 'single' | 'multiple' | 'text'
  options?: string[]
  correctAnswer?: string | string[]
  points: number
}

export interface TestResult {
  id: number
  userId: number
  username: string
  testId: number
  testTitle: string
  score: number
  maxScore: number
  percentage: number
  passed: boolean
  timeSpent: number
  focusLostCount: number
  warningsCount: number
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
  results?: {
    answers: Array<{
      questionId: string
      question: string
      userAnswer: string | string[]
      correctAnswer: string | string[]
      isCorrect: boolean
      points: number
    }>
    adminComment?: string
  }
}

export interface TestExam {
  id: number
  title: string
  durationMinutes: number
  questions: Question[]
  applicationId?: number
} 