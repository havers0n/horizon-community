import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { useToast } from '@/shared/lib/use-toast'

interface ApplicationModalProps {
  children?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ApplicationModal({ children, isOpen, onOpenChange }: ApplicationModalProps) {
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    department: '',
    priority: 'medium'
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Здесь будет API вызов для создания заявки
      console.log('Создание заявки:', formData)
      
      toast({
        title: 'Успешно',
        description: 'Заявка создана и отправлена на рассмотрение',
      })
      
      setFormData({
        type: '',
        title: '',
        description: '',
        department: '',
        priority: 'medium'
      })
      
      onOpenChange?.(false)
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать заявку',
        variant: 'destructive'
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Создать заявку</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Тип заявки</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип заявки" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leave">Отпуск</SelectItem>
                <SelectItem value="transfer">Перевод</SelectItem>
                <SelectItem value="joint">Совместительство</SelectItem>
                <SelectItem value="complaint">Жалоба</SelectItem>
                <SelectItem value="other">Другое</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Краткое описание заявки"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department">Департамент</Label>
            <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите департамент" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lspd">LSPD</SelectItem>
                <SelectItem value="bcso">BCSO</SelectItem>
                <SelectItem value="lsfd">LSFD</SelectItem>
                <SelectItem value="sams">SAMS</SelectItem>
                <SelectItem value="safr">SAFR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">Приоритет</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Низкий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
                <SelectItem value="urgent">Срочный</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Подробное описание заявки"
              rows={4}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
              Отмена
            </Button>
            <Button type="submit">
              Создать заявку
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 