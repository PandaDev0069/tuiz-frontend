import React from 'react';
import { CreateQuizSetForm } from '@/types/quiz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@/components/ui';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useFileUpload } from '@/lib/uploadService';
import { debugLog } from '@/components/debug';

interface ThumbnailUploadProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
  quizId?: string; // Optional quiz ID for organizing uploads
}

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
    if (!file) return;

    debugLog.info('Thumbnail upload initiated', {
      fileName: file.name,
      size: file.size,
      type: file.type,
      hasQuizId: !!quizId,
    });

    try {
      // If no quizId, store as blob URL temporarily
      // This will be uploaded to backend once quiz is created
      if (!quizId) {
        debugLog.info('No quiz ID - storing thumbnail temporarily');
        // Create a temporary blob URL for preview
        const blobUrl = URL.createObjectURL(file);

        // Store the file object and blob URL for later upload
        onFormDataChange({
          ...formData,
          thumbnail_url: blobUrl,
          // Store the actual file for later upload
          _thumbnailFile: file,
        });

        debugLog.success('Thumbnail stored for later upload', { blobUrl });
        return;
      }

      // Quiz exists, upload to backend API
      debugLog.info('Quiz ID exists - uploading thumbnail immediately', { quizId });
      const thumbnailUrl = await uploadQuizThumbnail(file, quizId);

      if (thumbnailUrl) {
        debugLog.success('Thumbnail uploaded immediately', { url: thumbnailUrl });
        handleInputChange('thumbnail_url', thumbnailUrl);

        // Clear the temporary file if it exists
        onFormDataChange({
          ...formData,
          thumbnail_url: thumbnailUrl,
          _thumbnailFile: undefined,
        });
      } else {
        debugLog.error('Thumbnail upload failed - no URL returned');
      }
    } catch (error) {
      debugLog.error('Thumbnail upload error', {
        error: error instanceof Error ? error.message : String(error),
      });
      console.error('Upload failed:', error);
      // Error is already handled by useFileUpload hook (toast notification)
    }
  };

  const handleRemoveThumbnail = () => {
    debugLog.info('Removing thumbnail', {
      isBlob: formData.thumbnail_url?.startsWith('blob:'),
      hasFile: !!formData._thumbnailFile,
    });

    // If it's a blob URL, revoke it to free memory
    if (formData.thumbnail_url?.startsWith('blob:')) {
      URL.revokeObjectURL(formData.thumbnail_url);
      debugLog.info('Blob URL revoked');
    }

    handleInputChange('thumbnail_url', undefined);
    onFormDataChange({
      ...formData,
      thumbnail_url: undefined,
      _thumbnailFile: undefined,
    });

    debugLog.success('Thumbnail removed successfully');
  };

  return (
    <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-lg">
      <CardHeader className="pb-3 md:pb-6 px-3 md:px-6">
        <CardTitle className="flex items-center gap-2 text-sm md:text-base">
          <Upload className="w-4 h-4 md:w-5 md:h-5 text-primary" />
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
                alt="Quiz thumbnail"
                width={300}
                height={128}
                className="w-full h-32 object-cover rounded-lg border"
                onError={(e) => {
                  console.error('Thumbnail image failed to load:', formData.thumbnail_url, e);
                }}
                onLoad={() => {
                  console.log('Thumbnail image loaded successfully:', formData.thumbnail_url);
                }}
              />
              <button
                type="button"
                onClick={handleRemoveThumbnail}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className="border-4 border-dashed border-lime-600 rounded-lg p-4 md:p-6 text-center cursor-pointer"
              onClick={() => {
                if (!isUploading) {
                  document.getElementById('thumbnail-upload')?.click();
                }
              }}
            >
              <Upload className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs md:text-sm text-gray-600 mb-2">画像をアップロード</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
                id="thumbnail-upload"
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isUploading) {
                    document.getElementById('thumbnail-upload')?.click();
                  }
                }}
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
