// Document-related types based on backend API

export interface Document {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  content: any; // JSON content
  is_published: boolean;
  is_internal: boolean;
  version: number;
  author_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentCategory {
  id: string;
  title: string;
  description?: string;
  parent_category_id?: string;
  sort_order: number;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentTreeCategory {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  children?: DocumentTreeCategory[];
  documents: {
    id: string;
    title: string;
    slug: string;
    updated_at: string | null;
    version: number | null;
  }[];
}

export interface CreateDocumentRequest {
  title: string;
  slug?: string;
  category_id: string;
  content?: any;
  is_published?: boolean;
  is_internal?: boolean;
  version?: number;
}

export interface UpdateDocumentRequest {
  title?: string;
  slug?: string;
  category_id?: string;
  content?: any;
  is_published?: boolean;
  is_internal?: boolean;
  version?: number;
}

export interface CreateCategoryRequest {
  title: string;
  description?: string;
  parent_category_id?: string;
  sort_order?: number;
  is_internal?: boolean;
}

export interface UploadUrlRequest {
  fileName: string;
  fileType: string;
}

export interface UploadUrlResponse {
  signedUrl: string;
  path: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}