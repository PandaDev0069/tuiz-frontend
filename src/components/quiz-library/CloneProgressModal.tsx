// ====================================================
// File Name   : CloneProgressModal.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-17
// Last Update : 2025-09-17
//
// Description:
// - Modal component for displaying quiz cloning progress
// - Shows different states: idle, cloning, success, error
// - Displays status-specific icons, titles, and descriptions
// - Provides action buttons based on clone status
// - Shows progress bar during cloning operation
//
// Notes:
// - Client-only component (requires 'use client')
// - Modal overlay with centered card layout
// - Status-based styling and content
// ====================================================

'use client';

import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/core/card';
import { Button } from '@/components/ui/core/button';
import { Loader2, Copy, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_SIZE_LARGE = 'w-12 h-12';

const MODAL_OVERLAY_CLASSES =
  'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
const CARD_BASE_CLASSES = 'w-full max-w-md mx-4 border-2';
const CARD_CONTENT_CLASSES = 'p-6 text-center';
const CONTENT_CONTAINER_CLASSES = 'flex flex-col items-center space-y-4';
const TEXT_CONTAINER_CLASSES = 'space-y-2';
const TITLE_CLASSES = 'text-xl font-bold';
const DESCRIPTION_CLASSES = 'text-gray-600 text-sm';

const BUTTON_VARIANT_GRADIENT = 'gradient';
const BUTTON_VARIANT_OUTLINE = 'outline';

const SUCCESS_BUTTONS_CONTAINER_CLASSES = 'flex flex-col gap-2 w-full';
const SUCCESS_BUTTONS_ROW_CLASSES = 'flex gap-2';
const ERROR_BUTTONS_CONTAINER_CLASSES = 'flex gap-2 w-full';

const PROGRESS_BAR_CONTAINER_CLASSES = 'w-full bg-gray-200 rounded-full h-2';
const PROGRESS_BAR_FILL_CLASSES = 'bg-blue-500 h-2 rounded-full animate-pulse w-3/4';

const STATUS_BG_CLONING = 'bg-blue-50';
const STATUS_BG_SUCCESS = 'bg-green-50';
const STATUS_BG_ERROR = 'bg-red-50';
const STATUS_BG_IDLE = 'bg-gray-50';

const STATUS_BORDER_CLONING = 'border-blue-200';
const STATUS_BORDER_SUCCESS = 'border-green-200';
const STATUS_BORDER_ERROR = 'border-red-200';
const STATUS_BORDER_IDLE = 'border-gray-200';

const ICON_COLOR_BLUE = 'text-blue-500';
const ICON_COLOR_GREEN = 'text-green-500';
const ICON_COLOR_RED = 'text-red-500';
const ICON_COLOR_GRAY = 'text-gray-500';

interface CloneProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  cloneStatus: 'idle' | 'cloning' | 'success' | 'error';
  originalQuizTitle?: string;
  clonedQuizId?: string;
  error?: string;
  onEditClonedQuiz?: () => void;
  onViewMyLibrary?: () => void;
}

interface StatusConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  borderColor: string;
}

/**
 * Function: getStatusConfig
 * Description:
 * - Returns configuration object based on clone status
 * - Provides icon, title, description, and styling for each status
 *
 * Parameters:
 * - cloneStatus ('idle' | 'cloning' | 'success' | 'error'): Current clone status
 * - originalQuizTitle (string, optional): Title of original quiz
 * - error (string, optional): Error message if status is error
 *
 * Returns:
 * - StatusConfig: Configuration object with icon, title, description, and styling
 *
 * Example:
 * ```ts
 * const config = getStatusConfig('success', 'My Quiz');
 * // Returns success configuration with green styling
 * ```
 */
const getStatusConfig = (
  cloneStatus: 'idle' | 'cloning' | 'success' | 'error',
  originalQuizTitle?: string,
  error?: string,
): StatusConfig => {
  switch (cloneStatus) {
    case 'cloning':
      return {
        icon: <Loader2 className={cn(ICON_SIZE_LARGE, ICON_COLOR_BLUE, 'animate-spin')} />,
        title: 'クイズをクローンしています...',
        description: 'しばらくお待ちください',
        bgColor: STATUS_BG_CLONING,
        borderColor: STATUS_BORDER_CLONING,
      };
    case 'success':
      return {
        icon: <CheckCircle className={cn(ICON_SIZE_LARGE, ICON_COLOR_GREEN)} />,
        title: 'クローン完了！',
        description: `「${originalQuizTitle}」をライブラリに追加しました`,
        bgColor: STATUS_BG_SUCCESS,
        borderColor: STATUS_BORDER_SUCCESS,
      };
    case 'error':
      return {
        icon: <XCircle className={cn(ICON_SIZE_LARGE, ICON_COLOR_RED)} />,
        title: 'クローンに失敗しました',
        description: error || 'もう一度お試しください',
        bgColor: STATUS_BG_ERROR,
        borderColor: STATUS_BORDER_ERROR,
      };
    default:
      return {
        icon: <Copy className={cn(ICON_SIZE_LARGE, ICON_COLOR_GRAY)} />,
        title: 'クイズクローン',
        description: '',
        bgColor: STATUS_BG_IDLE,
        borderColor: STATUS_BORDER_IDLE,
      };
  }
};

/**
 * Component: CloneProgressModal
 * Description:
 * - Modal component displaying quiz cloning progress and status
 * - Shows different UI states based on clone status (idle, cloning, success, error)
 * - Provides action buttons for success state (edit, view library, close)
 * - Shows progress bar during cloning operation
 * - Displays error message on failure
 *
 * Parameters:
 * - isOpen (boolean): Whether modal is open
 * - onClose (function): Callback to close the modal
 * - cloneStatus ('idle' | 'cloning' | 'success' | 'error'): Current clone status
 * - originalQuizTitle (string, optional): Title of original quiz being cloned
 * - clonedQuizId (string, optional): ID of cloned quiz
 * - error (string, optional): Error message if cloning failed
 * - onEditClonedQuiz (function, optional): Callback to edit cloned quiz
 * - onViewMyLibrary (function, optional): Callback to view library
 *
 * Returns:
 * - React.ReactElement | null: The clone progress modal component or null if not open
 *
 * Example:
 * ```tsx
 * <CloneProgressModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   cloneStatus="cloning"
 *   originalQuizTitle="My Quiz"
 *   onEditClonedQuiz={() => navigateToEdit()}
 *   onViewMyLibrary={() => navigateToLibrary()}
 * />
 * ```
 */
export const CloneProgressModal: React.FC<CloneProgressModalProps> = ({
  isOpen,
  onClose,
  cloneStatus,
  originalQuizTitle,
  error,
  onEditClonedQuiz,
  onViewMyLibrary,
}) => {
  if (!isOpen) return null;

  const config = getStatusConfig(cloneStatus, originalQuizTitle, error);

  return (
    <div className={MODAL_OVERLAY_CLASSES}>
      <Card className={cn(CARD_BASE_CLASSES, config.bgColor, config.borderColor)}>
        <CardContent className={CARD_CONTENT_CLASSES}>
          <div className={CONTENT_CONTAINER_CLASSES}>
            {config.icon}

            <div className={TEXT_CONTAINER_CLASSES}>
              <CardTitle className={TITLE_CLASSES}>{config.title}</CardTitle>
              {config.description && <p className={DESCRIPTION_CLASSES}>{config.description}</p>}
            </div>

            {cloneStatus === 'success' && (
              <div className={SUCCESS_BUTTONS_CONTAINER_CLASSES}>
                <Button
                  variant={BUTTON_VARIANT_GRADIENT}
                  onClick={onEditClonedQuiz}
                  className="w-full"
                >
                  クローンしたクイズを編集
                </Button>
                <div className={SUCCESS_BUTTONS_ROW_CLASSES}>
                  <Button
                    variant={BUTTON_VARIANT_OUTLINE}
                    onClick={onViewMyLibrary}
                    className="flex-1"
                  >
                    ライブラリで確認
                  </Button>
                  <Button variant={BUTTON_VARIANT_OUTLINE} onClick={onClose} className="flex-1">
                    閉じる
                  </Button>
                </div>
              </div>
            )}

            {cloneStatus === 'error' && (
              <div className={ERROR_BUTTONS_CONTAINER_CLASSES}>
                <Button variant={BUTTON_VARIANT_OUTLINE} onClick={onClose} className="w-full">
                  閉じる
                </Button>
              </div>
            )}

            {cloneStatus === 'cloning' && (
              <div className={PROGRESS_BAR_CONTAINER_CLASSES}>
                <div className={PROGRESS_BAR_FILL_CLASSES}></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
