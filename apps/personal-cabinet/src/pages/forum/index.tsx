import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { Input } from '@shared/ui/input'
import { Avatar, AvatarFallback } from '@shared/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@shared/ui/dialog'
import { Textarea } from '@shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@shared/ui/dropdown-menu'
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