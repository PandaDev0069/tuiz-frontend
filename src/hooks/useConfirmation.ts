// ====================================================
// File Name   : useConfirmation.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-14
// Last Update : 2025-09-14
//
// Description:
// - Universal confirmation hook using the warning modal
// - Provides confirmation dialogs with customizable options
// - Includes convenience methods for common confirmation types
// - Supports danger, warning, and info variants
//
// Notes:
// - Uses useWarningModal component for UI rendering
// - Provides confirm, confirmDelete, confirmAction, and confirmInfo methods
// - All confirmation methods return the WarningModalComponent for rendering
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useCallback } from 'react';

import { useWarningModal } from '@/components/ui';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const DEFAULT_CONFIRM_TEXT = '確認';
const DEFAULT_CANCEL_TEXT = 'キャンセル';
const DEFAULT_VARIANT = 'danger';

const CONFIRMATION_TEXTS = {
  DELETE_TITLE: '削除しますか？',
  DELETE_CONFIRM: '削除する',
  DELETE_DESCRIPTION: (itemName: string) =>
    `「${itemName}」を削除します。この操作は取り消すことができません。`,
  ACTION_TITLE: (actionName: string) => `${actionName}しますか？`,
  ACTION_DESCRIPTION: (actionName: string, itemName: string) =>
    `「${itemName}」を${actionName}します。`,
} as const;

const VARIANT_TYPES = {
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info',
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Options for confirmation dialog
 */
export interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Hook: useConfirmation
 * Description:
 * - Provides confirmation dialog functionality using warning modal
 * - Supports customizable confirmation options
 * - Includes convenience methods for common confirmation patterns
 * - Returns confirmation functions and modal component
 *
 * Returns:
 * - Object containing:
 *   - confirm (function): Generic confirmation function with full options
 *   - confirmDelete (function): Convenience method for delete confirmations
 *   - confirmAction (function): Convenience method for action confirmations
 *   - confirmInfo (function): Convenience method for info confirmations
 *   - WarningModalComponent (component): Modal component to render
 */
export const useConfirmation = () => {
  const { openModal, WarningModalComponent } = useWarningModal();

  const confirm = useCallback(
    (options: ConfirmationOptions) => {
      openModal({
        title: options.title,
        description: options.description,
        confirmText: options.confirmText || DEFAULT_CONFIRM_TEXT,
        cancelText: options.cancelText || DEFAULT_CANCEL_TEXT,
        variant: options.variant || DEFAULT_VARIANT,
        onConfirm: options.onConfirm,
      });
    },
    [openModal],
  );

  const confirmDelete = useCallback(
    (itemName: string, onConfirm: () => void | Promise<void>) => {
      confirm({
        title: CONFIRMATION_TEXTS.DELETE_TITLE,
        description: CONFIRMATION_TEXTS.DELETE_DESCRIPTION(itemName),
        confirmText: CONFIRMATION_TEXTS.DELETE_CONFIRM,
        cancelText: DEFAULT_CANCEL_TEXT,
        variant: VARIANT_TYPES.DANGER,
        onConfirm,
      });
    },
    [confirm],
  );

  const confirmAction = useCallback(
    (actionName: string, itemName: string, onConfirm: () => void | Promise<void>) => {
      confirm({
        title: CONFIRMATION_TEXTS.ACTION_TITLE(actionName),
        description: CONFIRMATION_TEXTS.ACTION_DESCRIPTION(actionName, itemName),
        confirmText: actionName,
        cancelText: DEFAULT_CANCEL_TEXT,
        variant: VARIANT_TYPES.WARNING,
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
        confirmText: DEFAULT_CONFIRM_TEXT,
        cancelText: DEFAULT_CANCEL_TEXT,
        variant: VARIANT_TYPES.INFO,
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

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
