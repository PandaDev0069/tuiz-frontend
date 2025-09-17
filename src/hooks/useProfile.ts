// src/hooks/useProfile.ts
// Custom hook for profile management with React Query

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  profileService,
  type ProfileData,
  type UpdateUsernameRequest,
  type UpdateDisplayNameRequest,
} from '@/lib/profileService';
import type { ApiError } from '@/types/api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const profileKeys = {
  all: ['profile'] as const,
  profile: () => [...profileKeys.all, 'current'] as const,
};

// ============================================================================
// PROFILE QUERY HOOK
// ============================================================================

/**
 * Hook to fetch current user's profile
 */
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.profile(),
    queryFn: () => profileService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// ============================================================================
// PROFILE MUTATION HOOKS
// ============================================================================

/**
 * Hook to update username
 */
export function useUpdateUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUsernameRequest) => profileService.updateUsername(data.username),
    onSuccess: (data) => {
      // Update the profile cache
      queryClient.setQueryData(profileKeys.profile(), (oldData: ProfileData | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            username: data.username,
            updatedAt: data.updatedAt,
          };
        }
        return oldData;
      });

      toast.success('ユーザー名が更新されました');
    },
    onError: (error: ApiError) => {
      console.error('Username update error:', error);
    },
  });
}

/**
 * Hook to update display name
 */
export function useUpdateDisplayName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDisplayNameRequest) =>
      profileService.updateDisplayName(data.displayName),
    onSuccess: (data) => {
      // Update the profile cache
      queryClient.setQueryData(profileKeys.profile(), (oldData: ProfileData | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            displayName: data.displayName,
            updatedAt: data.updatedAt,
          };
        }
        return oldData;
      });

      toast.success('表示名が更新されました');
    },
    onError: (error: ApiError) => {
      console.error('Display name update error:', error);
    },
  });
}

/**
 * Hook to upload avatar
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(file),
    onSuccess: (data) => {
      // Update the profile cache
      queryClient.setQueryData(profileKeys.profile(), (oldData: ProfileData | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            avatarUrl: data.url,
            updatedAt: new Date().toISOString(),
          };
        }
        return oldData;
      });

      toast.success('アバターがアップロードされました');
    },
    onError: (error: ApiError) => {
      console.error('Avatar upload error:', error);
    },
  });

  const uploadAvatar = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      await mutation.mutateAsync(file);

      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (error) {
      // Error handling is done in the mutation and service layer
      // The error will be displayed via toast notifications
      console.error('Avatar upload failed:', error);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
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
 * Hook to delete avatar
 */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => profileService.deleteAvatar(),
    onSuccess: () => {
      // Update the profile cache
      queryClient.setQueryData(profileKeys.profile(), (oldData: ProfileData | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            avatarUrl: null,
            updatedAt: new Date().toISOString(),
          };
        }
        return oldData;
      });

      toast.success('アバターが削除されました');
    },
    onError: (error: ApiError) => {
      console.error('Avatar delete error:', error);
    },
  });
}

// ============================================================================
// COMBINED PROFILE MANAGEMENT HOOK
// ============================================================================

/**
 * Combined hook for all profile operations
 */
export function useProfileManagement() {
  const profileQuery = useProfile();
  const updateUsernameMutation = useUpdateUsername();
  const updateDisplayNameMutation = useUpdateDisplayName();
  const uploadAvatarHook = useUploadAvatar();
  const deleteAvatarMutation = useDeleteAvatar();

  return {
    // Profile data
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error as ApiError | null,

    // Username operations
    updateUsername: updateUsernameMutation.mutate,
    isUpdatingUsername: updateUsernameMutation.isPending,
    usernameError: updateUsernameMutation.error as ApiError | null,

    // Display name operations
    updateDisplayName: updateDisplayNameMutation.mutate,
    isUpdatingDisplayName: updateDisplayNameMutation.isPending,
    displayNameError: updateDisplayNameMutation.error as ApiError | null,

    // Avatar operations
    uploadAvatar: uploadAvatarHook.uploadAvatar,
    isUploadingAvatar: uploadAvatarHook.isUploading,
    uploadProgress: uploadAvatarHook.uploadProgress,
    uploadError: uploadAvatarHook.error,

    deleteAvatar: deleteAvatarMutation.mutate,
    isDeletingAvatar: deleteAvatarMutation.isPending,
    deleteError: deleteAvatarMutation.error as ApiError | null,

    // Utility functions
    refetch: profileQuery.refetch,
  };
}
