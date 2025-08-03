import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { Progress } from '@shared/ui/progress'
import { Alert, AlertDescription } from '@shared/ui/alert'
import { TestExamFeature } from '@features/test-exam'

export function TestExamWidget() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Доступные экзамены</CardTitle>
          <CardDescription>
            Выберите экзамен для прохождения
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestExamFeature.AvailableTests />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Мои результаты</CardTitle>
        </CardHeader>
        <CardContent>
          <TestExamFeature.MyResults />
        </CardContent>
      </Card>
    </div>
  )
} 