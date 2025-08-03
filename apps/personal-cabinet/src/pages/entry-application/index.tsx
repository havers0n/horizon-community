import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { EntryApplicationWidget } from '@widgets/entry-application'

export default function EntryApplicationPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Заявка на вступление</h1>
        <p className="text-muted-foreground">
          Подача заявки на вступление в организацию
        </p>
      </div>

      <EntryApplicationWidget />
    </div>
  )
} 