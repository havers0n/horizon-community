import React, { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/tabs'
import { JointPositionsFeature } from '@features/joint-positions'

// Lazy load components
const AvailablePositions = React.lazy(() => 
  JointPositionsFeature.AvailablePositions().then(component => ({ default: component }))
)
const MyApplications = React.lazy(() => 
  JointPositionsFeature.MyApplications().then(component => ({ default: component }))
)
const CreatePosition = React.lazy(() => 
  JointPositionsFeature.CreatePosition().then(component => ({ default: component }))
)

export function JointPositionsWidget() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Доступные позиции</TabsTrigger>
          <TabsTrigger value="my-applications">Мои заявки</TabsTrigger>
          <TabsTrigger value="create">Создать позицию</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-4">
          <Suspense fallback={<div>Загрузка...</div>}>
            <AvailablePositions />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="my-applications" className="space-y-4">
          <Suspense fallback={<div>Загрузка...</div>}>
            <MyApplications />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="create" className="space-y-4">
          <Suspense fallback={<div>Загрузка...</div>}>
            <CreatePosition />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
} 