import { useState } from 'react'

import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { Textarea } from '@shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'

export function ApplicationForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    experience: '',
    motivation: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Отправка заявки на вступление:', formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Имя</Label>
          <Input
            id="firstName"
            placeholder="Введите имя"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Фамилия</Label>
          <Input
            id="lastName"
            placeholder="Введите фамилию"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Введите email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Телефон</Label>
          <Input
            id="phone"
            placeholder="Введите телефон"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="department">Желаемый отдел</Label>
        <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
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
        <Label htmlFor="experience">Опыт работы</Label>
        <Textarea
          id="experience"
          placeholder="Опишите ваш опыт работы"
          value={formData.experience}
          onChange={(e) => setFormData({...formData, experience: e.target.value})}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="motivation">Мотивация</Label>
        <Textarea
          id="motivation"
          placeholder="Почему вы хотите присоединиться к организации?"
          value={formData.motivation}
          onChange={(e) => setFormData({...formData, motivation: e.target.value})}
        />
      </div>
      
      <Button type="submit" className="w-full">
        Отправить заявку
      </Button>
    </form>
  )
}

export default ApplicationForm 