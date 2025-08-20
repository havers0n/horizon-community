import React from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/api-client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'

type TestResult = {
  score: number
  max_score: number
  percentage: number
  passed: boolean
  created_at: string
  test_sessions: { tests: { title: string; passing_score_percent: number } }
}

const fetchTestResult = async (sessionId: string): Promise<TestResult> => {
  const res = await apiClient.get<any>(`/test-sessions/${sessionId}/result`)
  const payload = (res as any)?.data ?? res
  return payload as TestResult
}

const TestResultPage: React.FC = () => {
  const { sessionId } = useParams()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['test-result', sessionId],
    queryFn: () => fetchTestResult(sessionId!),
    enabled: !!sessionId,
    staleTime: 30_000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-red-400">{(error as any)?.message || 'Не удалось загрузить результат теста'}</div>
        <div className="mt-4">
          <Button variant="outline" onClick={() => refetch()}>Повторить</Button>
        </div>
      </div>
    )
  }

  const result = data
  const testInfo = result.test_sessions?.tests

  return (
    <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-xl text-center">
        <CardHeader>
          <CardTitle className={`text-3xl font-bold ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
            {result.passed ? 'Тест успешно сдан!' : 'Тест провален'}
          </CardTitle>
          {testInfo?.title && (
            <CardDescription className="text-base">{testInfo.title}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-xl">
            Ваш результат: <span className="font-bold">{result.score} / {result.max_score}</span>
          </div>
          <div className="text-4xl font-bold">{result.percentage}%</div>
          {typeof testInfo?.passing_score_percent === 'number' && (
            <div className="text-sm text-muted-foreground">
              Проходной балл: {testInfo.passing_score_percent}%
            </div>
          )}
          <div className="pt-4">
            <Button asChild size="lg">
              <RouterLink to="/dashboard">Вернуться в личный кабинет</RouterLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TestResultPage


