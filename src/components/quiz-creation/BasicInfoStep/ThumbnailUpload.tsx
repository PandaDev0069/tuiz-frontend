// ====================================================
// File Name   : ThumbnailUpload.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-03
// Last Update : 2025-09-14
//
// Description:
// - Thumbnail upload component for quiz creation
// - Allows users to upload and preview quiz thumbnail images
// - Supports blob URLs for temporary previews and server uploads
// - Handles image upload, preview, and removal
//
// Notes:
// - Client component (no 'use client' needed as parent handles it)
// - Uses Next.js Image component for optimized image display
// - Supports both temporary blob URLs and permanent server uploads
// ====================================================

import React from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@/components/ui';
import { CreateQuizSetForm } from '@/types/quiz';
import { cn } from '@/lib/utils';
import { useFileUpload } from '@/lib/uploadService';

const FORM_FIELD_THUMBNAIL_URL = 'thumbnail_url';

const THUMBNAIL_IMAGE_WIDTH = 300;
const THUMBNAIL_IMAGE_HEIGHT = 128;
const THUMBNAIL_IMAGE_ALT = 'Quiz thumbnail';

const FILE_INPUT_ID = 'thumbnail-upload';
const FILE_INPUT_ACCEPT = 'image/*';
const FILE_INPUT_TYPE = 'file';

const BUTTON_TYPE_BUTTON = 'button';
const BUTTON_VARIANT_OUTLINE = 'outline';
const BUTTON_SIZE_SM = 'sm';

const ICON_SIZE_SMALL = 'w-4 h-4';
const ICON_SIZE_LARGE = 'w-6 h-6';

const BLOB_URL_PREFIX = 'blob:';

interface ThumbnailUploadProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
  quizId?: string;
}

/**
 * Triggers the file input click event.
 *
 * @param {string} inputId - The ID of the file input element
 */
const triggerFileInput = (inputId: string) => {
  document.getElementById(inputId)?.click();
};

/**
 * Component: ThumbnailUpload
 * Description:
 * - Manages thumbnail image upload and preview for quiz creation
 * - Supports temporary blob URLs for preview when quiz ID is not available
 * - Uploads to server when quiz ID is provided
 * - Displays uploaded thumbnail with remove button
 * - Shows upload area when no thumbnail is present
 *
 * Parameters:
 * - formData (Partial<CreateQuizSetForm>): Current form data including thumbnail URL
 * - onFormDataChange (function): Callback function when form data changes
 * - quizId (string, optional): Quiz ID for organizing uploads to server
 *
 * Returns:
 * - React.ReactElement: The thumbnail upload component
 *
 * Example:
 * ```tsx
 * <ThumbnailUpload
 *   formData={formData}
 *   onFormDataChange={(data) => setFormData(data)}
 *   quizId="quiz-123"
 * />
 * ```
 */
export const ThumbnailUpload: React.FC<ThumbnailUploadProps> = ({
  formData,
  onFormDataChange,
  quizId,
}) => {
  const { uploadQuizThumbnail, isUploading } = useFileUpload();

  const handleInputChange = (field: keyof CreateQuizSetForm, value: string | undefined) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      if (!quizId) {
        const blobUrl = URL.createObjectURL(file);

        onFormDataChange({
          ...formData,
          thumbnail_url: blobUrl,
          _thumbnailFile: file,
        });

        return;
      }

      const thumbnailUrl = await uploadQuizThumbnail(file, quizId);

      if (thumbnailUrl) {
        handleInputChange(FORM_FIELD_THUMBNAIL_URL, thumbnailUrl);

        onFormDataChange({
          ...formData,
          thumbnail_url: thumbnailUrl,
          _thumbnailFile: undefined,
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleRemoveThumbnail = () => {
    if (formData.thumbnail_url?.startsWith(BLOB_URL_PREFIX)) {
      URL.revokeObjectURL(formData.thumbnail_url);
    }

    handleInputChange(FORM_FIELD_THUMBNAIL_URL, undefined);
    onFormDataChange({
      ...formData,
      thumbnail_url: undefined,
      _thumbnailFile: undefined,
    });
  };

  const handleUploadAreaClick = () => {
    if (!isUploading) {
      triggerFileInput(FILE_INPUT_ID);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUploading) {
      triggerFileInput(FILE_INPUT_ID);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-lg">
      <CardHeader className="pb-3 md:pb-6 px-3 md:px-6">
        <CardTitle className="flex items-center gap-2 text-sm md:text-base">
          <Upload className={cn(ICON_SIZE_SMALL, 'md:w-5 md:h-5 text-primary')} />
          サムネイル
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          クイズのサムネイル画像をアップロード（任意）
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 md:px-6">
        <div className="space-y-4">
          {formData.thumbnail_url ? (
            <div className="relative">
              <Image
                src={formData.thumbnail_url}
                alt={THUMBNAIL_IMAGE_ALT}
                width={THUMBNAIL_IMAGE_WIDTH}
                height={THUMBNAIL_IMAGE_HEIGHT}
                className="w-full h-32 object-cover rounded-lg border"
                onError={(e) => {
                  console.error('Thumbnail image failed to load:', formData.thumbnail_url, e);
                }}
              />
              <button
                type={BUTTON_TYPE_BUTTON}
                onClick={handleRemoveThumbnail}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className={ICON_SIZE_SMALL} />
              </button>
            </div>
          ) : (
            <div
              className="border-4 border-dashed border-lime-600 rounded-lg p-4 md:p-6 text-center cursor-pointer"
              onClick={handleUploadAreaClick}
            >
              <Upload className={cn(ICON_SIZE_LARGE, 'md:w-8 md:h-8 text-gray-400 mx-auto mb-2')} />
              <p className="text-xs md:text-sm text-gray-600 mb-2">画像をアップロード</p>
              <input
                type={FILE_INPUT_TYPE}
                accept={FILE_INPUT_ACCEPT}
                onChange={handleThumbnailUpload}
                className="hidden"
                id={FILE_INPUT_ID}
                disabled={isUploading}
              />
              <Button
                type={BUTTON_TYPE_BUTTON}
                variant={BUTTON_VARIANT_OUTLINE}
                size={BUTTON_SIZE_SM}
                onClick={handleButtonClick}
                disabled={isUploading}
              >
                {isUploading ? 'アップロード中...' : 'ファイルを選択'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
