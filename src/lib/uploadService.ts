// src/lib/uploadService.ts
// Service for handling file uploads via backend API

import { cfg } from '@/config/config';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface UploadResult {
  url: string;
  path: string;
}

export interface UploadError {
  error: string;
  message?: string;
}

// ============================================================================
// UPLOAD SERVICE CLASS
// ============================================================================

class UploadService {
  /**
   * Upload quiz thumbnail via backend API
   */
  async uploadQuizThumbnail(file: File, quizId: string): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('thumbnail', file);

      // Use fetch directly for file uploads with progress
      const response = await fetch(`${cfg.apiBase}/upload/quiz-thumbnail/${quizId}`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type - let browser set it with boundary for FormData
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const errorData: UploadError = await response.json();
        throw new Error(errorData.message || errorData.error || 'Upload failed');
      }

      const result: UploadResult = await response.json();
      return result;
    } catch (error) {
      console.error('Upload service error:', error);
      throw error;
    }
  }

  /**
   * Get stored auth token
   */
  private getAuthToken(): string {
    // Get token from localStorage - matching the auth service pattern
    const sessionStr = localStorage.getItem('tuiz_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        const token = session?.access_token || '';
        console.log('UploadService: Getting auth token', {
          hasSession: !!sessionStr,
          hasToken: !!token,
          tokenLength: token?.length || 0,
        });
        return token;
      } catch (error) {
        console.error('UploadService: Error parsing session', error);
        return '';
      }
    }
    console.log('UploadService: No session found in localStorage');
    return '';
  }

  /**
   * Validate file before upload
   */
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'ファイルサイズが大きすぎます。最大10MBまでです。',
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'サポートされていないファイル形式です。JPEG、PNG、WebP、GIFのみ対応しています。',
      };
    }

    return { isValid: true };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const uploadService = new UploadService();

// ============================================================================
// REACT HOOK
// ============================================================================

/**
 * Hook for uploading files with loading state and error handling
 */
export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadQuizThumbnail = async (file: File, quizId: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      // Validate file
      const validation = uploadService.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev: number) => Math.min(prev + 10, 90));
      }, 100);

      const result = await uploadService.uploadQuizThumbnail(file, quizId);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('画像がアップロードされました');
      return result.url;
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
    uploadQuizThumbnail,
    isUploading,
    uploadProgress,
    error,
  };
}
