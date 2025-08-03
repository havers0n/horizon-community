import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { TransferDepartmentWidget } from '@widgets/transfer-department'

export default function TransferDepartmentPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Перевод между отделами</h1>
        <p className="text-muted-foreground">
          Подача заявок на перевод в другой отдел
        </p>
      </div>

      <TransferDepartmentWidget />
    </div>
  )
} 