import React, { useState } from 'react';
import { CreateQuizSetForm } from '@/types/quiz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@/components/ui';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface ThumbnailUploadProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
}

export const ThumbnailUpload: React.FC<ThumbnailUploadProps> = ({ formData, onFormDataChange }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (field: keyof CreateQuizSetForm, value: string | undefined) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // TODO: Implement actual file upload logic
      // For now, we'll simulate the upload
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockUrl = URL.createObjectURL(file);
      handleInputChange('thumbnail_url', mockUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
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
              />
              <button
                type="button"
                onClick={() => handleInputChange('thumbnail_url', undefined)}
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
