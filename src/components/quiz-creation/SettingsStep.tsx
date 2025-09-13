'use client';

import React, { useState } from 'react';
import { CreateQuizSetForm, QuizPlaySettings } from '@/types/quiz';
import { PlaySettingsPanel } from './SettingsStep/PlaySettingsPanel';
import { SettingsNavigation } from './SettingsStep/SettingsNavigation';
import { useUpdatePlaySettings } from '@/hooks/useCodeManagement';

interface SettingsStepProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
  onNext: () => void;
  onPrevious: () => void;
  errors?: Record<string, string>;
  quizId?: string;
}

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

  // Hook for updating play settings
  const updatePlaySettingsMutation = useUpdatePlaySettings();

  // Handle screen size detection
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handlePlaySettingsChange = (playSettings: Partial<QuizPlaySettings>) => {
    onFormDataChange({
      play_settings: {
        ...formData.play_settings,
        ...playSettings,
      },
    });
  };

  // Validate play settings
  const validatePlaySettings = (): { isValid: boolean; errors: Record<string, string> } => {
    const playSettings = formData.play_settings;
    const errors: Record<string, string> = {};

    if (!playSettings) {
      return { isValid: false, errors: { play_settings: 'プレイ設定が必要です' } };
    }

    // Check if code is valid (6 digits)
    if (playSettings.code && (playSettings.code < 100000 || playSettings.code > 999999)) {
      errors.code = 'コードは6桁の数字である必要があります';
    }

    // Check if max_players is valid
    if (
      playSettings.max_players &&
      (playSettings.max_players < 1 || playSettings.max_players > 400)
    ) {
      errors.max_players = '最大プレイヤー数は1-400の範囲で設定してください';
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  };

  // Handle next button with saving
  const handleNext = async () => {
    if (!quizId) {
      console.error('No quiz ID available for saving settings');
      onNext();
      return;
    }

    const validation = validatePlaySettings();
    if (!validation.isValid) {
      console.error('Play settings validation failed:', validation.errors);
      // Update form errors to show validation messages
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
      // Still proceed to next step even if save fails
      onNext();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">クイズ設定</h2>
        <p className="text-gray-600">クイズのプレイ設定を調整してください</p>
      </div>

      {/* Settings Panels */}
      <div className="space-y-6">
        {/* Play Settings */}
        <PlaySettingsPanel
          playSettings={formData.play_settings || {}}
          onPlaySettingsChange={handlePlaySettingsChange}
          isMobile={isMobile}
          errors={errors}
          quizId={quizId}
        />
      </div>

      {/* Navigation */}
      <SettingsNavigation
        onPrevious={onPrevious}
        onNext={handleNext}
        isMobile={isMobile}
        isLoading={isSaving || updatePlaySettingsMutation.isPending}
      />
    </div>
  );
};
