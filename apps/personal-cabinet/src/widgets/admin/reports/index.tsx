import React, { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/tabs'

// Lazy load components
const ReportManager = React.lazy(() => import('@/features/admin/reports/ui/report-manager'))
const Analytics = React.lazy(() => import('@/features/admin/reports/ui/analytics'))

export function AdminReportsWidget() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">Управление отчетами</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports" className="space-y-4">
          <Suspense fallback={<div>Загрузка...</div>}>
            <ReportManager />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Suspense fallback={<div>Загрузка...</div>}>
            <Analytics />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
} 