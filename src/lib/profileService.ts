// ====================================================
// File Name   : profileService.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-16
// Last Update : 2025-09-16
//
// Description:
// - Service for handling user profile operations via backend API
// - Provides methods for fetching, updating profile data and avatar management
// - Handles username, display name, and avatar upload/delete operations
//
// Notes:
// - Uses apiClient for most operations, fetch directly for file uploads
// - Validates avatar files before upload
// - Provides Japanese error messages for user-facing errors
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { apiClient, handleApiError } from './apiClient';
import { uploadService } from './uploadService';
import type { ApiError } from '@/types/api';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const STORAGE_KEY_SESSION = 'tuiz_session';

const API_ENDPOINT_PROFILE = '/profile';
const API_ENDPOINT_USERNAME = '/profile/username';
const API_ENDPOINT_DISPLAY_NAME = '/profile/display-name';
const API_ENDPOINT_AVATAR = '/profile/avatar';

const FORM_DATA_FIELD_AVATAR = 'avatar';
const HTTP_METHOD_POST = 'POST';
const AUTH_BEARER_PREFIX = 'Bearer ';

const ERROR_CODE_USERNAME_TAKEN = 'username_taken';
const ERROR_CODE_VALIDATION_ERROR = 'validation_error';
const ERROR_CODE_VALIDATION_FAILED = 'validation_failed';
const ERROR_CODE_NO_FILE = 'no_file';
const ERROR_CODE_UPLOAD_FAILED = 'upload_failed';
const ERROR_CODE_NO_AVATAR = 'no_avatar';

const ERROR_MESSAGE_INVALID_FILE_FORMAT = 'Invalid file format';
const ERROR_MESSAGE_DEFAULT_FILE_FORMAT = 'ファイルの形式が正しくありません';

const ERROR_MESSAGES = {
  GET_PROFILE_FAILED: 'プロフィールの取得に失敗しました',
  USERNAME_TAKEN: 'このユーザー名は既に使用されています',
  USERNAME_VALIDATION_ERROR: 'ユーザー名の形式が正しくありません',
  USERNAME_UPDATE_FAILED: 'ユーザー名の更新に失敗しました',
  DISPLAY_NAME_VALIDATION_ERROR: '表示名の形式が正しくありません',
  DISPLAY_NAME_UPDATE_FAILED: '表示名の更新に失敗しました',
  NO_FILE_SELECTED: 'ファイルが選択されていません',
  AVATAR_UPLOAD_FAILED: 'アバターのアップロードに失敗しました',
  NO_AVATAR_TO_DELETE: '削除するアバターがありません',
  AVATAR_DELETE_FAILED: 'アバターの削除に失敗しました',
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Interface: ProfileData
 * Description:
 * - Complete user profile data structure
 * - Contains user identification, display information, and timestamps
 */
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

/**
 * Interface: UpdateUsernameRequest
 * Description:
 * - Request payload for updating username
 */
export interface UpdateUsernameRequest {
  username: string;
}

/**
 * Interface: UpdateDisplayNameRequest
 * Description:
 * - Request payload for updating display name
 */
export interface UpdateDisplayNameRequest {
  displayName: string;
}

/**
 * Interface: UpdateUsernameResponse
 * Description:
 * - Response from username update operation
 * - Contains updated username and timestamp
 */
export interface UpdateUsernameResponse {
  username: string;
  updatedAt: string;
}

/**
 * Interface: UpdateDisplayNameResponse
 * Description:
 * - Response from display name update operation
 * - Contains updated display name and timestamp
 */
export interface UpdateDisplayNameResponse {
  displayName: string;
  updatedAt: string;
}

/**
 * Interface: AvatarUploadResponse
 * Description:
 * - Response from avatar upload operation
 * - Contains uploaded avatar URL and storage path
 */
export interface AvatarUploadResponse {
  url: string;
  path: string;
}

/**
 * Interface: AvatarDeleteResponse
 * Description:
 * - Response from avatar delete operation
 * - Contains success message
 */
export interface AvatarDeleteResponse {
  message: string;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Class: ProfileService
 * Description:
 * - Service for managing user profile operations
 * - Handles profile data retrieval, updates, and avatar management
 */
class ProfileService {
  /**
   * Method: getProfile
   * Description:
   * - Retrieves current user's profile data
   *
   * Returns:
   * - Promise<ProfileData>: User profile data
   *
   * Throws:
   * - ApiError: When profile retrieval fails
   */
  async getProfile(): Promise<ProfileData> {
    try {
      const response = await apiClient.get<ProfileData>(API_ENDPOINT_PROFILE);
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      handleApiError(apiError, {
        customMessage: ERROR_MESSAGES.GET_PROFILE_FAILED,
      });
      throw apiError;
    }
  }

  /**
   * Method: updateUsername
   * Description:
   * - Updates user's username
   * - Handles specific error cases (username taken, validation errors)
   *
   * Parameters:
   * - username (string): New username to set
   *
   * Returns:
   * - Promise<UpdateUsernameResponse>: Updated username and timestamp
   *
   * Throws:
   * - ApiError: When username update fails
   */
  async updateUsername(username: string): Promise<UpdateUsernameResponse> {
    try {
      const response = await apiClient.put<UpdateUsernameResponse>(API_ENDPOINT_USERNAME, {
        username,
      });
      return response;
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.error === ERROR_CODE_USERNAME_TAKEN) {
        handleApiError(apiError, {
          customMessage: ERROR_MESSAGES.USERNAME_TAKEN,
        });
      } else if (apiError.error === ERROR_CODE_VALIDATION_ERROR) {
        handleApiError(apiError, {
          customMessage: ERROR_MESSAGES.USERNAME_VALIDATION_ERROR,
        });
      } else {
        handleApiError(apiError, {
          customMessage: ERROR_MESSAGES.USERNAME_UPDATE_FAILED,
        });
      }

      throw apiError;
    }
  }

  /**
   * Method: updateDisplayName
   * Description:
   * - Updates user's display name
   * - Handles validation errors
   *
   * Parameters:
   * - displayName (string): New display name to set
   *
   * Returns:
   * - Promise<UpdateDisplayNameResponse>: Updated display name and timestamp
   *
   * Throws:
   * - ApiError: When display name update fails
   */
  async updateDisplayName(displayName: string): Promise<UpdateDisplayNameResponse> {
    try {
      const response = await apiClient.put<UpdateDisplayNameResponse>(API_ENDPOINT_DISPLAY_NAME, {
        displayName,
      });
      return response;
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.error === ERROR_CODE_VALIDATION_ERROR) {
        handleApiError(apiError, {
          customMessage: ERROR_MESSAGES.DISPLAY_NAME_VALIDATION_ERROR,
        });
      } else {
        handleApiError(apiError, {
          customMessage: ERROR_MESSAGES.DISPLAY_NAME_UPDATE_FAILED,
        });
      }

      throw apiError;
    }
  }

  /**
   * Method: uploadAvatar
   * Description:
   * - Uploads user's avatar image
   * - Validates file before upload
   * - Uses fetch directly for file uploads with authentication
   *
   * Parameters:
   * - file (File): Avatar image file to upload
   *
   * Returns:
   * - Promise<AvatarUploadResponse>: Upload result with URL and path
   *
   * Throws:
   * - ApiError: When avatar upload fails
   */
  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    try {
      const validation = uploadService.validateImageFile(file);
      if (!validation.isValid) {
        const apiError: ApiError = {
          error: ERROR_CODE_VALIDATION_FAILED,
          message: validation.error || ERROR_MESSAGE_INVALID_FILE_FORMAT,
        };
        handleApiError(apiError, {
          customMessage: validation.error || ERROR_MESSAGE_DEFAULT_FILE_FORMAT,
        });
        throw apiError;
      }

      const formData = new FormData();
      formData.append(FORM_DATA_FIELD_AVATAR, file);

      const token = this.getAuthToken();
      const response = await fetch(`${this.getBaseUrl()}${API_ENDPOINT_AVATAR}`, {
        method: HTTP_METHOD_POST,
        body: formData,
        headers: {
          Authorization: `${AUTH_BEARER_PREFIX}${token}`,
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

      if (apiError.error === ERROR_CODE_NO_FILE) {
        handleApiError(apiError, {
          customMessage: ERROR_MESSAGES.NO_FILE_SELECTED,
        });
      } else if (apiError.error === ERROR_CODE_UPLOAD_FAILED) {
        handleApiError(apiError, {
          customMessage: ERROR_MESSAGES.AVATAR_UPLOAD_FAILED,
        });
      } else {
        handleApiError(apiError, {
          customMessage: ERROR_MESSAGES.AVATAR_UPLOAD_FAILED,
        });
      }

      throw apiError;
    }
  }

  /**
   * Method: deleteAvatar
   * Description:
   * - Deletes user's avatar image
   *
   * Returns:
   * - Promise<AvatarDeleteResponse>: Delete result with success message
   *
   * Throws:
   * - ApiError: When avatar deletion fails
   */
  async deleteAvatar(): Promise<AvatarDeleteResponse> {
    try {
      const response = await apiClient.delete<AvatarDeleteResponse>(API_ENDPOINT_AVATAR);
      return response;
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.error === ERROR_CODE_NO_AVATAR) {
        handleApiError(apiError, {
          customMessage: ERROR_MESSAGES.NO_AVATAR_TO_DELETE,
        });
      } else {
        handleApiError(apiError, {
          customMessage: ERROR_MESSAGES.AVATAR_DELETE_FAILED,
        });
      }

      throw apiError;
    }
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
        console.error('ProfileService: Error parsing session', error);
        return '';
      }
    }
    return '';
  }

  /**
   * Method: getBaseUrl
   * Description:
   * - Retrieves API base URL from configuration
   * - Uses dynamic require to avoid circular dependencies
   *
   * Returns:
   * - string: API base URL
   */
  private getBaseUrl(): string {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { cfg } = require('@/config/config');
    return cfg.apiBase;
  }
}

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
export const profileService = new ProfileService();
