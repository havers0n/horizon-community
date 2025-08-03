import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { Textarea } from '@shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'

export function CreatePosition() {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    salary: '',
    description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Создание позиции:', formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Создать позицию</CardTitle>
        <CardDescription>
          Создайте новую совместную позицию
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название позиции</Label>
            <Input
              id="title"
              placeholder="Введите название позиции"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department">Отдел</Label>
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
            <Label htmlFor="salary">Зарплата</Label>
            <Input
              id="salary"
              placeholder="Укажите зарплату"
              value={formData.salary}
              onChange={(e) => setFormData({...formData, salary: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              placeholder="Опишите требования к позиции"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <Button type="submit" className="w-full">
            Создать позицию
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 