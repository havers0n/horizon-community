import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'


export function AvailablePositions() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Доступные позиции</CardTitle>
          <CardDescription>
            Список доступных совместных позиций
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Офицер полиции</h3>
                <p className="text-sm text-muted-foreground">Отдел: Полиция</p>
                <p className="text-xs text-muted-foreground">Зарплата: $5000/мес</p>
              </div>
              <Button size="sm">Подать заявку</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Парамедик</h3>
                <p className="text-sm text-muted-foreground">Отдел: Скорая помощь</p>
                <p className="text-xs text-muted-foreground">Зарплата: $4500/мес</p>
              </div>
              <Button size="sm">Подать заявку</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 