// Forum model store
import { create } from 'zustand'
import type { ForumPost, ForumComment } from './types'

interface ForumStore {
  posts: ForumPost[]
  comments: ForumComment[]
  setPosts: (posts: ForumPost[]) => void
  setComments: (comments: ForumComment[]) => void
}

export const useForumStore = create<ForumStore>((set) => ({
  posts: [],
  comments: [],
  setPosts: (posts) => set({ posts }),
  setComments: (comments) => set({ comments }),
})) 