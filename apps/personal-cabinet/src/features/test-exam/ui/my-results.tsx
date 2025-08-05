import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

const MyResults: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Мои результаты</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Мои результаты тестов в разработке</p>
      </CardContent>
    </Card>
  )
}

export default MyResults 