// ====================================================
// File Name   : imageUploadService.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-11
// Last Update : 2025-09-11

// Description:
// - Service for handling image uploads to Supabase storage
// - Provides client-side image processing (resize, compress)
// - Handles file validation, upload, and deletion operations
// - Includes React hooks for upload state management

// Notes:
// - Uses singleton pattern for service instance
// - Supports image compression and resizing before upload
// - Validates file types and sizes before upload
// - Provides hooks for React component integration
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useState } from 'react';
import { supabase } from './supabaseClient';
import { toast } from 'react-hot-toast';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const STORAGE_BUCKET_QUIZ_IMAGES = 'quiz-images';
const DEFAULT_FOLDER = 'uploads';
const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024;
const THUMBNAIL_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const BYTES_PER_MB = 1024 * 1024;

const DEFAULT_QUALITY = 0.8;
const DEFAULT_MAX_WIDTH = 1920;
const DEFAULT_MAX_HEIGHT = 1080;

const CACHE_CONTROL_SECONDS = '3600';
const RANDOM_STRING_START = 2;
const RANDOM_STRING_END = 15;
const RANDOM_STRING_BASE = 36;
const DEFAULT_EXTENSION = 'jpg';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

const PATH_SEGMENT_THUMBNAILS = 'thumbnails';

const PROGRESS_INCREMENT = 10;
const PROGRESS_MAX = 90;
const PROGRESS_COMPLETE = 100;
const PROGRESS_UPDATE_INTERVAL_MS = 100;
const PROGRESS_RESET_DELAY_MS = 1000;

const URL_PATH_PATTERN = /\/storage\/v1\/object\/public\/[^\/]+\/(.+)/;

const ERROR_MESSAGE_PROCESS_FAILED = '画像の処理に失敗しました';
const ERROR_MESSAGE_LOAD_FAILED = '画像の読み込みに失敗しました';
const ERROR_MESSAGE_UPLOAD_FAILED = 'アップロードに失敗しました';
const ERROR_MESSAGE_DELETE_FAILED = '画像の削除に失敗しました';
const ERROR_MESSAGE_BULK_DELETE_FAILED = '画像の一括削除に失敗しました';
const ERROR_MESSAGE_UPLOAD_FAILED_GENERIC = 'アップロードに失敗しました';

const SUCCESS_MESSAGE_UPLOADED = '画像がアップロードされました';

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Interface: UploadResult
 * Description:
 * - Result object returned after successful image upload
 * - Contains URL, path, and public URL for the uploaded image
 */
export interface UploadResult {
  url: string;
  path: string;
  publicUrl: string;
}

/**
 * Interface: UploadOptions
 * Description:
 * - Configuration options for image upload
 * - Controls bucket, folder, validation, and processing settings
 */
export interface UploadOptions {
  bucket?: string;
  folder?: string;
  maxSize?: number;
  allowedTypes?: string[];
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Interface: ValidationResult
 * Description:
 * - Result of file validation
 * - Indicates if file is valid and provides error message if not
 */
interface ValidationResult {
  isValid: boolean;
  error?: string;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Class: ImageUploadService
 * Description:
 * - Service for handling image uploads to Supabase storage
 * - Provides image processing, validation, and upload functionality
 * - Supports single and multiple image uploads
 */
class ImageUploadService {
  /**
   * Method: uploadImage
   * Description:
   * - Uploads a single image to Supabase storage
   * - Validates file, processes image, and uploads to storage
   *
   * Parameters:
   * - file (File): Image file to upload
   * - options (UploadOptions, optional): Upload configuration options
   *
   * Returns:
   * - Promise<UploadResult>: Upload result with URL and path
   *
   * Throws:
   * - Error: When validation, processing, or upload fails
   */
  async uploadImage(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    const {
      bucket = STORAGE_BUCKET_QUIZ_IMAGES,
      folder = DEFAULT_FOLDER,
      ...processOptions
    } = options;

    try {
      const validation = this.validateFile(file, options);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const processedFile = await this.processImage(file, processOptions);
      const fileName = this.generateFileName(processedFile, folder);

      const { data, error } = await supabase.storage.from(bucket).upload(fileName, processedFile, {
        cacheControl: CACHE_CONTROL_SECONDS,
        upsert: false,
      });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`${ERROR_MESSAGE_UPLOAD_FAILED}: ${error.message}`);
      }

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
   * Method: uploadMultipleImages
   * Description:
   * - Uploads multiple images sequentially
   * - Returns partial results even if some uploads fail
   *
   * Parameters:
   * - files (File[]): Array of image files to upload
   * - options (UploadOptions, optional): Upload configuration options
   *
   * Returns:
   * - Promise<UploadResult[]>: Array of successful upload results
   */
  async uploadMultipleImages(files: File[], options: UploadOptions = {}): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadImage(files[i], {
          ...options,
          folder: `${options.folder || DEFAULT_FOLDER}/batch-${Date.now()}`,
        });
        results.push(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : ERROR_MESSAGE_UPLOAD_FAILED_GENERIC;
        errors.push(`ファイル ${i + 1}: ${errorMessage}`);
      }
    }

    if (errors.length > 0) {
      console.error('Some uploads failed:', errors);
      toast.error(`${errors.length}個のファイルのアップロードに失敗しました`);
    }

    return results;
  }

  /**
   * Method: uploadPendingThumbnail
   * Description:
   * - Uploads thumbnail image for a quiz after quiz creation
   * - Uses specific folder structure: userId/quiz-{quizId}/thumbnails
   *
   * Parameters:
   * - file (File): Thumbnail image file
   * - userId (string): User identifier
   * - quizId (string): Quiz identifier
   * - options (UploadOptions, optional): Additional upload options
   *
   * Returns:
   * - Promise<UploadResult>: Upload result with URL and path
   */
  async uploadPendingThumbnail(
    file: File,
    userId: string,
    quizId: string,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const folderPath = `${userId}/quiz-${quizId}/${PATH_SEGMENT_THUMBNAILS}`;

    return this.uploadImage(file, {
      bucket: STORAGE_BUCKET_QUIZ_IMAGES,
      folder: folderPath,
      maxSize: THUMBNAIL_MAX_SIZE_BYTES,
      maxWidth: DEFAULT_MAX_WIDTH,
      maxHeight: DEFAULT_MAX_HEIGHT,
      quality: DEFAULT_QUALITY,
      ...options,
    });
  }

  /**
   * Method: deleteImage
   * Description:
   * - Deletes a single image from Supabase storage
   *
   * Parameters:
   * - path (string): File path in storage
   * - bucket (string, optional): Storage bucket name (default: quiz-images)
   *
   * Returns:
   * - Promise<void>: No return value
   *
   * Throws:
   * - Error: When deletion fails
   */
  async deleteImage(path: string, bucket: string = STORAGE_BUCKET_QUIZ_IMAGES): Promise<void> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) {
        console.error('Delete error:', error);
        throw new Error(`${ERROR_MESSAGE_DELETE_FAILED}: ${error.message}`);
      }
    } catch (error) {
      console.error('Image delete error:', error);
      throw error;
    }
  }

  /**
   * Method: deleteMultipleImages
   * Description:
   * - Deletes multiple images from Supabase storage
   *
   * Parameters:
   * - paths (string[]): Array of file paths in storage
   * - bucket (string, optional): Storage bucket name (default: quiz-images)
   *
   * Returns:
   * - Promise<void>: No return value
   *
   * Throws:
   * - Error: When bulk deletion fails
   */
  async deleteMultipleImages(
    paths: string[],
    bucket: string = STORAGE_BUCKET_QUIZ_IMAGES,
  ): Promise<void> {
    try {
      const { error } = await supabase.storage.from(bucket).remove(paths);

      if (error) {
        console.error('Bulk delete error:', error);
        throw new Error(`${ERROR_MESSAGE_BULK_DELETE_FAILED}: ${error.message}`);
      }
    } catch (error) {
      console.error('Multiple images delete error:', error);
      throw error;
    }
  }

  /**
   * Method: getOptimizedUrl
   * Description:
   * - Gets optimized URL with transformations
   * - Placeholder for future Supabase image transformation features
   *
   * Parameters:
   * - originalUrl (string): Original image URL
   *
   * Returns:
   * - string: Optimized URL (currently returns original)
   */
  getOptimizedUrl(originalUrl: string): string {
    return originalUrl;
  }

  /**
   * Method: extractPathFromUrl
   * Description:
   * - Extracts file path from Supabase public URL
   *
   * Parameters:
   * - url (string): Supabase public URL
   *
   * Returns:
   * - string | null: Extracted file path or null if extraction fails
   */
  extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(URL_PATH_PATTERN);
      return pathMatch ? pathMatch[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Method: checkBucketAccess
   * Description:
   * - Checks if storage bucket exists and is accessible
   *
   * Parameters:
   * - bucket (string, optional): Bucket name to check (default: quiz-images)
   *
   * Returns:
   * - Promise<boolean>: True if bucket is accessible, false otherwise
   */
  async checkBucketAccess(bucket: string = STORAGE_BUCKET_QUIZ_IMAGES): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage.getBucket(bucket);
      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * Method: getFileInfo
   * Description:
   * - Gets file information from storage
   *
   * Parameters:
   * - path (string): File path in storage
   * - bucket (string, optional): Storage bucket name (default: quiz-images)
   *
   * Returns:
   * - Promise<unknown | null>: File information or null if not found
   */
  async getFileInfo(
    path: string,
    bucket: string = STORAGE_BUCKET_QUIZ_IMAGES,
  ): Promise<unknown | null> {
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

  //----------------------------------------------------
  // 5. Helper Functions
  //----------------------------------------------------
  /**
   * Method: validateFile
   * Description:
   * - Validates file size and type before upload
   *
   * Parameters:
   * - file (File): File to validate
   * - options (UploadOptions, optional): Validation options
   *
   * Returns:
   * - ValidationResult: Validation result with error message if invalid
   */
  private validateFile(file: File, options: UploadOptions = {}): ValidationResult {
    const maxSize = options.maxSize || DEFAULT_MAX_SIZE_BYTES;
    const allowedTypes = options.allowedTypes || [...ALLOWED_MIME_TYPES];

    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / BYTES_PER_MB);
      return {
        isValid: false,
        error: `ファイルサイズが大きすぎます。最大${maxSizeMB}MBまでです。`,
      };
    }

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
   * Method: generateFileName
   * Description:
   * - Generates unique filename with timestamp and random string
   *
   * Parameters:
   * - originalFile (File): Original file to generate name for
   * - folder (string, optional): Folder path prefix
   *
   * Returns:
   * - string: Generated file path
   */
  private generateFileName(originalFile: File, folder?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random()
      .toString(RANDOM_STRING_BASE)
      .substring(RANDOM_STRING_START, RANDOM_STRING_END);
    const extension = originalFile.name.split('.').pop()?.toLowerCase() || DEFAULT_EXTENSION;
    const fileName = `${timestamp}-${randomString}.${extension}`;

    return folder ? `${folder}/${fileName}` : fileName;
  }

  /**
   * Method: processImage
   * Description:
   * - Resizes and compresses image client-side before upload
   * - Uses canvas API for image processing
   *
   * Parameters:
   * - file (File): Image file to process
   * - options (object, optional): Processing options (quality, maxWidth, maxHeight)
   *
   * Returns:
   * - Promise<File>: Processed image file
   *
   * Throws:
   * - Error: When image processing fails
   */
  private async processImage(
    file: File,
    options: Pick<UploadOptions, 'quality' | 'maxWidth' | 'maxHeight'> = {},
  ): Promise<File> {
    const quality = options.quality ?? DEFAULT_QUALITY;
    const maxWidth = options.maxWidth ?? DEFAULT_MAX_WIDTH;
    const maxHeight = options.maxHeight ?? DEFAULT_MAX_HEIGHT;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

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
              reject(new Error(ERROR_MESSAGE_PROCESS_FAILED));
            }
          },
          file.type,
          quality,
        );
      };

      img.onerror = () => {
        reject(new Error(ERROR_MESSAGE_LOAD_FAILED));
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

/**
 * Hook: useImageUpload
 * Description:
 * - React hook for uploading images with loading state management
 * - Provides upload progress tracking and error handling
 *
 * Returns:
 * - { uploadImage, isUploading, uploadProgress, error }: Upload state and function
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

      const progressInterval = setInterval(() => {
        setUploadProgress((prev: number) => Math.min(prev + PROGRESS_INCREMENT, PROGRESS_MAX));
      }, PROGRESS_UPDATE_INTERVAL_MS);

      const result = await imageUploadService.uploadImage(file, options);

      clearInterval(progressInterval);
      setUploadProgress(PROGRESS_COMPLETE);

      toast.success(SUCCESS_MESSAGE_UPLOADED);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : ERROR_MESSAGE_UPLOAD_FAILED_GENERIC;
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), PROGRESS_RESET_DELAY_MS);
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
 * Hook: usePendingThumbnailUpload
 * Description:
 * - React hook for uploading pending thumbnails after quiz creation
 * - Manages upload state for thumbnail uploads
 *
 * Returns:
 * - { uploadPendingThumbnail, isUploadingThumbnail }: Thumbnail upload state and function
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

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
export const imageUploadService = new ImageUploadService();
