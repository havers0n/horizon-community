import { apiClient } from './api-client';
import type {
  Document,
  DocumentCategory,
  DocumentTreeCategory,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  CreateCategoryRequest,
  UploadUrlRequest,
  UploadUrlResponse,
  ApiResponse
} from '../types/documents';

// Public document API
export const documentsApi = {
  // Get document tree (public)
  getDocumentTree: async (): Promise<ApiResponse<DocumentTreeCategory[]>> => {
    const response = await apiClient.get('/documents/tree');
    return response;
  },

  // Get document by slug (public)
  getDocumentBySlug: async (slug: string): Promise<ApiResponse<Document>> => {
    const response = await apiClient.get(`/documents/slug/${slug}`);
    return response;
  },
};

// Admin document API (requires documents.manage permission)
export const adminDocumentsApi = {
  // Document management
  getAllDocuments: async (): Promise<ApiResponse<Document[]>> => {
    const response = await apiClient.get('/admin/documents');
    return response;
  },

  getDocument: async (id: string): Promise<ApiResponse<Document>> => {
    const response = await apiClient.get(`/admin/documents/${id}`);
    return response;
  },

  createDocument: async (data: CreateDocumentRequest): Promise<ApiResponse<Document>> => {
    const response = await apiClient.post('/admin/documents', data);
    return response;
  },

  updateDocument: async (id: string, data: UpdateDocumentRequest): Promise<ApiResponse<Document>> => {
    const response = await apiClient.put(`/admin/documents/${id}`, data);
    return response;
  },

  deleteDocument: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/admin/documents/${id}`);
    return response;
  },

  // Category management
  getAllCategories: async (): Promise<ApiResponse<DocumentCategory[]>> => {
    const response = await apiClient.get('/admin/doc-categories');
    return response;
  },

  getCategory: async (id: string): Promise<ApiResponse<DocumentCategory>> => {
    const response = await apiClient.get(`/admin/doc-categories/${id}`);
    return response;
  },

  createCategory: async (data: CreateCategoryRequest): Promise<ApiResponse<DocumentCategory>> => {
    const response = await apiClient.post('/admin/doc-categories', data);
    return response;
  },

  updateCategory: async (id: string, data: Partial<CreateCategoryRequest>): Promise<ApiResponse<DocumentCategory>> => {
    const response = await apiClient.put(`/admin/doc-categories/${id}`, data);
    return response;
  },

  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/admin/doc-categories/${id}`);
    return response;
  },

  // File upload
  getUploadUrl: async (data: UploadUrlRequest): Promise<ApiResponse<UploadUrlResponse>> => {
    const response = await apiClient.post('/admin/documents/upload-url', data);
    return response;
  },

  // Document department associations
  getDocumentDepartments: async (documentId: string): Promise<ApiResponse<{ department_id: string }[]>> => {
    const response = await apiClient.get(`/admin/documents/${documentId}/departments`);
    return response;
  },

  updateDocumentDepartments: async (documentId: string, departmentIds: string[]): Promise<ApiResponse<{ department_id: string }[]>> => {
    const response = await apiClient.post(`/admin/documents/${documentId}/departments`, { departmentIds });
    return response;
  },
};