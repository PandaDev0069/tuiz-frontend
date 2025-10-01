'use client';

import React from 'react';
import { Switch, Input, Label, Button } from '@/components/ui';
import { Settings, Users, Clock, Trophy, Eye, EyeOff, X } from 'lucide-react';
import { QuizPlaySettings } from '@/types/quiz';

interface HostSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playSettings: Partial<QuizPlaySettings>;
  onPlaySettingsChange: (settings: Partial<QuizPlaySettings>) => void;
  roomCode: string;
}

export const HostSettingsModal: React.FC<HostSettingsModalProps> = ({
  isOpen,
  onClose,
  playSettings,
  onPlaySettingsChange,
  roomCode,
}) => {
  const handleSwitchChange = (field: keyof QuizPlaySettings, value: boolean) => {
    onPlaySettingsChange({ [field]: value });
  };

  const handleMaxPlayersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 400) {
      onPlaySettingsChange({ max_players: value });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">ゲーム設定</h2>
                <p className="text-sm text-gray-600">ルームコード: {roomCode}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Room Code Section - Read Only */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-bold">
                #
              </div>
              <Label className="font-semibold text-gray-700">ルームコード</Label>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-300">
              <span className="text-2xl font-mono font-bold text-gray-800 tracking-wider">
                {roomCode}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">ルームコードは変更できません</p>
          </div>

          {/* Display Settings */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-600" />
              表示設定
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">問題のみ表示</span>
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
                  <span className="text-sm text-gray-700">正解を表示</span>
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
                  <span className="text-sm text-gray-700">解説を表示</span>
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
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-gray-600" />
              ボーナス設定
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">時間ボーナス</span>
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
                  <span className="text-sm text-gray-700">連続正解ボーナス</span>
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
              <Label className="font-semibold text-gray-700">最大プレイヤー数</Label>
            </div>
            <Input
              type="number"
              value={playSettings.max_players || 400}
              onChange={handleMaxPlayersChange}
              min={1}
              max={400}
              className="w-24"
            />
            <p className="text-xs text-gray-500 mt-1">
              同時に参加できる最大プレイヤー数（1-400人）
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg"
            >
              設定を保存
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
