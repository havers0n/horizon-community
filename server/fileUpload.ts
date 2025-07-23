import { Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { Request as ExpressRequest } from 'express';
// import { File as MulterFile } from 'multer';

interface UploadedFile {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  uploadedBy: number;
  uploadedAt: Date;
  category: 'report' | 'evidence' | 'avatar' | 'document';
}

interface FileUploadConfig {
  maxFileSize: number; // in bytes
  allowedMimeTypes: string[];
  uploadDirectory: string;
  preserveOriginalName: boolean;
}

interface MulterRequest extends ExpressRequest {
  file?: Express.Multer.File;
}

export class FileUploadManager {
  private uploadConfigs: Record<string, FileUploadConfig> = {
    report: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      uploadDirectory: 'uploads/reports',
      preserveOriginalName: false
    },
    evidence: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/quicktime'
      ],
      uploadDirectory: 'uploads/evidence',
      preserveOriginalName: false
    },
    avatar: {
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/webp'
      ],
      uploadDirectory: 'uploads/avatars',
      preserveOriginalName: false
    },
    document: {
      maxFileSize: 25 * 1024 * 1024, // 25MB
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png'
      ],
      uploadDirectory: 'uploads/documents',
      preserveOriginalName: true
    }
  };

  private uploadedFiles: Map<string, UploadedFile> = new Map();

  constructor() {
    this.initializeDirectories();
  }

  /**
   * Initialize upload directories
   */
  private async initializeDirectories() {
    for (const config of Object.values(this.uploadConfigs)) {
      try {
        await fs.mkdir(config.uploadDirectory, { recursive: true });
      } catch (error) {
        console.error(`Failed to create directory ${config.uploadDirectory}:`, error);
      }
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(
    file: { size: number; mimetype: string; originalname: string },
    category: string,
    userId: number
  ): { valid: boolean; error?: string } {
    const config = this.uploadConfigs[category];
    if (!config) {
      return { valid: false, error: 'Invalid upload category' };
    }

    // Check file size
    if (file.size > config.maxFileSize) {
      const maxSizeMB = (config.maxFileSize / (1024 * 1024)).toFixed(1);
      return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
    }

    // Check mime type
    if (!config.allowedMimeTypes.includes(file.mimetype)) {
      return { valid: false, error: 'File type not allowed' };
    }

    // Check file name
    if (!file.originalname || file.originalname.length > 255) {
      return { valid: false, error: 'Invalid file name' };
    }

    // Additional security checks
    const extension = path.extname(file.originalname).toLowerCase();
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.vbs', '.js'];
    if (dangerousExtensions.includes(extension)) {
      return { valid: false, error: 'File type not allowed for security reasons' };
    }

    return { valid: true };
  }

  /**
   * Generate unique filename
   */
  private generateFileName(originalName: string, preserveOriginal: boolean): string {
    if (preserveOriginal) {
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(8).toString('hex');
      const extension = path.extname(originalName);
      const baseName = path.basename(originalName, extension);
      return `${baseName}_${timestamp}_${randomString}${extension}`;
    }

    const extension = path.extname(originalName);
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(16).toString('hex');
    return `${timestamp}_${randomString}${extension}`;
  }

  /**
   * Upload file
   */
  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    category: string,
    userId: number
  ): Promise<{ success: boolean; file?: UploadedFile; error?: string }> {
    
    // Create mock file object for validation
    const mockFile = {
      size: fileBuffer.length,
      mimetype: mimeType,
      originalname: originalName
    };

    // Validate file
    const validation = this.validateFile(mockFile, category, userId);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const config = this.uploadConfigs[category];
    const fileName = this.generateFileName(originalName, config.preserveOriginalName);
    const filePath = path.join(config.uploadDirectory, fileName);
    const fileId = crypto.randomUUID();

    try {
      // Write file to disk
      await fs.writeFile(filePath, fileBuffer);

      // Create file record
      const uploadedFile: UploadedFile = {
        id: fileId,
        originalName,
        fileName,
        filePath,
        mimeType,
        size: fileBuffer.length,
        uploadedBy: userId,
        uploadedAt: new Date(),
        category: category as any
      };

      // Store in memory (in real implementation, store in database)
      this.uploadedFiles.set(fileId, uploadedFile);

      console.log(`File uploaded: ${originalName} -> ${fileName} by user ${userId}`);

      return { success: true, file: uploadedFile };

    } catch (error) {
      console.error('File upload error:', error);
      return { success: false, error: 'Failed to save file' };
    }
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string): Promise<UploadedFile | null> {
    return this.uploadedFiles.get(fileId) || null;
  }

  /**
   * Get file buffer
   */
  async getFileBuffer(fileId: string): Promise<Buffer | null> {
    const file = await this.getFile(fileId);
    if (!file) return null;

    try {
      return await fs.readFile(file.filePath);
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string, userId: number): Promise<{ success: boolean; error?: string }> {
    const file = await this.getFile(fileId);
    if (!file) {
      return { success: false, error: 'File not found' };
    }

    // Check if user has permission to delete (owner or admin)
    // This would check user role in real implementation
    if (file.uploadedBy !== userId) {
      return { success: false, error: 'Permission denied' };
    }

    try {
      // Delete physical file
      await fs.unlink(file.filePath);
      
      // Remove from records
      this.uploadedFiles.delete(fileId);

      console.log(`File deleted: ${file.fileName} by user ${userId}`);
      return { success: true };

    } catch (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: 'Failed to delete file' };
    }
  }

  /**
   * Get files by user
   */
  async getFilesByUser(userId: number, category?: string): Promise<UploadedFile[]> {
    const files = Array.from(this.uploadedFiles.values())
      .filter(file => 
        file.uploadedBy === userId && 
        (!category || file.category === category)
      )
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

    return files;
  }

  /**
   * Get upload statistics
   */
  async getUploadStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByCategory: Record<string, number>;
    recentUploads: UploadedFile[];
  }> {
    const files = Array.from(this.uploadedFiles.values());
    
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    
    const filesByCategory: Record<string, number> = {};
    files.forEach(file => {
      filesByCategory[file.category] = (filesByCategory[file.category] || 0) + 1;
    });

    const recentUploads = files
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
      .slice(0, 10);

    return {
      totalFiles,
      totalSize,
      filesByCategory,
      recentUploads
    };
  }

  /**
   * Clean up old files (garbage collection)
   */
  async cleanupOldFiles(maxAgeInDays: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeInDays);

    const oldFiles = Array.from(this.uploadedFiles.values())
      .filter(file => file.uploadedAt < cutoffDate);

    for (const file of oldFiles) {
      try {
        await fs.unlink(file.filePath);
        this.uploadedFiles.delete(file.id);
        console.log(`Cleaned up old file: ${file.fileName}`);
      } catch (error) {
        console.error(`Failed to cleanup file ${file.fileName}:`, error);
      }
    }

    console.log(`Cleaned up ${oldFiles.length} old files`);
  }

  /**
   * Generate secure download URL
   */
  generateDownloadUrl(fileId: string, expiresInMinutes: number = 60): string {
    const timestamp = Date.now() + (expiresInMinutes * 60 * 1000);
    const signature = crypto
      .createHmac('sha256', process.env.FILE_DOWNLOAD_SECRET || 'default-secret')
      .update(`${fileId}:${timestamp}`)
      .digest('hex');

    return `/api/files/${fileId}/download?expires=${timestamp}&signature=${signature}`;
  }

  /**
   * Verify download URL
   */
  verifyDownloadUrl(fileId: string, expires: string, signature: string): boolean {
    const expiresTimestamp = parseInt(expires);
    
    // Check if URL has expired
    if (Date.now() > expiresTimestamp) {
      return false;
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.FILE_DOWNLOAD_SECRET || 'default-secret')
      .update(`${fileId}:${expires}`)
      .digest('hex');

    return signature === expectedSignature;
  }
}

// Singleton instance
export const fileUploadManager = new FileUploadManager();

// Multer storage config (in-memory, можно заменить на diskStorage при необходимости)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

export const uploadMiddleware = upload.single('file');

// Экспорт singleton-экземпляра handleUpload
export const handleUpload = createUploadMiddleware().handleUpload;

// Express middleware for file uploads
export function createUploadMiddleware() {
  return {
    // Middleware to handle multipart/form-data
    // In real implementation, would use multer or similar
    parseMultipartData: async (req: Request, res: Response, next: any) => {
      // Mock implementation - would parse form data
      // const upload = multer({ 
      //   storage: multer.memoryStorage(),
      //   limits: { fileSize: 50 * 1024 * 1024 }
      // });
      next();
    },

    // Upload handler (теперь использует multer)
    handleUpload: async (req: MulterRequest, res: Response) => {
      try {
        const { category } = req.params;
        const userId = (req as any).user?.id;
        if (!userId) {
          return res.status(401).json({ error: 'Authentication required' });
        }
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }
        const result = await fileUploadManager.uploadFile(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          category,
          userId
        );
        if (result.success) {
          res.json({
            success: true,
            file: {
              id: result.file!.id,
              originalName: result.file!.originalName,
              size: result.file!.size,
              uploadedAt: result.file!.uploadedAt,
              downloadUrl: fileUploadManager.generateDownloadUrl(result.file!.id)
            }
          });
        } else {
          res.status(400).json({ success: false, error: result.error });
        }
      } catch (error) {
        console.error('Upload handler error:', error);
        res.status(500).json({ success: false, error: 'Upload failed' });
      }
    },

    // Download handler
    handleDownload: async (req: Request, res: Response) => {
      try {
        const { fileId } = req.params;
        const { expires, signature } = req.query;

        // Verify download URL
        if (expires && signature) {
          const isValid = fileUploadManager.verifyDownloadUrl(
            fileId, 
            expires as string, 
            signature as string
          );
          if (!isValid) {
            return res.status(403).json({ error: 'Invalid or expired download link' });
          }
        }

        const file = await fileUploadManager.getFile(fileId);
        if (!file) {
          return res.status(404).json({ error: 'File not found' });
        }

        const fileBuffer = await fileUploadManager.getFileBuffer(fileId);
        if (!fileBuffer) {
          return res.status(404).json({ error: 'File content not found' });
        }

        // Set appropriate headers
        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Length', file.size);
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);

        // Send file
        res.send(fileBuffer);

      } catch (error) {
        console.error('Download handler error:', error);
        res.status(500).json({ error: 'Download failed' });
      }
    }
  };
}