// ====================================================
// File Name   : useProfile.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-16
// Last Update : 2025-09-16
//
// Description:
// - Custom hooks for profile management with React Query
// - Provides hooks for fetching and updating user profile data
// - Handles username, display name, and avatar operations
// - Includes combined hook for comprehensive profile management
//
// Notes:
// - Uses React Query for data fetching and caching
// - Implements optimistic cache updates for better UX
// - Avatar upload includes progress simulation for better UX
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

import {
  profileService,
  type ProfileData,
  type UpdateUsernameRequest,
  type UpdateDisplayNameRequest,
} from '@/lib/profileService';

import type { ApiError } from '@/types/api';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const STALE_TIME_PROFILE_MS = 5 * 60 * 1000;
const RETRY_COUNT_PROFILE = 2;

const QUERY_KEY_PROFILE = 'profile';
const QUERY_KEY_CURRENT = 'current';

const PROGRESS_INCREMENT = 10;
const PROGRESS_MAX_SIMULATED = 90;
const PROGRESS_INTERVAL_MS = 100;
const PROGRESS_RESET_DELAY_MS = 1000;

const TOAST_MESSAGES = {
  USERNAME_UPDATED: 'ユーザー名が更新されました',
  DISPLAY_NAME_UPDATED: '表示名が更新されました',
  AVATAR_UPLOADED: 'アバターがアップロードされました',
  AVATAR_DELETED: 'アバターが削除されました',
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
export const PROFILE_QUERY_KEYS = {
  all: [QUERY_KEY_PROFILE] as const,
  profile: () => [...PROFILE_QUERY_KEYS.all, QUERY_KEY_CURRENT] as const,
} as const;

/**
 * Hook: useProfile
 * Description:
 * - Fetches the current user's profile data
 * - Caches results for 5 minutes (stale time)
 * - Retries up to 2 times on failure
 *
 * Returns:
 * - TanStack Query result object with profile data, loading state, and error
 */
export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.profile(),
    queryFn: () => profileService.getProfile(),
    staleTime: STALE_TIME_PROFILE_MS,
    retry: RETRY_COUNT_PROFILE,
  });
}

/**
 * Hook: useUpdateUsername
 * Description:
 * - Updates the user's username
 * - Optimistically updates the profile cache
 * - Shows success toast notification
 *
 * Returns:
 * - TanStack Query mutation object with updateUsername function and state
 */
export function useUpdateUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUsernameRequest) => profileService.updateUsername(data.username),
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEYS.profile(), (oldData: ProfileData | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            username: data.username,
            updatedAt: data.updatedAt,
          };
        }
        return oldData;
      });

      toast.success(TOAST_MESSAGES.USERNAME_UPDATED);
    },
  });
}

/**
 * Hook: useUpdateDisplayName
 * Description:
 * - Updates the user's display name
 * - Optimistically updates the profile cache
 * - Shows success toast notification
 *
 * Returns:
 * - TanStack Query mutation object with updateDisplayName function and state
 */
export function useUpdateDisplayName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDisplayNameRequest) =>
      profileService.updateDisplayName(data.displayName),
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEYS.profile(), (oldData: ProfileData | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            displayName: data.displayName,
            updatedAt: data.updatedAt,
          };
        }
        return oldData;
      });

      toast.success(TOAST_MESSAGES.DISPLAY_NAME_UPDATED);
    },
  });
}

/**
 * Hook: useUploadAvatar
 * Description:
 * - Uploads a new avatar image for the user
 * - Simulates upload progress for better UX
 * - Optimistically updates the profile cache
 * - Shows success toast notification
 *
 * Returns:
 * - Object containing:
 *   - uploadAvatar (function): Function to trigger avatar upload
 *   - isUploading (boolean): Loading state for upload operation
 *   - uploadProgress (number): Upload progress percentage (0-100)
 *   - error (ApiError | null): Error object if upload failed
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(file),
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEYS.profile(), (oldData: ProfileData | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            avatarUrl: data.url,
            updatedAt: new Date().toISOString(),
          };
        }
        return oldData;
      });

      toast.success(TOAST_MESSAGES.AVATAR_UPLOADED);
    },
  });

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const uploadAvatar = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      progressIntervalRef.current = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + PROGRESS_INCREMENT, PROGRESS_MAX_SIMULATED));
      }, PROGRESS_INTERVAL_MS);

      await mutation.mutateAsync(file);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setUploadProgress(100);
    } catch {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } finally {
      setIsUploading(false);
      resetTimeoutRef.current = setTimeout(() => {
        setUploadProgress(0);
        resetTimeoutRef.current = null;
      }, PROGRESS_RESET_DELAY_MS);
    }
  };

  return {
    uploadAvatar,
    isUploading,
    uploadProgress,
    error: mutation.error as ApiError | null,
  };
}

/**
 * Hook: useDeleteAvatar
 * Description:
 * - Deletes the user's current avatar
 * - Optimistically updates the profile cache
 * - Shows success toast notification
 *
 * Returns:
 * - TanStack Query mutation object with deleteAvatar function and state
 */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => profileService.deleteAvatar(),
    onSuccess: () => {
      queryClient.setQueryData(PROFILE_QUERY_KEYS.profile(), (oldData: ProfileData | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            avatarUrl: null,
            updatedAt: new Date().toISOString(),
          };
        }
        return oldData;
      });

      toast.success(TOAST_MESSAGES.AVATAR_DELETED);
    },
  });
}

/**
 * Hook: useProfileManagement
 * Description:
 * - Combined hook that provides all profile management operations
 * - Aggregates profile data, mutations, and loading states
 * - Convenient single hook for comprehensive profile management
 *
 * Returns:
 * - Object containing:
 *   - profile (ProfileData | undefined): Current profile data
 *   - isLoading (boolean): Loading state for profile fetch
 *   - isError (boolean): Error state for profile fetch
 *   - error (ApiError | null): Error object if profile fetch failed
 *   - updateUsername (function): Function to update username
 *   - isUpdatingUsername (boolean): Loading state for username update
 *   - usernameError (ApiError | null): Error object if username update failed
 *   - updateDisplayName (function): Function to update display name
 *   - isUpdatingDisplayName (boolean): Loading state for display name update
 *   - displayNameError (ApiError | null): Error object if display name update failed
 *   - uploadAvatar (function): Function to upload avatar
 *   - isUploadingAvatar (boolean): Loading state for avatar upload
 *   - uploadProgress (number): Upload progress percentage
 *   - uploadError (ApiError | null): Error object if avatar upload failed
 *   - deleteAvatar (function): Function to delete avatar
 *   - isDeletingAvatar (boolean): Loading state for avatar deletion
 *   - deleteError (ApiError | null): Error object if avatar deletion failed
 *   - refetch (function): Function to manually refetch profile data
 */
export function useProfileManagement() {
  const profileQuery = useProfile();
  const updateUsernameMutation = useUpdateUsername();
  const updateDisplayNameMutation = useUpdateDisplayName();
  const uploadAvatarHook = useUploadAvatar();
  const deleteAvatarMutation = useDeleteAvatar();

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error as ApiError | null,

    updateUsername: updateUsernameMutation.mutate,
    isUpdatingUsername: updateUsernameMutation.isPending,
    usernameError: updateUsernameMutation.error as ApiError | null,

    updateDisplayName: updateDisplayNameMutation.mutate,
    isUpdatingDisplayName: updateDisplayNameMutation.isPending,
    displayNameError: updateDisplayNameMutation.error as ApiError | null,

    uploadAvatar: uploadAvatarHook.uploadAvatar,
    isUploadingAvatar: uploadAvatarHook.isUploading,
    uploadProgress: uploadAvatarHook.uploadProgress,
    uploadError: uploadAvatarHook.error,

    deleteAvatar: deleteAvatarMutation.mutate,
    isDeletingAvatar: deleteAvatarMutation.isPending,
    deleteError: deleteAvatarMutation.error as ApiError | null,

    refetch: profileQuery.refetch,
  };
}

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
