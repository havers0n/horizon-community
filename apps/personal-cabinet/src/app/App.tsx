import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams, Link as RouterLink } from 'react-router-dom'
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
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TiptapLink from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { loadInitialTiptapDoc } from '@/lib/tiptapTransform'
import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'

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
const TestSessionPage = React.lazy(() => import('@/pages/tests/session'))
const TestResultPage = React.lazy(() => import('@/pages/tests/result'))
const AdminApplicationsPage = React.lazy(() => import('@/pages/admin/applications'))
const AdminGalleryModerationPage = React.lazy(() => import('@/pages/admin/gallery-moderation'))

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

// Простая реализация Slash-меню по символу "/"
const SlashCommands = Extension.create({
  name: 'slash',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: true,
        items: ({ query }: { query: string }) => {
          const items = [
            { title: 'Заголовок', run: (e: any) => e.chain().focus().setHeading({ level: 2 }).run() },
            { title: 'Параграф', run: (e: any) => e.chain().focus().setParagraph().run() },
            { title: 'Список', run: (e: any) => e.chain().focus().toggleBulletList().run() },
            { title: 'Нумер. список', run: (e: any) => e.chain().focus().toggleOrderedList().run() },
            { title: 'Код', run: (e: any) => e.chain().focus().toggleCodeBlock().run() },
            { title: 'Изображение', run: () => document.getElementById('doc-image-input')?.click() },
          ]
          return items.filter(i => i.title.toLowerCase().includes((query || '').toLowerCase()))
        },
        render: () => {
          let component: HTMLDivElement | null = null
          let list: HTMLDivElement | null = null

          return {
            onStart: (props: any) => {
              component = document.createElement('div')
              component.className = 'z-50 rounded-md border border-zinc-700 bg-zinc-800 p-1 shadow-lg'
              list = document.createElement('div')
              list.className = 'flex flex-col'
              component.appendChild(list)
              document.body.appendChild(component)

              const { clientRect } = props
              if (clientRect) {
                const rect = clientRect()
                if (rect) {
                  component.style.position = 'fixed'
                  component.style.left = rect.left + 'px'
                  component.style.top = rect.bottom + 6 + 'px'
                }
              }

              props.items.forEach((item: any) => {
                const btn = document.createElement('button')
                btn.type = 'button'
                btn.className = 'px-3 py-1 text-left text-sm hover:bg-zinc-700 rounded'
                btn.textContent = item.title
                btn.addEventListener('click', () => {
                  (props.editor as any).chain().focus()
                  item.run(props.editor)
                  props.command({ id: item.title })
                })
                list!.appendChild(btn)
              })
            },
            onUpdate: (props: any) => {
              if (!component || !list) return
              list.innerHTML = ''
              props.items.forEach((item: any) => {
                const btn = document.createElement('button')
                btn.type = 'button'
                btn.className = 'px-3 py-1 text-left text-sm hover:bg-zinc-700 rounded'
                btn.textContent = item.title
                btn.addEventListener('click', () => {
                  (props.editor as any).chain().focus()
                  item.run(props.editor)
                  props.command({ id: item.title })
                })
                list!.appendChild(btn)
              })
              const { clientRect } = props
              if (clientRect) {
                const rect = clientRect()
                if (rect && component) {
                  component.style.left = rect.left + 'px'
                  component.style.top = rect.bottom + 6 + 'px'
                }
              }
            },
            onKeyDown: (props: any) => {
              if (props.event.key === 'Escape') {
                props.command('close')
                return true
              }
              return false
            },
            onExit: () => {
              if (component) {
                component.remove()
                component = null
              }
              list = null
            },
          }
        },
      },
    }
  },
  addProseMirrorPlugins() {
    return [Suggestion({ editor: this.editor, ...((this.options as any).suggestion) })]
  },
})

// Вспомогательное Bubble-меню без зависимости от @tiptap/react/BubbleMenu
const InlineBubble: React.FC<{ editor: any; setLink: () => void; containerRef: React.RefObject<HTMLDivElement> }> = ({ editor, setLink, containerRef }) => {
  const [visible, setVisible] = React.useState(false)
  const [pos, setPos] = React.useState<{ left: number; top: number }>({ left: 0, top: 0 })

  const updatePosition = React.useCallback(() => {
    if (!editor || !containerRef.current) return
    const { from, to } = editor.state.selection || { from: 0, to: 0 }
    if (from === to) return
    const mid = Math.floor((from + to) / 2)
    let coords: any
    try { coords = editor.view.coordsAtPos(mid) } catch { /* ignore */ }
    if (!coords) {
      try { coords = editor.view.coordsAtPos(to) } catch { /* ignore */ }
    }
    const containerRect = containerRef.current.getBoundingClientRect()
    if (!coords || !containerRect) return
    const rawLeft = (coords.left ?? 0) - containerRect.left
    const rawTop = (coords.top ?? 0) - containerRect.top
    const width = containerRect.width
    const left = Math.min(Math.max(rawLeft, 24), width - 24)
    const top = Math.max(rawTop - 24, 8)
    setPos({ left, top })
  }, [editor, containerRef])

  React.useEffect(() => {
    const handleChange = () => {
      const hasSelection = editor?.state?.selection?.from !== editor?.state?.selection?.to
      const focused = editor?.isFocused
      const editable = editor?.isEditable
      const show = Boolean(focused && editable) // показываем и при каретке без выделения
      setVisible(show)
      if (show) updatePosition()
    }
    const hide = () => setVisible(false)
    editor?.on('selectionUpdate', handleChange)
    editor?.on('transaction', handleChange)
    editor?.on('focus', handleChange)
    editor?.on('blur', hide)
    window.addEventListener('mouseup', handleChange)
    window.addEventListener('keyup', handleChange)
    document.addEventListener('selectionchange', handleChange)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    // Первичный пересчет после маунта
    setTimeout(handleChange, 0)
    return () => {
      editor?.off('selectionUpdate', handleChange)
      editor?.off('transaction', handleChange)
      editor?.off('focus', handleChange)
      editor?.off('blur', hide)
      window.removeEventListener('mouseup', handleChange)
      window.removeEventListener('keyup', handleChange)
      document.removeEventListener('selectionchange', handleChange)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [editor, updatePosition])

  if (!visible) return null
  return (
    <div
      style={{ position: 'absolute', left: pos.left, top: pos.top, transform: 'translate(-50%, -100%)' }}
      className="z-[999] rounded bg-zinc-800 p-1 shadow-lg border border-zinc-600 flex gap-1 pointer-events-auto"
    >
      <button onClick={()=>editor.chain().focus().toggleBold().run()} className={`px-2 py-1 text-xs rounded ${editor.isActive('bold')?'bg-zinc-700':'hover:bg-zinc-700'}`}>B</button>
      <button onClick={()=>editor.chain().focus().toggleItalic().run()} className={`px-2 py-1 text-xs rounded ${editor.isActive('italic')?'bg-zinc-700':'hover:bg-zinc-700'}`}>I</button>
      <button onClick={()=>editor.chain().focus().toggleUnderline().run()} className={`px-2 py-1 text-xs rounded ${editor.isActive('underline')?'bg-zinc-700':'hover:bg-zinc-700'}`}>U</button>
      <button onClick={setLink} className={`px-2 py-1 text-xs rounded ${editor.isActive('link')?'bg-zinc-700':'hover:bg-zinc-700'}`}>Link</button>
      <button onClick={()=>editor.chain().focus().toggleBulletList().run()} className={`px-2 py-1 text-xs rounded ${editor.isActive('bulletList')?'bg-zinc-700':'hover:bg-zinc-700'}`}>•</button>
      <button onClick={()=>editor.chain().focus().toggleOrderedList().run()} className={`px-2 py-1 text-xs rounded ${editor.isActive('orderedList')?'bg-zinc-700':'hover:bg-zinc-700'}`}>1.</button>
      <button onClick={()=>editor.chain().focus().toggleCodeBlock().run()} className={`px-2 py-1 text-xs rounded ${editor.isActive('codeBlock')?'bg-zinc-700':'hover:bg-zinc-700'}`}>{'</>'}</button>
    </div>
  )
}

const EditorToolbar: React.FC<{ editor: any; setLink: () => void; openImagePicker: () => void }> = ({ editor, setLink, openImagePicker }) => {
  if (!editor) return null
  return (
    <div className="sticky top-2 z-[200] w-full flex justify-center mb-2 pointer-events-none">
      <div className="pointer-events-auto flex gap-1 rounded bg-zinc-800 p-1 shadow-lg border border-zinc-600">
        <button onClick={()=>editor.chain().focus().toggleBold().run()} className={`px-2 py-1 text-xs rounded ${editor.isActive('bold')?'bg-zinc-700':'hover:bg-zinc-700'}`}>B</button>
        <button onClick={()=>editor.chain().focus().toggleItalic().run()} className={`px-2 py-1 text-xs rounded ${editor.isActive('italic')?'bg-zinc-700':'hover:bg-zinc-700'}`}>I</button>
        <button onClick={()=>editor.chain().focus().toggleUnderline().run()} className={`px-2 py-1 text-xs rounded ${editor.isActive('underline')?'bg-zinc-700':'hover:bg-zinc-700'}`}>U</button>
        <button onClick={setLink} className={`px-2 py-1 text-xs rounded ${editor.isActive('link')?'bg-zinc-700':'hover:bg-zinc-700'}`}>Link</button>
        <div className="mx-1 w-px bg-zinc-700" />
        <button onClick={()=>editor.chain().focus().toggleBulletList().run()} className={`px-2 py-1 text-xs rounded ${editor.isActive('bulletList')?'bg-zinc-700':'hover:bg-zinc-700'}`}>•</button>
        <button onClick={()=>editor.chain().focus().toggleOrderedList().run()} className={`px-2 py-1 text-xs rounded ${editor.isActive('orderedList')?'bg-zinc-700':'hover:bg-zinc-700'}`}>1.</button>
        <button onClick={()=>editor.chain().focus().toggleCodeBlock().run()} className={`px-2 py-1 text-xs rounded ${editor.isActive('codeBlock')?'bg-zinc-700':'hover:bg-zinc-700'}`}>{'</>'}</button>
        <div className="mx-1 w-px bg-zinc-700" />
        <button onClick={()=>editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-2 py-1 text-xs rounded ${editor.isActive('heading', { level: 2 })?'bg-zinc-700':'hover:bg-zinc-700'}`}>H2</button>
        <button onClick={()=>editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`px-2 py-1 text-xs rounded ${editor.isActive('heading', { level: 3 })?'bg-zinc-700':'hover:bg-zinc-700'}`}>H3</button>
        <button onClick={()=>editor.chain().focus().setParagraph().run()} className={`px-2 py-1 text-xs rounded ${editor.isActive('paragraph')?'bg-zinc-700':'hover:bg-zinc-700'}`}>P</button>
        <div className="mx-1 w-px bg-zinc-700" />
        <button onClick={()=>editor.chain().focus().setTextAlign('left').run()} className={`px-2 py-1 text-xs rounded ${editor.isActive({ textAlign: 'left' })?'bg-zinc-700':'hover:bg-zinc-700'}`}>L</button>
        <button onClick={()=>editor.chain().focus().setTextAlign('center').run()} className={`px-2 py-1 text-xs rounded ${editor.isActive({ textAlign: 'center' })?'bg-zinc-700':'hover:bg-zinc-700'}`}>C</button>
        <button onClick={()=>editor.chain().focus().setTextAlign('right').run()} className={`px-2 py-1 text-xs rounded ${editor.isActive({ textAlign: 'right' })?'bg-zinc-700':'hover:bg-zinc-700'}`}>R</button>
        <div className="mx-1 w-px bg-zinc-700" />
        <button onClick={openImagePicker} className="px-2 py-1 text-xs rounded hover:bg-zinc-700">Img</button>
      </div>
    </div>
  )
}

// Компонент Tiptap редактора с BubbleMenu, центровкой и обработкой изображений
const TiptapDocEditor: React.FC<{
  initialDoc: any
  onDebouncedUpdate: (doc: any) => void
  requestImageUpload: (file: File) => Promise<{ src: string; alt?: string }>
  readOnly?: boolean
}> = ({ initialDoc, onDebouncedUpdate, requestImageUpload, readOnly = false }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const editor = useEditor({
    editable: !readOnly,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: { HTMLAttributes: { class: 'bg-zinc-900 p-3 rounded' } },
      }),
      Underline,
      TiptapLink.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Начните писать…' }),
      SlashCommands,
    ],
    content: initialDoc || { type: 'doc', content: [{ type: 'paragraph' }] },
    onUpdate: ({ editor }) => {
      if (readOnly) return
      const json = editor.getJSON()
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onDebouncedUpdate(json)
      }, 1200)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-[800px] mx-auto focus:outline-none leading-7',
      },
      handlePaste: (view, event) => {
        if (readOnly) return false
        const items = (event.clipboardData && event.clipboardData.items) || []
        for (const item of items) {
          if (item.kind === 'file') {
            const file = item.getAsFile()
            if (file && file.type.startsWith('image/')) {
              ;(async () => {
                const { src } = await requestImageUpload(file)
                editor?.chain().focus().setImage({ src, alt: '' }).run()
              })()
              return true
            }
          }
        }
        return false
      },
      handleDrop: (view, event) => {
        if (readOnly) return false
        const dt = event.dataTransfer
        if (dt && dt.files && dt.files.length > 0) {
          const file = Array.from(dt.files).find(f => f.type.startsWith('image/'))
          if (file) {
            ;(async () => {
              const { src } = await requestImageUpload(file)
              editor?.chain().focus().setImage({ src, alt: '' }).run()
            })()
            return true
          }
        }
        return false
      },
    },
  })

  const setLink = () => {
    if (!editor) return
    const prev = editor.getAttributes('link').href || ''
    const url = window.prompt('Вставьте ссылку', prev)
    if (url === null) return
    if (url === '') editor.chain().focus().unsetLink().run()
    else editor.chain().focus().setLink({ href: url }).run()
  }

  const onImagePicked: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !editor) return
    if (!file.type.startsWith('image/')) return
    const { src } = await requestImageUpload(file)
    editor.chain().focus().setImage({ src, alt: '' }).run()
  }

  if (!editor) return null

  return (
    <div className="space-y-2 px-6 relative" ref={containerRef}>
      {!readOnly && editor && (
        <EditorToolbar editor={editor} setLink={setLink} openImagePicker={() => fileInputRef.current?.click()} />
      )}
      <div className="max-w-[900px] mx-auto">
        <EditorContent editor={editor} />
        {/* Hidden picker to support Slash → Изображение */}
        {!readOnly && (
          <input id="doc-image-input" ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImagePicked} />
        )}
      </div>
    </div>
  )
}

// Публичная документация: дерево категорий и документов (read-only)
type PublicCategoryNode = {
  id: string
  title: string
  description: string | null
  children: PublicCategoryNode[]
  documents: { id: string; title: string; slug: string }[]
}

const DocsTreePage: React.FC = () => {
  const [tree, setTree] = React.useState<PublicCategoryNode[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const navigate = useNavigate()

  React.useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiClient.get<{ success: boolean; data: PublicCategoryNode[] }>(`/documents/tree`)
        setTree(res.data || [])
      } catch (e: any) {
        setError(e?.message || 'Не удалось загрузить дерево документации')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const findFirstDocSlug = (n: PublicCategoryNode): string | null => {
    if (n.documents && n.documents.length > 0) return n.documents[0].slug
    for (const child of n.children || []) {
      const s = findFirstDocSlug(child)
      if (s) return s
    }
    return null
  }

  const renderNode = (node: PublicCategoryNode) => {
    const firstSlug = findFirstDocSlug(node)
    return (
      <div key={node.id} className="border rounded-lg p-3 bg-zinc-900/40">
        <button
          type="button"
          className={`w-full text-left mb-2 ${firstSlug ? 'cursor-pointer hover:underline' : 'cursor-default'}`}
          onClick={() => { if (firstSlug) navigate(`/docs/${firstSlug}`) }}
          aria-label={firstSlug ? `Открыть первый документ категории ${node.title}` : undefined}
        >
          <div className="text-sm font-semibold">{node.title}</div>
          {node.description && (
            <div className="text-xs text-muted-foreground mt-0.5">{node.description}</div>
          )}
        </button>
        {node.documents.length > 0 && (
          <ul className="space-y-2 text-sm">
            {node.documents.map((d) => (
              <li key={d.id}>
                <Button asChild variant="outline" className="w-full justify-between px-3 py-2 bg-zinc-900 hover:bg-zinc-800/70 border-zinc-700">
                  <RouterLink to={`/docs/${encodeURIComponent(d.slug)}`} aria-label={`Открыть документ ${d.title}`}>
                    <span className="text-primary">{d.title}</span>
                    <span className="text-xs text-muted-foreground ml-2">/{d.slug}</span>
                  </RouterLink>
                </Button>
              </li>
            ))}
          </ul>
        )}
        {node.children.length > 0 && (
          <div className="mt-3 space-y-2 pl-3 border-l border-zinc-700">
            {node.children.map((c) => (
              <div key={c.id}>{renderNode(c)}</div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Документация</h1>
        <p className="text-muted-foreground">Опубликованные материалы и правила для игроков</p>
      </div>
      {loading ? (
        <div>Загрузка…</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : tree.length === 0 ? (
        <div className="text-muted-foreground">Пока нет опубликованных материалов</div>
      ) : (
        <div className="space-y-3">
          {tree.map((n) => renderNode(n))}
        </div>
      )}
    </div>
  )
}

// Публичная документация: страница просмотра документа по слагу
const PlayerDocumentPage: React.FC = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [doc, setDoc] = React.useState<any>(null)

  React.useEffect(() => {
    const load = async () => {
      if (!slug) return
      setLoading(true)
      setError(null)
      try {
        const res = await apiClient.get<{ success: boolean; data: any }>(`/documents/slug/${slug}`)
        setDoc(loadInitialTiptapDoc(res.data?.content))
      } catch (e: any) {
        setError(e?.message || 'Документ не найден или недоступен')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Документ</h1>
          {error && <p className="text-amber-400 text-sm mt-1">{error}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/docs')}>К списку</Button>
        </div>
      </div>

      {!error && (
        <Card>
          <CardHeader>
            <CardTitle>Содержимое</CardTitle>
          </CardHeader>
          <CardContent>
            <TiptapDocViewer doc={doc} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

const TiptapDocViewer: React.FC<{ doc: any }> = ({ doc }) => {
  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TiptapLink.configure({ openOnClick: true }),
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: doc || { type: 'doc', content: [{ type: 'paragraph' }] },
    editorProps: {
      attributes: { class: 'prose prose-invert max-w-[800px] mx-auto leading-7' },
    },
  })
  if (!editor) return null
  return (
    <div className="px-6">
      <div className="max-w-[900px] mx-auto">
        <EditorContent editor={editor} />
      </div>
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
  const [allDeps, setAllDeps] = React.useState<Department[]>([])
  const [catDeps, setCatDeps] = React.useState<string[]>([])
  const [savingCatDeps, setSavingCatDeps] = React.useState(false)

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

  // Загрузка департаментов и привязок категории при открытии модалки редактирования
  React.useEffect(() => {
    const loadDeps = async () => {
      try {
        const res = await apiClient.get<{ success: boolean; data: Department[] }>(`/departments`)
        setAllDeps(Array.isArray(res) ? res as any : (res?.data || []))
      } catch {}
      if (editId) {
        try {
          const resp = await apiClient.get<{ success: boolean; data: { department_id: string }[] }>(`/admin/doc-categories/${editId}/departments`)
          const ids = (resp.data || []).map(r => r.department_id)
          setCatDeps(ids)
        } catch {}
      } else {
        setCatDeps([])
      }
    }
    if (isModalOpen) loadDeps()
  }, [isModalOpen, editId])

  const toggleCatDep = (id: string) => {
    setCatDeps(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id])
  }
  const saveCatDeps = async () => {
    if (!editId) return
    setSavingCatDeps(true)
    try {
      await apiClient.post(`/admin/doc-categories/${editId}/departments`, { departmentIds: catDeps })
    } finally {
      setSavingCatDeps(false)
    }
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
            {editId && (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Доступ департаментов (наследуется документами)</legend>
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-auto pr-1">
                  {allDeps.map((d:any)=> (
                    <label key={d.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={catDeps.includes(d.id)}
                        onChange={(e)=> toggleCatDep(d.id)}
                      />
                      <span>{d.full_name ?? d.name}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <Button size="sm" variant="secondary" onClick={saveCatDeps} disabled={savingCatDeps}>{savingCatDeps ? 'Сохраняю…' : 'Сохранить доступ'}</Button>
                </div>
              </fieldset>
            )}
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

  const [isNewOpen, setIsNewOpen] = React.useState(false)
  const [newTitle, setNewTitle] = React.useState('')
  const [newSlug, setNewSlug] = React.useState('')
  const [newCategoryId, setNewCategoryId] = React.useState<string | null>(null)
  const [newPublished, setNewPublished] = React.useState(false)
  const slugTouchedRef = React.useRef(false)

  const translit = React.useCallback((s: string) => {
    const map: Record<string,string> = {"а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"e","ж":"zh","з":"z","и":"i","й":"y","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"c","ч":"ch","ш":"sh","щ":"sch","ъ":"","ы":"y","ь":"","э":"e","ю":"yu","я":"ya","А":"a","Б":"b","В":"v","Г":"g","Д":"d","Е":"e","Ё":"e","Ж":"zh","З":"z","И":"i","Й":"y","К":"k","Л":"l","М":"m","Н":"n","О":"o","П":"p","Р":"r","С":"s","Т":"t","У":"u","Ф":"f","Х":"h","Ц":"c","Ч":"ch","Ш":"sh","Щ":"sch","Ъ":"","Ы":"y","Ь":"","Э":"e","Ю":"yu","Я":"ya"};
    const replaced = s.split('').map(ch=>map[ch]??ch).join('')
    const ascii = replaced.normalize('NFKD').replace(/[^\w\s-]/g, '')
    return ascii.trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')
  }, [])

  React.useEffect(() => {
    if (!slugTouchedRef.current) setNewSlug(translit(newTitle))
  }, [newTitle, translit])

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

  const openNewModal = () => {
    setNewTitle('')
    setNewPublished(false)
    setNewCategoryId(activeCategoryId ?? null)
    setNewSlug('')
    slugTouchedRef.current = false
    setIsNewOpen(true)
  }

  const createDocument = async () => {
    if (!newTitle || !newCategoryId) return
    const payload = {
      title: newTitle,
      slug: newSlug || translit(newTitle),
      category_id: newCategoryId,
      is_published: newPublished,
      is_internal: false,
      content: { type: 'tiptap', doc: { type: 'doc', content: [{ type: 'paragraph' }] } },
    }
    const res = await apiClient.post<{ success: boolean; data: DocumentItem }>(
      '/admin/documents',
      payload
    )
    const id = res.data.id
    setIsNewOpen(false)
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
                <Button disabled={!activeCategoryId} onClick={openNewModal}>Новый документ</Button>
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

      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый документ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Название документа" />
            </div>
            <div className="space-y-2">
              <Label>Слаг</Label>
              <Input value={newSlug} onChange={e=>{ setNewSlug(e.target.value); slugTouchedRef.current = true }} placeholder="slug" />
            </div>
            <div className="space-y-2">
              <Label>Категория</Label>
              <Select value={newCategoryId ?? ''} onValueChange={v=>setNewCategoryId(v)}>
                <SelectTrigger><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c=> (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Опубликован</Label>
              <Switch checked={newPublished} onCheckedChange={setNewPublished} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setIsNewOpen(false)}>Отмена</Button>
            <Button onClick={createDocument} disabled={!newTitle || !newCategoryId}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Редактор документа на Tiptap с автосохранением JSONB
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
  const [initialDoc, setInitialDoc] = React.useState<any>({ type: 'doc', content: [{ type: 'paragraph' }] })

  // Привязка департаментов
  const [depIds, setDepIds] = React.useState<string[]>([])
  const [savingDeps, setSavingDeps] = React.useState(false)

  // Индикатор автосохранения
  const [isSaving, setIsSaving] = React.useState(false)
  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestDocRef = React.useRef<any>(null)

  // Просмотр/Редактирование
  const [isPreview, setIsPreview] = React.useState(false)

  // Сворачивание доступа по умолчанию
  const [accessOpen, setAccessOpen] = React.useState(false)

  // Флаг готовности: исключаем автосохранение до загрузки данных
  const [isLoaded, setIsLoaded] = React.useState(false)

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
        setInitialDoc(loadInitialTiptapDoc(d.content))
        try {
          const rel = await apiClient.get<{ success: boolean; data: { department_id: string }[] }>(`/admin/documents/${id}/departments`)
          setDepIds((rel.data || []).map(r => r.department_id))
        } catch (e) {
          console.warn('Не удалось загрузить привязки департаментов', e)
        }
      }
      setIsLoaded(true)
    }
    load()
  }, [id])

  // Автогенерация slug
  React.useEffect(()=>{
    if (!slugTouched) {
      const map: Record<string,string> = {"а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"e","ж":"zh","з":"z","и":"i","й":"y","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"c","ч":"ch","ш":"sh","щ":"sch","ъ":"","ы":"y","ь":"","э":"e","ю":"yu","я":"ya","А":"a","Б":"b","В":"v","Г":"g","Д":"d","Е":"e","Ё":"e","Ж":"zh","З":"z","И":"i","Й":"y","К":"k","Л":"l","М":"m","Н":"n","О":"o","П":"p","Р":"r","С":"s","Т":"t","У":"u","Ф":"f","Х":"h","Ц":"c","Ч":"ch","Ш":"sh","Щ":"sch","Ъ":"","Ы":"y","Ь":"","Э":"e","Ю":"yu","Я":"ya"};
      const replaced = title.split('').map(ch=>map[ch]??ch).join('')
      const ascii = replaced.normalize('NFKD').replace(/[^\w\s-]/g, '')
      setSlug(ascii.trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, ''))
    }
  }, [title, slugTouched])

  const requestSignedUploadUrl = async (file: File): Promise<{ signedUrl: string; path: string }> => {
    const resp = await apiClient.post<{ success: boolean; data: { signedUrl: string; path: string } }>(
      '/admin/documents/upload-url',
      { fileName: file.name, fileType: file.type }
    )
    return resp.data
  }

  async function uploadFileToSignedUrl(signedUrl: string, file: File) {
    await apiClient.put(signedUrl, file, { headers: { 'Content-Type': file.type } })
  }

  const requestImageUpload = async (file: File): Promise<{ src: string; alt?: string }> => {
    const { signedUrl, path } = await requestSignedUploadUrl(file)
    await uploadFileToSignedUrl(signedUrl, file)
    const { data } = supabase.storage.from('doc_attachments').getPublicUrl(path)
    return { src: data.publicUrl, alt: '' }
  }

  const scheduleSave = (doc: any) => {
    if (!isLoaded) return
    latestDocRef.current = doc
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      if (!id) return
      setIsSaving(true)
      try {
        const payload = {
          title,
          slug,
          is_published: isPublished,
          is_internal: isInternal,
          content: { type: 'tiptap', doc: latestDocRef.current || initialDoc },
          ...(categoryId ? { category_id: categoryId } : {}),
        }
        await apiClient.put(`/admin/documents/${id}`, payload)
      } finally {
        setIsSaving(false)
      }
    }, 1200)
  }

  // Триггер автосохранения при изменении метаданных
  React.useEffect(() => {
    if (!id) return
    if (!isLoaded) return
    scheduleSave(latestDocRef.current || initialDoc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, slug, categoryId, isPublished, isInternal])

  // Загрузчик списка департаментов
  const loadDepartments = React.useCallback(async (): Promise<Department[]> => {
    const res = await apiClient.get<any>(`/departments`)
    return Array.isArray(res) ? res : (res?.data || [])
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Редактор документа</h1>
          <div className={`text-xs px-2 py-0.5 rounded ${isSaving ? 'bg-zinc-800 text-zinc-300' : 'bg-emerald-900/40 text-emerald-300'}`}>
            {isSaving ? 'Сохраняю…' : 'Сохранено'}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant={isPreview ? 'outline' : 'secondary'} size="sm" onClick={()=>setIsPreview(false)}>Редактор</Button>
          <Button variant={isPreview ? 'secondary' : 'outline'} size="sm" onClick={()=>setIsPreview(true)}>Просмотр</Button>
          <Button variant="outline" onClick={()=>navigate('/admin/documents')}>Назад</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <Label>Опубликован</Label>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Внутренний</Label>
            <Switch checked={isInternal} onCheckedChange={setIsInternal} />
          </div>

          {/* Блок доступа (свернут по умолчанию) */}
          <div className="mt-4 border rounded">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Доступ</span>
                {isInternal ? (
                  <span className="text-xs text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">Internal</span>
                ) : (
                  <span className="text-xs text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">{depIds.length > 0 ? 'Департаментский' : 'Публичный'}</span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={()=>setAccessOpen(v=>!v)}>{accessOpen ? 'Скрыть' : 'Показать'}</Button>
            </div>
            {accessOpen && (
              <div className={`px-3 pb-3 ${isInternal ? 'opacity-50 pointer-events-none' : ''}`}>
                {!isInternal && (
                  <div className="text-sm text-muted-foreground mb-2">
                    Если не выбрано ни одного департамента — документ публичный для всех, у кого есть доступ согласно политикам. Если выбраны департаменты — документ виден только участникам этих департаментов.
                  </div>
                )}
                <DepartmentPicker value={depIds} onChange={setDepIds} loadDepartments={loadDepartments} />
                <div className="flex items-center gap-4 mt-3">
                  <Button variant="secondary" size="sm" onClick={saveDepartments} disabled={savingDeps || isInternal}>
                    {savingDeps ? 'Сохраняю…' : 'Сохранить доступ'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="px-6">
                <input
                  className="text-2xl md:text-3xl font-semibold w-full bg-transparent border-0 focus:ring-0 outline-none mb-2"
                  placeholder="Название документа"
                  value={title}
                  onChange={e=>setTitle(e.target.value)}
                />
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <span>Категория:</span>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="h-7 w-[260px] text-left"><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isPreview ? (
                <TiptapDocViewer doc={latestDocRef.current || initialDoc} />
              ) : (
                <TiptapDocEditor
                  initialDoc={initialDoc}
                  onDebouncedUpdate={scheduleSave}
                  requestImageUpload={requestImageUpload}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Просмотр документа (read-only) на Tiptap
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
        const adminRes = await apiClient.get<{ success: boolean; data: DocumentItem }>(`/admin/documents/${id}`)
        const meta = adminRes.data
        setAdminDoc(meta)
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )

  const showDoc = playerDoc ?? adminDoc
  const isPlayerView = !!playerDoc && !unavailableToPlayer
  const tiptapDoc = loadInitialTiptapDoc(showDoc?.content)

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
              <TiptapDocViewer doc={tiptapDoc} />
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
                    <Route path="/tests/session/:sessionId" element={<TestSessionPage />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/tests" element={<Tests />} />
                    <Route path="/tests/result/:sessionId" element={<TestResultPage />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/docs" element={<DocsTreePage />} />
                    <Route path="/docs/:slug" element={<PlayerDocumentPage />} />
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
                      path="/admin/gallery-moderation"
                      element={
                        <PermissionGuard permission="gallery.moderate">
                          <AdminGalleryModerationPage />
                        </PermissionGuard>
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