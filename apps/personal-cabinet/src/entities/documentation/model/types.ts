// Типы документации
export type DocCategory = {
  id: string
  title: string
  description: string | null
  parent_category_id: string | null
  sort_order: number
  is_internal: boolean
}

export type DocumentItem = {
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

export type EditorBlock =
  | { type: 'heading' | 'paragraph'; text: string; align?: 'left' | 'center' | 'right' }
  | { type: 'code'; text: string }
  | { type: 'image'; src: string; alt?: string }

export type Department = { 
  id: string
  name: string
  full_name?: string 
}