import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export function ReportManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление отчетами</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Компонент управления отчетами в разработке</p>
      </CardContent>
    </Card>
  )
}

export default ReportManager 