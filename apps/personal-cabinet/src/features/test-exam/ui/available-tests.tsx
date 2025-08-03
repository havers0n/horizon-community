import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'

export function AvailableTests() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Доступные экзамены</CardTitle>
          <CardDescription>
            Выберите экзамен для прохождения
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Базовый экзамен полиции</h3>
                <p className="text-sm text-muted-foreground">Вопросов: 20</p>
                <p className="text-sm text-muted-foreground">Время: 30 минут</p>
              </div>
              <Button size="sm">Начать экзамен</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Экзамен по медицине</h3>
                <p className="text-sm text-muted-foreground">Вопросов: 25</p>
                <p className="text-sm text-muted-foreground">Время: 45 минут</p>
              </div>
              <Button size="sm">Начать экзамен</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 