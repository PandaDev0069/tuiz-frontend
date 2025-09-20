'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Play, X, Users, Clock } from 'lucide-react';

interface StartGameConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  playerCount: number;
  maxPlayers: number;
  roomCode: string;
  playSettings: {
    show_question_only?: boolean;
    show_explanation?: boolean;
    time_bonus?: boolean;
    streak_bonus?: boolean;
    show_correct_answer?: boolean;
    max_players?: number;
  };
}

export const StartGameConfirmationModal: React.FC<StartGameConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  playerCount,
  maxPlayers,
  roomCode,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <Card className="bg-white shadow-2xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                ゲーム開始確認
              </CardTitle>
            </div>
            <p className="text-gray-600">クイズを開始してもよろしいですか？</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Room Info */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">ルームコード</span>
                <span className="font-mono font-bold text-cyan-600 text-lg">{roomCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">参加者数</span>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-500" />
                  <span className="font-semibold text-gray-800">
                    {playerCount} / {maxPlayers}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">注意事項</p>
                  <p className="text-xs text-amber-700 mt-1">
                    ゲーム開始後は新しいプレイヤーの参加はできません
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="gradient2"
                onClick={onClose}
                className="flex-1 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                キャンセル
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                ゲーム開始
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
