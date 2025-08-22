import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { Separator } from '@/shared/ui/separator'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { Label } from '@/shared/ui/label'
import { useToast } from '@/shared/ui/use-toast'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import { 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Image,
  Save,
  ArrowLeft,
  Eye,
  FileText,
  Upload,
  Loader2,
  Type,
  Quote,
  Code,
  Table,
  Strikethrough,
  Highlighter,
  Palette
} from 'lucide-react'
import { adminDocumentsApi } from '@/shared/api/documents'
import type { Document, DocumentCategory } from '@/shared/types/documents'
import { useSession } from '@/shared/contexts/SessionContext'
import { usePermissions } from '@/shared/hooks/usePermissions'

interface EditorState {
  title: string
  slug: string
  categoryId: string
  content: string
  isPublished: boolean
  isInternal: boolean
  version: string
}

export default function DocumentEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isLoading } = useSession()
  const { isLoggedIn, session } = usePermissions()
  const hasDocsManage = (session?.permissions || []).includes('documents.manage')
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<DocumentCategory[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [editorState, setEditorState] = useState<EditorState>({
    title: '',
    slug: '',
    categoryId: '',
    content: '',
    isPublished: false,
    isInternal: false,
    version: '1.0'
  })

  const isEditMode = !!id

  useEffect(() => {
    if (!isLoggedIn || !hasDocsManage) {
      setLoading(false)
      return
    }
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch categories
        const categoriesResponse = await adminDocumentsApi.getAllCategories()
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data)
        }

        // If editing, fetch document data
        if (isEditMode) {
          const docResponse = await adminDocumentsApi.getDocument(id)
          if (docResponse.success && docResponse.data) {
            const doc = docResponse.data
            setEditorState({
              title: doc.title,
              slug: doc.slug,
              categoryId: doc.category_id,
              content: doc.content || '',
              isPublished: doc.is_published,
              isInternal: doc.is_internal,
              version: doc.version
            })
            
            // Set editor content
            if (editorRef.current) {
              editorRef.current.innerHTML = doc.content || ''
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
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
  }, [id, isEditMode, isLoggedIn, hasDocsManage])

  const handleSave = async () => {
    if (!editorState.title.trim() || !editorState.slug.trim() || !editorState.categoryId) {
      toast({
        title: "Ошибка валидации",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)
      
      const content = editorRef.current?.innerHTML || ''
      
      const documentData = {
        title: editorState.title,
        slug: editorState.slug,
        category_id: editorState.categoryId,
        content,
        is_published: editorState.isPublished,
        is_internal: editorState.isInternal,
        version: editorState.version
      }

      let response
      if (isEditMode) {
        response = await adminDocumentsApi.updateDocument(id, documentData)
      } else {
        response = await adminDocumentsApi.createDocument(documentData)
      }

      if (response.success) {
        toast({
          title: "Успех",
          description: isEditMode ? "Документ обновлен" : "Документ создан"
        })
        
        if (!isEditMode && response.data?.id) {
          // Navigate to edit mode with the new document ID
          navigate(`/admin/documents/editor/${response.data.id}`)
        }
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Не удалось сохранить документ",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving document:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить документ",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await uploadImage(file)
    }
  }

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите изображение",
        variant: "destructive"
      })
      return
    }

    // For now, we'll use a data URL. In production, you'd upload to a server
    const reader = new FileReader()
    reader.onload = (e) => {
      const imgHTML = `<img src="${e.target?.result}" style="max-width: 100%; height: auto; margin: 1em 0;" alt="Uploaded image" />`
      document.execCommand('insertHTML', false, imgHTML)
      editorRef.current?.focus()
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, перетащите изображения",
        variant: "destructive"
      })
      return
    }

    // Upload all images
    for (const file of imageFiles) {
      await uploadImage(file)
    }
  }

  const insertHeading = (level: number) => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const headingElement = document.createElement(`h${level}`)
      
      // Apply comprehensive styling based on heading level
      const styles = {
        1: {
          fontSize: '2.25em',
          fontWeight: 'bold',
          margin: '1.5em 0 0.5em 0',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.25em',
          color: '#1f2937'
        },
        2: {
          fontSize: '1.875em',
          fontWeight: 'bold',
          margin: '1.25em 0 0.5em 0',
          color: '#374151'
        },
        3: {
          fontSize: '1.5em',
          fontWeight: 'semibold',
          margin: '1em 0 0.5em 0',
          color: '#4b5563'
        },
        4: {
          fontSize: '1.25em',
          fontWeight: 'semibold',
          margin: '0.75em 0 0.25em 0',
          color: '#6b7280'
        }
      }
      
      const style = styles[level as keyof typeof styles]
      Object.assign(headingElement.style, style)
      
      if (range.collapsed) {
        headingElement.textContent = `Заголовок ${level}`
        range.insertNode(headingElement)
        range.selectNodeContents(headingElement)
        selection.removeAllRanges()
        selection.addRange(range)
      } else {
        headingElement.appendChild(range.extractContents())
        range.insertNode(headingElement)
      }
    }
    editorRef.current?.focus()
  }

  const insertBlockQuote = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const blockquoteElement = document.createElement('blockquote')
      
      blockquoteElement.style.borderLeft = '4px solid #e5e7eb'
      blockquoteElement.style.paddingLeft = '1em'
      blockquoteElement.style.margin = '1em 0'
      blockquoteElement.style.fontStyle = 'italic'
      blockquoteElement.style.color = '#6b7280'
      blockquoteElement.style.backgroundColor = '#f9fafb'
      blockquoteElement.style.padding = '1em'
      blockquoteElement.style.borderRadius = '0.375rem'
      
      if (range.collapsed) {
        blockquoteElement.innerHTML = '<p>Ваша цитата...</p>'
        range.insertNode(blockquoteElement)
        
        // Create an escape paragraph after the blockquote to prevent cursor trapping
        const escapeParagraph = document.createElement('p')
        escapeParagraph.innerHTML = '<br>' // Empty paragraph with line break
        blockquoteElement.parentNode?.insertBefore(escapeParagraph, blockquoteElement.nextSibling)
        
        // Select the content inside the blockquote for editing
        const paragraph = blockquoteElement.querySelector('p')
        if (paragraph) {
          range.selectNodeContents(paragraph)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      } else {
        const paragraph = document.createElement('p')
        paragraph.appendChild(range.extractContents())
        blockquoteElement.appendChild(paragraph)
        range.insertNode(blockquoteElement)
        
        // Create an escape paragraph after the blockquote to prevent cursor trapping
        const escapeParagraph = document.createElement('p')
        escapeParagraph.innerHTML = '<br>' // Empty paragraph with line break
        blockquoteElement.parentNode?.insertBefore(escapeParagraph, blockquoteElement.nextSibling)
      }
    }
    editorRef.current?.focus()
  }

  const insertCodeBlock = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const codeElement = document.createElement('pre')
      const code = document.createElement('code')
      
      codeElement.style.backgroundColor = '#f3f4f6'
      codeElement.style.padding = '1em'
      codeElement.style.borderRadius = '0.375rem'
      codeElement.style.fontFamily = 'ui-monospace, SFMono-Regular, Monaco, Consolas, monospace'
      codeElement.style.fontSize = '0.875em'
      codeElement.style.overflow = 'auto'
      codeElement.style.margin = '1em 0'
      codeElement.style.border = '1px solid #e5e7eb'
      codeElement.style.color = '#374151' // Dark text color to fix visibility
      code.style.color = '#374151' // Ensure code text is dark
      
      if (range.collapsed) {
        code.textContent = '// Ваш код здесь...'
        codeElement.appendChild(code)
        range.insertNode(codeElement)
        
        // Create an escape paragraph after the code block to prevent cursor trapping
        const escapeParagraph = document.createElement('p')
        escapeParagraph.innerHTML = '<br>' // Empty paragraph with line break
        codeElement.parentNode?.insertBefore(escapeParagraph, codeElement.nextSibling)
        
        // Select the content inside the code block for editing
        range.selectNodeContents(code)
        selection.removeAllRanges()
        selection.addRange(range)
      } else {
        code.appendChild(range.extractContents())
        codeElement.appendChild(code)
        range.insertNode(codeElement)
        
        // Create an escape paragraph after the code block to prevent cursor trapping
        const escapeParagraph = document.createElement('p')
        escapeParagraph.innerHTML = '<br>' // Empty paragraph with line break
        codeElement.parentNode?.insertBefore(escapeParagraph, codeElement.nextSibling)
      }
    }
    editorRef.current?.focus()
  }

  const changeTextColor = (color: string) => {
    document.execCommand('foreColor', false, color)
    editorRef.current?.focus()
  }

  const insertTable = () => {
    const tableHTML = `
      <table style="border-collapse: collapse; width: 100%; margin: 1em 0; border: 1px solid #e5e7eb;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="border: 1px solid #e5e7eb; padding: 0.75em; text-align: left;">Заголовок 1</th>
            <th style="border: 1px solid #e5e7eb; padding: 0.75em; text-align: left;">Заголовок 2</th>
            <th style="border: 1px solid #e5e7eb; padding: 0.75em; text-align: left;">Заголовок 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #e5e7eb; padding: 0.75em;">Ячейка 1</td>
            <td style="border: 1px solid #e5e7eb; padding: 0.75em;">Ячейка 2</td>
            <td style="border: 1px solid #e5e7eb; padding: 0.75em;">Ячейка 3</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e5e7eb; padding: 0.75em;">Ячейка 4</td>
            <td style="border: 1px solid #e5e7eb; padding: 0.75em;">Ячейка 5</td>
            <td style="border: 1px solid #e5e7eb; padding: 0.75em;">Ячейка 6</td>
          </tr>
        </tbody>
      </table>
    `
    document.execCommand('insertHTML', false, tableHTML)
    editorRef.current?.focus()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Загрузка…</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn || !hasDocsManage) {
    return <Navigate to="/dashboard" replace />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Загрузка редактора...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/admin/documents')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к документам
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span className="font-medium">
                {isEditMode ? 'Редактирование документа' : 'Создание документа'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Предпросмотр
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave} 
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Сохранить
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Настройки документа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название *</Label>
                <Input
                  id="title"
                  value={editorState.title}
                  onChange={(e) => setEditorState(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Введите название документа"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={editorState.slug}
                  onChange={(e) => setEditorState(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="document-slug"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Категория *</Label>
                <Select 
                  value={editorState.categoryId} 
                  onValueChange={(value) => setEditorState(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={editorState.isPublished}
                    onCheckedChange={(checked) => setEditorState(prev => ({ ...prev, isPublished: checked }))}
                  />
                  <Label htmlFor="published">Опубликовать</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="internal"
                    checked={editorState.isInternal}
                    onCheckedChange={(checked) => setEditorState(prev => ({ ...prev, isInternal: checked }))}
                  />
                  <Label htmlFor="internal">Внутренний документ</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Версия</Label>
                <Input
                  id="version"
                  value={editorState.version}
                  onChange={(e) => setEditorState(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="1.0"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Editor */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Toolbar */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 flex-wrap gap-2">
                  {/* Text Formatting */}
                  <div className="flex items-center space-x-1 border-r pr-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => execCommand('bold')}
                      title="Жирный"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => execCommand('italic')}
                      title="Курсив"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => execCommand('underline')}
                      title="Подчеркнутый"
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => execCommand('strikeThrough')}
                      title="Зачеркнутый"
                    >
                      <Strikethrough className="h-4 w-4" />
                    </Button>
                    
                    {/* Text Color */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Цвет текста"
                        >
                          <Palette className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="space-y-3">
                          <h4 className="font-medium leading-none">Цвет текста</h4>
                          <div className="grid grid-cols-8 gap-2">
                            {[
                              '#000000', '#444444', '#666666', '#999999',
                              '#cccccc', '#eeeeee', '#f3f3f3', '#ffffff',
                              '#ff0000', '#ff9900', '#ffff00', '#00ff00',
                              '#00ffff', '#0000ff', '#9900ff', '#ff00ff',
                              '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3',
                              '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc',
                              '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8',
                              '#a2c4c9', '#9fc5e8', '#b4a7d6', '#d5a6bd',
                              '#e06666', '#f6b26b', '#ffd966', '#93c47d',
                              '#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0',
                              '#cc0000', '#e69138', '#f1c232', '#6aa84f',
                              '#45818e', '#3d85c6', '#674ea7', '#a64d79',
                              '#990000', '#b45f06', '#bf9000', '#38761d',
                              '#134f5c', '#0b5394', '#351c75', '#741b47'
                            ].map((color) => (
                              <button
                                key={color}
                                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => changeTextColor(color)}
                                title={color}
                              />
                            ))}
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              className="w-8 h-8 rounded border border-gray-300"
                              onChange={(e) => changeTextColor(e.target.value)}
                              title="Выбрать другой цвет"
                            />
                            <span className="text-sm text-gray-600">Другой цвет</span>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Headings */}
                  <div className="flex items-center space-x-1 border-r pr-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertHeading(1)}
                      title="Заголовок 1"
                      className="font-bold"
                    >
                      H1
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertHeading(2)}
                      title="Заголовок 2"
                      className="font-semibold"
                    >
                      H2
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertHeading(3)}
                      title="Заголовок 3"
                    >
                      H3
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertHeading(4)}
                      title="Заголовок 4"
                      className="text-sm"
                    >
                      H4
                    </Button>
                  </div>

                  {/* Alignment */}
                  <div className="flex items-center space-x-1 border-r pr-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => execCommand('justifyLeft')}
                      title="По левому краю"
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => execCommand('justifyCenter')}
                      title="По центру"
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => execCommand('justifyRight')}
                      title="По правому краю"
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Lists */}
                  <div className="flex items-center space-x-1 border-r pr-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => execCommand('insertUnorderedList')}
                      title="Маркированный список"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => execCommand('insertOrderedList')}
                      title="Нумерованный список"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Special Elements */}
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={insertBlockQuote}
                      title="Цитата"
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={insertCodeBlock}
                      title="Блок кода"
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={insertTable}
                      title="Таблица"
                    >
                      <Table className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleImageUpload}
                      title="Вставить изображение"
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Editor */}
            <Card>
              <CardContent className="p-0 relative">
                <div
                  ref={editorRef}
                  contentEditable
                  className={`min-h-[600px] p-8 focus:outline-none transition-colors ${
                    isDragOver ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-400' : ''
                  }`}
                  style={{
                    lineHeight: '1.6',
                    fontSize: '16px',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                  suppressContentEditableWarning
                  onInput={() => {
                    // Auto-save could be implemented here
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  placeholder="Начните писать ваш документ или перетащите изображения..."
                />
                {isDragOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-50/90 dark:bg-blue-900/50 pointer-events-none">
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <p className="text-lg font-medium text-blue-700 dark:text-blue-300">
                        Отпустите для загрузки изображений
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}