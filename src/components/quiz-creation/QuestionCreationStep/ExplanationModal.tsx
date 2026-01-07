// ====================================================
// File Name   : ExplanationModal.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-04
// Last Update : 2025-09-16
//
// Description:
// - Modal component for editing quiz question explanations
// - Allows users to set explanation title, text, and image
// - Supports both mobile and desktop layouts
// - Handles image upload and form state management
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses custom hooks for form state, mobile detection, and image upload
// - Implements responsive design with different layouts for mobile/desktop
// ====================================================

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, X, BookOpen, Image as ImageIcon, FileText } from 'lucide-react';

import { Button, Card, CardContent, CardHeader, CardTitle, Label, Textarea } from '@/components/ui';
import { useFileUpload } from '@/lib/uploadService';
import { cn } from '@/lib/utils';

const DEFAULT_EXPLANATION_TITLE = '';
const DEFAULT_EXPLANATION_TEXT = '';
const DEFAULT_EXPLANATION_IMAGE_URL = '';

const MOBILE_BREAKPOINT_PX = 768;
const MODAL_Z_INDEX = 'z-[9998]';
const MODAL_MAX_HEIGHT = 'max-h-[90vh]';

const INPUT_TYPE_TEXT = 'text';
const INPUT_TYPE_FILE = 'file';
const FILE_INPUT_ACCEPT = 'image/*';

const BUTTON_TYPE_BUTTON = 'button';
const BUTTON_VARIANT_OUTLINE = 'outline';
const BUTTON_VARIANT_GHOST = 'ghost';
const BUTTON_SIZE_ICON = 'icon';
const BUTTON_SIZE_SM = 'sm';
const LABEL_VARIANT_PRIMARY = 'primary';
const TEXTAREA_VARIANT_PRIMARY = 'primary';

const ICON_SIZE_SMALL = 'w-4 h-4';
const ICON_SIZE_MEDIUM = 'w-5 w-5';
const ICON_SIZE_LARGE = 'w-6 h-6';
const ICON_SIZE_XLARGE = 'w-12 h-12';

const IMAGE_ALT_TEXT = 'Explanation image';
const IMAGE_WIDTH_MOBILE = 300;
const IMAGE_HEIGHT_MOBILE = 200;
const IMAGE_WIDTH_DESKTOP = 400;
const IMAGE_HEIGHT_DESKTOP = 300;

interface ExplanationData {
  explanation_title?: string | null;
  explanation_text?: string | null;
  explanation_image_url?: string | null;
}

interface ExplanationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  explanationTitle?: string | null;
  explanationText?: string | null;
  explanationImageUrl?: string | null;
  onSave: (data: ExplanationData) => void;
  questionNumber: number;
  quizId?: string;
}

interface TitleSectionProps {
  localTitle: string | null;
  onTitleChange: (title: string) => void;
  isMobile: boolean;
}

interface DescriptionSectionProps {
  localText: string | null;
  onTextChange: (text: string) => void;
  isMobile: boolean;
}

interface ImageSectionProps {
  localImageUrl: string | null;
  onImageChange: (url: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  isMobile: boolean;
}

/**
 * Custom hook for form state management.
 * Manages local state for explanation fields and tracks changes.
 *
 * @param {string | null} explanationTitle - Initial explanation title
 * @param {string | null} explanationText - Initial explanation text
 * @param {string | null} explanationImageUrl - Initial explanation image URL
 * @returns {object} Form state and handlers
 */
const useExplanationForm = (
  explanationTitle: string | null,
  explanationText: string | null,
  explanationImageUrl: string | null,
) => {
  const [localTitle, setLocalTitle] = useState(explanationTitle);
  const [localText, setLocalText] = useState(explanationText);
  const [localImageUrl, setLocalImageUrl] = useState(explanationImageUrl);

  useEffect(() => {
    setLocalTitle(explanationTitle);
    setLocalText(explanationText);
    setLocalImageUrl(explanationImageUrl);
  }, [explanationTitle, explanationText, explanationImageUrl]);

  const hasChanges =
    localTitle !== explanationTitle ||
    localText !== explanationText ||
    localImageUrl !== explanationImageUrl;

  const resetToOriginal = () => {
    setLocalTitle(explanationTitle);
    setLocalText(explanationText);
    setLocalImageUrl(explanationImageUrl);
  };

  return {
    localTitle,
    localText,
    localImageUrl,
    hasChanges,
    setLocalTitle,
    setLocalText,
    setLocalImageUrl,
    resetToOriginal,
  };
};

/**
 * Custom hook for mobile detection.
 * Detects screen size and updates mobile state on resize.
 *
 * @returns {boolean} Whether the device is mobile
 */
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT_PX);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isMobile;
};

/**
 * Custom hook for image upload.
 * Handles image file upload and provides upload state.
 *
 * @param {string} [quizId] - Optional quiz ID for organizing uploads
 * @returns {object} Upload handler and loading state
 */
const useImageUpload = (quizId?: string) => {
  const { uploadQuestionImage, isUploading } = useFileUpload();

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !quizId) {
      return;
    }

    try {
      const imageUrl = await uploadQuestionImage(file, quizId);
      if (imageUrl) {
        onSuccess(imageUrl);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return { handleImageUpload, isUploading };
};

/**
 * Triggers file input click event.
 *
 * @param {string} inputId - The ID of the file input element
 */
const triggerFileInput = (inputId: string) => {
  document.getElementById(inputId)?.click();
};

/**
 * Component: TitleSection
 * Description:
 * - Renders title input section for explanation
 * - Displays card with title input field
 *
 * @param {TitleSectionProps} props - Component props
 * @returns {React.ReactElement} Title section component
 */
const TitleSection: React.FC<TitleSectionProps> = ({ localTitle, onTitleChange, isMobile }) => {
  const inputId = `explanation_title_${isMobile ? 'mobile' : 'desktop'}`;

  return (
    <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-400 shadow-md">
      <CardHeader className="pb-3 px-4">
        <CardTitle className="flex items-center gap-2 text-base text-gray-700">
          <FileText className={cn(ICON_SIZE_SMALL, 'text-blue-600')} />
          解説タイトル
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="space-y-2">
          <Label htmlFor={inputId} variant={LABEL_VARIANT_PRIMARY} className="text-sm">
            タイトル（任意）
          </Label>
          <input
            id={inputId}
            type={INPUT_TYPE_TEXT}
            placeholder="解説のタイトルを入力..."
            value={localTitle || DEFAULT_EXPLANATION_TITLE}
            onChange={(e) => onTitleChange(e.target.value)}
            className={cn(
              'w-full px-3 py-2 border-2 border-blue-500 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-300',
              isMobile && 'text-sm',
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Component: DescriptionSection
 * Description:
 * - Renders description textarea section for explanation
 * - Displays card with textarea for explanation text
 *
 * @param {DescriptionSectionProps} props - Component props
 * @returns {React.ReactElement} Description section component
 */
const DescriptionSection: React.FC<DescriptionSectionProps> = ({
  localText,
  onTextChange,
  isMobile,
}) => {
  const inputId = `explanation_text_${isMobile ? 'mobile' : 'desktop'}`;

  return (
    <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-400 shadow-md">
      <CardHeader className="pb-3 px-4">
        <CardTitle className="flex items-center gap-2 text-base text-gray-700">
          <FileText className={cn(ICON_SIZE_SMALL, 'text-green-600')} />
          解説内容
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="space-y-2">
          <Label htmlFor={inputId} variant={LABEL_VARIANT_PRIMARY} className="text-sm">
            解説文（任意）
          </Label>
          <Textarea
            id={inputId}
            placeholder="問題の解説を入力してください..."
            value={localText || DEFAULT_EXPLANATION_TEXT}
            onChange={(e) => onTextChange(e.target.value)}
            variant={TEXTAREA_VARIANT_PRIMARY}
            className={cn(
              'border-2 border-green-500 focus:border-green-600 focus:ring-2 focus:ring-green-300',
              isMobile ? 'h-32 text-sm' : 'h-40',
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Component: ImageSection
 * Description:
 * - Renders image upload section for explanation
 * - Displays image preview or upload area
 * - Handles image upload and removal
 *
 * @param {ImageSectionProps} props - Component props
 * @returns {React.ReactElement} Image section component
 */
const ImageSection: React.FC<ImageSectionProps> = ({
  localImageUrl,
  onImageChange,
  onImageUpload,
  isUploading,
  isMobile,
}) => {
  const inputId = `explanation_image_${isMobile ? 'mobile' : 'desktop'}`;

  const handleUploadAreaClick = () => {
    if (!isUploading) {
      triggerFileInput(inputId);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUploading) {
      triggerFileInput(inputId);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-400 shadow-md">
      <CardHeader className="pb-3 px-4">
        <CardTitle className="flex items-center gap-2 text-base text-gray-700">
          <ImageIcon className={cn(ICON_SIZE_SMALL, 'text-purple-600')} />
          解説画像
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="space-y-3">
          <Label htmlFor={inputId} variant={LABEL_VARIANT_PRIMARY} className="text-sm">
            画像（任意）
          </Label>
          {localImageUrl ? (
            <div className="relative">
              <Image
                src={localImageUrl}
                alt={IMAGE_ALT_TEXT}
                width={isMobile ? IMAGE_WIDTH_MOBILE : IMAGE_WIDTH_DESKTOP}
                height={isMobile ? IMAGE_HEIGHT_MOBILE : IMAGE_HEIGHT_DESKTOP}
                className={cn('w-full object-cover rounded-lg border', isMobile ? 'h-32' : 'h-48')}
              />
              <button
                type={BUTTON_TYPE_BUTTON}
                onClick={() => onImageChange(DEFAULT_EXPLANATION_IMAGE_URL)}
                className={cn(
                  'absolute p-1 bg-red-500 text-white rounded-full hover:bg-red-600',
                  isMobile ? 'top-1 right-1' : 'top-2 right-2',
                )}
              >
                <X className={isMobile ? 'w-3 h-3' : ICON_SIZE_SMALL} />
              </button>
            </div>
          ) : (
            <div
              className={cn(
                'border-2 border-dashed border-purple-500 rounded-lg text-center cursor-pointer',
                isMobile
                  ? 'p-4 h-32 flex flex-col items-center justify-center'
                  : 'p-8 h-48 flex flex-col items-center justify-center',
              )}
              onClick={handleUploadAreaClick}
            >
              <Upload
                className={cn(
                  'text-gray-400 mx-auto mb-2',
                  isMobile ? ICON_SIZE_LARGE : ICON_SIZE_XLARGE,
                )}
              />
              <p className={cn('text-gray-600', isMobile ? 'text-sm mb-2' : 'mb-4')}>
                画像をアップロード
              </p>
              <input
                type={INPUT_TYPE_FILE}
                accept={FILE_INPUT_ACCEPT}
                onChange={onImageUpload}
                className="hidden"
                id={inputId}
                disabled={isUploading}
              />
              <Button
                type={BUTTON_TYPE_BUTTON}
                variant={BUTTON_VARIANT_OUTLINE}
                size={BUTTON_SIZE_SM}
                onClick={handleButtonClick}
                disabled={isUploading}
                className={isMobile ? 'text-xs' : ''}
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

/**
 * Component: ExplanationModal
 * Description:
 * - Modal component for editing quiz question explanations
 * - Allows users to set explanation title, text, and image
 * - Supports both mobile and desktop layouts with responsive design
 * - Handles form state, image upload, and save/cancel actions
 *
 * Parameters:
 * - isOpen (boolean): Whether the modal is open
 * - onOpenChange (function): Callback when modal open state changes
 * - explanationTitle (string | null, optional): Initial explanation title
 * - explanationText (string | null, optional): Initial explanation text
 * - explanationImageUrl (string | null, optional): Initial explanation image URL
 * - onSave (function): Callback when explanation is saved
 * - questionNumber (number): Question number for display
 * - quizId (string, optional): Quiz ID for organizing uploads
 *
 * Returns:
 * - React.ReactElement | null: The explanation modal component or null if not open
 *
 * Example:
 * ```tsx
 * <ExplanationModal
 *   isOpen={isModalOpen}
 *   onOpenChange={(open) => setIsModalOpen(open)}
 *   explanationTitle="Explanation Title"
 *   explanationText="Explanation text"
 *   onSave={(data) => handleSave(data)}
 *   questionNumber={1}
 *   quizId="quiz-123"
 * />
 * ```
 */
export const ExplanationModal: React.FC<ExplanationModalProps> = ({
  isOpen,
  onOpenChange,
  explanationTitle = DEFAULT_EXPLANATION_TITLE,
  explanationText = DEFAULT_EXPLANATION_TEXT,
  explanationImageUrl = DEFAULT_EXPLANATION_IMAGE_URL,
  onSave,
  questionNumber,
  quizId,
}) => {
  const isMobile = useMobileDetection();
  const {
    localTitle,
    localText,
    localImageUrl,
    hasChanges,
    setLocalTitle,
    setLocalText,
    setLocalImageUrl,
    resetToOriginal,
  } = useExplanationForm(explanationTitle, explanationText, explanationImageUrl);
  const { handleImageUpload, isUploading } = useImageUpload(quizId);

  const handleImageUploadWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e, setLocalImageUrl);
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
    resetToOriginal();
    onOpenChange(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={cn('fixed inset-0', MODAL_Z_INDEX, 'flex items-center justify-center')}>
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div
        className={cn(
          'relative mx-4 px-4 sm:px-0',
          MODAL_MAX_HEIGHT,
          'overflow-y-auto',
          isMobile ? 'w-[95vw] max-w-[95vw]' : 'w-[90vw] max-w-4xl',
        )}
      >
        <Card className="relative bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-2xl border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-lime-300 to-green-400 rounded-lg shadow-md">
                <BookOpen className={cn(ICON_SIZE_MEDIUM, 'text-lime-700')} />
              </div>
              <div>
                <CardTitle className="text-lg md:text-xl text-gray-800 font-bold">
                  問題 {questionNumber} の解説設定
                </CardTitle>
                <p className="text-sm text-gray-700 font-medium">問題の解説を設定してください</p>
              </div>
            </div>
            <Button
              variant={BUTTON_VARIANT_GHOST}
              size={BUTTON_SIZE_ICON}
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 bg-gradient-to-br from-red-200 to-pink-300 hover:from-red-300 hover:to-pink-400 text-red-700 hover:text-red-800 rounded-full"
            >
              <X className={ICON_SIZE_SMALL} />
            </Button>
          </CardHeader>

          <CardContent className={cn(isMobile ? 'space-y-4 px-2' : 'space-y-6')}>
            {isMobile ? (
              <div className="space-y-4">
                <TitleSection
                  localTitle={localTitle}
                  onTitleChange={setLocalTitle}
                  isMobile={isMobile}
                />
                <DescriptionSection
                  localText={localText}
                  onTextChange={setLocalText}
                  isMobile={isMobile}
                />
                <ImageSection
                  localImageUrl={localImageUrl}
                  onImageChange={setLocalImageUrl}
                  onImageUpload={handleImageUploadWrapper}
                  isUploading={isUploading}
                  isMobile={isMobile}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <TitleSection
                    localTitle={localTitle}
                    onTitleChange={setLocalTitle}
                    isMobile={isMobile}
                  />
                  <DescriptionSection
                    localText={localText}
                    onTextChange={setLocalText}
                    isMobile={isMobile}
                  />
                </div>

                <div>
                  <ImageSection
                    localImageUrl={localImageUrl}
                    onImageChange={setLocalImageUrl}
                    onImageUpload={handleImageUploadWrapper}
                    isUploading={isUploading}
                    isMobile={isMobile}
                  />
                </div>
              </div>
            )}
          </CardContent>

          <div
            className={cn(
              'flex justify-end gap-3 pt-4 border-t border-lime-500 px-4 sm:px-6',
              isMobile ? 'flex-col' : 'flex-row',
            )}
          >
            <Button
              type={BUTTON_TYPE_BUTTON}
              variant={BUTTON_VARIANT_OUTLINE}
              onClick={handleCancel}
              className={cn(
                'border-2 border-gray-500 bg-gray-100 hover:bg-gray-200 text-gray-700',
                isMobile ? 'w-full' : 'px-6',
              )}
            >
              キャンセル
            </Button>
            <Button
              type={BUTTON_TYPE_BUTTON}
              variant="gradient2"
              onClick={handleSave}
              disabled={!hasChanges}
              className={cn(isMobile ? 'w-full' : 'px-6')}
            >
              保存
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
