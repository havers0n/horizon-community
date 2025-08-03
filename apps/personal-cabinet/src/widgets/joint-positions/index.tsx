import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/tabs'
import { JointPositionsFeature } from '@features/joint-positions'

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
          <JointPositionsFeature.AvailablePositions />
        </TabsContent>
        
        <TabsContent value="my-applications" className="space-y-4">
          <JointPositionsFeature.MyApplications />
        </TabsContent>
        
        <TabsContent value="create" className="space-y-4">
          <JointPositionsFeature.CreatePosition />
        </TabsContent>
      </Tabs>
    </div>
  )
} 