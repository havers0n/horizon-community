import { Router } from 'express';
import { randomUUID } from 'crypto';
import supportRoutes from './support.routes';
import userMetadataRoutes from './user-metadata';
import testsRoutes from './tests.routes';
import applicationsRoutes from './applications.routes';
import { requirePermission } from '../../middleware/auth.middleware';
import { GalleryService } from '../../../core/services/GalleryService';
import { TestAdminService } from '../../../core/services/TestAdminService';

// Простейшая транслитерация кириллицы в латиницу и нормализация slug
function transliterateToSlug(input: string): string {
  const map: Record<string, string> = {
    а:'a', б:'b', в:'v', г:'g', д:'d', е:'e', ё:'e', ж:'zh', з:'z', и:'i', й:'y', к:'k', л:'l', м:'m', н:'n', о:'o', п:'p', р:'r', с:'s', т:'t', у:'u', ф:'f', х:'h', ц:'c', ч:'ch', ш:'sh', щ:'sch', ъ:'', ы:'y', ь:'', э:'e', ю:'yu', я:'ya',
    А:'a', Б:'b', В:'v', Г:'g', Д:'d', Е:'e', Ё:'e', Ж:'zh', З:'z', И:'i', Й:'y', К:'k', Л:'l', М:'m', Н:'n', О:'o', П:'p', Р:'r', С:'s', Т:'t', У:'u', Ф:'f', Х:'h', Ц:'c', Ч:'ch', Ш:'sh', Щ:'sch', Ъ:'', Ы:'y', Ь:'', Э:'e', Ю:'yu', Я:'ya'
  };
  const replaced = input.split('').map(ch => map[ch] ?? ch).join('');
  const ascii = replaced.normalize('NFKD').replace(/[^\w\s-]/g, '');
  const dashed = ascii.trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/-+/g, '-');
  return dashed.replace(/^-+|-+$/g, '');
}

async function ensureUniqueSlug(baseSlug: string, supa: any): Promise<string> {
  let candidate = baseSlug || 'doc';
  let suffix = 0;
  while (true) {
    const slugToCheck = suffix === 0 ? candidate : `${candidate}-${suffix}`;
    const { data, error } = await supa
      .from('documents' as any)
      .select('id')
      .eq('slug', slugToCheck)
      .limit(1);
    if (error) break; // не блокируем создание — отдадим БД ошибку, если что
    if (!data || data.length === 0) return slugToCheck;
    suffix += 1;
  }
  return candidate;
}

const router: Router = Router();

// Регистрация всех admin маршрутов
router.use('/support', supportRoutes);
router.use('/user-metadata', userMetadataRoutes);
router.use('/tests', testsRoutes);
router.use('/', applicationsRoutes);

// === Gallery Moderation ===
// GET /api/v1/admin/gallery/pending
router.get('/gallery/pending', requirePermission('gallery.moderate'), async (req: any, res) => {
  try {
    const service = new GalleryService({ common: req.supabase!.common, public: req.supabase!.public });
    const page = Number(req.query?.page ?? 1);
    const limit = Number(req.query?.limit ?? 20);
    const departmentId = req.query?.department_id as string | undefined;
    const data = await service.getPendingImages({ page, limit, departmentId });
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('[AdminGallery] pending error:', error);
    return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// POST /api/v1/admin/gallery/:id/approve
router.post('/gallery/:id/approve', requirePermission('gallery.moderate'), async (req: any, res) => {
  try {
    const service = new GalleryService({ common: req.supabase!.common, public: req.supabase!.public });
    const id = req.params.id as string;
    const updated = await service.approveImage(id);
    return res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[AdminGallery] approve error:', error);
    return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// DELETE /api/v1/admin/gallery/:id
router.delete('/gallery/:id', requirePermission('gallery.moderate'), async (req: any, res) => {
  try {
    const service = new GalleryService({ common: req.supabase!.common, public: req.supabase!.public });
    const id = req.params.id as string;
    await service.deleteImageAsAdmin(id);
    return res.status(204).send();
  } catch (error: any) {
    console.error('[AdminGallery] delete error:', error);
    return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// POST /api/v1/admin/questions/:questionId/options
router.post('/questions/:questionId/options', requirePermission('tests.manage'), async (req: any, res) => {
  try {
    const questionId = req.params.questionId as string;
    const { option_text, is_correct } = req.body || {};
    const service = new TestAdminService(req.supabase!.system);
    const option = await service.addOptionToQuestion(questionId, { option_text, is_correct });
    res.status(201).json({ success: true, data: option });
  } catch (error: any) {
    console.error('[AdminQuestionsRoutes] addOption error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// PUT /api/v1/admin/questions/:id
router.put('/questions/:id', requirePermission('tests.manage'), async (req: any, res) => {
  try {
    const id = req.params.id as string;
    const { question_text, question_type } = req.body || {};
    const service = new TestAdminService(req.supabase!.system);
    const updated = await service.updateQuestion(id, { question_text, question_type });
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[AdminQuestionsRoutes] updateQuestion error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// DELETE /api/v1/admin/questions/:id
router.delete('/questions/:id', requirePermission('tests.manage'), async (req: any, res) => {
  try {
    const id = req.params.id as string;
    const service = new TestAdminService(req.supabase!.system);
    await service.deleteQuestion(id);
    res.status(204).send();
  } catch (error: any) {
    console.error('[AdminQuestionsRoutes] deleteQuestion error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// PUT /api/v1/admin/options/:id
router.put('/options/:id', requirePermission('tests.manage'), async (req: any, res) => {
  try {
    const id = req.params.id as string;
    const { option_text, is_correct } = req.body || {};
    const service = new TestAdminService(req.supabase!.system);
    const updated = await service.updateOption(id, { option_text, is_correct });
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[AdminOptionsRoutes] updateOption error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// DELETE /api/v1/admin/options/:id
router.delete('/options/:id', requirePermission('tests.manage'), async (req: any, res) => {
  try {
    const id = req.params.id as string;
    const service = new TestAdminService(req.supabase!.system);
    await service.deleteOption(id);
    res.status(204).send();
  } catch (error: any) {
    console.error('[AdminOptionsRoutes] deleteOption error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

export default router; 

// ===== Документация: Админские CRUD по документам и категориям =====
// Все маршруты под /api/v1/admin уже находятся за authenticateToken (см. v1 router)
// Здесь дополнительно вешаем проверку разрешений documents.manage

// --- Категории документов ---
// GET /api/v1/admin/doc-categories
router.get('/doc-categories', requirePermission('documents.manage'), async (req: any, res) => {
  try {
    const supa = req.supabase?.public;
    if (!supa) return res.status(500).json({ success: false, error: 'Server configuration error' });

    const { data, error } = await supa
      .from('doc_categories' as any)
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data: data ?? [] });
  } catch (err: any) {
    console.error('[AdminDocs] list categories error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/v1/admin/doc-categories/:id
router.get('/doc-categories/:id', requirePermission('documents.manage'), async (req: any, res) => {
  try {
    const supa = req.supabase?.public;
    const id = req.params?.id as string;
    const { data, error } = await supa
      .from('doc_categories' as any)
      .select('*')
      .eq('id', id)
      .single();
    if (error) return res.status(404).json({ success: false, error: 'Category not found' });
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[AdminDocs] get category error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/v1/admin/doc-categories
router.post('/doc-categories', requirePermission('documents.manage'), async (req: any, res) => {
  try {
    const supa = req.supabase?.public;
    const { title, description, parent_category_id, sort_order, is_internal } = req.body || {};
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ success: false, error: 'title is required' });
    }
    const { data, error } = await supa
      .from('doc_categories' as any)
      .insert({
        title,
        description: description ?? null,
        parent_category_id: parent_category_id ?? null,
        sort_order: typeof sort_order === 'number' ? sort_order : 0,
        is_internal: typeof is_internal === 'boolean' ? is_internal : false,
      })
      .select('*')
      .single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, data });
  } catch (err: any) {
    console.error('[AdminDocs] create category error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /api/v1/admin/doc-categories/:id
router.put('/doc-categories/:id', requirePermission('documents.manage'), async (req: any, res) => {
  try {
    const supa = req.supabase?.public;
    const id = req.params?.id as string;
    const { title, description, parent_category_id, sort_order, is_internal } = req.body || {};
    const payload: any = {};
    if (typeof title === 'string') payload.title = title;
    if (typeof description !== 'undefined') payload.description = description ?? null;
    if (typeof parent_category_id !== 'undefined') payload.parent_category_id = parent_category_id ?? null;
    if (typeof sort_order === 'number') payload.sort_order = sort_order;
    if (typeof is_internal === 'boolean') payload.is_internal = is_internal;

    const { data, error } = await supa
      .from('doc_categories' as any)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[AdminDocs] update category error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /api/v1/admin/doc-categories/:id
router.delete('/doc-categories/:id', requirePermission('documents.manage'), async (req: any, res) => {
  try {
    const supa = req.supabase?.public;
    const id = req.params?.id as string;
    const { error } = await supa
      .from('doc_categories' as any)
      .delete()
      .eq('id', id);
    if (error) {
      // В случае нарушения зависимостей (FK) возвращаем 409
      const message = (error as any).message || 'Delete failed';
      const status = /violates|constraint/i.test(message) ? 409 : 500;
      return res.status(status).json({ success: false, error: message });
    }
    return res.status(204).send();
  } catch (err: any) {
    console.error('[AdminDocs] delete category error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// === Привязка департаментов к КАТЕГОРИЯМ документов ===
// GET /api/v1/admin/doc-categories/:id/departments
router.get('/doc-categories/:id/departments', requirePermission('documents.manage'), async (req: any, res) => {
  try {
    const supa = req.supabase?.public;
    const id = req.params.id as string;
    const { data, error } = await supa
      .from('doc_category_departments' as any)
      .select('department_id')
      .eq('category_id', id);
    if (error) return res.status(500).json({ success:false, error: error.message });
    return res.json({ success:true, data: data ?? [] });
  } catch (e:any) {
    console.error('[AdminDocCats] list deps', e);
    return res.status(500).json({ success:false, error:'Internal server error' });
  }
});

// POST /api/v1/admin/doc-categories/:id/departments
// Body: { departmentIds: string[] }
router.post('/doc-categories/:id/departments', requirePermission('documents.manage'), async (req: any, res) => {
  try {
    const supa = req.supabase?.public;
    const id = req.params.id as string;
    const raw = (req.body?.departmentIds ?? []) as unknown;
    if (!Array.isArray(raw)) return res.status(400).json({ success:false, error:'departmentIds must be an array' });

    const uniqueIds = Array.from(new Set(raw.filter((v) => typeof v === 'string' && v.trim().length > 0)));

    // проверим, что депы существуют
    const { data: deps, error: depsErr } = await supa.schema('common')
      .from('departments' as any)
      .select('id')
      .in('id', uniqueIds);
    if (depsErr) return res.status(500).json({ success:false, error: depsErr.message });

    // очистим старые привязки
    const { error: delErr } = await supa
      .from('doc_category_departments' as any)
      .delete()
      .eq('category_id', id);
    if (delErr) return res.status(500).json({ success:false, error: delErr.message });

    // если пусто — вернёмся
    if (!deps?.length) return res.json({ success:true, data: [] });

    // вставим новые
    const rows = deps.map((d: any) => ({ category_id: id, department_id: d.id }));
    const { error: insErr } = await supa.from('doc_category_departments' as any).insert(rows as any);
    if (insErr) return res.status(500).json({ success:false, error: insErr.message });

    // вернём актуальный список
    const { data, error } = await supa
      .from('doc_category_departments' as any)
      .select('department_id')
      .eq('category_id', id);
    if (error) return res.status(500).json({ success:false, error: error.message });

    return res.json({ success:true, data: data ?? [] });
  } catch (e:any) {
    console.error('[AdminDocCats] sync deps', e);
    return res.status(500).json({ success:false, error:'Internal server error' });
  }
});

// --- Документы ---
// GET /api/v1/admin/documents
router.get('/documents', requirePermission('documents.manage'), async (req: any, res) => {
  try {
    const supa = req.supabase?.public;
    if (!supa) return res.status(500).json({ success: false, error: 'Server configuration error' });
    const { data, error } = await supa
      .from('documents' as any)
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data: data ?? [] });
  } catch (err: any) {
    console.error('[AdminDocs] list documents error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// === Загрузка вложений для документации ===
// POST /api/v1/admin/documents/upload-url
// Тело: { fileName: string, fileType: string }
// Возвращает: { success: true, data: { signedUrl, path } }
function sanitizeFileName(input: string): string {
  try {
    const base = (input || '')
      .replace(/\\/g, '/')
      .split('/')
      .pop() || 'file';
    let safe = base.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (safe.startsWith('.')) safe = `file${safe}`;
    if (safe.length > 200) safe = safe.slice(-200);
    return safe.toLowerCase();
  } catch {
    return 'file';
  }
}

router.post('/documents/upload-url', requirePermission('documents.manage'), async (req: any, res) => {
  try {
    const supa = req.supabase?.public;
    if (!supa) {
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    const { fileName, fileType } = req.body || {};
    if (!fileName || typeof fileName !== 'string') {
      return res.status(400).json({ success: false, error: 'fileName is required' });
    }
    if (!fileType || typeof fileType !== 'string' || !/^image\//.test(fileType)) {
      return res.status(400).json({ success: false, error: 'Only image/* fileType is allowed' });
    }

    const safeName = sanitizeFileName(fileName);
    const uuid = typeof randomUUID === 'function' ? randomUUID() : Math.random().toString(36).slice(2);
    const path = `public/${uuid}-${safeName}`;

    const { data, error } = await (supa.storage as any)
      .from('doc_attachments')
      .createSignedUploadUrl(path);

    if (error) {
      return res.status(500).json({ success: false, error: error.message || 'Failed to create signed upload url' });
    }
    if (!data || !data.signedUrl) {
      return res.status(500).json({ success: false, error: 'Invalid response from storage service' });
    }

    return res.status(200).json({ success: true, data: { signedUrl: data.signedUrl, path } });
  } catch (err: any) {
    console.error('[AdminDocs] upload-url error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/v1/admin/documents/:id
router.get('/documents/:id', requirePermission('documents.manage'), async (req: any, res) => {
  try {
    const supa = req.supabase?.public;
    const id = req.params?.id as string;
    const { data, error } = await supa
      .from('documents' as any)
      .select('*')
      .eq('id', id)
      .single();
    if (error) return res.status(404).json({ success: false, error: 'Document not found' });
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[AdminDocs] get document error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/v1/admin/documents
router.post('/documents', requirePermission('documents.manage'), async (req: any, res) => {
  try {
    const supa = req.supabase?.public;
    const { title, slug, category_id, content, is_published, is_internal, version } = req.body || {};
    if (!title || typeof title !== 'string') return res.status(400).json({ success: false, error: 'title is required' });
    if (!category_id || typeof category_id !== 'string') return res.status(400).json({ success: false, error: 'category_id is required' });

    // Генерация slug, если не передан или пустой
    let finalSlug: string = (typeof slug === 'string' ? slug : '').trim();
    if (!finalSlug) {
      finalSlug = transliterateToSlug(title);
      finalSlug = await ensureUniqueSlug(finalSlug, supa);
    }

    const payload: any = {
      title,
      slug: finalSlug,
      category_id,
      content: typeof content === 'object' ? content : (content ? JSON.parse(content) : {}),
      is_published: typeof is_published === 'boolean' ? is_published : false,
      is_internal: typeof is_internal === 'boolean' ? is_internal : false,
      version: typeof version === 'number' ? version : 1,
    };

    const { data, error } = await supa
      .from('documents' as any)
      .insert(payload)
      .select('*')
      .single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, data });
  } catch (err: any) {
    console.error('[AdminDocs] create document error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /api/v1/admin/documents/:id
router.put('/documents/:id', requirePermission('documents.manage'), async (req: any, res) => {
  try {
    const supa = req.supabase?.public;
    const id = req.params?.id as string;
    const { title, slug, category_id, content, is_published, is_internal, version } = req.body || {};
    const payload: any = {};
    if (typeof title === 'string') payload.title = title;
    if (typeof slug === 'string') payload.slug = slug.trim();
    if (typeof category_id === 'string') payload.category_id = category_id;
    if (typeof content !== 'undefined') payload.content = typeof content === 'object' ? content : (content ? JSON.parse(content) : {});
    if (typeof is_published === 'boolean') payload.is_published = is_published;
    if (typeof is_internal === 'boolean') payload.is_internal = is_internal;
    if (typeof version === 'number') payload.version = version;

    // Если явно не передан slug или он пустой, сгенерируем заново из title
    if ((!('slug' in req.body)) || (typeof slug === 'string' && slug.trim().length === 0)) {
      const sourceTitle = typeof title === 'string' ? title : (payload.title as string | undefined);
      if (sourceTitle) {
        let generated = transliterateToSlug(sourceTitle);
        generated = await ensureUniqueSlug(generated, supa);
        payload.slug = generated;
      }
    }

    const { data, error } = await supa
      .from('documents' as any)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[AdminDocs] update document error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /api/v1/admin/documents/:id
router.delete('/documents/:id', requirePermission('documents.manage'), async (req: any, res) => {
  try {
    const supa = req.supabase?.public;
    const id = req.params?.id as string;
    const { error } = await supa
      .from('documents' as any)
      .delete()
      .eq('id', id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(204).send();
  } catch (err: any) {
    console.error('[AdminDocs] delete document error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// --- Привязка документов к департаментам ---
// GET /api/v1/admin/documents/:id/departments
router.get('/documents/:id/departments', requirePermission('documents.manage'), async (req: any, res) => {
  try {
    const supa = req.supabase?.public;
    if (!supa) return res.status(500).json({ success: false, error: 'Server configuration error' });
    const id = req.params?.id as string;

    const { data, error } = await supa
      .from('document_departments' as any)
      .select('department_id')
      .eq('document_id', id);
    if (error) return res.status(500).json({ success: false, error: error.message });

    return res.json({ success: true, data: data ?? [] });
  } catch (err: any) {
    console.error('[AdminDocs] list document departments error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/v1/admin/documents/:id/departments
// Body: { departmentIds: string[] }
router.post('/documents/:id/departments', requirePermission('documents.manage'), async (req: any, res) => {
  try {
    const supa = req.supabase?.public;
    if (!supa) return res.status(500).json({ success: false, error: 'Server configuration error' });
    const id = req.params?.id as string;
    const { departmentIds } = (req.body || {}) as { departmentIds?: string[] };

    if (!Array.isArray(departmentIds)) {
      return res.status(400).json({ success: false, error: 'departmentIds must be an array' });
    }

    // Очистить все старые связи
    const { error: delErr } = await supa
      .from('document_departments' as any)
      .delete()
      .eq('document_id', id);
    if (delErr) return res.status(500).json({ success: false, error: delErr.message });

    // Если массив пуст — возвращаем успех
    if (departmentIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Проверка существования департаментов в common.departments
    const uniqueIds = Array.from(new Set(departmentIds.filter((v) => typeof v === 'string' && v.trim().length > 0)));
    if (uniqueIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const { data: existingDeps, error: depsErr } = await supa
      .schema('common')
      .from('departments' as any)
      .select('id')
      .in('id', uniqueIds);
    if (depsErr) return res.status(500).json({ success: false, error: depsErr.message });

    const validIds: string[] = (existingDeps || []).map((d: any) => d.id).filter(Boolean);
    if (validIds.length === 0) {
      // Нет валидных департаментов — связи очищены, возвращаем успех
      return res.json({ success: true, data: [] });
    }

    // Вставка новых связей
    const { error: insErr } = await supa
      .from('document_departments' as any)
      .insert(validIds.map((depId) => ({ document_id: id, department_id: depId })) as any);
    if (insErr) return res.status(500).json({ success: false, error: insErr.message });

    // Возврат актуального списка
    const { data, error } = await supa
      .from('document_departments' as any)
      .select('department_id')
      .eq('document_id', id);
    if (error) return res.status(500).json({ success: false, error: error.message });

    return res.json({ success: true, data: data ?? [] });
  } catch (err: any) {
    console.error('[AdminDocs] sync document departments error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});