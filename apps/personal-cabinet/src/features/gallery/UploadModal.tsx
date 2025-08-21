import { useState } from 'react'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Button } from '@/shared/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { apiClient } from '@/shared/api/api-client'
import { supabase } from '@/shared/lib/supabase'

interface UploadModalProps {
  departments: Array<{ id: string; name: string; color: string }>
  onSuccess?: () => void
}

export function UploadModal({ departments, onSuccess }: UploadModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [department, setDepartment] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    try {
      // Шаг A: получить signedUrl и filePath
      const { data: signed } = await apiClient.post<any>('/gallery/upload-url', {
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
      })
      const signedUrl: string = signed.signedUrl
      const filePath: string = signed.filePath

      // Загрузка файла через официальный клиент Supabase
      const token = (signedUrl.split('?token=')[1] || '').trim()
      if (!token) throw new Error('Некорректный signedUrl: отсутствует token')

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .uploadToSignedUrl(
          filePath,
          token,
          file,
          { contentType: file.type || 'application/octet-stream', upsert: false }
        )
      if (uploadError) {
        console.error('[UploadModal] Supabase upload error:', uploadError)
        throw new Error(uploadError.message || 'Ошибка загрузки файла в хранилище')
      }

      // Шаг B: создать запись в БД
      await apiClient.post<any>('/gallery', {
        title,
        description: description || null,
        storage_path: filePath,
        department_id: department || null,
      })

      if (onSuccess) onSuccess()
      setTitle('')
      setDescription('')
      setDepartment('')
      setFile(null)
    } catch (err) {
      console.error('[UploadModal] upload error:', err)
      alert('Не удалось загрузить изображение')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Название *</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="department">Департамент</Label>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите департамент (опционально)" />
          </SelectTrigger>
          <SelectContent>
            {departments.filter(d => d.id !== 'all').map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">Файл *</Label>
        <Input id="file" type="file" accept="image/*" onChange={handleFileSelect} required />
      </div>
      <Button type="submit" className="w-full" disabled={loading || !file || !title}>
        {loading ? 'Загрузка...' : 'Загрузить'}
      </Button>
    </form>
  )
}


