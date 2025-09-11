// src/lib/imageUploadService.ts
// Service for handling image uploads to Supabase storage

import { useState } from 'react';
import { supabase } from './supabaseClient';
import { toast } from 'react-hot-toast';

// ============================================================================
// TYPES
// ============================================================================

interface UploadResult {
  url: string;
  path: string;
  publicUrl: string;
}

interface UploadOptions {
  bucket?: string;
  folder?: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  quality?: number; // for image compression (0-1)
  maxWidth?: number; // for image resizing
  maxHeight?: number; // for image resizing
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// ============================================================================
// IMAGE UPLOAD SERVICE
// ============================================================================

class ImageUploadService {
  private readonly DEFAULT_BUCKET = 'quiz-images';
  private readonly DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly DEFAULT_ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  /**
   * Validate file before upload
   */
  private validateFile(file: File, options: UploadOptions = {}): ValidationResult {
    const { maxSize = this.DEFAULT_MAX_SIZE, allowedTypes = this.DEFAULT_ALLOWED_TYPES } = options;

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return {
        isValid: false,
        error: `ファイルサイズが大きすぎます。最大${maxSizeMB}MBまでです。`,
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      const allowedExtensions = allowedTypes.map((type) => type.split('/')[1]).join(', ');
      return {
        isValid: false,
        error: `サポートされていないファイル形式です。使用可能な形式: ${allowedExtensions}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Generate unique filename
   */
  private generateFileName(originalFile: File, folder?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalFile.name.split('.').pop()?.toLowerCase() || 'jpg';

    const fileName = `${timestamp}-${randomString}.${extension}`;

    return folder ? `${folder}/${fileName}` : fileName;
  }

  // ============================================================================
  // IMAGE PROCESSING METHODS
  // ============================================================================

  /**
   * Resize and compress image (client-side)
   */
  private async processImage(
    file: File,
    options: Pick<UploadOptions, 'quality' | 'maxWidth' | 'maxHeight'> = {},
  ): Promise<File> {
    const { quality = 0.8, maxWidth = 1920, maxHeight = 1080 } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const processedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(processedFile);
            } else {
              reject(new Error('画像の処理に失敗しました'));
            }
          },
          file.type,
          quality,
        );
      };

      img.onerror = () => {
        reject(new Error('画像の読み込みに失敗しました'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // ============================================================================
  // UPLOAD METHODS
  // ============================================================================

  /**
   * Upload image to Supabase storage
   */
  async uploadImage(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    const { bucket = this.DEFAULT_BUCKET, folder = 'uploads', ...processOptions } = options;

    try {
      // Validate file
      const validation = this.validateFile(file, options);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Process image (resize/compress)
      const processedFile = await this.processImage(file, processOptions);

      // Generate unique filename
      const fileName = this.generateFileName(processedFile, folder);

      // Upload to Supabase
      const { data, error } = await supabase.storage.from(bucket).upload(fileName, processedFile, {
        cacheControl: '3600', // Cache for 1 hour
        upsert: false, // Don't overwrite existing files
      });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error('アップロードに失敗しました: ' + error.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

      return {
        url: urlData.publicUrl,
        path: data.path,
        publicUrl: urlData.publicUrl,
      };
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(files: File[], options: UploadOptions = {}): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadImage(files[i], {
          ...options,
          folder: `${options.folder || 'uploads'}/batch-${Date.now()}`,
        });
        results.push(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'アップロードに失敗しました';
        errors.push(`ファイル ${i + 1}: ${errorMessage}`);
      }
    }

    if (errors.length > 0) {
      console.warn('Some uploads failed:', errors);
      // Don't throw error, return partial results
      toast.error(`${errors.length}個のファイルのアップロードに失敗しました`);
    }

    return results;
  }

  /**
   * Upload pending thumbnail after quiz creation
   */
  async uploadPendingThumbnail(
    file: File,
    userId: string,
    quizId: string,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const folderPath = `${userId}/quiz-${quizId}/thumbnails`;

    // Debug logging
    console.log('Uploading thumbnail with path:', folderPath);
    console.log('User ID:', userId);
    console.log('Quiz ID:', quizId);

    return this.uploadImage(file, {
      bucket: 'quiz-images',
      folder: folderPath,
      maxSize: 5 * 1024 * 1024, // 5MB
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.8,
      ...options,
    });
  }

  // ============================================================================
  // DELETE METHODS
  // ============================================================================

  /**
   * Delete image from storage
   */
  async deleteImage(path: string, bucket: string = this.DEFAULT_BUCKET): Promise<void> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) {
        console.error('Delete error:', error);
        throw new Error('画像の削除に失敗しました: ' + error.message);
      }
    } catch (error) {
      console.error('Image delete error:', error);
      throw error;
    }
  }

  /**
   * Delete multiple images
   */
  async deleteMultipleImages(paths: string[], bucket: string = this.DEFAULT_BUCKET): Promise<void> {
    try {
      const { error } = await supabase.storage.from(bucket).remove(paths);

      if (error) {
        console.error('Bulk delete error:', error);
        throw new Error('画像の一括削除に失敗しました: ' + error.message);
      }
    } catch (error) {
      console.error('Multiple images delete error:', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get optimized URL with transformations
   */
  getOptimizedUrl(originalUrl: string): string {
    // If using Supabase with image transformations (Pro plan)
    // This would need to be implemented based on your storage setup
    // For now, return the original URL
    return originalUrl;
  }

  /**
   * Extract path from Supabase public URL
   */
  extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)/);
      return pathMatch ? pathMatch[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if bucket exists and is accessible
   */
  async checkBucketAccess(bucket: string = this.DEFAULT_BUCKET): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage.getBucket(bucket);
      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * Get file info from storage
   */
  async getFileInfo(path: string, bucket: string = this.DEFAULT_BUCKET) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path.split('/').slice(0, -1).join('/'), {
          search: path.split('/').pop(),
        });

      if (error || !data || data.length === 0) {
        return null;
      }

      return data[0];
    } catch {
      return null;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const imageUploadService = new ImageUploadService();

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook for uploading images with loading state
 */
export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, options?: UploadOptions): Promise<UploadResult | null> => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev: number) => Math.min(prev + 10, 90));
      }, 100);

      const result = await imageUploadService.uploadImage(file, options);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('画像がアップロードされました');
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'アップロードに失敗しました';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return {
    uploadImage,
    isUploading,
    uploadProgress,
    error,
  };
}

/**
 * Hook for handling pending thumbnail uploads after quiz creation
 */
export function usePendingThumbnailUpload() {
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const uploadPendingThumbnail = async (
    file: File,
    userId: string,
    quizId: string,
  ): Promise<string | null> => {
    try {
      setIsUploadingThumbnail(true);
      const result = await imageUploadService.uploadPendingThumbnail(file, userId, quizId);
      return result.url;
    } catch (error) {
      console.error('Failed to upload pending thumbnail:', error);
      return null;
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  return {
    uploadPendingThumbnail,
    isUploadingThumbnail,
  };
}

// Re-export for convenience
export type { UploadResult, UploadOptions };
