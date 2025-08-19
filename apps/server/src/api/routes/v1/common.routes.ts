import { Router } from 'express'

/**
 * Роутер общих справочников (common)
 */
export function createCommonRoutes(): Router {
  const router: Router = Router()

  // GET /api/v1/common/statuses — получить список всех статусов
  router.get('/statuses', async (req: any, res) => {
    try {
      const supa = req.supabase
      if (!supa?.common) {
        return res.status(500).json({ success: false, error: 'Server configuration error: missing common client' })
      }

      const { data, error } = await (supa.common as any)
        .from('statuses' as any)
        .select('*')

      if (error) {
        return res.status(500).json({ success: false, error: error.message })
      }

      return res.status(200).json({ success: true, data: data ?? [] })
    } catch (err: any) {
      console.error('[CommonRoutes] /statuses error:', err)
      return res.status(500).json({ success: false, error: 'Internal server error' })
    }
  })

  return router
}

export default createCommonRoutes


