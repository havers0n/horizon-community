import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Badge } from '@shared/ui/badge'

export function History() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>История отпусков</CardTitle>
        <CardDescription>
          История всех ваших заявок на отпуск
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Ежегодный отпуск</h3>
              <p className="text-sm text-muted-foreground">01.01.2024 - 15.01.2024</p>
              <p className="text-xs text-muted-foreground">Одобрено: 20.12.2023</p>
            </div>
            <Badge variant="secondary">Завершен</Badge>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Больничный</h3>
              <p className="text-sm text-muted-foreground">10.03.2024 - 15.03.2024</p>
              <p className="text-xs text-muted-foreground">Одобрено: 08.03.2024</p>
            </div>
            <Badge variant="secondary">Завершен</Badge>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Отпуск без содержания</h3>
              <p className="text-sm text-muted-foreground">01.05.2024 - 05.05.2024</p>
              <p className="text-xs text-muted-foreground">Отклонено: 25.04.2024</p>
            </div>
            <Badge variant="destructive">Отклонен</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 