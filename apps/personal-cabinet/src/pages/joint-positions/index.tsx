
import { JointPositionsWidget } from '@widgets/joint-positions'
import { MyJointPositionsHistoryTable } from '@widgets/my-joint-positions-history'

export default function JointPositionsPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Совмещение должностей</h1>
        <p className="text-muted-foreground">
          Управление заявками на совмещение должностей
        </p>
      </div>

      <JointPositionsWidget />
      
      {/* История заявок на совмещение */}
      <MyJointPositionsHistoryTable />
    </div>
  )
} 