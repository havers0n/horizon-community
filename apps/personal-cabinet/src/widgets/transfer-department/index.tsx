import React, { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { TransferDepartmentFeature } from '@features/transfer-department'

// Lazy load components
const TransferForm = React.lazy(() => 
  TransferDepartmentFeature.TransferForm().then(component => ({ default: component }))
)
const MyRequests = React.lazy(() => 
  TransferDepartmentFeature.MyRequests().then(component => ({ default: component }))
)

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
          <Suspense fallback={<div>Загрузка...</div>}>
            <TransferForm />
          </Suspense>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Мои заявки на перевод</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Загрузка...</div>}>
            <MyRequests />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
} 