import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { XCircle, HeadphonesIcon, RefreshCcw } from 'lucide-react'
import { H3, Muted, Stack } from '@shared/ui-components'

interface RejectedApplicationMessageProps {
  departmentName?: string
  attemptsLeft?: number
  rejectionReason?: string
  supportUrl?: string
  onNewApplication?: () => void
}

export function RejectedApplicationMessage({ 
  departmentName = 'департамент',
  attemptsLeft = 0,
  rejectionReason,
  supportUrl = '/support',
  onNewApplication
}: RejectedApplicationMessageProps) {
  
  const handleSupportClick = () => {
    if (supportUrl.startsWith('http')) {
      window.open(supportUrl, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = supportUrl
    }
  }

  const getNextResetDate = () => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return nextMonth.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
      <CardContent className="p-6">
        <Stack space="md">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <H3 className="text-red-800 dark:text-red-200">
                К сожалению, ваша заявка была отклонена
              </H3>
              <Muted className="text-red-700 dark:text-red-300">
                Заявка в {departmentName}
              </Muted>
            </div>
          </div>

          {rejectionReason && (
            <div className="rounded-lg border-l-4 border-red-500 bg-white/50 p-4 dark:bg-gray-800/50">
              <Muted className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Причина отклонения:
              </Muted>
              <Muted className="text-sm leading-relaxed">
                {rejectionReason}
              </Muted>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white/80 p-4 dark:border-gray-700 dark:bg-gray-800/80">
            {attemptsLeft > 0 ? (
              <div>
                <Muted className="text-sm font-medium mb-2">
                  Вы можете подать новую заявку. У вас есть еще <span className="font-bold text-blue-600">{attemptsLeft}</span> {attemptsLeft === 1 ? 'попытка' : 'попытки'}.
                </Muted>
                <Muted className="text-xs text-muted-foreground">
                  В случае наличия вопросов по причинам отклонения вашей заявки - обращайтесь в нашу службу поддержки.
                </Muted>
              </div>
            ) : (
              <div>
                <Muted className="text-sm font-medium mb-2 text-orange-700 dark:text-orange-300">
                  К сожалению, ваша заявка была отклонена. Вы сможете подать новую заявку <span className="font-bold">{getNextResetDate()}</span>.
                </Muted>
                <Muted className="text-xs text-muted-foreground">
                  Попытки не суммируются - счетчик обновляется 1 числа каждого месяца. В случае вопросов обращайтесь в службу поддержки.
                </Muted>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {attemptsLeft > 0 && onNewApplication && (
              <Button 
                onClick={onNewApplication}
                className="flex items-center gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Подать новую заявку
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={handleSupportClick}
              className="flex items-center gap-2"
            >
              <HeadphonesIcon className="h-4 w-4" />
              Служба поддержки
            </Button>
          </div>
        </Stack>
      </CardContent>
    </Card>
  )
}