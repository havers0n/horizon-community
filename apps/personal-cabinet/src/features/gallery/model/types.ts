export interface GalleryItem {
  id: string
  imageUrl: string
  title: string
  description?: string
  department: string
  alt: string
  date?: string
  author?: string
}

export interface Department {
  id: string
  name: string
  color: string
}

export interface GalleryFilter {
  department: string
  dateRange?: {
    start: string
    end: string
  }
  author?: string
} 