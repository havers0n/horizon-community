// Forum API service
import { apiClient, ApiResponse } from '@/shared/api'
import type { ForumPost, ForumComment } from '../model/types'

export const forumService = {
  getPosts: () => apiClient.get<ApiResponse<ForumPost[]>>('/forum/posts'),
  getPost: (id: string) => apiClient.get<ApiResponse<ForumPost>>(`/forum/posts/${id}`),
  createPost: (data: { title: string; content: string }) => 
    apiClient.post<ApiResponse<ForumPost>>('/forum/posts', data),
  getComments: (postId: string) => 
    apiClient.get<ApiResponse<ForumComment[]>>(`/forum/posts/${postId}/comments`),
  createComment: (postId: string, data: { content: string }) => 
    apiClient.post<ApiResponse<ForumComment>>(`/forum/posts/${postId}/comments`, data),
} 