import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Badge } from '@shared/ui/badge'

export function MyApplications() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h3 className="font-semibold">Офицер полиции</h3>
          <p className="text-sm text-muted-foreground">Подано: 15.01.2024</p>
        </div>
        <Badge variant="outline">Ожидает</Badge>
      </div>
      
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h3 className="font-semibold">Парамедик</h3>
          <p className="text-sm text-muted-foreground">Подано: 10.01.2024</p>
        </div>
        <Badge variant="secondary">Одобрена</Badge>
      </div>
    </div>
  )
} 