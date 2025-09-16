// src/lib/profileService.ts
// Service for handling user profile operations via backend API

import { apiClient, handleApiError } from './apiClient';
import { uploadService } from './uploadService';
import type { ApiError } from '@/types/api';

// ============================================================================
// TYPES
// ============================================================================

export interface ProfileData {
  id: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastActive: string | null;
}

export interface UpdateUsernameRequest {
  username: string;
}

export interface UpdateDisplayNameRequest {
  displayName: string;
}

export interface UpdateUsernameResponse {
  username: string;
  updatedAt: string;
}

export interface UpdateDisplayNameResponse {
  displayName: string;
  updatedAt: string;
}

export interface AvatarUploadResponse {
  url: string;
  path: string;
}

export interface AvatarDeleteResponse {
  message: string;
}

// ============================================================================
// PROFILE SERVICE CLASS
// ============================================================================

class ProfileService {
  /**
   * Get current user's profile
   */
  async getProfile(): Promise<ProfileData> {
    try {
      const response = await apiClient.get<ProfileData>('/profile');
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      handleApiError(apiError, {
        customMessage: 'プロフィールの取得に失敗しました',
      });
      throw apiError;
    }
  }

  /**
   * Update user's username
   */
  async updateUsername(username: string): Promise<UpdateUsernameResponse> {
    try {
      const response = await apiClient.put<UpdateUsernameResponse>('/profile/username', {
        username,
      });
      return response;
    } catch (error) {
      const apiError = error as ApiError;

      // Handle specific username errors
      if (apiError.error === 'username_taken') {
        handleApiError(apiError, {
          customMessage: 'このユーザー名は既に使用されています',
        });
      } else if (apiError.error === 'validation_error') {
        handleApiError(apiError, {
          customMessage: 'ユーザー名の形式が正しくありません',
        });
      } else {
        handleApiError(apiError, {
          customMessage: 'ユーザー名の更新に失敗しました',
        });
      }

      throw apiError;
    }
  }

  /**
   * Update user's display name
   */
  async updateDisplayName(displayName: string): Promise<UpdateDisplayNameResponse> {
    try {
      const response = await apiClient.put<UpdateDisplayNameResponse>('/profile/display-name', {
        displayName,
      });
      return response;
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.error === 'validation_error') {
        handleApiError(apiError, {
          customMessage: '表示名の形式が正しくありません',
        });
      } else {
        handleApiError(apiError, {
          customMessage: '表示名の更新に失敗しました',
        });
      }

      throw apiError;
    }
  }

  /**
   * Upload user's avatar
   */
  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    try {
      // Validate file first
      const validation = uploadService.validateImageFile(file);
      if (!validation.isValid) {
        const apiError: ApiError = {
          error: 'validation_failed',
          message: validation.error || 'Invalid file format',
        };
        handleApiError(apiError, {
          customMessage: validation.error || 'ファイルの形式が正しくありません',
        });
        throw apiError;
      }

      const formData = new FormData();
      formData.append('avatar', file);

      // Use fetch directly for file uploads with auth header
      const token = this.getAuthToken();
      const response = await fetch(`${this.getBaseUrl()}/profile/avatar`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw errorData;
      }

      const result: AvatarUploadResponse = await response.json();
      return result;
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.error === 'no_file') {
        handleApiError(apiError, {
          customMessage: 'ファイルが選択されていません',
        });
      } else if (apiError.error === 'upload_failed') {
        handleApiError(apiError, {
          customMessage: 'アバターのアップロードに失敗しました',
        });
      } else {
        handleApiError(apiError, {
          customMessage: 'アバターのアップロードに失敗しました',
        });
      }

      throw apiError;
    }
  }

  /**
   * Delete user's avatar
   */
  async deleteAvatar(): Promise<AvatarDeleteResponse> {
    try {
      const response = await apiClient.delete<AvatarDeleteResponse>('/profile/avatar');
      return response;
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.error === 'no_avatar') {
        handleApiError(apiError, {
          customMessage: '削除するアバターがありません',
        });
      } else {
        handleApiError(apiError, {
          customMessage: 'アバターの削除に失敗しました',
        });
      }

      throw apiError;
    }
  }

  /**
   * Get stored auth token
   */
  private getAuthToken(): string {
    const sessionStr = localStorage.getItem('tuiz_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        return session?.access_token || '';
      } catch (error) {
        console.error('ProfileService: Error parsing session', error);
        return '';
      }
    }
    return '';
  }

  /**
   * Get base URL from config
   */
  private getBaseUrl(): string {
    // Import config dynamically to avoid circular dependencies
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { cfg } = require('@/config/config');
    return cfg.apiBase;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const profileService = new ProfileService();
