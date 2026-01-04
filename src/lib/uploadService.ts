// ====================================================
// File Name   : uploadService.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-11
// Last Update : 2025-09-13
//
// Description:
// - Service for handling file uploads via backend API
// - Provides methods for uploading quiz thumbnails, question images, and answer images
// - Includes React hook for upload state management with progress tracking
//
// Notes:
// - Uses fetch directly for file uploads with FormData
// - Validates files before upload (size and type)
// - Matches backend upload validation logic
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useState, useEffect, useRef } from 'react';
import { cfg } from '@/config/config';
import { toast } from 'react-hot-toast';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const STORAGE_KEY_SESSION = 'tuiz_session';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const BYTES_PER_MB = 1024 * 1024;
const MAX_FILE_SIZE_MB = MAX_FILE_SIZE_BYTES / BYTES_PER_MB;

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

const FILE_FIELD_THUMBNAIL = 'thumbnail';
const FILE_FIELD_IMAGE = 'image';

const HTTP_METHOD_POST = 'POST';
const AUTH_BEARER_PREFIX = 'Bearer ';

const API_ENDPOINT_QUIZ_THUMBNAIL = '/upload/quiz-thumbnail';
const API_ENDPOINT_QUESTION_IMAGE = '/upload/question-image';
const API_ENDPOINT_ANSWER_IMAGE = '/upload/answer-image';

const PROGRESS_INCREMENT = 10;
const PROGRESS_MAX = 90;
const PROGRESS_COMPLETE = 100;
const PROGRESS_UPDATE_INTERVAL_MS = 100;
const PROGRESS_RESET_DELAY_MS = 1000;

const ERROR_MESSAGE_UPLOAD_FAILED = 'Upload failed';
const ERROR_MESSAGE_UPLOAD_FAILED_GENERIC = 'アップロードに失敗しました';
const ERROR_MESSAGE_FILE_SIZE_TOO_LARGE = `ファイルサイズが大きすぎます。最大${MAX_FILE_SIZE_MB}MBまでです。`;
const ERROR_MESSAGE_UNSUPPORTED_FILE_TYPE =
  'サポートされていないファイル形式です。JPEG、PNG、WebP、GIFのみ対応しています。';

const SUCCESS_MESSAGE_IMAGE_UPLOADED = '画像がアップロードされました';
const SUCCESS_MESSAGE_QUESTION_IMAGE_UPLOADED = '問題画像がアップロードされました';
const SUCCESS_MESSAGE_ANSWER_IMAGE_UPLOADED = '選択肢画像がアップロードされました';

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Interface: UploadResult
 * Description:
 * - Result object returned after successful file upload
 * - Contains URL and path for the uploaded file
 */
export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Interface: UploadError
 * Description:
 * - Error object returned from upload API
 * - Contains error code and optional message
 */
export interface UploadError {
  error: string;
  message?: string;
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
 * Class: UploadService
 * Description:
 * - Service for handling file uploads via backend API
 * - Provides methods for uploading quiz thumbnails, question images, and answer images
 * - Validates files before upload
 */
class UploadService {
  /**
   * Method: uploadQuizThumbnail
   * Description:
   * - Uploads quiz thumbnail image via backend API
   *
   * Parameters:
   * - file (File): Thumbnail image file
   * - quizId (string): Quiz set ID
   *
   * Returns:
   * - Promise<UploadResult>: Upload result with URL and path
   *
   * Throws:
   * - Error: When upload fails
   */
  async uploadQuizThumbnail(file: File, quizId: string): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append(FILE_FIELD_THUMBNAIL, file);

      const response = await fetch(`${cfg.apiBase}${API_ENDPOINT_QUIZ_THUMBNAIL}/${quizId}`, {
        method: HTTP_METHOD_POST,
        body: formData,
        headers: {
          Authorization: `${AUTH_BEARER_PREFIX}${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const errorData: UploadError = await response.json();
        throw new Error(errorData.message || errorData.error || ERROR_MESSAGE_UPLOAD_FAILED);
      }

      const result: UploadResult = await response.json();
      return result;
    } catch (error) {
      console.error('Upload service error:', error);
      throw error;
    }
  }

  /**
   * Method: uploadQuestionImage
   * Description:
   * - Uploads question image via backend API
   *
   * Parameters:
   * - file (File): Question image file
   * - quizId (string): Quiz set ID
   *
   * Returns:
   * - Promise<UploadResult>: Upload result with URL and path
   *
   * Throws:
   * - Error: When upload fails
   */
  async uploadQuestionImage(file: File, quizId: string): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append(FILE_FIELD_IMAGE, file);

      const response = await fetch(`${cfg.apiBase}${API_ENDPOINT_QUESTION_IMAGE}/${quizId}`, {
        method: HTTP_METHOD_POST,
        body: formData,
        headers: {
          Authorization: `${AUTH_BEARER_PREFIX}${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const errorData: UploadError = await response.json();
        throw new Error(errorData.message || errorData.error || ERROR_MESSAGE_UPLOAD_FAILED);
      }

      const result: UploadResult = await response.json();
      return result;
    } catch (error) {
      console.error('Question image upload error:', error);
      throw error;
    }
  }

  /**
   * Method: uploadAnswerImage
   * Description:
   * - Uploads answer image via backend API
   *
   * Parameters:
   * - file (File): Answer image file
   * - quizId (string): Quiz set ID
   *
   * Returns:
   * - Promise<UploadResult>: Upload result with URL and path
   *
   * Throws:
   * - Error: When upload fails
   */
  async uploadAnswerImage(file: File, quizId: string): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append(FILE_FIELD_IMAGE, file);

      const response = await fetch(`${cfg.apiBase}${API_ENDPOINT_ANSWER_IMAGE}/${quizId}`, {
        method: HTTP_METHOD_POST,
        body: formData,
        headers: {
          Authorization: `${AUTH_BEARER_PREFIX}${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const errorData: UploadError = await response.json();
        throw new Error(errorData.message || errorData.error || ERROR_MESSAGE_UPLOAD_FAILED);
      }

      const result: UploadResult = await response.json();
      return result;
    } catch (error) {
      console.error('Answer image upload error:', error);
      throw error;
    }
  }

  /**
   * Method: validateImageFile
   * Description:
   * - Validates image file before upload
   * - Checks file size and MIME type
   * - Matches backend validation logic
   *
   * Parameters:
   * - file (File): File to validate
   *
   * Returns:
   * - ValidationResult: Validation result with error message if invalid
   */
  validateImageFile(file: File): ValidationResult {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        error: ERROR_MESSAGE_FILE_SIZE_TOO_LARGE,
      };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
      return {
        isValid: false,
        error: ERROR_MESSAGE_UNSUPPORTED_FILE_TYPE,
      };
    }

    return { isValid: true };
  }

  //----------------------------------------------------
  // 5. Helper Functions
  //----------------------------------------------------
  /**
   * Method: getAuthToken
   * Description:
   * - Retrieves authentication token from localStorage
   * - Parses session data and extracts access token
   *
   * Returns:
   * - string: Authentication token or empty string if not found
   */
  private getAuthToken(): string {
    const sessionStr = localStorage.getItem(STORAGE_KEY_SESSION);
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        return session?.access_token || '';
      } catch (error) {
        console.error('UploadService: Error parsing session', error);
        return '';
      }
    }
    return '';
  }
}

/**
 * Hook: useFileUpload
 * Description:
 * - React hook for uploading files with loading state and error handling
 * - Provides upload progress tracking and error management
 * - Handles cleanup of progress intervals on unmount
 *
 * Returns:
 * - { uploadQuizThumbnail, uploadQuestionImage, uploadAnswerImage, isUploading, uploadProgress, error }: Upload state and functions
 */
export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (progressResetTimeoutRef.current) {
        clearTimeout(progressResetTimeoutRef.current);
      }
    };
  }, []);

  const uploadQuizThumbnail = async (file: File, quizId: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      const validation = uploadService.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      progressIntervalRef.current = setInterval(() => {
        setUploadProgress((prev: number) => Math.min(prev + PROGRESS_INCREMENT, PROGRESS_MAX));
      }, PROGRESS_UPDATE_INTERVAL_MS);

      const result = await uploadService.uploadQuizThumbnail(file, quizId);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setUploadProgress(PROGRESS_COMPLETE);

      toast.success(SUCCESS_MESSAGE_IMAGE_UPLOADED);
      return result.url;
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      const message = error instanceof Error ? error.message : ERROR_MESSAGE_UPLOAD_FAILED_GENERIC;
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsUploading(false);
      if (progressResetTimeoutRef.current) {
        clearTimeout(progressResetTimeoutRef.current);
      }
      progressResetTimeoutRef.current = setTimeout(
        () => setUploadProgress(0),
        PROGRESS_RESET_DELAY_MS,
      );
    }
  };

  const uploadQuestionImage = async (file: File, quizId: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      const validation = uploadService.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      progressIntervalRef.current = setInterval(() => {
        setUploadProgress((prev: number) => Math.min(prev + PROGRESS_INCREMENT, PROGRESS_MAX));
      }, PROGRESS_UPDATE_INTERVAL_MS);

      const result = await uploadService.uploadQuestionImage(file, quizId);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setUploadProgress(PROGRESS_COMPLETE);

      toast.success(SUCCESS_MESSAGE_QUESTION_IMAGE_UPLOADED);
      return result.url;
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      const message = error instanceof Error ? error.message : ERROR_MESSAGE_UPLOAD_FAILED_GENERIC;
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsUploading(false);
      if (progressResetTimeoutRef.current) {
        clearTimeout(progressResetTimeoutRef.current);
      }
      progressResetTimeoutRef.current = setTimeout(
        () => setUploadProgress(0),
        PROGRESS_RESET_DELAY_MS,
      );
    }
  };

  const uploadAnswerImage = async (file: File, quizId: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      const validation = uploadService.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      progressIntervalRef.current = setInterval(() => {
        setUploadProgress((prev: number) => Math.min(prev + PROGRESS_INCREMENT, PROGRESS_MAX));
      }, PROGRESS_UPDATE_INTERVAL_MS);

      const result = await uploadService.uploadAnswerImage(file, quizId);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setUploadProgress(PROGRESS_COMPLETE);

      toast.success(SUCCESS_MESSAGE_ANSWER_IMAGE_UPLOADED);
      return result.url;
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      const message = error instanceof Error ? error.message : ERROR_MESSAGE_UPLOAD_FAILED_GENERIC;
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsUploading(false);
      if (progressResetTimeoutRef.current) {
        clearTimeout(progressResetTimeoutRef.current);
      }
      progressResetTimeoutRef.current = setTimeout(
        () => setUploadProgress(0),
        PROGRESS_RESET_DELAY_MS,
      );
    }
  };

  return {
    uploadQuizThumbnail,
    uploadQuestionImage,
    uploadAnswerImage,
    isUploading,
    uploadProgress,
    error,
  };
}

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
export const uploadService = new UploadService();
