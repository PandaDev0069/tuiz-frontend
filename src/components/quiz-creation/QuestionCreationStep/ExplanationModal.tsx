'use client';

import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Label, Textarea } from '@/components/ui';
import { Upload, X, BookOpen, Image as ImageIcon, FileText } from 'lucide-react';
import Image from 'next/image';
import { useFileUpload } from '@/lib/uploadService';
import { debugLog } from '@/components/debug';

interface ExplanationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  explanationTitle?: string | null;
  explanationText?: string | null;
  explanationImageUrl?: string | null;
  onSave: (data: {
    explanation_title?: string | null;
    explanation_text?: string | null;
    explanation_image_url?: string | null;
  }) => void;
  questionNumber: number;
  quizId?: string;
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({
  isOpen,
  onOpenChange,
  explanationTitle = '',
  explanationText = '',
  explanationImageUrl = '',
  onSave,
  questionNumber,
  quizId,
}) => {
  const [localTitle, setLocalTitle] = useState(explanationTitle);
  const [localText, setLocalText] = useState(explanationText);
  const [localImageUrl, setLocalImageUrl] = useState(explanationImageUrl);
  const [isMobile, setIsMobile] = useState(false);

  // Use the upload service
  const { uploadQuestionImage, isUploading } = useFileUpload();

  // Handle screen size detection
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Update local state when props change
  React.useEffect(() => {
    setLocalTitle(explanationTitle);
    setLocalText(explanationText);
    setLocalImageUrl(explanationImageUrl);
  }, [explanationTitle, explanationText, explanationImageUrl]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quizId) return;

    debugLog.info('Starting explanation image upload', {
      fileName: file.name,
      size: file.size,
      quizId,
    });

    try {
      const imageUrl = await uploadQuestionImage(file, quizId);
      if (imageUrl) {
        setLocalImageUrl(imageUrl);
        debugLog.success('Explanation image uploaded successfully', { url: imageUrl });
      } else {
        debugLog.warning('Explanation image upload returned no URL');
      }
    } catch (error) {
      debugLog.error('Explanation image upload failed', { error });
      console.error('Upload failed:', error);
    }
  };

  const handleSave = () => {
    onSave({
      explanation_title: localTitle,
      explanation_text: localText,
      explanation_image_url: localImageUrl,
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setLocalTitle(explanationTitle);
    setLocalText(explanationText);
    setLocalImageUrl(explanationImageUrl);
    onOpenChange(false);
  };

  const hasChanges =
    localTitle !== explanationTitle ||
    localText !== explanationText ||
    localImageUrl !== explanationImageUrl;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div
        className={`relative mx-4 px-4 sm:px-0 max-h-[90vh] overflow-y-auto ${
          isMobile ? 'w-[95vw] max-w-[95vw]' : 'w-[90vw] max-w-4xl'
        }`}
      >
        <Card className="relative bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-2xl border-0">
          {/* Header */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-lime-300 to-green-400 rounded-lg shadow-md">
                <BookOpen className="h-5 w-5 text-lime-700" />
              </div>
              <div>
                <CardTitle className="text-lg md:text-xl text-gray-800 font-bold">
                  問題 {questionNumber} の解説設定
                </CardTitle>
                <p className="text-sm text-gray-700 font-medium">問題の解説を設定してください</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 bg-gradient-to-br from-red-200 to-pink-300 hover:from-red-300 hover:to-pink-400 text-red-700 hover:text-red-800 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className={`${isMobile ? 'space-y-4 px-2' : 'space-y-6'}`}>
            {isMobile ? (
              /* Mobile Layout - Stacked */
              <div className="space-y-4">
                {/* Title Section */}
                <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-400 shadow-md">
                  <CardHeader className="pb-3 px-4">
                    <CardTitle className="flex items-center gap-2 text-base text-gray-700">
                      <FileText className="w-4 h-4 text-blue-600" />
                      解説タイトル
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="explanation_title_mobile"
                        variant="primary"
                        className="text-sm"
                      >
                        タイトル（任意）
                      </Label>
                      <input
                        id="explanation_title_mobile"
                        type="text"
                        placeholder="解説のタイトルを入力..."
                        value={localTitle || ''}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-blue-500 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-300 text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Description Section */}
                <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-400 shadow-md">
                  <CardHeader className="pb-3 px-4">
                    <CardTitle className="flex items-center gap-2 text-base text-gray-700">
                      <FileText className="w-4 h-4 text-green-600" />
                      解説内容
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="explanation_text_mobile"
                        variant="primary"
                        className="text-sm"
                      >
                        解説文（任意）
                      </Label>
                      <Textarea
                        id="explanation_text_mobile"
                        placeholder="問題の解説を入力してください..."
                        value={localText || ''}
                        onChange={(e) => setLocalText(e.target.value)}
                        variant="primary"
                        className="h-32 border-2 border-green-500 focus:border-green-600 focus:ring-2 focus:ring-green-300 text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Image Section */}
                <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-400 shadow-md">
                  <CardHeader className="pb-3 px-4">
                    <CardTitle className="flex items-center gap-2 text-base text-gray-700">
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                      解説画像
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4">
                    <div className="space-y-3">
                      <Label
                        htmlFor="explanation_image_mobile"
                        variant="primary"
                        className="text-sm"
                      >
                        画像（任意）
                      </Label>
                      {localImageUrl ? (
                        <div className="relative">
                          <Image
                            src={localImageUrl}
                            alt="Explanation image"
                            width={300}
                            height={200}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => setLocalImageUrl('')}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="border-2 border-dashed border-purple-500 rounded-lg p-4 text-center cursor-pointer"
                          onClick={() => {
                            if (!isUploading) {
                              document.getElementById('explanation_image_mobile')?.click();
                            }
                          }}
                        >
                          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">画像をアップロード</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="explanation_image_mobile"
                            disabled={isUploading}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isUploading) {
                                document.getElementById('explanation_image_mobile')?.click();
                              }
                            }}
                            disabled={isUploading}
                            className="text-xs"
                          >
                            {isUploading ? 'アップロード中...' : 'ファイルを選択'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Desktop Layout - Grid */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Title and Description */}
                <div className="space-y-6">
                  {/* Title Section */}
                  <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-400 shadow-md">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg text-gray-700">
                        <FileText className="w-5 h-5 text-blue-600" />
                        解説タイトル
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Label htmlFor="explanation_title_desktop" variant="primary">
                          タイトル（任意）
                        </Label>
                        <input
                          id="explanation_title_desktop"
                          type="text"
                          placeholder="解説のタイトルを入力..."
                          value={localTitle || ''}
                          onChange={(e) => setLocalTitle(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-300"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Description Section */}
                  <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-400 shadow-md">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg text-gray-700">
                        <FileText className="w-5 h-5 text-green-600" />
                        解説内容
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Label htmlFor="explanation_text_desktop" variant="primary">
                          解説文（任意）
                        </Label>
                        <Textarea
                          id="explanation_text_desktop"
                          placeholder="問題の解説を入力してください..."
                          value={localText || ''}
                          onChange={(e) => setLocalText(e.target.value)}
                          variant="primary"
                          className="h-40 border-2 border-green-500 focus:border-green-600 focus:ring-2 focus:ring-green-300"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Image */}
                <div>
                  <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-400 shadow-md h-full">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg text-gray-700">
                        <ImageIcon className="w-5 h-5 text-purple-600" />
                        解説画像
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Label htmlFor="explanation_image_desktop" variant="primary">
                          画像（任意）
                        </Label>
                        {localImageUrl ? (
                          <div className="relative">
                            <Image
                              src={localImageUrl}
                              alt="Explanation image"
                              width={400}
                              height={300}
                              className="w-full h-48 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => setLocalImageUrl('')}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div
                            className="border-4 border-dashed border-purple-500 rounded-lg p-8 text-center cursor-pointer h-48 flex flex-col items-center justify-center"
                            onClick={() => {
                              if (!isUploading) {
                                document.getElementById('explanation_image_desktop')?.click();
                              }
                            }}
                          >
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">画像をアップロード</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="explanation_image_desktop"
                              disabled={isUploading}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isUploading) {
                                  document.getElementById('explanation_image_desktop')?.click();
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
                </div>
              </div>
            )}
          </CardContent>

          {/* Action Buttons */}
          <div
            className={`flex justify-end gap-3 pt-4 border-t border-lime-500 px-4 sm:px-6 ${
              isMobile ? 'flex-col' : 'flex-row'
            }`}
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className={`border-2 border-gray-500 bg-gray-100 hover:bg-gray-200 text-gray-700 ${
                isMobile ? 'w-full' : 'px-6'
              }`}
            >
              キャンセル
            </Button>
            <Button
              type="button"
              variant="gradient2"
              onClick={handleSave}
              disabled={!hasChanges}
              className={`${isMobile ? 'w-full' : 'px-6'}`}
            >
              保存
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
