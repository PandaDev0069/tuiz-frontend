// src/hooks/useConfirmation.ts
// Universal confirmation hook using the warning modal

import { useCallback } from 'react';
import { useWarningModal } from '@/components/ui';

export interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
}

export const useConfirmation = () => {
  const { openModal, WarningModalComponent } = useWarningModal();

  const confirm = useCallback(
    (options: ConfirmationOptions) => {
      openModal({
        title: options.title,
        description: options.description,
        confirmText: options.confirmText || '確認',
        cancelText: options.cancelText || 'キャンセル',
        variant: options.variant || 'danger',
        onConfirm: options.onConfirm,
      });
    },
    [openModal],
  );

  // Convenience methods for common confirmation types
  const confirmDelete = useCallback(
    (itemName: string, onConfirm: () => void | Promise<void>) => {
      confirm({
        title: '削除しますか？',
        description: `「${itemName}」を削除します。この操作は取り消すことができません。`,
        confirmText: '削除する',
        cancelText: 'キャンセル',
        variant: 'danger',
        onConfirm,
      });
    },
    [confirm],
  );

  const confirmAction = useCallback(
    (actionName: string, itemName: string, onConfirm: () => void | Promise<void>) => {
      confirm({
        title: `${actionName}しますか？`,
        description: `「${itemName}」を${actionName}します。`,
        confirmText: actionName,
        cancelText: 'キャンセル',
        variant: 'warning',
        onConfirm,
      });
    },
    [confirm],
  );

  const confirmInfo = useCallback(
    (title: string, description: string, onConfirm: () => void | Promise<void>) => {
      confirm({
        title,
        description,
        confirmText: '確認',
        cancelText: 'キャンセル',
        variant: 'info',
        onConfirm,
      });
    },
    [confirm],
  );

  return {
    confirm,
    confirmDelete,
    confirmAction,
    confirmInfo,
    WarningModalComponent,
  };
};
