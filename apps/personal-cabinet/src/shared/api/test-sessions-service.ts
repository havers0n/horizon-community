// src/shared/api/test-sessions-service.ts

import { apiClient } from './api-client'

export type QuestionType = 'single_choice' | 'multiple_choice'

export interface SessionQuestionOption {
  id: string
  option_text: string
}

export interface SessionQuestion {
  id: string
  question_text: string
  question_type: QuestionType
  options: SessionQuestionOption[]
}

export interface StartSessionDto {
  applicationId: string
  testId?: string
}

export interface StartSessionResponse {
  sessionId: string
  duration_minutes: number
  max_focus_losses: number
  passing_score_percent: number
  questions: SessionQuestion[]
}

export interface SubmitAnswerPayload {
  questionId: string
  selectedOptionIds: string[]
}

export interface SubmitSessionDto {
  answers: SubmitAnswerPayload[]
}

export interface SubmitSessionResponse {
  passed: boolean
  score: number
}

export const startTestSession = async (dto: StartSessionDto): Promise<StartSessionResponse> => {
  return apiClient.post<StartSessionResponse>('/test-sessions', dto)
}

export const reportFocusLoss = async (sessionId: string): Promise<{ remaining?: number } | void> => {
  return apiClient.post<{ remaining?: number } | void>(`/test-sessions/${sessionId}/focus-loss`)
}

export const submitTestSession = async (sessionId: string, dto: SubmitSessionDto): Promise<SubmitSessionResponse> => {
  return apiClient.post<SubmitSessionResponse>(`/test-sessions/${sessionId}/submit`, dto)
}
