import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/tabs'
import { JointPositionsWidget } from '@widgets/joint-positions'

export default function JointPositionsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Совместные позиции</h1>
        <p className="text-muted-foreground">
          Управление совместными позициями и вакансиями
        </p>
      </div>

      <JointPositionsWidget />
    </div>
  )
} 