import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { TransferDepartmentFeature } from '@features/transfer-department'

export function TransferDepartmentWidget() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Перевод между отделами</CardTitle>
          <CardDescription>
            Подайте заявку на перевод в другой отдел
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransferDepartmentFeature.TransferForm />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Мои заявки на перевод</CardTitle>
        </CardHeader>
        <CardContent>
          <TransferDepartmentFeature.MyRequests />
        </CardContent>
      </Card>
    </div>
  )
} 