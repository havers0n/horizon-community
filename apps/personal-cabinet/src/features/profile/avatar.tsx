import { Avatar, AvatarFallback, AvatarImage } from '@shared/ui'
import { Button } from '@shared/ui'
import { Camera } from 'lucide-react'

export function ProfileAvatar() {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src="/placeholder-avatar.jpg" alt="Avatar" />
          <AvatarFallback className="text-lg">ИП</AvatarFallback>
        </Avatar>
        <Button
          size="sm"
          variant="outline"
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-medium">Иван Петров</h3>
        <p className="text-sm text-muted-foreground">ivan.petrov@example.com</p>
      </div>
    </div>
  )
} 