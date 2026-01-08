// ====================================================
// File Name   : HostControls.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-19
// Last Update : 2025-09-19
//
// Description:
// - Host control panel component for the waiting room
// - Displays room code with decorative styling
// - Provides buttons to open screen display and start quiz
// - Includes animated decorative elements
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses Lucide React icons for UI elements
// - Implements gradient styling and hover effects
// ====================================================

'use client';

import React from 'react';
import { Play, Monitor, Settings } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';

const DEFAULT_CLASS_NAME = '';
const DEFAULT_ROOM_CODE_PLACEHOLDER = '------';

const ICON_SIZE = 'w-5 h-5';
const DECORATIVE_DOT_SIZE = 'w-2 h-2';

const ANIMATION_DELAY_FIRST = '0.1s';
const ANIMATION_DELAY_SECOND = '0.2s';

interface HostControlsProps {
  roomCode: string;
  onStartQuiz: () => void;
  onOpenScreen: () => void;
  className?: string;
}

/**
 * Component: HostControls
 * Description:
 * - Renders the host control panel in the waiting room
 * - Displays the room code with decorative 3D styling and glow effects
 * - Provides action buttons for opening screen display and starting the quiz
 * - Includes animated decorative dots at the bottom
 *
 * Parameters:
 * - roomCode (string): The room code to display
 * - onStartQuiz (function): Callback function when start quiz button is clicked
 * - onOpenScreen (function): Callback function when open screen button is clicked
 * - className (string, optional): Additional CSS classes to apply to the card
 *
 * Returns:
 * - React.ReactElement: The host controls component
 *
 * Example:
 * ```tsx
 * <HostControls
 *   roomCode="ABC123"
 *   onStartQuiz={() => handleStartQuiz()}
 *   onOpenScreen={() => handleOpenScreen()}
 *   className="mb-4"
 * />
 * ```
 */
export const HostControls: React.FC<HostControlsProps> = ({
  roomCode,
  onStartQuiz,
  onOpenScreen,
  className = DEFAULT_CLASS_NAME,
}) => {
  return (
    <Card
      className={`bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg ${className}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className={`${ICON_SIZE} text-green-600`} />
          ホストコントロール
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">ルームコード</p>
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur-lg opacity-30 scale-110"></div>

            <div className="relative bg-gradient-to-br from-green-100 via-emerald-50 to-green-100 px-6 py-4 rounded-xl border-2 border-green-300 shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl"></div>

              <span className="relative text-3xl font-mono font-black bg-gradient-to-r from-green-700 via-emerald-600 to-green-700 bg-clip-text text-transparent tracking-wider">
                {roomCode || DEFAULT_ROOM_CODE_PLACEHOLDER}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onOpenScreen}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Monitor className={`${ICON_SIZE} mr-2`} />
            画面表示
          </Button>

          <Button
            onClick={onStartQuiz}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Play className={`${ICON_SIZE} mr-2`} />
            クイズ開始
          </Button>
        </div>

        <div className="flex justify-center space-x-2 pt-2">
          <div className={`${DECORATIVE_DOT_SIZE} bg-green-400 rounded-full animate-bounce`}></div>
          <div
            className={`${DECORATIVE_DOT_SIZE} bg-emerald-400 rounded-full animate-bounce`}
            style={{ animationDelay: ANIMATION_DELAY_FIRST }}
          ></div>
          <div
            className={`${DECORATIVE_DOT_SIZE} bg-green-400 rounded-full animate-bounce`}
            style={{ animationDelay: ANIMATION_DELAY_SECOND }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};
