
import { ForumWidget } from '@widgets/forum'

export default function ForumPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Форум</h1>
        <p className="text-muted-foreground">
          Обсуждения и общение с коллегами
        </p>
      </div>

      <ForumWidget />
    </div>
  )
} 