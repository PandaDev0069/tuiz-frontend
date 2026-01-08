// ====================================================
// File Name   : SettingsStep.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-06
// Last Update : 2025-09-13
//
// Description:
// - Third step component in quiz creation/editing flow
// - Manages quiz play settings configuration
// - Validates play settings (code, max players) before proceeding
// - Handles saving play settings to backend
// - Displays play settings panel and navigation controls
//
// Notes:
// - Client-only component (requires 'use client')
// - Requires quizId to save settings to backend
// - Validates code format (6 digits) and max players range (1-400)
// ====================================================

'use client';

import React, { useState } from 'react';
import { CreateQuizSetForm, QuizPlaySettings } from '@/types/quiz';
import { PlaySettingsPanel } from './SettingsStep/PlaySettingsPanel';
import { SettingsNavigation } from './SettingsStep/SettingsNavigation';
import { useUpdatePlaySettings } from '@/hooks/useCodeManagement';

const MOBILE_BREAKPOINT = 768;

const CODE_MIN_VALUE = 100000;
const CODE_MAX_VALUE = 999999;
const CODE_DIGITS = 6;

const MAX_PLAYERS_MIN = 1;
const MAX_PLAYERS_MAX = 400;

const CONTAINER_SPACING_CLASSES = 'space-y-4 md:space-y-6';
const HEADER_CONTAINER_CLASSES = 'text-center mb-6';
const HEADER_TITLE_CLASSES = 'text-2xl md:text-3xl font-bold text-gray-900 mb-2';
const HEADER_DESCRIPTION_CLASSES = 'text-gray-600';
const SETTINGS_PANELS_CONTAINER_CLASSES = 'space-y-6';

interface SettingsStepProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
  onNext: () => void;
  onPrevious: () => void;
  errors?: Record<string, string>;
  quizId?: string;
}

/**
 * Component: SettingsStep
 * Description:
 * - Third step in quiz creation/editing workflow
 * - Manages quiz play settings configuration
 * - Validates play settings before allowing progression
 * - Saves play settings to backend before proceeding
 * - Displays play settings panel with validation errors
 * - Responsive design adapting to mobile and desktop
 *
 * Parameters:
 * - formData (Partial<CreateQuizSetForm>): Current form data
 * - onFormDataChange (function): Callback when form data changes
 * - onNext (function): Callback to proceed to next step
 * - onPrevious (function): Callback to go back to previous step
 * - errors (Record<string, string>, optional): Form validation errors
 * - quizId (string, optional): ID of quiz being edited
 *
 * Returns:
 * - React.ReactElement: The settings step component
 *
 * Example:
 * ```tsx
 * <SettingsStep
 *   formData={formData}
 *   onFormDataChange={(data) => setFormData(data)}
 *   onNext={() => goToNextStep()}
 *   onPrevious={() => goToPreviousStep()}
 *   errors={errors}
 *   quizId={quizId}
 * />
 * ```
 */
export const SettingsStep: React.FC<SettingsStepProps> = ({
  formData,
  onFormDataChange,
  onNext,
  onPrevious,
  errors = {},
  quizId,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updatePlaySettingsMutation = useUpdatePlaySettings();

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  /**
   * Function: handlePlaySettingsChange
   * Description:
   * - Updates play settings in form data
   * - Merges new settings with existing play settings
   *
   * Parameters:
   * - playSettings (Partial<QuizPlaySettings>): New play settings to apply
   */
  const handlePlaySettingsChange = (playSettings: Partial<QuizPlaySettings>) => {
    onFormDataChange({
      play_settings: {
        ...formData.play_settings,
        ...playSettings,
      },
    });
  };

  /**
   * Function: validatePlaySettings
   * Description:
   * - Validates play settings for required fields and value ranges
   * - Checks if play settings object exists
   * - Validates code is 6 digits (100000-999999)
   * - Validates max_players is within range (1-400)
   *
   * Returns:
   * - Object with isValid boolean and errors object
   *
   * Example:
   * ```ts
   * const result = validatePlaySettings();
   * // { isValid: true, errors: {} }
   * ```
   */
  const validatePlaySettings = (): { isValid: boolean; errors: Record<string, string> } => {
    const playSettings = formData.play_settings;
    const errors: Record<string, string> = {};

    if (!playSettings) {
      return { isValid: false, errors: { play_settings: 'プレイ設定が必要です' } };
    }

    if (
      playSettings.code &&
      (playSettings.code < CODE_MIN_VALUE || playSettings.code > CODE_MAX_VALUE)
    ) {
      errors.code = `コードは${CODE_DIGITS}桁の数字である必要があります`;
    }

    if (
      playSettings.max_players &&
      (playSettings.max_players < MAX_PLAYERS_MIN || playSettings.max_players > MAX_PLAYERS_MAX)
    ) {
      errors.max_players = `最大プレイヤー数は${MAX_PLAYERS_MIN}-${MAX_PLAYERS_MAX}の範囲で設定してください`;
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  };

  /**
   * Function: handleNext
   * Description:
   * - Validates play settings before proceeding
   * - Saves play settings to backend
   * - Proceeds to next step on success
   * - Handles errors gracefully, still proceeds if save fails
   */
  const handleNext = async () => {
    if (!quizId) {
      console.error('No quiz ID available for saving settings');
      onNext();
      return;
    }

    const validation = validatePlaySettings();
    if (!validation.isValid) {
      console.error('Play settings validation failed:', validation.errors);
      onFormDataChange({ ...formData });
      return;
    }

    setIsSaving(true);
    try {
      await updatePlaySettingsMutation.mutateAsync({
        quizId,
        playSettings: formData.play_settings || {},
      });
      onNext();
    } catch (error) {
      console.error('Failed to save play settings:', error);
      onNext();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={CONTAINER_SPACING_CLASSES}>
      <div className={HEADER_CONTAINER_CLASSES}>
        <h2 className={HEADER_TITLE_CLASSES}>クイズ設定</h2>
        <p className={HEADER_DESCRIPTION_CLASSES}>クイズのプレイ設定を調整してください</p>
      </div>

      <div className={SETTINGS_PANELS_CONTAINER_CLASSES}>
        <PlaySettingsPanel
          playSettings={formData.play_settings || {}}
          onPlaySettingsChange={handlePlaySettingsChange}
          isMobile={isMobile}
          errors={errors}
          quizId={quizId}
        />
      </div>

      <SettingsNavigation
        onPrevious={onPrevious}
        onNext={handleNext}
        isMobile={isMobile}
        isLoading={isSaving || updatePlaySettingsMutation.isPending}
      />
    </div>
  );
};
