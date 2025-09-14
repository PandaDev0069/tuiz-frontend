'use client';

import React from 'react';
import { Button } from '../core/button';
import { Text } from '../core/typography';
import { cn } from '@/lib/utils';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

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

export const WarningModal: React.FC<WarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '確認',
  cancelText = 'キャンセル',
  variant = 'danger',
  isLoading = false,
  className,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: 'text-red-500',
          confirmButton: 'bg-red-500 hover:bg-red-600 text-white',
          border: 'border-red-200',
        };
      case 'warning':
        return {
          icon: 'text-yellow-500',
          confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-white',
          border: 'border-yellow-200',
        };
      case 'info':
        return {
          icon: 'text-blue-500',
          confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white',
          border: 'border-blue-200',
        };
      default:
        return {
          icon: 'text-red-500',
          confirmButton: 'bg-red-500 hover:bg-red-600 text-white',
          border: 'border-red-200',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          'relative w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 transform transition-all duration-200',
          'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2',
          styles.border,
          className,
        )}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="閉じる"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="p-6 pt-8">
          {/* Icon and Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0">
              <AlertTriangle className={cn('w-8 h-8', styles.icon)} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
              <Text className="text-gray-600 leading-relaxed">{description}</Text>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-2 border-blue-400 hover:border-blue-500 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn('flex-1', styles.confirmButton)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

// Hook for easier usage
export const useWarningModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Partial<WarningModalProps>>({});

  const openModal = (modalConfig: Omit<WarningModalProps, 'isOpen' | 'onClose'>) => {
    setConfig(modalConfig);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setConfig({});
  };

  const WarningModalComponent = () => (
    <WarningModal
      isOpen={isOpen}
      onClose={closeModal}
      onConfirm={
        config.onConfirm
          ? async () => {
              try {
                await config.onConfirm!();
                closeModal(); // Close modal after successful confirmation
              } catch (error) {
                // If there's an error, keep the modal open
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
