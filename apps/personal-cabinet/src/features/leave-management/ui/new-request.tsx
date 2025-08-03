import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { Textarea } from '@shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'

export function NewRequest() {
  const [formData, setFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Логика отправки заявки
    console.log('Отправка заявки:', formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Новая заявка на отпуск</CardTitle>
        <CardDescription>
          Заполните форму для подачи заявки на отпуск
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Тип отпуска</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип отпуска" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Ежегодный отпуск</SelectItem>
                <SelectItem value="sick">Больничный</SelectItem>
                <SelectItem value="unpaid">Отпуск без содержания</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Дата начала</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Дата окончания</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Причина</Label>
            <Textarea
              id="reason"
              placeholder="Укажите причину отпуска"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
            />
          </div>
          
          <Button type="submit" className="w-full">
            Отправить заявку
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 