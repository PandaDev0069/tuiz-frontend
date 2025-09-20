'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header, PageContainer, Container, Main } from '@/components/ui';
import { HostSettingsModal } from '@/components/ui/overlays/host-settings-modal';
import {
  PlayerList,
  HostControls,
  RightPanel,
  StartGameConfirmationModal,
} from '@/components/host-waiting-room';
import { Settings } from 'lucide-react';
import { QuizPlaySettings } from '@/types/quiz';

export default function HostWaitingRoomPage() {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || '';
  const quizId = searchParams.get('quizId') || '';

  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playSettings, setPlaySettings] = useState<Partial<QuizPlaySettings>>({
    show_question_only: true,
    show_explanation: true,
    time_bonus: true,
    streak_bonus: true,
    show_correct_answer: false,
    max_players: 400,
  });

  // Room lock state
  const [isRoomLocked, setIsRoomLocked] = useState(false);

  // Start game confirmation modal state
  const [isStartConfirmOpen, setIsStartConfirmOpen] = useState(false);

  // Mock player data for now - will be replaced with real-time data
  const [players, setPlayers] = useState([
    { id: '1', name: 'プレイヤー1', joinedAt: new Date(), isHost: true },
    { id: '2', name: 'プレイヤー2', joinedAt: new Date() },
    { id: '3', name: 'プレイヤー3', joinedAt: new Date() },
    { id: '4', name: 'プレイヤー4', joinedAt: new Date() },
    { id: '5', name: 'プレイヤー5', joinedAt: new Date() },
  ]);

  // Player management functions
  const handlePlayerBan = (playerId: string) => {
    setPlayers((prev) =>
      prev.map((player) => (player.id === playerId ? { ...player, isBanned: true } : player)),
    );
  };

  const handleStartQuiz = () => {
    setIsStartConfirmOpen(true);
  };

  const handleConfirmStartQuiz = () => {
    // TODO: Implement actual quiz start logic
    console.log('Starting quiz with settings:', playSettings);
    // This will navigate to the quiz game page
  };

  const handleOpenScreen = () => {
    // Open host screen in new window
    const hostScreenUrl = `/host-screen?code=${roomCode}&quizId=${quizId}`;
    window.open(hostScreenUrl, 'host-screen', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  };

  const handleAddPlayer = () => {
    const newPlayer = {
      id: (players.length + 1).toString(),
      name: `プレイヤー${players.length + 1}`,
      joinedAt: new Date(),
    };
    setPlayers((prev) => [...prev, newPlayer]);
  };

  const handleRoomLockToggle = (isLocked: boolean) => {
    setIsRoomLocked(isLocked);
    // TODO: Implement actual room lock logic with backend
    console.log(`Room ${isLocked ? 'locked' : 'unlocked'}`);
  };

  return (
    <PageContainer>
      {/* Settings Button - Fixed Top Right */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed top-4 right-4 z-40 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        title="ゲーム設定"
      >
        <Settings className="w-5 h-5" />
      </button>

      <Header>
        <Container size="sm">
          <div className="flex flex-col items-center space-y-2 md:space-y-3">
            {/* Enhanced title */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                TUIZ情報王
              </h1>
              <div className="mt-2 flex justify-center space-x-1">
                <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce"></div>
                <div
                  className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </div>
        </Container>
      </Header>

      <Main className="flex-1">
        <Container size="lg" className="h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full py-6">
            {/* Left Panel - Player List */}
            <div className="lg:col-span-1 h-full">
              <PlayerList
                players={players}
                onPlayerBan={handlePlayerBan}
                onAddPlayer={handleAddPlayer}
                className="h-full"
              />
            </div>

            {/* Center Panel - Host Controls */}
            <div className="lg:col-span-1 h-full flex items-center justify-center">
              <HostControls
                roomCode={roomCode}
                onStartQuiz={handleStartQuiz}
                onOpenScreen={handleOpenScreen}
                className="w-full max-w-md h-fit"
              />
            </div>

            {/* Right Panel - Room Management */}
            <div className="lg:col-span-1 h-full">
              <RightPanel
                className="h-full"
                isRoomLocked={isRoomLocked}
                onRoomLockToggle={handleRoomLockToggle}
                playerCount={players.length}
                maxPlayers={playSettings.max_players || 400}
              />
            </div>
          </div>
        </Container>
      </Main>

      {/* Settings Modal */}
      <HostSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        playSettings={playSettings}
        onPlaySettingsChange={setPlaySettings}
        roomCode={roomCode}
      />

      {/* Start Game Confirmation Modal */}
      <StartGameConfirmationModal
        isOpen={isStartConfirmOpen}
        onClose={() => setIsStartConfirmOpen(false)}
        onConfirm={handleConfirmStartQuiz}
        playerCount={players.length}
        maxPlayers={playSettings.max_players || 400}
        roomCode={roomCode}
        playSettings={playSettings}
      />
    </PageContainer>
  );
}
