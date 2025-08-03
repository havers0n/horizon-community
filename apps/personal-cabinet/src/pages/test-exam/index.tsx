import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { Progress } from '@shared/ui/progress'
import { Alert, AlertDescription } from '@shared/ui/alert'
import { TestExamWidget } from '@widgets/test-exam'

export default function TestExamPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Экзамены</h1>
        <p className="text-muted-foreground">
          Прохождение тестов и экзаменов
        </p>
      </div>

      <TestExamWidget />
    </div>
  )
} 