// API functions for test exam
import { apiClient } from '@/shared/api/api-client'

export interface ApiTestExam {
  id: string
  title: string
  description: string
  duration: number
  questionsCount: number
}

export const getAvailableTests = async (): Promise<ApiTestExam[]> => {
  return apiClient.get<ApiTestExam[]>('/tests/available')
} 