// ====================================================
// File Name   : QuestionNavigation.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-04
// Last Update : 2025-09-13
//
// Description:
// - Navigation component for quiz question creation flow
// - Provides previous and next buttons with validation state
// - Shows loading state during save operations
// - Displays validation error count when present
//
// Notes:
// - Client-only component (requires 'use client')
// - Next button is disabled when validation fails or loading
// ====================================================

'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const BUTTON_VARIANT_GRADIENT2 = 'gradient2';

const BUTTON_PADDING_CLASSES = 'px-6 md:px-8 text-sm md:text-base';
const CONTAINER_PADDING_CLASSES = 'pt-4 md:pt-6';

const ICON_SIZE = 'w-4 h-4';
const ICON_ANIMATION = 'animate-spin';
const ICON_MARGIN = 'mr-2';

const ERROR_TEXT_MARGIN = 'ml-2';
const ERROR_TEXT_SIZE = 'text-xs';

const DISABLED_STATE_CLASSES = 'opacity-50 cursor-not-allowed';

interface QuestionNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  canProceed: boolean;
  validationErrors: string[];
  isLoading?: boolean;
}

/**
 * Component: QuestionNavigation
 * Description:
 * - Renders navigation buttons for moving between quiz creation steps
 * - Previous button allows going back to previous step
 * - Next button is disabled when validation fails or during loading
 * - Shows loading spinner and text when saving
 * - Displays validation error count when errors are present
 *
 * Parameters:
 * - onPrevious (function): Callback when previous button is clicked
 * - onNext (function): Callback when next button is clicked
 * - canProceed (boolean): Whether user can proceed to next step
 * - validationErrors (string[]): Array of validation error messages
 * - isLoading (boolean, optional): Whether a save operation is in progress
 *
 * Returns:
 * - React.ReactElement: The navigation component
 *
 * Example:
 * ```tsx
 * <QuestionNavigation
 *   onPrevious={() => goToPreviousStep()}
 *   onNext={() => goToNextStep()}
 *   canProceed={isValid}
 *   validationErrors={errors}
 *   isLoading={isSaving}
 * />
 * ```
 */
export const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  onPrevious,
  onNext,
  canProceed,
  validationErrors,
  isLoading = false,
}) => {
  const isDisabled = !canProceed || isLoading;
  const hasErrors = !canProceed && validationErrors.length > 0;

  return (
    <div className={cn('flex justify-between', CONTAINER_PADDING_CLASSES)}>
      <Button
        variant={BUTTON_VARIANT_GRADIENT2}
        onClick={onPrevious}
        className={BUTTON_PADDING_CLASSES}
      >
        前へ戻る
      </Button>
      <Button
        variant={BUTTON_VARIANT_GRADIENT2}
        onClick={onNext}
        disabled={isDisabled}
        className={cn(BUTTON_PADDING_CLASSES, isDisabled && DISABLED_STATE_CLASSES)}
        title={!canProceed ? 'すべての問題を完成させてください' : ''}
      >
        {isLoading ? (
          <>
            <Loader2 className={cn(ICON_SIZE, ICON_ANIMATION, ICON_MARGIN)} />
            保存中...
          </>
        ) : (
          <>
            次へ進む
            {hasErrors && (
              <span className={cn(ERROR_TEXT_MARGIN, ERROR_TEXT_SIZE)}>
                ({validationErrors.length}個のエラー)
              </span>
            )}
          </>
        )}
      </Button>
    </div>
  );
};
