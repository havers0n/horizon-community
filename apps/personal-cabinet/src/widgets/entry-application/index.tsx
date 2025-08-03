import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { EntryApplicationFeature } from '@features/entry-application'

export function EntryApplicationWidget() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Заявка на вступление</CardTitle>
          <CardDescription>
            Заполните форму для подачи заявки на вступление в организацию
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EntryApplicationFeature.ApplicationForm />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Мои заявки</CardTitle>
        </CardHeader>
        <CardContent>
          <EntryApplicationFeature.MyApplications />
        </CardContent>
      </Card>
    </div>
  )
} 