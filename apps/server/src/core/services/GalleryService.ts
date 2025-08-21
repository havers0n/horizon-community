// apps/server/src/core/services/GalleryService.ts

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@roleplay-identity/db-types';
import { AppError } from '../../utils/AppError';

type CommonClient = SupabaseClient<Database, 'common'>;
type PublicClient = SupabaseClient<Database>;

export interface GetApprovedImagesOptions {
  page: number;
  limit: number;
  departmentId?: string;
}

export class GalleryService {
  private readonly commonDb: CommonClient;
  private readonly publicDb: PublicClient;

  constructor(clients: { common: CommonClient; public: PublicClient }) {
    this.commonDb = clients.common;
    this.publicDb = clients.public;
  }

  /**
   * Получить список одобренных изображений с пагинацией и опциональным фильтром по департаменту
   */
  async getApprovedImages(options: GetApprovedImagesOptions): Promise<any[]> {
    console.log('[GalleryService] Starting getApprovedImages with MANUAL JOIN logic...');
    try {
      const page = Math.max(1, Number.isFinite(Number(options.page)) ? Number(options.page) : 1);
      const limit = Math.min(100, Math.max(1, Number.isFinite(Number(options.limit)) ? Number(options.limit) : 20));

      // ШАГ 1: Получаем основной список изображений (БЕЗ JOIN)
      let imagesQuery: any = this.commonDb
        .from('gallery_images' as any)
        .select('id, storage_path, title, description, created_at, department_id, uploader_user_id')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (options.departmentId) {
        imagesQuery = imagesQuery.eq('department_id', options.departmentId);
      }

      const { data: images, error: imagesError } = await imagesQuery;
      if (imagesError) throw new Error(`DB error fetching images: ${imagesError.message}`);
      if (!images || images.length === 0) return [];
      console.log(`[GalleryService] Step 1 OK: Fetched ${images.length} images.`);

      // ШАГ 2: Собираем ID авторов и изображений для следующих запросов
      const uploaderIds: string[] = Array.from(new Set(images.map((img: any) => img.uploader_user_id).filter(Boolean)));
      const imageIds: string[] = images.map((img: any) => img.id).filter(Boolean);

      // ШАГ 3: Получаем данные об авторах (один запрос для всех)
      let profilesMap = new Map<string, any>();
      if (uploaderIds.length > 0) {
        const { data: profiles, error: profilesError } = await (this.publicDb as any)
          .from('profiles')
          .select('id, username')
          .in('id', uploaderIds);
        if (profilesError) throw new Error(`DB error fetching profiles: ${profilesError.message}`);
        profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      }
      console.log(`[GalleryService] Step 2 OK: Fetched ${profilesMap.size} profiles.`);

      // ШАГ 4: Получаем количество лайков (один запрос для всех)
      let likesMap = new Map<string, number>();
      if (imageIds.length > 0) {
        const { data: likes, error: likesError } = await (this.commonDb as any)
          .from('gallery_image_likes_count')
          .select('image_id, like_count')
          .in('image_id', imageIds);
        if (likesError) console.warn('[GalleryService] Could not fetch likes, defaulting to 0.');
        likesMap = new Map((likes || []).map((l: any) => [l.image_id, l.like_count]));
      }
      console.log(`[GalleryService] Step 3 OK: Fetched likes for ${likesMap.size} images.`);

      // ШАГ 5: "Склеиваем" все данные вместе
      const enrichedImages = images.map((image: any) => ({
        ...image,
        profiles: profilesMap.get(image.uploader_user_id) || { username: 'Неизвестный автор' },
        gallery_image_likes: [{ count: likesMap.get(image.id) || 0 }],
      }));

      console.log('[GalleryService] Step 4 OK: Data enriched successfully.');
      return enrichedImages;

    } catch (error: any) {
      console.error('[GalleryService] FATAL ERROR in getApprovedImages:', { message: error?.message });
      throw new AppError('Не удалось обработать запрос галереи', 500);
    }
  }

  /**
   * Получить список изображений, ожидающих модерации (is_approved = false)
   * С ручной агрегацией профилей и лайков
   */
  async getPendingImages(options: GetApprovedImagesOptions): Promise<any[]> {
    console.log('[GalleryService] Starting getPendingImages with MANUAL JOIN logic...');
    try {
      const page = Math.max(1, Number.isFinite(Number(options.page)) ? Number(options.page) : 1);
      const limit = Math.min(100, Math.max(1, Number.isFinite(Number(options.limit)) ? Number(options.limit) : 20));

      // 1) Базовые записи
      let imagesQuery: any = this.commonDb
        .from('gallery_images' as any)
        .select('id, storage_path, title, description, created_at, department_id, uploader_user_id, is_approved')
        .eq('is_approved', false)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (options.departmentId) {
        imagesQuery = imagesQuery.eq('department_id', options.departmentId);
      }

      const { data: images, error: imagesError } = await imagesQuery;
      if (imagesError) throw new Error(`DB error fetching pending images: ${imagesError.message}`);
      if (!images || images.length === 0) return [];

      // 2) Профили авторов
      const uploaderIds: string[] = Array.from(new Set(images.map((img: any) => img.uploader_user_id).filter(Boolean)));
      let profilesMap = new Map<string, any>();
      if (uploaderIds.length > 0) {
        const { data: profiles, error: profilesError } = await (this.publicDb as any)
          .from('profiles')
          .select('id, username')
          .in('id', uploaderIds);
        if (profilesError) throw new Error(`DB error fetching profiles: ${profilesError.message}`);
        profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      }

      // 3) Лайки
      const imageIds: string[] = images.map((img: any) => img.id).filter(Boolean);
      let likesMap = new Map<string, number>();
      if (imageIds.length > 0) {
        const { data: likes, error: likesError } = await (this.commonDb as any)
          .from('gallery_image_likes_count')
          .select('image_id, like_count')
          .in('image_id', imageIds);
        if (likesError) console.warn('[GalleryService] Could not fetch likes for pending, defaulting to 0.');
        likesMap = new Map((likes || []).map((l: any) => [l.image_id, l.like_count]));
      }

      // 4) Обогащение
      const enrichedImages = images.map((image: any) => ({
        ...image,
        profiles: profilesMap.get(image.uploader_user_id) || { username: 'Неизвестный автор' },
        gallery_image_likes: [{ count: likesMap.get(image.id) || 0 }],
      }));

      return enrichedImages;
    } catch (error: any) {
      console.error('[GalleryService] FATAL ERROR in getPendingImages:', { message: error?.message });
      throw new AppError('Не удалось получить изображения на модерации', 500);
    }
  }

  /**
   * Одобрить изображение администратором (is_approved = true)
   */
  async approveImage(imageId: string): Promise<any> {
    try {
      if (!imageId) throw new AppError('imageId is required', 400);

      const { data, error } = await (this.commonDb as any)
        .from('gallery_images')
        .update({ is_approved: true })
        .eq('id', imageId)
        .select('*')
        .single();

      if (error) {
        throw new AppError(error.message, 500);
      }

      if (!data) {
        throw new AppError('Image not found', 404);
      }

      return data;
    } catch (error: any) {
      console.error('[GalleryService] approveImage error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Не удалось одобрить изображение', 500);
    }
  }

  /**
   * Удалить изображение администратором: запись в БД и файл в Storage
   */
  async deleteImageAsAdmin(imageId: string): Promise<void> {
    try {
      if (!imageId) throw new AppError('imageId is required', 400);

      // Получим запись, чтобы знать путь в сторадже
      const { data: img, error: fetchErr } = await (this.commonDb as any)
        .from('gallery_images')
        .select('id, storage_path')
        .eq('id', imageId)
        .single();
      if (fetchErr) {
        if ((fetchErr as any).code === 'PGRST116') {
          throw new AppError('Image not found', 404);
        }
        throw new AppError(fetchErr.message, 500);
      }

      const storagePath: string | null = (img as any)?.storage_path ?? null;

      // Сначала удалим запись из БД (или наоборот). Предпочтем удалить файл, затем запись.
      if (storagePath) {
        const { error: rmErr } = await (this.publicDb.storage as any)
          .from('gallery')
          .remove([storagePath]);
        if (rmErr) {
          // Логируем, но не блокируем удаление БД, чтобы не оставлять мусор
          console.warn('[GalleryService] deleteImageAsAdmin: storage remove error (continuing):', rmErr);
        }
      }

      const { error: delErr } = await (this.commonDb as any)
        .from('gallery_images')
        .delete()
        .eq('id', imageId);
      if (delErr) {
        throw new AppError(delErr.message, 500);
      }
    } catch (error: any) {
      console.error('[GalleryService] deleteImageAsAdmin error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Не удалось удалить изображение', 500);
    }
  }

  /**
   * Создать подписанный URL для загрузки файла в Storage
   */
  async createSignedUploadUrl(userId: string, fileName: string, fileType: string): Promise<{ signedUrl: string; filePath: string; }> {
    console.log('[GalleryService] createSignedUploadUrl: start', { userId, fileName, fileType });
    try {
      if (!userId) throw new AppError('Unauthorized', 401);
      if (!fileName) throw new AppError('fileName is required', 400);
      if (!fileType) throw new AppError('fileType is required', 400);

      // Генерируем уникальный путь, включая папку с ID пользователя
      const filePath = `public/${userId}/${Date.now()}-${fileName}`;

      const BUCKET_NAME = 'gallery';

      // Ключевое исправление: явно указываем contentType и запрещаем upsert
      const uploadOptions = {
        contentType: fileType,
        upsert: false,
      } as any;

      const { data, error } = await (this.publicDb.storage as any)
        .from(BUCKET_NAME)
        .createSignedUploadUrl(filePath, 600, uploadOptions);

      if (error) {
        console.error('[GalleryService] createSignedUploadUrl Supabase error:', error);
        throw new AppError('Не удалось создать URL для загрузки', 500);
      }

      const signedUrl = (data as any)?.signedUrl as string | undefined;
      if (!signedUrl) {
        throw new AppError('Failed to create signed upload URL', 500);
      }

      console.log('[GalleryService] Signed URL created successfully');
      return { signedUrl, filePath };
    } catch (error: any) {
      console.error('[GalleryService] FATAL ERROR in createSignedUploadUrl:', { message: error?.message });
      if (error instanceof AppError) throw error;
      throw new AppError('Не удалось обработать запрос на загрузку', 500);
    }
  }

  /**
   * Создать запись изображения в таблице common.gallery_images
   */
  async createImageRecord(userId: string, payload: { title: string; description?: string | null; storage_path: string; department_id?: string | null; }): Promise<any> {
    console.log('[GalleryService] createImageRecord: start', { userId, data: payload });
    try {
      if (!userId) throw new AppError('Unauthorized', 401);
      if (!payload?.title) throw new AppError('title is required', 400);
      if (!payload?.storage_path) throw new AppError('storage_path is required', 400);

      const { data: newImage, error } = await (this.commonDb as any)
        .rpc('create_gallery_image', {
          p_title: payload.title,
          p_description: payload.description ?? null,
          p_storage_path: payload.storage_path,
          p_uploader_user_id: userId,
          p_department_id: payload.department_id ?? null,
        })
        .single();

      if (error) {
        console.error('[GalleryService] RPC create_gallery_image error:', error);
        throw new AppError(`Не удалось создать запись в галерее: ${error.message}`, 500);
      }

      console.log('[GalleryService] Image record created successfully via RPC!', newImage);
      return newImage;
    } catch (error: any) {
      console.error('[GalleryService] FATAL ERROR in createImageRecord:', { message: error?.message });
      if (error instanceof AppError) throw error;
      throw new AppError('Не удалось обработать запрос на создание записи', 500);
    }
  }
}


