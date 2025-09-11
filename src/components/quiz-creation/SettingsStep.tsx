'use client';

import React, { useState } from 'react';
import { CreateQuizSetForm, QuizPlaySettings } from '@/types/quiz';
import { PlaySettingsPanel } from './SettingsStep/PlaySettingsPanel';
import { SettingsNavigation } from './SettingsStep/SettingsNavigation';

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
}) => {
  const [isMobile, setIsMobile] = useState(false);

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
        />
      </div>

      {/* Navigation */}
      <SettingsNavigation onPrevious={onPrevious} onNext={onNext} isMobile={isMobile} />
    </div>
  );
};
