// API functions for admin tests
import { apiClient } from '@/shared/api/api-client'

export interface AdminTest {
  id: string
  title: string
  description: string | null
  duration_minutes: number
  passing_score_percent: number
  max_focus_losses: number
}

export interface CreateTestDto {
  title: string
  description?: string
  duration_minutes: number
  passing_score_percent: number
  max_focus_losses: number
}

export interface UpdateTestDto extends Partial<CreateTestDto> {}

export interface AdminQuestionOption {
  id: string
  option_text: string
  is_correct: boolean
}

export type QuestionType = 'single_choice' | 'multiple_choice'

export interface AdminQuestion {
  id: string
  question_text: string
  question_type: QuestionType
  options: AdminQuestionOption[]
}

export const listTests = async (): Promise<AdminTest[]> => {
  return apiClient.get<AdminTest[]>('/admin/tests')
}

export const getTest = async (id: string): Promise<AdminTest> => {
  return apiClient.get<AdminTest>(`/admin/tests/${id}`)
}

export const createTest = async (dto: CreateTestDto): Promise<AdminTest> => {
  return apiClient.post<AdminTest>('/admin/tests', dto)
}

export const updateTest = async (id: string, dto: UpdateTestDto): Promise<AdminTest> => {
  return apiClient.put<AdminTest>(`/admin/tests/${id}`, dto)
}

export const deleteTest = async (id: string): Promise<void> => {
  return apiClient.delete<void>(`/admin/tests/${id}`)
}

export const listQuestions = async (testId: string): Promise<AdminQuestion[]> => {
  return apiClient.get<AdminQuestion[]>(`/admin/tests/${testId}/questions`)
}

export interface CreateQuestionDto {
  question_text: string
  question_type: QuestionType
}

export const createQuestion = async (testId: string, dto: CreateQuestionDto): Promise<AdminQuestion> => {
  return apiClient.post<AdminQuestion>(`/admin/tests/${testId}/questions`, dto)
}

export const updateQuestion = async (questionId: string, dto: Partial<CreateQuestionDto>): Promise<AdminQuestion> => {
  return apiClient.put<AdminQuestion>(`/admin/questions/${questionId}`, dto)
}

export const deleteQuestion = async (questionId: string): Promise<void> => {
  return apiClient.delete<void>(`/admin/questions/${questionId}`)
}

export interface CreateOptionDto {
  option_text: string
  is_correct: boolean
}

export const addOption = async (questionId: string, dto: CreateOptionDto): Promise<AdminQuestionOption> => {
  return apiClient.post<AdminQuestionOption>(`/admin/questions/${questionId}/options`, dto)
}

export const updateOption = async (optionId: string, dto: Partial<CreateOptionDto>): Promise<AdminQuestionOption> => {
  return apiClient.put<AdminQuestionOption>(`/admin/options/${optionId}`, dto)
}

export const deleteOption = async (optionId: string): Promise<void> => {
  return apiClient.delete<void>(`/admin/options/${optionId}`)
} 