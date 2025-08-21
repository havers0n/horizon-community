import { Router } from 'express'
import { z } from 'zod'
import { validateRequest } from '../../../utils/validation'
import type { AuthenticatedRequest } from '../../middleware/auth.middleware'
import { GalleryService } from '../../../core/services/GalleryService'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  department_id: z.string().uuid().optional(),
})

const uploadUrlBodySchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
})

const createImageBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  storage_path: z.string().min(1),
  department_id: z.string().uuid().optional().nullable(),
})

export function createGalleryRoutes(): Router {
  const router = Router()

  // GET /api/v1/gallery/images — получить список одобренных изображений
  router.get(
    '/images',
    validateRequest({ query: querySchema }),
    async (req: AuthenticatedRequest, res) => {
      try {
        const service = new GalleryService({ common: req.supabase!.common, public: req.supabase!.public })
        const { page, limit, department_id } = req.query as any
        const data = await service.getApprovedImages({ page, limit, departmentId: department_id })
        return res.json({ success: true, data })
      } catch (error: any) {
        console.error('[GalleryRoutes] GET /images error:', error)
        return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Internal server error' })
      }
    }
  )

  // POST /api/v1/gallery/upload-url — получить подписанный URL для загрузки
  router.post(
    '/upload-url',
    validateRequest({ body: uploadUrlBodySchema }),
    async (req: AuthenticatedRequest, res) => {
      try {
        const service = new GalleryService({ common: req.supabase!.common, public: req.supabase!.public })
        const userId = (req.user?.id || req.session?.user?.id) as string
        const { fileName, fileType } = req.body as any
        const { signedUrl, filePath } = await service.createSignedUploadUrl(userId, fileName, fileType)
        return res.json({ success: true, data: { signedUrl, filePath } })
      } catch (error: any) {
        console.error('[GalleryRoutes] POST /upload-url error:', error)
        return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Internal server error' })
      }
    }
  )

  // POST /api/v1/gallery — создать запись изображения
  router.post(
    '/',
    validateRequest({ body: createImageBodySchema }),
    async (req: AuthenticatedRequest, res) => {
      try {
        const service = new GalleryService({ common: req.supabase!.common, public: req.supabase!.public })
        const userId = (req.user?.id || req.session?.user?.id) as string
        const created = await service.createImageRecord(userId, req.body as any)
        return res.status(201).json({ success: true, data: created })
      } catch (error: any) {
        console.error('[GalleryRoutes] POST / error:', error)
        return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Internal server error' })
      }
    }
  )

  return router
}

export default createGalleryRoutes


