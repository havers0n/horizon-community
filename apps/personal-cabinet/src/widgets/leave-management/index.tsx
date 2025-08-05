import React, { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/tabs'
import { LeaveManagementFeature } from '@features/leave-management'

// Lazy load components
const MyLeaves = React.lazy(() => 
  LeaveManagementFeature.MyLeaves().then(component => ({ default: component }))
)
const NewRequest = React.lazy(() => 
  LeaveManagementFeature.NewRequest().then(component => ({ default: component }))
)
const History = React.lazy(() => 
  LeaveManagementFeature.History().then(component => ({ default: component }))
)

export function LeaveManagementWidget() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="my-leaves" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-leaves">Мои отпуска</TabsTrigger>
          <TabsTrigger value="new-request">Новая заявка</TabsTrigger>
          <TabsTrigger value="history">История</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-leaves" className="space-y-4">
          <Suspense fallback={<div>Загрузка...</div>}>
            <MyLeaves />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="new-request" className="space-y-4">
          <Suspense fallback={<div>Загрузка...</div>}>
            <NewRequest />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Suspense fallback={<div>Загрузка...</div>}>
            <History />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
} 