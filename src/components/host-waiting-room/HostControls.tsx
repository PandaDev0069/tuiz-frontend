'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { Play, Monitor, Settings } from 'lucide-react';

interface HostControlsProps {
  roomCode: string;
  onStartQuiz: () => void;
  onOpenScreen: () => void;
  className?: string;
}

export const HostControls: React.FC<HostControlsProps> = ({
  roomCode,
  onStartQuiz,
  onOpenScreen,
  className = '',
}) => {
  return (
    <Card
      className={`bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg ${className}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="w-5 h-5 text-green-600" />
          ホストコントロール
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Room Code Display */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">ルームコード</p>
          <div className="relative inline-block">
            {/* Outer glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur-lg opacity-30 scale-110"></div>

            {/* Main container with 3D effect */}
            <div className="relative bg-gradient-to-br from-green-100 via-emerald-50 to-green-100 px-6 py-4 rounded-xl border-2 border-green-300 shadow-2xl">
              {/* Inner highlight */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl"></div>

              <span className="relative text-3xl font-mono font-black bg-gradient-to-r from-green-700 via-emerald-600 to-green-700 bg-clip-text text-transparent tracking-wider">
                {roomCode || '------'}
              </span>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="space-y-3">
          {/* Screen Display Button */}
          <Button
            onClick={onOpenScreen}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Monitor className="w-5 h-5 mr-2" />
            画面表示
          </Button>

          {/* Start Quiz Button */}
          <Button
            onClick={onStartQuiz}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Play className="w-5 h-5 mr-2" />
            クイズ開始
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="flex justify-center space-x-2 pt-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div
            className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};
