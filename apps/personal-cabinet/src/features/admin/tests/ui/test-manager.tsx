import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export function TestManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление тестами</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Компонент управления тестами в разработке</p>
      </CardContent>
    </Card>
  )
}

export default TestManager 