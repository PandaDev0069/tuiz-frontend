// ====================================================
// File Name   : warning-modal.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-14
// Last Update : 2025-09-14
//
// Description:
// - Warning modal component for displaying confirmation dialogs
// - Supports multiple variants (danger, warning, info)
// - Includes custom hook for easier modal management
// - Handles loading states and backdrop clicks
//
// Notes:
// - Client component (uses 'use client' directive)
// - Uses React hooks for state management
// - Modal overlay with backdrop blur
// ====================================================

'use client';

import React from 'react';
import { Button } from '../core/button';
import { Text } from '../core/typography';
import { cn } from '@/lib/utils';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

const DEFAULT_CONFIRM_TEXT = '確認';
const DEFAULT_CANCEL_TEXT = 'キャンセル';
const DEFAULT_VARIANT = 'danger';
const DEFAULT_IS_LOADING = false;

const OVERLAY_CLASSES =
  'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm';
const MODAL_BASE_CLASSES =
  'relative w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 transform transition-all duration-200';
const MODAL_ANIMATION_CLASSES = 'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2';
const CLOSE_BUTTON_CLASSES =
  'absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const CLOSE_ICON_CLASSES = 'w-5 h-5 text-gray-500';
const CONTENT_CLASSES = 'p-6 pt-8';
const HEADER_CLASSES = 'flex items-start gap-4 mb-4';
const ICON_WRAPPER_CLASSES = 'flex-shrink-0';
const ICON_CLASSES = 'w-8 h-8';
const TITLE_CLASSES = 'text-xl font-semibold text-gray-900 mb-2';
const DESCRIPTION_CLASSES = 'text-gray-600 leading-relaxed';
const BUTTONS_CONTAINER_CLASSES = 'flex gap-3 mt-6';
const CANCEL_BUTTON_CLASSES =
  'flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-2 border-blue-400 hover:border-blue-500 shadow-md hover:shadow-lg transition-all duration-200';
const CONFIRM_BUTTON_BASE_CLASSES = 'flex-1';
const LOADING_SPINNER_CLASSES = 'w-4 h-4 mr-2 animate-spin';

interface VariantStyles {
  icon: string;
  confirmButton: string;
  border: string;
}

const VARIANT_STYLES: Record<'danger' | 'warning' | 'info', VariantStyles> = {
  danger: {
    icon: 'text-red-500',
    confirmButton: 'bg-red-500 hover:bg-red-600 text-white',
    border: 'border-red-200',
  },
  warning: {
    icon: 'text-yellow-500',
    confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    border: 'border-yellow-200',
  },
  info: {
    icon: 'text-blue-500',
    confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white',
    border: 'border-blue-200',
  },
};

export interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  className?: string;
}

/**
 * Function: getVariantStyles
 * Description:
 * - Returns style classes based on variant type
 * - Maps variant to icon, button, and border styles
 *
 * Parameters:
 * - variant ('danger' | 'warning' | 'info'): Modal variant
 *
 * Returns:
 * - VariantStyles: Object containing icon, confirmButton, and border classes
 *
 * Example:
 * ```ts
 * const styles = getVariantStyles('danger');
 * // Returns { icon: 'text-red-500', confirmButton: '...', border: '...' }
 * ```
 */
const getVariantStyles = (variant: 'danger' | 'warning' | 'info'): VariantStyles => {
  return VARIANT_STYLES[variant];
};

/**
 * Component: WarningModal
 * Description:
 * - Warning modal component for displaying confirmation dialogs
 * - Supports multiple variants (danger, warning, info)
 * - Handles loading states and backdrop clicks
 * - Returns null if modal is not open
 *
 * Parameters:
 * - isOpen (boolean): Whether the modal is open
 * - onClose (function): Callback to close the modal
 * - onConfirm (function): Callback when confirm button is clicked
 * - title (string): Modal title text
 * - description (string): Modal description text
 * - confirmText (string, optional): Confirm button text (default: '確認')
 * - cancelText (string, optional): Cancel button text (default: 'キャンセル')
 * - variant ('danger' | 'warning' | 'info', optional): Visual variant (default: 'danger')
 * - isLoading (boolean, optional): Whether action is in progress (default: false)
 * - className (string, optional): Additional CSS classes
 *
 * Returns:
 * - React.ReactElement | null: The warning modal component or null if not open
 *
 * Example:
 * ```tsx
 * <WarningModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   onConfirm={handleConfirm}
 *   title="削除確認"
 *   description="この操作は取り消せません"
 *   variant="danger"
 * />
 * ```
 */
export const WarningModal: React.FC<WarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = DEFAULT_CONFIRM_TEXT,
  cancelText = DEFAULT_CANCEL_TEXT,
  variant = DEFAULT_VARIANT,
  isLoading = DEFAULT_IS_LOADING,
  className,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = (): void => {
    onConfirm();
  };

  const styles = getVariantStyles(variant);

  return (
    <div className={OVERLAY_CLASSES} onClick={handleBackdropClick}>
      <div className={cn(MODAL_BASE_CLASSES, MODAL_ANIMATION_CLASSES, styles.border, className)}>
        <button
          onClick={onClose}
          disabled={isLoading}
          className={CLOSE_BUTTON_CLASSES}
          aria-label="閉じる"
        >
          <X className={CLOSE_ICON_CLASSES} />
        </button>

        <div className={CONTENT_CLASSES}>
          <div className={HEADER_CLASSES}>
            <div className={ICON_WRAPPER_CLASSES}>
              <AlertTriangle className={cn(ICON_CLASSES, styles.icon)} />
            </div>
            <div className="flex-1">
              <h3 className={TITLE_CLASSES}>{title}</h3>
              <Text className={DESCRIPTION_CLASSES}>{description}</Text>
            </div>
          </div>

          <div className={BUTTONS_CONTAINER_CLASSES}>
            <Button onClick={onClose} disabled={isLoading} className={CANCEL_BUTTON_CLASSES}>
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn(CONFIRM_BUTTON_BASE_CLASSES, styles.confirmButton)}
            >
              {isLoading ? (
                <>
                  <Loader2 className={LOADING_SPINNER_CLASSES} />
                  処理中...
                </>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook: useWarningModal
 * Description:
 * - Custom hook for easier warning modal management
 * - Provides open/close functionality and modal component
 * - Handles async confirm actions with error handling
 * - Automatically closes modal after successful confirmation
 *
 * Returns:
 * - Object containing openModal, closeModal, and WarningModalComponent
 *
 * Example:
 * ```ts
 * const { openModal, closeModal, WarningModalComponent } = useWarningModal();
 *
 * // Open modal
 * openModal({
 *   title: '削除確認',
 *   description: 'この操作は取り消せません',
 *   onConfirm: async () => { await deleteItem(); }
 * });
 *
 * // Render component
 * <WarningModalComponent />
 * ```
 */
export const useWarningModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Partial<WarningModalProps>>({});

  const openModal = (modalConfig: Omit<WarningModalProps, 'isOpen' | 'onClose'>): void => {
    setConfig(modalConfig);
    setIsOpen(true);
  };

  const closeModal = (): void => {
    setIsOpen(false);
    setConfig({});
  };

  const WarningModalComponent = (): React.ReactElement => (
    <WarningModal
      isOpen={isOpen}
      onClose={closeModal}
      onConfirm={
        config.onConfirm
          ? async () => {
              try {
                await config.onConfirm!();
                closeModal();
              } catch (error) {
                console.error('Confirmation action failed:', error);
              }
            }
          : () => {}
      }
      title={config.title || ''}
      description={config.description || ''}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      variant={config.variant}
      isLoading={config.isLoading}
      className={config.className}
    />
  );

  return {
    openModal,
    closeModal,
    WarningModalComponent,
  };
};
