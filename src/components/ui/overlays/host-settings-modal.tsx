// ====================================================
// File Name   : host-settings-modal.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-18
// Last Update : 2025-09-21
//
// Description:
// - Modal component for host to configure game play settings
// - Allows modification of display settings, bonus settings, and player limits
// - Displays room code (read-only)
// - Handles settings changes and validation
//
// Notes:
// - Client component (uses 'use client' directive)
// - Uses React hooks for state management
// - Modal overlay with backdrop blur
// ====================================================

'use client';

import React from 'react';
import { Switch, Input, Label, Button } from '@/components/ui';
import { Settings, Users, Clock, Trophy, Eye, EyeOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuizPlaySettings } from '@/types/quiz';

const MIN_PLAYERS = 1;
const MAX_PLAYERS = 400;
const DEFAULT_MAX_PLAYERS = 400;

const OVERLAY_CLASSES =
  'fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4';
const MODAL_CLASSES =
  'bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto';
const HEADER_CLASSES = 'sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl';
const HEADER_ICON_WRAPPER_CLASSES =
  'w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full flex items-center justify-center';
const HEADER_ICON_CLASSES = 'w-5 h-5';
const CLOSE_BUTTON_CLASSES = 'p-2 hover:bg-gray-100 rounded-full transition-colors';
const CLOSE_ICON_CLASSES = 'w-5 h-5 text-gray-500';
const CONTENT_CLASSES = 'p-6 space-y-6';
const SECTION_CLASSES = 'bg-white rounded-lg p-4 border border-gray-200 shadow-sm';
const SECTION_HEADER_CLASSES = 'text-base font-semibold text-gray-900 mb-4 flex items-center gap-2';
const SECTION_ICON_CLASSES = 'w-4 h-4 text-gray-600';
const ROOM_CODE_SECTION_CLASSES = 'bg-gray-50 rounded-lg p-4 border border-gray-200';
const ROOM_CODE_ICON_WRAPPER_CLASSES =
  'w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-bold';
const ROOM_CODE_DISPLAY_CLASSES = 'bg-white px-4 py-3 rounded-lg border border-gray-300';
const ROOM_CODE_TEXT_CLASSES = 'text-2xl font-mono font-bold text-gray-800 tracking-wider';
const HELP_TEXT_CLASSES = 'text-xs text-gray-500';
const HELP_TEXT_INDENTED_CLASSES = 'text-xs text-gray-500 ml-6';
const SETTING_ROW_CLASSES = 'flex items-center justify-between';
const SETTING_LABEL_CLASSES = 'flex items-center gap-2';
const SETTING_TEXT_CLASSES = 'text-sm text-gray-700';
const FOOTER_CLASSES =
  'sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl';
const SAVE_BUTTON_CLASSES =
  'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg';
const INPUT_WIDTH_CLASSES = 'w-24';

export interface HostSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playSettings: Partial<QuizPlaySettings>;
  onPlaySettingsChange: (settings: Partial<QuizPlaySettings>) => void;
  roomCode: string;
}

/**
 * Function: handleSwitchChange
 * Description:
 * - Handles switch toggle changes for play settings
 * - Updates specific field in play settings
 *
 * Parameters:
 * - field (keyof QuizPlaySettings): Field name to update
 * - value (boolean): New value for the field
 * - onPlaySettingsChange (function): Callback to update settings
 *
 * Returns:
 * - void
 *
 * Example:
 * ```ts
 * handleSwitchChange('show_question_only', true, onPlaySettingsChange);
 * ```
 */
const handleSwitchChange = (
  field: keyof QuizPlaySettings,
  value: boolean,
  onPlaySettingsChange: (settings: Partial<QuizPlaySettings>) => void,
): void => {
  onPlaySettingsChange({ [field]: value });
};

/**
 * Function: handleMaxPlayersChange
 * Description:
 * - Handles max players input change
 * - Validates value is between MIN_PLAYERS and MAX_PLAYERS
 * - Updates max_players setting if valid
 *
 * Parameters:
 * - e (React.ChangeEvent<HTMLInputElement>): Input change event
 * - onPlaySettingsChange (function): Callback to update settings
 *
 * Returns:
 * - void
 *
 * Example:
 * ```ts
 * handleMaxPlayersChange(event, onPlaySettingsChange);
 * ```
 */
const handleMaxPlayersChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  onPlaySettingsChange: (settings: Partial<QuizPlaySettings>) => void,
): void => {
  const value = parseInt(e.target.value, 10);
  if (!isNaN(value) && value >= MIN_PLAYERS && value <= MAX_PLAYERS) {
    onPlaySettingsChange({ max_players: value });
  }
};

/**
 * Component: HostSettingsModal
 * Description:
 * - Modal component for host to configure game play settings
 * - Allows modification of display settings, bonus settings, and player limits
 * - Displays room code (read-only)
 * - Handles settings changes and validation
 * - Returns null if modal is not open
 *
 * Parameters:
 * - isOpen (boolean): Whether the modal is open
 * - onClose (function): Callback to close the modal
 * - playSettings (Partial<QuizPlaySettings>): Current play settings
 * - onPlaySettingsChange (function): Callback when settings change
 * - roomCode (string): Room code to display
 *
 * Returns:
 * - React.ReactElement | null: The host settings modal component or null if not open
 *
 * Example:
 * ```tsx
 * <HostSettingsModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   playSettings={settings}
 *   onPlaySettingsChange={handleChange}
 *   roomCode="ABC123"
 * />
 * ```
 */
export const HostSettingsModal: React.FC<HostSettingsModalProps> = ({
  isOpen,
  onClose,
  playSettings,
  onPlaySettingsChange,
  roomCode,
}) => {
  if (!isOpen) return null;

  return (
    <div className={OVERLAY_CLASSES}>
      <div className={MODAL_CLASSES}>
        <div className={HEADER_CLASSES}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={HEADER_ICON_WRAPPER_CLASSES}>
                <Settings className={HEADER_ICON_CLASSES} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">ゲーム設定</h2>
                <p className="text-sm text-gray-600">ルームコード: {roomCode}</p>
              </div>
            </div>
            <button onClick={onClose} className={CLOSE_BUTTON_CLASSES}>
              <X className={CLOSE_ICON_CLASSES} />
            </button>
          </div>
        </div>

        <div className={CONTENT_CLASSES}>
          <div className={ROOM_CODE_SECTION_CLASSES}>
            <div className="flex items-center gap-2 mb-3">
              <div className={ROOM_CODE_ICON_WRAPPER_CLASSES}>#</div>
              <Label className="font-semibold text-gray-700">ルームコード</Label>
            </div>
            <div className={ROOM_CODE_DISPLAY_CLASSES}>
              <span className={ROOM_CODE_TEXT_CLASSES}>{roomCode}</span>
            </div>
            <p className={cn(HELP_TEXT_CLASSES, 'mt-2')}>ルームコードは変更できません</p>
          </div>

          <div className={SECTION_CLASSES}>
            <h3 className={cn(SECTION_HEADER_CLASSES)}>
              <Eye className={SECTION_ICON_CLASSES} />
              表示設定
            </h3>
            <div className="space-y-4">
              <div className={SETTING_ROW_CLASSES}>
                <div className={SETTING_LABEL_CLASSES}>
                  <Eye className={SECTION_ICON_CLASSES} />
                  <span className={SETTING_TEXT_CLASSES}>問題のみ表示</span>
                </div>
                <Switch
                  checked={playSettings.show_question_only ?? true}
                  onCheckedChange={(checked) =>
                    handleSwitchChange('show_question_only', checked, onPlaySettingsChange)
                  }
                />
              </div>
              <p className={HELP_TEXT_INDENTED_CLASSES}>
                回答前に問題のみを表示し、選択肢は回答時に表示
              </p>

              <div className={SETTING_ROW_CLASSES}>
                <div className={SETTING_LABEL_CLASSES}>
                  <EyeOff className={SECTION_ICON_CLASSES} />
                  <span className={SETTING_TEXT_CLASSES}>正解を表示</span>
                </div>
                <Switch
                  checked={playSettings.show_correct_answer ?? false}
                  onCheckedChange={(checked) =>
                    handleSwitchChange('show_correct_answer', checked, onPlaySettingsChange)
                  }
                />
              </div>
              <p className={HELP_TEXT_INDENTED_CLASSES}>回答後に正解を表示するかどうか</p>

              <div className={SETTING_ROW_CLASSES}>
                <div className={SETTING_LABEL_CLASSES}>
                  <Settings className={SECTION_ICON_CLASSES} />
                  <span className={SETTING_TEXT_CLASSES}>解説を表示</span>
                </div>
                <Switch
                  checked={playSettings.show_explanation ?? true}
                  onCheckedChange={(checked) =>
                    handleSwitchChange('show_explanation', checked, onPlaySettingsChange)
                  }
                />
              </div>
              <p className={HELP_TEXT_INDENTED_CLASSES}>回答後に解説を表示するかどうか</p>
            </div>
          </div>

          <div className={SECTION_CLASSES}>
            <h3 className={cn(SECTION_HEADER_CLASSES)}>
              <Trophy className={SECTION_ICON_CLASSES} />
              ボーナス設定
            </h3>
            <div className="space-y-4">
              <div className={SETTING_ROW_CLASSES}>
                <div className={SETTING_LABEL_CLASSES}>
                  <Clock className={SECTION_ICON_CLASSES} />
                  <span className={SETTING_TEXT_CLASSES}>時間ボーナス</span>
                </div>
                <Switch
                  checked={playSettings.time_bonus ?? true}
                  onCheckedChange={(checked) =>
                    handleSwitchChange('time_bonus', checked, onPlaySettingsChange)
                  }
                />
              </div>
              <p className={HELP_TEXT_INDENTED_CLASSES}>
                早く回答したプレイヤーにボーナスポイントを付与
              </p>

              <div className={SETTING_ROW_CLASSES}>
                <div className={SETTING_LABEL_CLASSES}>
                  <Trophy className={SECTION_ICON_CLASSES} />
                  <span className={SETTING_TEXT_CLASSES}>連続正解ボーナス</span>
                </div>
                <Switch
                  checked={playSettings.streak_bonus ?? true}
                  onCheckedChange={(checked) =>
                    handleSwitchChange('streak_bonus', checked, onPlaySettingsChange)
                  }
                />
              </div>
              <p className={HELP_TEXT_INDENTED_CLASSES}>
                連続で正解した場合にボーナスポイントを付与
              </p>
            </div>
          </div>

          <div className={SECTION_CLASSES}>
            <div className="flex items-center gap-2 mb-3">
              <Users className={SECTION_ICON_CLASSES} />
              <Label className="font-semibold text-gray-700">最大プレイヤー数</Label>
            </div>
            <Input
              type="number"
              value={playSettings.max_players || DEFAULT_MAX_PLAYERS}
              onChange={(e) => handleMaxPlayersChange(e, onPlaySettingsChange)}
              min={MIN_PLAYERS}
              max={MAX_PLAYERS}
              className={INPUT_WIDTH_CLASSES}
            />
            <p className={cn(HELP_TEXT_CLASSES, 'mt-1')}>
              同時に参加できる最大プレイヤー数（1-400人）
            </p>
          </div>
        </div>

        <div className={FOOTER_CLASSES}>
          <div className="flex justify-end">
            <Button onClick={onClose} className={SAVE_BUTTON_CLASSES}>
              設定を保存
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
