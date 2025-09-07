'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Switch, Input, Label } from '@/components/ui';
import { Settings, Users, Clock, Trophy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { QuizPlaySettings } from '@/types/quiz';

interface PlaySettingsPanelProps {
  playSettings: Partial<QuizPlaySettings>;
  onPlaySettingsChange: (settings: Partial<QuizPlaySettings>) => void;
  isMobile: boolean;
  errors: Record<string, string>;
}

export const PlaySettingsPanel: React.FC<PlaySettingsPanelProps> = ({
  playSettings,
  onPlaySettingsChange,
  isMobile,
  errors,
}) => {
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [codeInput, setCodeInput] = useState(playSettings.code?.toString() || '');
  const [hasUserEdited, setHasUserEdited] = useState(false);

  // Auto-generate code when component mounts if no code is set or code is 0
  // Only auto-generate if user hasn't manually edited the code
  useEffect(() => {
    if ((!playSettings.code || playSettings.code === 0) && !hasUserEdited) {
      const randomCode = Math.floor(100000 + Math.random() * 900000);
      setCodeInput(randomCode.toString());
      onPlaySettingsChange({ code: randomCode });
    }
  }, [playSettings.code, onPlaySettingsChange, hasUserEdited]);

  const generateRandomCode = () => {
    setIsGeneratingCode(true);
    // Simulate code generation
    setTimeout(() => {
      const randomCode = Math.floor(100000 + Math.random() * 900000);
      setCodeInput(randomCode.toString());
      setHasUserEdited(false); // Reset flag since user explicitly requested new code
      onPlaySettingsChange({ code: randomCode });
      setIsGeneratingCode(false);
    }, 500);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow 6-digit numbers
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setCodeInput(value);
      setHasUserEdited(true); // Mark that user has started editing
      onPlaySettingsChange({ code: parseInt(value) || 0 });
    }
  };

  const handleCodeBlur = () => {
    // Format with leading zeros when user finishes typing
    if (codeInput && codeInput.length < 6) {
      const formattedCode = codeInput.padStart(6, '0');
      setCodeInput(formattedCode);
      onPlaySettingsChange({ code: parseInt(formattedCode) });
    }
  };

  const handleSwitchChange = (field: keyof QuizPlaySettings, value: boolean) => {
    onPlaySettingsChange({ [field]: value });
  };

  const handleMaxPlayersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 400) {
      onPlaySettingsChange({ max_players: value });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-sm">
      <CardHeader className={`${isMobile ? 'pb-4 px-4' : 'pb-6 px-6'}`}>
        <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            <Settings className="w-4 h-4" />
          </div>
          プレイ設定
        </CardTitle>
        <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
          クイズのプレイ方法と表示設定を調整できます
        </p>
      </CardHeader>

      <CardContent className={`${isMobile ? 'px-4' : 'px-6'}`}>
        <div className="space-y-6">
          {/* Quiz Code */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Label variant="primary" size={isMobile ? 'md' : 'lg'} className="font-semibold">
                クイズコード
              </Label>
              <button
                type="button"
                onClick={generateRandomCode}
                disabled={isGeneratingCode}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isGeneratingCode ? 'animate-spin' : ''}`} />
                {isGeneratingCode ? '生成中...' : 'ランダム生成'}
              </button>
            </div>
            <Input
              type="text"
              value={codeInput}
              onChange={handleCodeChange}
              onBlur={handleCodeBlur}
              placeholder="123456"
              maxLength={6}
              className="text-center text-lg font-mono tracking-wider"
            />
            {errors.code && <div className="text-red-600 text-sm mt-1">{errors.code}</div>}
            <p className="text-xs text-gray-500 mt-1">
              プレイヤーがクイズに参加する際に使用する6桁のコード
            </p>
          </div>

          {/* Display Settings */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h3
              className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900 mb-4`}
            >
              表示設定
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-600" />
                  <span className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700`}>
                    問題のみ表示
                  </span>
                </div>
                <Switch
                  checked={playSettings.show_question_only ?? true}
                  onCheckedChange={(checked) => handleSwitchChange('show_question_only', checked)}
                />
              </div>
              <p className="text-xs text-gray-500 ml-6">
                回答前に問題のみを表示し、選択肢は回答時に表示
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-gray-600" />
                  <span className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700`}>
                    正解を表示
                  </span>
                </div>
                <Switch
                  checked={playSettings.show_correct_answer ?? false}
                  onCheckedChange={(checked) => handleSwitchChange('show_correct_answer', checked)}
                />
              </div>
              <p className="text-xs text-gray-500 ml-6">回答後に正解を表示するかどうか</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700`}>
                    解説を表示
                  </span>
                </div>
                <Switch
                  checked={playSettings.show_explanation ?? true}
                  onCheckedChange={(checked) => handleSwitchChange('show_explanation', checked)}
                />
              </div>
              <p className="text-xs text-gray-500 ml-6">回答後に解説を表示するかどうか</p>
            </div>
          </div>

          {/* Bonus Settings */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h3
              className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900 mb-4`}
            >
              ボーナス設定
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700`}>
                    時間ボーナス
                  </span>
                </div>
                <Switch
                  checked={playSettings.time_bonus ?? true}
                  onCheckedChange={(checked) => handleSwitchChange('time_bonus', checked)}
                />
              </div>
              <p className="text-xs text-gray-500 ml-6">
                早く回答したプレイヤーにボーナスポイントを付与
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-gray-600" />
                  <span className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700`}>
                    連続正解ボーナス
                  </span>
                </div>
                <Switch
                  checked={playSettings.streak_bonus ?? true}
                  onCheckedChange={(checked) => handleSwitchChange('streak_bonus', checked)}
                />
              </div>
              <p className="text-xs text-gray-500 ml-6">
                連続で正解した場合にボーナスポイントを付与
              </p>
            </div>
          </div>

          {/* Player Limit */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-gray-600" />
              <Label variant="primary" size={isMobile ? 'md' : 'lg'} className="font-semibold">
                最大プレイヤー数
              </Label>
            </div>
            <Input
              type="number"
              value={playSettings.max_players || 400}
              onChange={handleMaxPlayersChange}
              min={1}
              max={400}
              className="w-24"
            />
            {errors.max_players && (
              <div className="text-red-600 text-sm mt-1">{errors.max_players}</div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              同時に参加できる最大プレイヤー数（1-400人）
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
