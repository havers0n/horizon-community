// Forum model types
export interface ForumPost {
  id: string
  title: string
  content: string
  author_id: string
  created_at: string
  updated_at: string
}

export interface ForumComment {
  id: string
  post_id: string
  content: string
  author_id: string
  created_at: string
} 