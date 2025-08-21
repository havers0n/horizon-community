import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { CheckCircle, MessageCircle } from 'lucide-react'
import { H3, Muted, Stack } from '@shared/ui-components'

interface ApprovedApplicationMessageProps {
  departmentName?: string
  discordUrl?: string
}

export function ApprovedApplicationMessage({ 
  departmentName = 'департамент',
  discordUrl = 'https://discord.gg/horizoncommunity'
}: ApprovedApplicationMessageProps) {
  const handleDiscordClick = () => {
    window.open(discordUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
      <CardContent className="p-6">
        <Stack space="md">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <H3 className="text-green-800 dark:text-green-200">
                Поздравляем! Ваша заявка одобрена
              </H3>
              <Muted className="text-green-700 dark:text-green-300">
                Заявка в {departmentName}
              </Muted>
            </div>
          </div>

          <div className="rounded-lg border-l-4 border-green-500 bg-white/50 p-4 dark:bg-gray-800/50">
            <Muted className="text-sm leading-relaxed">
              Для прохождения дальнейших этапов отбора в сообщество просьба перейти в наш Discord-сервер.
              Там вы получите дальнейшие инструкции и сможете пройти интервью.
            </Muted>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleDiscordClick}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <MessageCircle className="h-4 w-4" />
              Перейти в Discord-сервер
            </Button>
          </div>
        </Stack>
      </CardContent>
    </Card>
  )
}