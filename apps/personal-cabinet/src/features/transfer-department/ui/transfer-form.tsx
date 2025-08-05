import { useState } from 'react'

import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { Textarea } from '@shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'

export function TransferForm() {
  const [formData, setFormData] = useState({
    targetDepartment: '',
    position: '',
    reason: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Отправка заявки на перевод:', formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="targetDepartment">Целевой отдел</Label>
        <Select value={formData.targetDepartment} onValueChange={(value) => setFormData({...formData, targetDepartment: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите отдел" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="police">Полиция</SelectItem>
            <SelectItem value="ems">Скорая помощь</SelectItem>
            <SelectItem value="fire">Пожарная служба</SelectItem>
            <SelectItem value="admin">Администрация</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="position">Должность</Label>
        <Input
          id="position"
          placeholder="Укажите желаемую должность"
          value={formData.position}
          onChange={(e) => setFormData({...formData, position: e.target.value})}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="reason">Причина перевода</Label>
        <Textarea
          id="reason"
          placeholder="Объясните причину перевода"
          value={formData.reason}
          onChange={(e) => setFormData({...formData, reason: e.target.value})}
        />
      </div>
      
      <Button type="submit" className="w-full">
        Отправить заявку на перевод
      </Button>
    </form>
  )
} 