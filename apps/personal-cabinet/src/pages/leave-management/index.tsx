

import { LeaveManagementWidget } from '@widgets/leave-management'

export default function LeaveManagementPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Управление отпусками</h1>
        <p className="text-muted-foreground">
          Подача заявок на отпуск и управление графиком
        </p>
      </div>

      <LeaveManagementWidget />
    </div>
  )
} 