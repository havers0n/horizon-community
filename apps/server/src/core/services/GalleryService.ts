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
   * Создать подписанный URL для загрузки файла в Storage
   */
  async createSignedUploadUrl(userId: string, fileName: string, fileType: string): Promise<{ signedUrl: string; filePath: string; }> {
    try {
      if (!userId) throw new AppError('Unauthorized', 401);
      if (!fileName) throw new AppError('fileName is required', 400);
      if (!fileType) throw new AppError('fileType is required', 400);

      const BUCKET_NAME = 'gallery-images';
      const filePath = `public/${userId}/${Date.now()}-${fileName}`;

      const { data, error } = await (this.publicDb.storage as any)
        .from(BUCKET_NAME)
        .createSignedUploadUrl(filePath, { contentType: fileType } as any);

      if (error) {
        throw new AppError(error.message, 500);
      }

      const signedUrl = (data as any)?.signedUrl as string | undefined;
      if (!signedUrl) {
        throw new AppError('Failed to create signed upload URL', 500);
      }

      return { signedUrl, filePath };
    } catch (err) {
      console.error('[GalleryService] createSignedUploadUrl error:', err);
      if (err instanceof AppError) throw err;
      throw new AppError('Не удалось получить URL загрузки', 500);
    }
  }

  /**
   * Создать запись изображения в таблице common.gallery_images
   */
  async createImageRecord(userId: string, payload: { title: string; description?: string | null; storage_path: string; department_id?: string | null; }): Promise<any> {
    try {
      if (!userId) throw new AppError('Unauthorized', 401);
      if (!payload?.title) throw new AppError('title is required', 400);
      if (!payload?.storage_path) throw new AppError('storage_path is required', 400);

      const insertData: any = {
        title: payload.title,
        description: payload.description ?? null,
        storage_path: payload.storage_path,
        department_id: payload.department_id ?? null,
        user_id: userId,
        is_approved: false,
      };

      const { data, error } = await (this.commonDb
        .from('gallery_images' as any)
        .insert(insertData)
        .select('*') as any).single();

      if (error) {
        throw new AppError(error.message, 500);
      }

      return data;
    } catch (err) {
      console.error('[GalleryService] createImageRecord error:', err);
      if (err instanceof AppError) throw err;
      throw new AppError('Не удалось сохранить запись изображения', 500);
    }
  }
}


