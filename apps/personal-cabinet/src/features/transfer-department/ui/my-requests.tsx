import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Badge } from '@shared/ui/badge'

export function MyRequests() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h3 className="font-semibold">Перевод в Полицию</h3>
          <p className="text-sm text-muted-foreground">Должность: Офицер</p>
          <p className="text-xs text-muted-foreground">Подано: 15.01.2024</p>
        </div>
        <Badge variant="outline">Ожидает</Badge>
      </div>
      
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h3 className="font-semibold">Перевод в Скорую помощь</h3>
          <p className="text-sm text-muted-foreground">Должность: Парамедик</p>
          <p className="text-xs text-muted-foreground">Подано: 10.01.2024</p>
        </div>
        <Badge variant="secondary">Одобрен</Badge>
      </div>
      
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h3 className="font-semibold">Перевод в Пожарную службу</h3>
          <p className="text-sm text-muted-foreground">Должность: Пожарный</p>
          <p className="text-xs text-muted-foreground">Подано: 05.01.2024</p>
        </div>
        <Badge variant="destructive">Отклонен</Badge>
      </div>
    </div>
  )
} 