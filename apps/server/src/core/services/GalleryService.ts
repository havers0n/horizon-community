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
    try {
      const page = Math.max(1, Number.isFinite(Number(options.page)) ? Number(options.page) : 1);
      const limit = Math.min(100, Math.max(1, Number.isFinite(Number(options.limit)) ? Number(options.limit) : 20));
      const from = (page - 1) * limit;
      const to = page * limit - 1;

      const qb: any = this.commonDb
        .from('gallery_images' as any)
        .select(
          `
            id,
            storage_path,
            title,
            description,
            created_at,
            department_id,
            profiles ( username ),
            gallery_image_likes ( count )
          `
        )
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (options.departmentId) {
        qb.eq('department_id', options.departmentId);
      }

      const { data, error } = await qb;
      if (error) {
        throw new AppError(error.message, 500);
      }
      return data ?? [];
    } catch (err) {
      console.error('[GalleryService] getApprovedImages error:', err);
      if (err instanceof AppError) throw err;
      throw new AppError('Не удалось получить изображения галереи', 500);
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


