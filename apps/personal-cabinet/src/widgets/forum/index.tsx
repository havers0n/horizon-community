import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { Input } from '@shared/ui/input'
import { Avatar, AvatarFallback } from '@shared/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@shared/ui/dialog'
import { Textarea } from '@shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@shared/ui/dropdown-menu'
import { ForumFeature } from '@features/forum'

export function ForumWidget() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Форум</CardTitle>
        </CardHeader>
        <CardContent>
          <ForumFeature.TopicList />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Создать новую тему</CardTitle>
        </CardHeader>
        <CardContent>
          <ForumFeature.CreateTopic />
        </CardContent>
      </Card>
    </div>
  )
} 