import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/shared/ui/toaster'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { AuthProvider } from '@/features/auth'
import { SessionProvider } from '@/shared/contexts/SessionContext'
import { StageGuard } from '@/shared/ui/StageGuard'
import { ThemeProvider } from '@/features/theme'
import { ProtectedRoute } from '@/shared/ui/protected-route'
// import { ConnectionStatus } from '@/shared/ui/connection-status'
import { queryClient } from '@/shared/lib'
import { useAuth } from '@/features/auth'
import { useSession } from '@/shared/contexts/SessionContext'
import { PermissionGuard } from '@/shared/ui/permission-guard'
import { apiClient } from '@/shared/api/api-client'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { supabase } from '@/shared/lib/supabase'

// Lazy loaded pages
const Homepage = React.lazy(() => import('@/pages/homepage'))
const Login = React.lazy(() => import('@/pages/auth/login'))
const Register = React.lazy(() => import('@/pages/auth/register'))
const Dashboard = React.lazy(() => import('@/pages/dashboard'))
const Profile = React.lazy(() => import('@/pages/profile'))
const Settings = React.lazy(() => import('@/pages/settings'))
const Departments = React.lazy(() => import('@/pages/departments'))
const Applications = React.lazy(() => import('@/pages/applications'))
const Reports = React.lazy(() => import('@/pages/reports'))
const Tests = React.lazy(() => import('@/pages/tests'))
const Support = React.lazy(() => import('@/pages/support'))
const AdminPanel = React.lazy(() => import('@/pages/admin'))
const FAQ = React.lazy(() => import('@/pages/faq'))
const Gallery = React.lazy(() => import('@/pages/gallery'))
const NotFound = React.lazy(() => import('@/pages/not-found'))
const AdminTestsPage = React.lazy(() => import('@/pages/admin/tests'))
const AdminTestNewPage = React.lazy(() => import('@/pages/admin/tests/new'))
const AdminTestEditPage = React.lazy(() => import('@/pages/admin/tests/edit'))
const ApplicationTestPage = React.lazy(() => import('@/pages/applications/test'))
const AdminApplicationsPage = React.lazy(() => import('@/pages/admin/applications'))

// ===== Админка: Документация =====
// Вспомогательные типы
type DocCategory = {
  id: string
  title: string
  description: string | null
  parent_category_id: string | null
  sort_order: number
  is_internal: boolean
}

type DocumentItem = {
  id: string
  title: string
  slug: string
  category_id: string
  content: any
  is_published: boolean
  is_internal: boolean
  version: number
  updated_at?: string | null
}

// Тип блока редактора
type EditorBlock =
  | { type: 'heading' | 'paragraph'; text: string; align?: 'left' | 'center' | 'right' }
  | { type: 'code'; text: string }
  | { type: 'image'; src: string; alt?: string }

// Типы и компоненты для привязки департаментов к документу
type Department = { id: string; name: string; full_name?: string }

const DepartmentPicker: React.FC<{
  value: string[]
  onChange: (ids: string[]) => void
  loadDepartments: () => Promise<Department[]>
}> = ({ value, onChange, loadDepartments }) => {
  const [items, setItems] = React.useState<Department[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    let mounted = true
    setLoading(true)
    loadDepartments()
      .then((list) => { if (mounted) setItems(list) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [loadDepartments])

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter(v => v !== id))
    else onChange([...value, id])
  }

  if (loading) return <div className="text-sm text-muted-foreground">Загрузка департаментов…</div>

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(dep => {
        const active = value.includes(dep.id)
        return (
          <button
            key={dep.id}
            type="button"
            onClick={() => toggle(dep.id)}
            className={`px-2 py-1 rounded border text-sm ${active ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'}`}
            title={dep.full_name || dep.name}
          >
            {dep.name}
          </button>
        )
      })}
      {items.length === 0 && <div className="text-sm text-muted-foreground">Нет департаментов</div>}
    </div>
  )
}

// Компонент: Дерево категорий со CRUD
const AdminDocCategoriesTree: React.FC<{
  categories: DocCategory[]
  activeCategoryId: string | null
  onSelect: (id: string | null) => void
  onCreate: (payload: Partial<DocCategory>) => Promise<void>
  onUpdate: (id: string, payload: Partial<DocCategory>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}> = ({ categories, activeCategoryId, onSelect, onCreate, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editId, setEditId] = React.useState<string | null>(null)
  const [title, setTitle] = React.useState('')
  const [parentId, setParentId] = React.useState<string | null>(null)
  const [isInternal, setIsInternal] = React.useState(false)

  const byParent: Record<string, DocCategory[]> = {}
  categories.forEach(c => {
    const key = c.parent_category_id || 'root'
    byParent[key] = byParent[key] || []
    byParent[key].push(c)
  })

  const openCreate = (parent: string | null) => {
    setEditId(null)
    setTitle('')
    setParentId(parent)
    setIsInternal(false)
    setIsModalOpen(true)
  }

  const openEdit = (cat: DocCategory) => {
    setEditId(cat.id)
    setTitle(cat.title)
    setParentId(cat.parent_category_id)
    setIsInternal(!!cat.is_internal)
    setIsModalOpen(true)
  }

  const submit = async () => {
    const payload: Partial<DocCategory> = {
      title,
      parent_category_id: parentId,
      is_internal: isInternal,
    }
    if (editId) {
      await onUpdate(editId, payload)
    } else {
      await onCreate(payload)
    }
    setIsModalOpen(false)
  }

  const renderNodes = (parent: string | null, depth = 0) => {
    const nodes = byParent[parent || 'root'] || []
    return (
      <div className="space-y-1">
        {nodes.sort((a,b)=> (a.sort_order - b.sort_order) || a.title.localeCompare(b.title)).map((c) => (
          <div key={c.id} className={`flex items-center justify-between px-2 py-1 rounded ${activeCategoryId===c.id? 'bg-gray-800' : 'hover:bg-gray-800/50'}`} style={{ paddingLeft: 8 + depth*10 }}>
            <button className="text-left flex-1" onClick={()=>onSelect(c.id)}>
              <div className="text-sm font-medium">{c.title}</div>
              {c.is_internal && (<div className="text-xs text-amber-400">Внутренняя</div>)}
            </button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={()=>openCreate(c.id)}>Добавить</Button>
              <Button variant="secondary" size="sm" onClick={()=>openEdit(c)}>Ред.</Button>
              <Button variant="destructive" size="sm" onClick={()=>onDelete(c.id)}>Удалить</Button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Категории</CardTitle>
          <Button onClick={()=>openCreate(null)}>Новая категория</Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderNodes(null, 0)}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Редактировать категорию' : 'Новая категория'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Название категории" />
            </div>
            <div className="space-y-2">
              <Label>Родительская категория</Label>
              <Select value={parentId ?? '__root__'} onValueChange={(v)=>setParentId(v === '__root__' ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Корень" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__root__">— Корневая —</SelectItem>
                  {categories.map(c=> (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Внутренняя</Label>
              <Switch checked={isInternal} onCheckedChange={setIsInternal} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setIsModalOpen(false)}>Отмена</Button>
            <Button onClick={submit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// Страница: Управление документацией (двухколоночный интерфейс)
const AdminDocumentsPage: React.FC = () => {
  const [categories, setCategories] = React.useState<DocCategory[]>([])
  const [documents, setDocuments] = React.useState<DocumentItem[]>([])
  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const navigate = useNavigate()

  const load = async () => {
    setIsLoading(true)
    try {
      const cats = await apiClient.get<{ success: boolean; data: DocCategory[] }>('/admin/doc-categories')
      const docs = await apiClient.get<{ success: boolean; data: DocumentItem[] }>('/admin/documents')
      setCategories(cats.data || [])
      setDocuments(docs.data || [])
    } finally {
      setIsLoading(false)
    }
  }
  React.useEffect(()=>{ load() }, [])

  const handleCreateCategory = async (payload: Partial<DocCategory>) => {
    await apiClient.post('/admin/doc-categories', payload)
    await load()
  }
  const handleUpdateCategory = async (id: string, payload: Partial<DocCategory>) => {
    await apiClient.put(`/admin/doc-categories/${id}`, payload)
    await load()
  }
  const handleDeleteCategory = async (id: string) => {
    await apiClient.delete(`/admin/doc-categories/${id}`)
    await load()
    if (activeCategoryId === id) setActiveCategoryId(null)
  }

  const filteredDocs = documents.filter(d => !activeCategoryId || d.category_id === activeCategoryId)

  const createDocument = async () => {
    if (!activeCategoryId) return
    const title = prompt('Название документа') || ''
    if (!title) return
    const res = await apiClient.post<{ success: boolean; data: DocumentItem }>(
      '/admin/documents',
      { title, slug: '', category_id: activeCategoryId, content: { type: 'doc', blocks: [] }, is_published: false, is_internal: false }
    )
    const id = res.data.id
    await load()
    navigate(`/admin/documents/edit/${id}`)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Управление документацией</h1>
        <p className="text-muted-foreground">Категории и документы базы знаний</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <AdminDocCategoriesTree
            categories={categories}
            activeCategoryId={activeCategoryId}
            onSelect={setActiveCategoryId}
            onCreate={handleCreateCategory}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
          />
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Документы</CardTitle>
                  <CardDescription>{activeCategoryId ? 'Выбранная категория' : 'Выберите категорию слева'}</CardDescription>
                </div>
                <Button disabled={!activeCategoryId} onClick={createDocument}>Создать документ</Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Загрузка...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-4">Название</th>
                        <th className="py-2 pr-4">Слаг</th>
                        <th className="py-2 pr-4">Опубликован</th>
                        <th className="py-2 pr-4">Внутренний</th>
                        <th className="py-2 pr-4">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocs.map(doc => (
                        <tr key={doc.id} className="border-b hover:bg-gray-800/30">
                          <td className="py-2 pr-4">{doc.title}</td>
                          <td className="py-2 pr-4">{doc.slug}</td>
                          <td className="py-2 pr-4">{doc.is_published ? 'Да' : 'Нет'}</td>
                          <td className="py-2 pr-4">{doc.is_internal ? 'Да' : 'Нет'}</td>
                          <td className="py-2 pr-4 flex gap-2">
                            <Button size="sm" variant="outline" onClick={()=>navigate(`/admin/documents/view/${doc.id}`)}>Просмотр</Button>
                            <Button size="sm" onClick={()=>navigate(`/admin/documents/edit/${doc.id}`)}>Редактировать</Button>
                            <Button size="sm" variant="destructive" onClick={async()=>{ await apiClient.delete(`/admin/documents/${doc.id}`); await load(); }}>Удалить</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Простой редактор на блоках (WYSIWYG-like) с сохранением JSONB
const AdminDocumentEditorPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = React.useState<DocCategory[]>([])
  const [title, setTitle] = React.useState('')
  const [slug, setSlug] = React.useState('')
  const [slugTouched, setSlugTouched] = React.useState(false)
  const [categoryId, setCategoryId] = React.useState('')
  const [isPublished, setIsPublished] = React.useState(false)
  const [isInternal, setIsInternal] = React.useState(false)
  const [blocks, setBlocks] = React.useState<EditorBlock[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Привязка департаментов
  const [depIds, setDepIds] = React.useState<string[]>([])
  const [savingDeps, setSavingDeps] = React.useState(false)

  React.useEffect(()=>{
    const load = async () => {
      const cats = await apiClient.get<{ success: boolean; data: DocCategory[] }>('/admin/doc-categories')
      setCategories(cats.data || [])
      if (id && id !== 'new') {
        const resp = await apiClient.get<{ success: boolean; data: DocumentItem }>(`/admin/documents/${id}`)
        const d = resp.data
        setTitle(d.title)
        setSlug(d.slug)
        setSlugTouched(true)
        setCategoryId(d.category_id)
        setIsPublished(!!d.is_published)
        setIsInternal(!!d.is_internal)
        const initialBlocks = Array.isArray(d.content?.blocks) ? d.content.blocks : []
        setBlocks(initialBlocks)

        // загрузим привязанные департаменты
        try {
          const rel = await apiClient.get<{ success: boolean; data: { department_id: string }[] }>(`/admin/documents/${id}/departments`)
          setDepIds((rel.data || []).map(r => r.department_id))
        } catch (e) {
          console.warn('Не удалось загрузить привязки департаментов', e)
        }
      }
    }
    load()
  }, [id])

  // Автогенерация slug, если пользователь не редактировал slug вручную
  React.useEffect(()=>{
    if (!slugTouched) {
      const translit = (s: string) => {
        const map: Record<string,string> = {"а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"e","ж":"zh","з":"z","и":"i","й":"y","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"c","ч":"ch","ш":"sh","щ":"sch","ъ":"","ы":"y","ь":"","э":"e","ю":"yu","я":"ya","А":"a","Б":"b","В":"v","Г":"g","Д":"d","Е":"e","Ё":"e","Ж":"zh","З":"z","И":"i","Й":"y","К":"k","Л":"l","М":"m","Н":"n","О":"o","П":"p","Р":"r","С":"s","Т":"t","У":"u","Ф":"f","Х":"h","Ц":"c","Ч":"ch","Ш":"sh","Щ":"sch","Ъ":"","Ы":"y","Ь":"","Э":"e","Ю":"yu","Я":"ya"};
        const replaced = s.split('').map(ch=>map[ch]??ch).join('');
        const ascii = replaced.normalize('NFKD').replace(/[^\w\s-]/g, '');
        return ascii.trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
      }
      setSlug(translit(title))
    }
  }, [title, slugTouched])

  const addBlock = (type: 'heading'|'paragraph'|'code') => {
    const base: any = { type, text: '' }
    if (type === 'heading' || type === 'paragraph') base.align = 'left'
    setBlocks(prev => [...prev, base])
  }
  const updateBlock = (i: number, text: string) => {
    setBlocks(prev => prev.map((b, idx)=> idx===i && (b as any).text !== undefined ? { ...(b as any), text } as EditorBlock : b))
  }
  const updateBlockAlign = (i: number, align: 'left'|'center'|'right') => {
    setBlocks(prev => prev.map((b, idx)=> idx===i ? { ...b, align } : b))
  }
  const removeBlock = (i: number) => {
    setBlocks(prev => prev.filter((_, idx)=> idx!==i))
  }

  const requestSignedUploadUrl = async (file: File): Promise<{ signedUrl: string; path: string }> => {
    const resp = await apiClient.post<{ success: boolean; data: { signedUrl: string; path: string } }>(
      '/admin/documents/upload-url',
      { fileName: file.name, fileType: file.type }
    )
    return resp.data
  }

  async function uploadFileToSignedUrl(signedUrl: string, file: File) {
    try {
      // Use the global apiClient to automatically include the Authorization header.
      // Use the PUT method, which is standard for Supabase Storage uploads.
      const data = await apiClient.put(signedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      console.log('File uploaded successfully via apiClient PUT.');
      return data; // Return data if any, or resolve promise.

    } catch (error) {
      console.error('Error in uploadFileToSignedUrl:', error);
      throw error; // Re-throw for the calling function to handle.
    }
  }

  const onImageButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageSelected: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    try {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return

      const { signedUrl, path } = await requestSignedUploadUrl(file)
      await uploadFileToSignedUrl(signedUrl, file)

      const { data } = supabase.storage.from('doc_attachments').getPublicUrl(path)
      const publicUrl = data.publicUrl
      const alt = window.prompt('Альтернативный текст (alt) для изображения', '') || undefined

      setBlocks(prev => [...prev, { type: 'image', src: publicUrl, alt }])
    } catch (err) {
      console.error('Image upload failed', err)
      alert('Не удалось загрузить изображение')
    }
  }

  // Загрузчик списка департаментов
  const loadDepartments = React.useCallback(async (): Promise<Department[]> => {
    const res = await apiClient.get<{ success: boolean; data: Department[] }>(`/admin/departments`)
    return res.data || []
  }, [])

  // Сохранение привязок департаментов
  const saveDepartments = async () => {
    if (!id) return
    setSavingDeps(true)
    try {
      await apiClient.post(`/admin/documents/${id}/departments`, { departmentIds: depIds })
    } finally {
      setSavingDeps(false)
    }
  }

  const save = async () => {
    if (!id) return
    const payload = {
      title,
      slug,
      category_id: categoryId,
      is_published: isPublished,
      is_internal: isInternal,
      content: { type: 'doc', blocks },
    }
    await apiClient.put(`/admin/documents/${id}`, payload)
    navigate('/admin/documents')
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Редактор документа</h1>
        <div className="flex gap-2">
          {id && id !== 'new' && (
            <Button variant="outline" onClick={()=>navigate(`/admin/documents/view/${id}`)}>Предпросмотр</Button>
          )}
          <Button variant="outline" onClick={()=>navigate('/admin/documents')}>Назад</Button>
          <Button onClick={save}>Сохранить</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 space-y-4">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input value={title} onChange={e=>setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Слаг (URL)</Label>
            <Input value={slug} onChange={e=>{ setSlug(e.target.value); setSlugTouched(true); }} />
          </div>
          <div className="space-y-2">
            <Label>Категория</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label>Опубликован</Label>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Внутренний</Label>
            <Switch checked={isInternal} onCheckedChange={setIsInternal} />
          </div>

          {/* Блок доступа по департаментам */}
          {!isInternal && (
            <div className="mt-4 space-y-3">
              <div className="text-sm text-muted-foreground">
                Если не выбрано ни одного департамента — документ публичный для всех, у кого есть доступ согласно политикам. Если выбраны департаменты — документ виден только участникам этих департаментов.
              </div>
              <DepartmentPicker value={depIds} onChange={setDepIds} loadDepartments={loadDepartments} />
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  Текущий режим: {depIds.length > 0 ? <b>Департаментский</b> : <b>Публичный</b>}
                </div>
                <Button variant="secondary" size="sm" onClick={saveDepartments} disabled={savingDeps}>
                  {savingDeps ? 'Сохраняю…' : 'Сохранить доступ'}
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Содержимое</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={()=>addBlock('heading')}>Заголовок</Button>
                  <Button variant="outline" onClick={()=>addBlock('paragraph')}>Основной текст</Button>
                  <Button variant="outline" onClick={()=>addBlock('code')}>Код</Button>
                  <Button variant="outline" onClick={onImageButtonClick}>Изображение</Button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelected} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {blocks.map((b, i)=> (
                  <div key={i} className="p-3 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-muted-foreground">{
                          b.type==='heading' ? 'Заголовок' :
                          b.type==='paragraph' ? 'Основной текст' :
                          b.type==='code' ? 'Код' :
                          b.type==='image' ? 'Изображение' : b.type
                        }</div>
                        {b.type !== 'code' && b.type !== 'image' && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">Выравнивание</span>
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant={((b as any).align ?? 'left')==='left' ? 'secondary' : 'outline'} onClick={()=>updateBlockAlign(i, 'left')}>L</Button>
                              <Button size="sm" variant={((b as any).align ?? 'left')==='center' ? 'secondary' : 'outline'} onClick={()=>updateBlockAlign(i, 'center')}>C</Button>
                              <Button size="sm" variant={((b as any).align ?? 'left')==='right' ? 'secondary' : 'outline'} onClick={()=>updateBlockAlign(i, 'right')}>R</Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="destructive" onClick={()=>removeBlock(i)}>Удалить</Button>
                    </div>
                    {b.type === 'image' ? (
                      <div className="my-2">
                        <img src={(b as any).src} alt={(b as any).alt || 'Изображение'} className="max-w-full h-auto rounded-md border" />
                        {(b as any).alt && <div className="text-xs text-slate-400 mt-1">alt: {(b as any).alt}</div>}
                      </div>
                    ) : (
                      <textarea
                        className={`w-full bg-transparent border rounded p-2 text-sm ${ (((b as any).align ?? 'left')==='center') ? 'text-center' : ( (((b as any).align ?? 'left')==='right') ? 'text-right' : '' ) }`}
                        rows={b.type==='code'? 8 : 3}
                        placeholder={b.type==='heading'? 'Заголовок' : b.type==='code'? 'Код' : 'Основной текст'}
                        value={(b as any).text}
                        onChange={e=>updateBlock(i, e.target.value)}
                      />
                    )}
                  </div>
                ))}
                {blocks.length===0 && (
                  <div className="text-sm text-muted-foreground">Добавьте блоки содержимого через панель инструментов сверху.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Просмотр документа «как игрок» (использует публичный endpoint по slug)
const AdminDocumentViewPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [playerDoc, setPlayerDoc] = React.useState<DocumentItem | null>(null)
  const [adminDoc, setAdminDoc] = React.useState<DocumentItem | null>(null)
  const [unavailableToPlayer, setUnavailableToPlayer] = React.useState(false)

  React.useEffect(()=>{
    const load = async () => {
      if (!id) return
      try {
        // 1) Получаем метаданные админского документа, чтобы узнать slug
        const adminRes = await apiClient.get<{ success: boolean; data: DocumentItem }>(`/admin/documents/${id}`)
        const meta = adminRes.data
        setAdminDoc(meta)

        // 2) Пытаемся получить публичный вид по slug (RLS + is_published)
        try {
          const pub = await apiClient.get<{ success: boolean; data: DocumentItem }>(`/documents/slug/${meta.slug}`)
          setPlayerDoc(pub.data)
        } catch (e) {
          setUnavailableToPlayer(true)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const renderBlocks = (content: any) => {
    const blocks = Array.isArray(content?.blocks) ? content.blocks as Array<any> : []
    return (
      <div className="space-y-6">
        {blocks.map((b, i)=>{
          if (b.type === 'heading') return <h2 key={i} className={`text-xl font-semibold ${ (b.align ?? 'left')==='center' ? 'text-center' : ( (b.align ?? 'left')==='right' ? 'text-right' : '' )}`}>{b.text}</h2>
          if (b.type === 'code') return (
            <pre key={i} className="bg-black/40 border border-gray-700 rounded p-3 text-xs overflow-auto">
{b.text}
            </pre>
          )
          if (b.type === 'image') {
            return (
              <div key={i} className="my-4">
                <img
                  src={b.src}
                  alt={b.alt || 'Изображение из документа'}
                  className="max-w-full h-auto rounded-md border"
                />
              </div>
            )
          }
          return <p key={i} className={`text-slate-300 text-sm whitespace-pre-wrap ${ (b.align ?? 'left')==='center' ? 'text-center' : ( (b.align ?? 'left')==='right' ? 'text-right' : '' )}`}>{b.text}</p>
        })}
        {blocks.length === 0 && (
          <div className="text-sm text-muted-foreground">Пустой документ.</div>
        )}
      </div>
    )
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )

  const showDoc = playerDoc ?? adminDoc
  const isPlayerView = !!playerDoc && !unavailableToPlayer

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{showDoc?.title || 'Документ'}</h1>
          {!isPlayerView && (
            <p className="text-amber-400 text-sm mt-1">Для игрока недоступно (не опубликован или нет доступа). Показан админский контент.</p>
          )}
        </div>
        <div className="flex gap-2">
          {id && <Button variant="outline" onClick={()=>navigate(`/admin/documents/edit/${id}`)}>Редактировать</Button>}
          <Button variant="outline" onClick={()=>navigate('/admin/documents')}>К списку</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Свойства</CardTitle>
              <CardDescription>Режим просмотра: {isPlayerView ? 'игрок' : 'админ (предпросмотр)'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><span className="text-slate-400">Слаг:</span> {showDoc?.slug}</div>
                <div><span className="text-slate-400">Опубликован:</span> {showDoc?.is_published ? 'Да' : 'Нет'}</div>
                <div><span className="text-slate-400">Внутренний:</span> {showDoc?.is_internal ? 'Да' : 'Нет'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-9">
          <Card>
            <CardHeader>
              <CardTitle>Содержимое</CardTitle>
            </CardHeader>
            <CardContent>
              {renderBlocks(showDoc?.content)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
)

function App() {
  // Логирование инициализации приложения
  console.log('✅ [Personal Cabinet] Приложение инициализировано')
  console.log('✅ [Personal Cabinet] Все провайдеры подключены')

  const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoading } = useAuth()
    const { session, isLoading: isSessionLoading } = useSession()
    if (isLoading || isSessionLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      )
    }
    if (!user || !session) return <Navigate to="/login" replace />
    const hasAdminPanelAccess = Array.isArray(session.permissions) && session.permissions.includes('admin.panel.access')
    if (!hasAdminPanelAccess) {
      return <Navigate to="/dashboard" replace />
    }
    return <>{children}</>
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SessionProvider>
          <AuthProvider>
            <TooltipProvider>
            <Router>
              <React.Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Homepage />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route
                      path="/cadet/test"
                      element={
                        <StageGuard requiredStage="cadet_test">
                          <React.Suspense fallback={<LoadingSpinner />}>
                            {React.createElement(React.lazy(() => import('@/pages/cadet/test')))}
                          </React.Suspense>
                        </StageGuard>
                      }
                    />
                    <Route
                      path="/cadet/training"
                      element={
                        <StageGuard requiredStage="cadet_training">
                          <React.Suspense fallback={<LoadingSpinner />}>
                            {React.createElement(React.lazy(() => import('@/pages/cadet/training')))}
                          </React.Suspense>
                        </StageGuard>
                      }
                    />
                    <Route
                      path="/cadet/test"
                      element={
                        <StageGuard requiredStage="cadet_test">
                          <React.Suspense fallback={<LoadingSpinner />}>
                            {React.createElement(React.lazy(() => import('@/pages/cadet/test')))}
                          </React.Suspense>
                        </StageGuard>
                      }
                    />
                    <Route
                      path="/cadet/training"
                      element={
                        <StageGuard requiredStage="cadet_training">
                          <React.Suspense fallback={<LoadingSpinner />}>
                            {React.createElement(React.lazy(() => import('@/pages/cadet/training')))}
                          </React.Suspense>
                        </StageGuard>
                      }
                    />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/departments" element={<Departments />} />
                    <Route path="/applications" element={<Applications />} />
                    <Route path="/applications/:applicationId/test" element={<ApplicationTestPage />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/tests" element={<Tests />} />
                    <Route path="/support" element={<Support />} />
                    <Route
                      path="/admin"
                      element={
                        <PermissionGuard permission="admin.panel.access">
                          <AdminPanel />
                        </PermissionGuard>
                      }
                    />
                    <Route
                      path="/admin/tests"
                      element={
                        <AdminRoute>
                          <AdminTestsPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/tests/new"
                      element={
                        <AdminRoute>
                          <AdminTestNewPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/tests/:id/edit"
                      element={
                        <AdminRoute>
                          <AdminTestEditPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/applications"
                      element={
                        <AdminRoute>
                          <AdminApplicationsPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/documents"
                      element={
                        <PermissionGuard permission="documents.manage">
                          <AdminDocumentsPage />
                        </PermissionGuard>
                      }
                    />
                    <Route
                      path="/admin/documents/edit/:id"
                      element={
                        <PermissionGuard permission="documents.manage">
                          <AdminDocumentEditorPage />
                        </PermissionGuard>
                      }
                    />
                    <Route
                      path="/admin/documents/view/:id"
                      element={
                        <PermissionGuard permission="documents.manage">
                          <AdminDocumentViewPage />
                        </PermissionGuard>
                      }
                    />
                  </Route>

                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </React.Suspense>
              <Toaster />
              {/* <ConnectionStatus /> */}
            </Router>
            </TooltipProvider>
          </AuthProvider>
        </SessionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App 