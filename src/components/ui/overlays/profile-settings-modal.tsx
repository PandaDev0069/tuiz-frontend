// ====================================================
// File Name   : profile-settings-modal.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-25
// Last Update : 2025-09-16
//
// Description:
// - Profile settings modal component for managing user profile
// - Handles avatar upload, username, and display name updates
// - Includes custom hooks for avatar and form management
// - Supports loading states and error handling
//
// Notes:
// - Client component (uses 'use client' directive)
// - Uses React hooks for state management
// - Uses Next.js Image component for optimized images
// ====================================================

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../core/button';
import { Card, CardHeader, CardTitle, CardContent } from '../core/card';
import { Input } from '../forms/input';
import { Text } from '../core/typography';
import { cn } from '@/lib/utils';
import { X, Upload, User, Mail, Edit3, Save, Camera, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useProfileManagement } from '@/hooks/useProfile';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

const DEFAULT_FORM_DATA: ProfileData = {
  username: '',
  displayName: '',
  email: '',
  avatarUrl: '',
};

const OVERLAY_CLASSES = 'fixed inset-0 z-[9998] flex items-center justify-center';
const BACKDROP_CLASSES = 'absolute inset-0 bg-black/50 backdrop-blur-sm';
const MODAL_CONTAINER_CLASSES =
  'relative w-full max-w-2xl mx-4 px-4 sm:px-0 max-h-[90vh] overflow-y-auto';
const CARD_CLASSES =
  'relative bg-gradient-to-br from-rose-200 via-purple-300 to-indigo-400 shadow-2xl border-0';
const LOADING_CARD_CLASSES =
  'relative bg-gradient-to-br from-rose-200 via-purple-300 to-indigo-400 shadow-2xl border-0';
const LOADING_CONTENT_CLASSES = 'flex items-center justify-center py-12';
const LOADING_SPINNER_CLASSES = 'h-8 w-8 animate-spin text-purple-700';
const HEADER_CLASSES = 'flex flex-row items-center justify-between space-y-0 pb-4 px-4 sm:px-6';
const HEADER_ICON_WRAPPER_CLASSES =
  'p-2 bg-gradient-to-br from-orange-200 to-pink-300 rounded-lg shadow-md';
const HEADER_ICON_CLASSES = 'h-5 w-5 text-purple-700';
const CLOSE_BUTTON_CLASSES =
  'h-8 w-8 bg-gradient-to-br from-red-200 to-pink-300 hover:from-red-300 hover:to-pink-400 text-red-700 hover:text-red-800 rounded-full';
const CLOSE_ICON_CLASSES = 'h-4 w-4';
const CONTENT_CLASSES = 'space-y-6 px-4 sm:px-6';
const AVATAR_SECTION_CLASSES = 'flex flex-col items-center space-y-4';
const AVATAR_WRAPPER_CLASSES =
  'relative w-24 h-24 rounded-full overflow-hidden border-4 flex items-center justify-center shadow-lg';
const AVATAR_BORDER_WITH_IMAGE_CLASSES = 'border-gradient-to-r from-emerald-400 to-cyan-500';
const AVATAR_BORDER_WITHOUT_IMAGE_CLASSES =
  'border-dashed border-pink-400 bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200';
const AVATAR_OVERLAY_CLASSES =
  'absolute inset-0 bg-gradient-to-br from-purple-600/60 to-pink-600/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center';
const AVATAR_CAMERA_BUTTON_CLASSES =
  'h-full w-full text-yellow-200 hover:bg-gradient-to-br hover:from-orange-400/30 hover:to-yellow-400/30';
const AVATAR_CAMERA_ICON_CLASSES = 'h-full w-full';
const AVATAR_PLACEHOLDER_CLASSES = 'h-12 w-12 text-purple-600';
const FILE_INPUT_CLASSES = 'hidden';
const AVATAR_BUTTONS_CONTAINER_CLASSES = 'flex gap-2';
const UPLOAD_BUTTON_CLASSES =
  'flex items-center gap-2 border-2 border-cyan-400 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 hover:from-cyan-200 hover:to-blue-200 hover:border-cyan-500 transition-all duration-200 shadow-md';
const UPLOAD_ICON_CLASSES = 'h-4 w-4';
const DELETE_BUTTON_CLASSES =
  'text-red-700 hover:text-red-800 bg-gradient-to-r from-red-200 to-pink-200 hover:from-red-300 hover:to-pink-300 border-2 border-red-400 hover:border-red-500 shadow-md disabled:opacity-50';
const DELETE_SPINNER_CLASSES = 'h-4 w-4 animate-spin mr-2';
const PROFILE_INFO_CLASSES = 'space-y-4';
const PROFILE_GRID_CLASSES = 'grid grid-cols-1 md:grid-cols-2 gap-4';
const FIELD_CONTAINER_CLASSES = 'space-y-2';
const LABEL_ICON_CLASSES = 'h-4 w-4';
const USERNAME_LABEL_CLASSES = 'text-sm font-semibold text-blue-700 flex items-center gap-2';
const DISPLAY_NAME_LABEL_CLASSES = 'text-sm font-semibold text-green-700 flex items-center gap-2';
const EMAIL_LABEL_CLASSES = 'text-sm font-semibold text-purple-700 flex items-center gap-2';
const USERNAME_INPUT_CLASSES =
  'border-2 border-blue-400 bg-gradient-to-r from-blue-100 to-cyan-100 text-gray-800 placeholder:text-blue-500 transition-all duration-200 shadow-md';
const DISPLAY_NAME_INPUT_CLASSES =
  'border-2 border-green-400 bg-gradient-to-r from-green-100 to-emerald-100 text-gray-800 placeholder:text-green-500 transition-all duration-200 shadow-md';
const USERNAME_DISPLAY_CLASSES =
  'p-3 bg-gradient-to-r from-blue-100 to-cyan-150 rounded-lg border-2 border-blue-300 shadow-md';
const DISPLAY_NAME_DISPLAY_CLASSES =
  'p-3 bg-gradient-to-r from-green-100 to-emerald-150 rounded-lg border-2 border-green-300 shadow-md';
const EMAIL_DISPLAY_CLASSES =
  'p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300 shadow-md';
const USERNAME_TEXT_CLASSES = 'font-semibold text-blue-800';
const DISPLAY_NAME_TEXT_CLASSES = 'font-semibold text-green-800';
const EMAIL_TEXT_CLASSES = 'font-semibold text-purple-800';
const EMAIL_HELP_TEXT_CLASSES = 'text-sm text-purple-700 mt-1';
const ACTION_BUTTONS_CLASSES = 'flex justify-end gap-3 pt-4 border-t';
const SAVE_BUTTON_CLASSES = 'flex items-center gap-2 disabled:opacity-50';
const SAVE_SPINNER_CLASSES = 'h-4 w-4 animate-spin';
const SAVE_ICON_CLASSES = 'h-4 w-4';
const EDIT_BUTTON_CLASSES = 'flex items-center gap-2';

export interface ProfileData {
  username: string;
  displayName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
}

export interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: ProfileData;
  onSave?: (profile: ProfileData) => void;
}

/**
 * Hook: useAvatarHandling
 * Description:
 * - Custom hook for managing avatar upload and deletion
 * - Handles file validation and preview
 * - Manages file input ref and avatar preview state
 *
 * Parameters:
 * - profile (ProfileData): Current profile data
 * - uploadAvatar (function): Function to upload avatar
 * - deleteAvatar (function): Function to delete avatar
 *
 * Returns:
 * - Object containing avatarPreview, fileInputRef, handleAvatarUpload, handleDeleteAvatar
 *
 * Example:
 * ```ts
 * const { avatarPreview, fileInputRef, handleAvatarUpload, handleDeleteAvatar } = useAvatarHandling(profile, uploadAvatar, deleteAvatar);
 * ```
 */
const useAvatarHandling = (
  profile: ProfileData,
  uploadAvatar: (file: File) => Promise<void>,
  deleteAvatar: () => Promise<void>,
) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvatarPreview(profile.avatarUrl || null);
  }, [profile.avatarUrl]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const { toast } = await import('react-hot-toast');
      toast.error('ファイルサイズが大きすぎます。最大5MBまでです。');
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type as (typeof ALLOWED_FILE_TYPES)[number])) {
      const { toast } = await import('react-hot-toast');
      toast.error('サポートされていないファイル形式です。JPEG、PNG、WebP、GIFのみ対応しています。');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
      await uploadAvatar(file);
    } catch {
      setAvatarPreview(profile.avatarUrl || null);
    }
  };

  const handleDeleteAvatar = async (): Promise<void> => {
    try {
      await deleteAvatar();
      setAvatarPreview(null);
    } catch (error) {
      console.error('Avatar delete error:', error);
    }
  };

  return {
    avatarPreview,
    fileInputRef,
    handleAvatarUpload,
    handleDeleteAvatar,
  };
};

/**
 * Hook: useFormManagement
 * Description:
 * - Custom hook for managing form state and editing mode
 * - Tracks form changes and handles input updates
 * - Manages edit mode and cancel functionality
 *
 * Parameters:
 * - profile (ProfileData): Current profile data
 *
 * Returns:
 * - Object containing isEditing, formData, hasChanges, setIsEditing, handleInputChange, handleCancel
 *
 * Example:
 * ```ts
 * const { isEditing, formData, hasChanges, setIsEditing, handleInputChange, handleCancel } = useFormManagement(profile);
 * ```
 */
const useFormManagement = (profile: ProfileData) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>(DEFAULT_FORM_DATA);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(formData);

  const handleInputChange = (field: keyof ProfileData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = (): void => {
    setFormData(profile);
    setIsEditing(false);
  };

  return {
    isEditing,
    formData,
    hasChanges,
    setIsEditing,
    handleInputChange,
    handleCancel,
  };
};

/**
 * Component: AvatarSection
 * Description:
 * - Displays avatar with upload and delete functionality
 * - Shows preview of uploaded avatar or placeholder
 * - Handles file input and camera button interactions
 *
 * Parameters:
 * - avatarPreview (string | null): Preview URL of avatar
 * - fileInputRef (React.RefObject<HTMLInputElement | null>): Ref to file input
 * - onAvatarUpload (function): Handler for avatar upload
 * - onDeleteAvatar (function): Handler for avatar deletion
 * - isDeletingAvatar (boolean): Whether avatar is being deleted
 *
 * Returns:
 * - React.ReactElement: The avatar section component
 */
const AvatarSection: React.FC<{
  avatarPreview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteAvatar: () => void;
  isDeletingAvatar: boolean;
}> = ({ avatarPreview, fileInputRef, onAvatarUpload, onDeleteAvatar, isDeletingAvatar }) => (
  <div className={AVATAR_SECTION_CLASSES}>
    <div className="relative group">
      <div
        className={cn(
          AVATAR_WRAPPER_CLASSES,
          avatarPreview ? AVATAR_BORDER_WITH_IMAGE_CLASSES : AVATAR_BORDER_WITHOUT_IMAGE_CLASSES,
        )}
      >
        {avatarPreview ? (
          <Image
            src={avatarPreview}
            alt="プロフィールアバター"
            fill
            quality={95}
            className="object-cover rounded-full"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <User className={AVATAR_PLACEHOLDER_CLASSES} />
        )}
      </div>

      <div className={AVATAR_OVERLAY_CLASSES}>
        <Button
          variant="ghost"
          size="icon"
          className={AVATAR_CAMERA_BUTTON_CLASSES}
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className={AVATAR_CAMERA_ICON_CLASSES} />
        </Button>
      </div>
    </div>

    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={onAvatarUpload}
      className={FILE_INPUT_CLASSES}
    />

    <div className={AVATAR_BUTTONS_CONTAINER_CLASSES}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className={UPLOAD_BUTTON_CLASSES}
      >
        <Upload className={UPLOAD_ICON_CLASSES} />
        アップロード
      </Button>
      {avatarPreview && (
        <Button
          size="sm"
          onClick={onDeleteAvatar}
          disabled={isDeletingAvatar}
          className={DELETE_BUTTON_CLASSES}
        >
          {isDeletingAvatar ? (
            <>
              <Loader2 className={DELETE_SPINNER_CLASSES} />
              削除中...
            </>
          ) : (
            '削除'
          )}
        </Button>
      )}
    </div>
  </div>
);

/**
 * Component: ProfileInfoSection
 * Description:
 * - Displays profile information fields (username, display name, email)
 * - Supports edit mode with input fields
 * - Shows read-only fields when not editing
 *
 * Parameters:
 * - formData (ProfileData): Current form data
 * - isEditing (boolean): Whether in edit mode
 * - onInputChange (function): Handler for input changes
 *
 * Returns:
 * - React.ReactElement: The profile info section component
 */
const ProfileInfoSection: React.FC<{
  formData: ProfileData;
  isEditing: boolean;
  onInputChange: (field: keyof ProfileData, value: string) => void;
}> = ({ formData, isEditing, onInputChange }) => (
  <div className={PROFILE_INFO_CLASSES}>
    <div className={PROFILE_GRID_CLASSES}>
      <div className={FIELD_CONTAINER_CLASSES}>
        <label className={USERNAME_LABEL_CLASSES}>
          <User className={LABEL_ICON_CLASSES} />
          ユーザー名
        </label>
        {isEditing ? (
          <Input
            value={formData.username}
            onChange={(e) => onInputChange('username', e.target.value)}
            placeholder="ユーザー名を入力"
            className={USERNAME_INPUT_CLASSES}
          />
        ) : (
          <div className={USERNAME_DISPLAY_CLASSES}>
            <Text className={USERNAME_TEXT_CLASSES}>{formData.username}</Text>
          </div>
        )}
      </div>

      <div className={FIELD_CONTAINER_CLASSES}>
        <label className={DISPLAY_NAME_LABEL_CLASSES}>
          <Edit3 className={LABEL_ICON_CLASSES} />
          表示名
        </label>
        {isEditing ? (
          <Input
            value={formData.displayName}
            onChange={(e) => onInputChange('displayName', e.target.value)}
            placeholder="表示名を入力"
            className={DISPLAY_NAME_INPUT_CLASSES}
          />
        ) : (
          <div className={DISPLAY_NAME_DISPLAY_CLASSES}>
            <Text className={DISPLAY_NAME_TEXT_CLASSES}>{formData.displayName}</Text>
          </div>
        )}
      </div>
    </div>

    <div className={FIELD_CONTAINER_CLASSES}>
      <label className={EMAIL_LABEL_CLASSES}>
        <Mail className={LABEL_ICON_CLASSES} />
        メールアドレス
      </label>
      <div className={EMAIL_DISPLAY_CLASSES}>
        <Text className={EMAIL_TEXT_CLASSES}>{formData.email}</Text>
        <Text className={EMAIL_HELP_TEXT_CLASSES}>メールアドレスは変更できません</Text>
      </div>
    </div>
  </div>
);

/**
 * Component: ActionButtons
 * Description:
 * - Displays action buttons based on edit state and changes
 * - Shows edit, save, cancel, and close buttons
 * - Handles loading states for save operations
 *
 * Parameters:
 * - isEditing (boolean): Whether in edit mode
 * - hasChanges (boolean): Whether form has unsaved changes
 * - isUpdatingUsername (boolean): Whether username is being updated
 * - isUpdatingDisplayName (boolean): Whether display name is being updated
 * - onEdit (function): Handler for edit button
 * - onSave (function): Handler for save button
 * - onCancel (function): Handler for cancel button
 * - onClose (function): Handler for close button
 *
 * Returns:
 * - React.ReactElement: The action buttons component
 */
const ActionButtons: React.FC<{
  isEditing: boolean;
  hasChanges: boolean;
  isUpdatingUsername: boolean;
  isUpdatingDisplayName: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onClose: () => void;
}> = ({
  isEditing,
  hasChanges,
  isUpdatingUsername,
  isUpdatingDisplayName,
  onEdit,
  onSave,
  onCancel,
  onClose,
}) => (
  <div className={ACTION_BUTTONS_CLASSES}>
    {isEditing ? (
      <>
        <Button variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button
          variant="gradient2"
          onClick={onSave}
          disabled={isUpdatingUsername || isUpdatingDisplayName}
          className={SAVE_BUTTON_CLASSES}
        >
          {isUpdatingUsername || isUpdatingDisplayName ? (
            <>
              <Loader2 className={SAVE_SPINNER_CLASSES} />
              保存中...
            </>
          ) : (
            <>
              <Save className={SAVE_ICON_CLASSES} />
              保存
            </>
          )}
        </Button>
      </>
    ) : hasChanges ? (
      <>
        <Button variant="outline" onClick={onClose}>
          閉じる
        </Button>
        <Button
          variant="gradient2"
          onClick={onSave}
          disabled={isUpdatingUsername || isUpdatingDisplayName}
          className={SAVE_BUTTON_CLASSES}
        >
          {isUpdatingUsername || isUpdatingDisplayName ? (
            <>
              <Loader2 className={SAVE_SPINNER_CLASSES} />
              保存中...
            </>
          ) : (
            <>
              <Save className={SAVE_ICON_CLASSES} />
              変更を保存
            </>
          )}
        </Button>
      </>
    ) : (
      <>
        <Button variant="outline" onClick={onClose}>
          閉じる
        </Button>
        <Button variant="gradient2" onClick={onEdit} className={EDIT_BUTTON_CLASSES}>
          <Edit3 className={SAVE_ICON_CLASSES} />
          編集
        </Button>
      </>
    )}
  </div>
);

/**
 * Component: ProfileSettingsModal
 * Description:
 * - Modal component for managing user profile settings
 * - Handles avatar upload, username, and display name updates
 * - Supports loading states and error handling
 * - Returns null if modal is not open
 *
 * Parameters:
 * - isOpen (boolean): Whether the modal is open
 * - onClose (function): Callback to close the modal
 * - profile (ProfileData, optional): Initial profile data
 * - onSave (function, optional): Callback when profile is saved
 *
 * Returns:
 * - React.ReactElement | null: The profile settings modal component or null if not open
 *
 * Example:
 * ```tsx
 * <ProfileSettingsModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   profile={profileData}
 *   onSave={handleSave}
 * />
 * ```
 */
export function ProfileSettingsModal({
  isOpen,
  onClose,
  profile: propProfile,
  onSave,
}: ProfileSettingsModalProps) {
  const {
    profile: apiProfile,
    isLoading,
    updateUsername,
    updateDisplayName,
    uploadAvatar,
    deleteAvatar,
    isUpdatingUsername,
    isUpdatingDisplayName,
    isDeletingAvatar,
  } = useProfileManagement();

  const profile: ProfileData = React.useMemo(() => {
    if (apiProfile) {
      return {
        username: apiProfile.username || '',
        displayName: apiProfile.displayName,
        email: '',
        avatarUrl: apiProfile.avatarUrl || undefined,
      };
    }
    return propProfile || DEFAULT_FORM_DATA;
  }, [apiProfile, propProfile]);

  const { isEditing, formData, hasChanges, setIsEditing, handleInputChange, handleCancel } =
    useFormManagement(profile);
  const { avatarPreview, fileInputRef, handleAvatarUpload, handleDeleteAvatar } = useAvatarHandling(
    profile,
    uploadAvatar,
    async () => {
      await deleteAvatar();
    },
  );

  const handleSave = async (): Promise<void> => {
    try {
      if (formData.username !== profile.username) {
        await updateUsername({ username: formData.username });
      }

      if (formData.displayName !== profile.displayName) {
        await updateDisplayName({ displayName: formData.displayName });
      }

      if (onSave) {
        onSave(formData);
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={OVERLAY_CLASSES}>
        <div className={BACKDROP_CLASSES} onClick={onClose} />
        <div className={cn(MODAL_CONTAINER_CLASSES, 'px-4 sm:px-0')}>
          <Card className={LOADING_CARD_CLASSES}>
            <CardContent className={LOADING_CONTENT_CLASSES}>
              <div className="flex flex-col items-center gap-4">
                <Loader2 className={LOADING_SPINNER_CLASSES} />
                <Text className="text-gray-700">プロフィールを読み込み中...</Text>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className={OVERLAY_CLASSES}>
      <div className={BACKDROP_CLASSES} onClick={onClose} />

      <div className={MODAL_CONTAINER_CLASSES}>
        <Card className={CARD_CLASSES}>
          <CardHeader className={HEADER_CLASSES}>
            <div className="flex items-center gap-3">
              <div className={HEADER_ICON_WRAPPER_CLASSES}>
                <User className={HEADER_ICON_CLASSES} />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-800 font-bold">プロフィール設定</CardTitle>
                <Text className="text-gray-700 font-medium">アカウント情報を管理</Text>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={CLOSE_BUTTON_CLASSES}
              >
                <X className={CLOSE_ICON_CLASSES} />
              </Button>
            </div>
          </CardHeader>

          <CardContent className={CONTENT_CLASSES}>
            <AvatarSection
              avatarPreview={avatarPreview}
              fileInputRef={fileInputRef}
              onAvatarUpload={handleAvatarUpload}
              onDeleteAvatar={handleDeleteAvatar}
              isDeletingAvatar={isDeletingAvatar}
            />

            <ProfileInfoSection
              formData={formData}
              isEditing={isEditing}
              onInputChange={handleInputChange}
            />

            <ActionButtons
              isEditing={isEditing}
              hasChanges={hasChanges}
              isUpdatingUsername={isUpdatingUsername}
              isUpdatingDisplayName={isUpdatingDisplayName}
              onEdit={() => setIsEditing(true)}
              onSave={handleSave}
              onCancel={handleCancel}
              onClose={onClose}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
