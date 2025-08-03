import { Card, CardContent, CardHeader, CardTitle } from '@shared'

export function DashboardStats() {
  const stats = [
    {
      title: 'Всего задач',
      value: '24',
      description: '+12% с прошлого месяца',
      change: 'positive'
    },
    {
      title: 'Выполнено',
      value: '18',
      description: '+8% с прошлого месяца',
      change: 'positive'
    },
    {
      title: 'В процессе',
      value: '6',
      description: '-2% с прошлого месяца',
      change: 'negative'
    }
  ]

  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  )
} 