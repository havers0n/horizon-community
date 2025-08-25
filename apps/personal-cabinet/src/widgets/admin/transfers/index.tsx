import React, { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/tabs'

// Lazy load components
const PendingRequests = React.lazy(() => import('@/features/admin/manage-transfers/ui/pending-requests'))
const ApprovedRequests = React.lazy(() => import('@/features/admin/manage-transfers/ui/approved-requests'))
const RejectedRequests = React.lazy(() => import('@/features/admin/manage-transfers/ui/rejected-requests'))

export function AdminTransfersWidget() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Ожидающие</TabsTrigger>
          <TabsTrigger value="approved">Одобренные</TabsTrigger>
          <TabsTrigger value="rejected">Отклоненные</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          <Suspense fallback={<div>Загрузка...</div>}>
            <PendingRequests />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          <Suspense fallback={<div>Загрузка...</div>}>
            <ApprovedRequests />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4">
          <Suspense fallback={<div>Загрузка...</div>}>
            <RejectedRequests />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}