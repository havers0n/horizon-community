import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'

export function MyLeaves() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Мои отпуска</CardTitle>
          <CardDescription>
            Список ваших заявок на отпуск
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Ежегодный отпуск</h3>
                <p className="text-sm text-muted-foreground">01.01.2024 - 15.01.2024</p>
              </div>
              <Badge variant="secondary">Одобрен</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Больничный</h3>
                <p className="text-sm text-muted-foreground">20.02.2024 - 25.02.2024</p>
              </div>
              <Badge variant="outline">Ожидает</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 