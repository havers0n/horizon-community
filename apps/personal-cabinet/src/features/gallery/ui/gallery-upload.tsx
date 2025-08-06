import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Upload, X } from 'lucide-react'

interface GalleryUploadProps {
  departments: Array<{ id: string; name: string; color: string }>
  onUpload: (data: {
    title: string
    description: string
    department: string
    file: File
  }) => void
  className?: string
}

export function GalleryUpload({ departments, onUpload, className }: GalleryUploadProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [department, setDepartment] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFile && title && department) {
      onUpload({
        title,
        description,
        department,
        file: selectedFile
      })
      
      // Сброс формы
      setTitle('')
      setDescription('')
      setDepartment('')
      setSelectedFile(null)
      setPreview(null)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setPreview(null)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Загрузить изображение в галерею</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название изображения *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название изображения"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание изображения"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Департамент *</Label>
            <Select value={department} onValueChange={setDepartment} required>
              <SelectTrigger>
                <SelectValue placeholder="Выберите департамент" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Изображение *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {!selectedFile ? (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Button type="button" variant="outline" asChild>
                      <label htmlFor="file-upload">
                        Выбрать файл
                        <input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileSelect}
                          required
                        />
                      </label>
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    PNG, JPG, GIF до 10MB
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={preview || ''}
                    alt="Preview"
                    className="mx-auto max-h-48 rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={!selectedFile || !title || !department}>
            Загрузить изображение
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 