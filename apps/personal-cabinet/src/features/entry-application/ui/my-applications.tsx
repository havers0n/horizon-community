
import { Badge } from '@shared/ui/badge'

export function MyApplications() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h3 className="font-semibold">Заявка в Полицию</h3>
          <p className="text-sm text-muted-foreground">Подано: 15.01.2024</p>
        </div>
        <Badge variant="outline">Ожидает</Badge>
      </div>
      
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h3 className="font-semibold">Заявка в Скорую помощь</h3>
          <p className="text-sm text-muted-foreground">Подано: 10.01.2024</p>
        </div>
        <Badge variant="secondary">Одобрена</Badge>
      </div>
    </div>
  )
}

export default MyApplications 