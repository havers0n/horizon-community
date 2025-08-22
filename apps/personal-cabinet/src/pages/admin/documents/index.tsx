import React, { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { 
  FileText, 
  Upload, 
  Download, 
  Edit, 
  Trash2, 
  Search,
  Plus,
  Eye,
  Loader2
} from 'lucide-react'
import { adminDocumentsApi } from '@/shared/api/documents'
import type { Document, DocumentCategory } from '@/shared/types/documents'
import { useToast } from '@/shared/ui/use-toast'
import { useSession } from '@/shared/contexts/SessionContext'
import { usePermissions } from '@/shared/hooks/usePermissions'

export default function AdminDocumentsPage() {
  const navigate = useNavigate()
  const { isLoading } = useSession()
  const { isLoggedIn, session } = usePermissions()
  const hasDocsManage = (session?.permissions || []).includes('documents.manage')
  const [searchTerm, setSearchTerm] = useState('')
  const [documents, setDocuments] = useState<Document[]>([])
  const [categories, setCategories] = useState<DocumentCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!isLoggedIn || !hasDocsManage) {
      setLoading(false)
      return
    }
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log('%c[AdminDocuments] Starting fetch...', 'color: blue; font-weight: bold;')
        
        const [docsResponse, categoriesResponse] = await Promise.all([
          adminDocumentsApi.getAllDocuments(),
          adminDocumentsApi.getAllCategories()
        ])

        console.log('%c[AdminDocuments] Documents Response:', 'color: blue;', docsResponse)
        console.log('%c[AdminDocuments] Categories Response:', 'color: blue;', categoriesResponse)

        if (docsResponse.success && docsResponse.data) {
          setDocuments(docsResponse.data)
          console.log('%c[AdminDocuments] Documents set:', 'color: green;', docsResponse.data.length, 'documents')
        } else {
          console.error('%c[AdminDocuments] Documents fetch failed:', 'color: red;', docsResponse)
          toast({
            title: "Ошибка",
            description: docsResponse.error || "Не удалось загрузить документы",
            variant: "destructive"
          })
        }

        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data)
          console.log('%c[AdminDocuments] Categories set:', 'color: green;', categoriesResponse.data.length, 'categories')
        }
      } catch (error) {
        console.error('%c[AdminDocuments] Fetch error:', 'color: red;', error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId)
    return category?.title || 'Неизвестная категория'
  }

  const getFilteredDocuments = () => {
    let filtered = documents
    
    // Filter by selected category
    if (selectedCategory) {
      filtered = filtered.filter(doc => doc.category_id === selectedCategory)
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoryName(doc.category_id).toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filtered
  }

  const handleCreateDocument = () => {
    navigate('/admin/documents/editor')
  }

  const handleEditDocument = (document: Document) => {
    navigate(`/admin/documents/editor/${document.id}`)
  }

  const handleDeleteDocument = async (id: string, title: string) => {
    if (!confirm(`Вы уверены, что хотите удалить документ "${title}"?`)) return

    try {
      const response = await adminDocumentsApi.deleteDocument(id)
      if (response.success) {
        setDocuments(documents.filter(doc => doc.id !== id))
        toast({
          title: "Успех",
          description: "Документ успешно удалён"
        })
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Не удалось удалить документ",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить документ",
        variant: "destructive"
      })
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const response = await adminDocumentsApi.updateDocument(id, {
        is_published: !currentStatus
      })
      if (response.success && response.data) {
        setDocuments(documents.map(doc => 
          doc.id === id ? response.data! : doc
        ))
        toast({
          title: "Успех",
          description: `Документ ${!currentStatus ? 'опубликован' : 'снят с публикации'}`
        })
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Не удалось обновить статус документа",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating document:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус документа",
        variant: "destructive"
      })
    }
  }



  const getStatusBadge = (isPublished: boolean, isInternal: boolean) => {
    if (isPublished && !isInternal) {
      return <Badge variant="default">Опубликован</Badge>
    } else if (isPublished && isInternal) {
      return <Badge variant="secondary">Внутренний</Badge>
    } else {
      return <Badge variant="outline">Черновик</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-gray-600 dark:text-gray-400">Загрузка…</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoggedIn || !hasDocsManage) {
    return <Navigate to="/dashboard" replace />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-gray-600 dark:text-gray-400">Загрузка документов...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Управление документацией
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Создание и управление документами
          </p>
        </div>
        <Button onClick={handleCreateDocument}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить документ
        </Button>
      </div>

      {/* Search and filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию или категории..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Загрузить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories and Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Категории</CardTitle>
              <CardDescription>Выберите категорию для просмотра документов</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedCategory(null)}
              >
                Все документы ({documents.length})
              </Button>
              {categories.map((category) => {
                const categoryDocCount = documents.filter(doc => doc.category_id === category.id).length
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.title} ({categoryDocCount})
                  </Button>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Documents list */}
        <div className="lg:col-span-3 space-y-4">
          {getFilteredDocuments().length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Документы не найдены
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedCategory 
                    ? `В выбранной категории нет документов${searchTerm ? ', соответствующих поисковому запросу' : ''}.`
                    : searchTerm 
                    ? 'Не найдено документов, соответствующих поисковому запросу.'
                    : 'Начните с создания первого документа.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            getFilteredDocuments().map((doc) => (
              <Card key={doc.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {doc.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Категория: {getCategoryName(doc.category_id)}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Slug: {doc.slug}</span>
                          <span>Версия: {doc.version}</span>
                          <span>Обновлено: {new Date(doc.updated_at).toLocaleDateString('ru-RU')}</span>
                          {doc.is_internal && <span className="text-orange-600">Внутренний</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant={doc.is_published ? "default" : "secondary"}
                        onClick={() => handleTogglePublish(doc.id, doc.is_published)}
                      >
                        {doc.is_published ? 'Снять с публикации' : 'Опубликовать'}
                      </Button>
                      {getStatusBadge(doc.is_published, doc.is_internal)}
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="ghost" title="Просмотр">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          title="Редактировать"
                          onClick={() => handleEditDocument(doc)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          title="Удалить"
                          onClick={() => handleDeleteDocument(doc.id, doc.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего документов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Опубликованных</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.is_published && !d.is_internal).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Черновиков</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => !d.is_published).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Категорий</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}