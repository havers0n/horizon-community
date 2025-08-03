export interface ForumCategory {
  id: number
  name: string
  description: string
  departmentId: number | null
  icon: string
  color: string
  orderIndex: number
  isActive: boolean
  topicsCount: number
  postsCount: number
  lastActivity: string | null
  departmentName: string | null
}

export interface ForumTopic {
  id: number
  title: string
  content: string
  status: string
  isPinned: boolean
  isLocked: boolean
  viewsCount: number
  repliesCount: number
  lastPostAt: string | null
  tags: string[]
  createdAt: string
  authorId: number
  authorUsername: string
  lastPostAuthorId: number | null
  lastPostAuthorUsername: string | null
  categoryId: number
  categoryName: string
}

export interface ForumPost {
  id: number
  content: string
  isEdited: boolean
  editedAt: string | null
  reactionsCount: number
  createdAt: string
  authorId: number
  authorUsername: string
  parentId: number | null
}

export interface ForumStats {
  totalTopics: number
  totalPosts: number
  totalMembers: number
  onlineNow: number
} 