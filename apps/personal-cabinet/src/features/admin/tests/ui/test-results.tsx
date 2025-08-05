import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export function TestResults() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Результаты тестов</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Компонент результатов тестов в разработке</p>
      </CardContent>
    </Card>
  )
}

export default TestResults 