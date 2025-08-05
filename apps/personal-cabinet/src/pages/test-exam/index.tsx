import { TestExamWidget } from '@widgets/test-exam'

function TestExamPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Экзамены</h1>
        <p className="text-muted-foreground">
          Прохождение тестов и экзаменов
        </p>
      </div>

      <TestExamWidget />
    </div>
  )
}

export default TestExamPage 