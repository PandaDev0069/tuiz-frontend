'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';
import { Question } from '@/types/game';

interface PlayerAnswerScreenProps {
  question: Question;
  currentTime: number;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSelect: (answerId: string) => void;
  onAnswerSubmit: (answerId: string) => void;
  isMobile?: boolean;
  isSubmitted?: boolean;
  isProcessing?: boolean;
  error?: string | null;
}

export const PlayerAnswerScreen: React.FC<PlayerAnswerScreenProps> = ({
  question,
  currentTime,
  questionNumber,
  totalQuestions,
  onAnswerSelect,
  onAnswerSubmit,
  isMobile = true,
  isSubmitted = false,
  isProcessing = false,
  error = null,
}) => {
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  const handleAnswerSelect = useCallback(
    (answerId: string) => {
      // If already submitted or processing, don't allow another click
      if (isSubmitted || isProcessing) {
        return;
      }

      setSelectedAnswerId(answerId);
      onAnswerSelect(answerId);
      onAnswerSubmit(answerId);
    },
    [isSubmitted, isProcessing, onAnswerSelect, onAnswerSubmit],
  );

  // Sync local selection with prop if needed
  React.useEffect(() => {
    if (!isSubmitted && !isProcessing) {
      setSelectedAnswerId(null);
    }
  }, [question.id, isSubmitted, isProcessing]);

  // If there's an error, we might want to allow re-selection
  // but usually the hook handles the error state.
  // The documentation says: "If submission fails and hasAnswered = false: Player can click answer again to retry"
  // Since we use isSubmitted from props, we just need to ensure the parent handles it correctly.

  const hasAnswered = !!selectedAnswerId;

  const TrueFalseLayout = () => (
    <div className="grid grid-cols-2 gap-6 md:gap-8 w-full max-w-3xl mx-auto">
      {question.choices.map((choice) => {
        const isTrue =
          choice.text === 'True' ||
          choice.text === '正しい' ||
          choice.text === 'はい' ||
          choice.text === '○';

        // Colorful backgrounds for each option
        const colorClass = isTrue
          ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-400' // True/○
          : 'bg-gradient-to-br from-red-500 to-red-600 border-red-400'; // False/×

        const isSelected = selectedAnswerId === choice.id;
        const isOtherSelected = selectedAnswerId && selectedAnswerId !== choice.id;

        return (
          <button
            key={choice.id}
            onClick={() => handleAnswerSelect(choice.id)}
            disabled={isSubmitted || isProcessing}
            className={`relative p-8 md:p-10 rounded-3xl border-4 transition-all duration-200 ${colorClass} shadow-xl backdrop-blur-sm ${
              isSubmitted || isProcessing
                ? isSelected
                  ? 'brightness-110 ring-4 ring-white/50 cursor-not-allowed'
                  : isOtherSelected
                    ? 'opacity-40 cursor-not-allowed'
                    : 'opacity-70 cursor-not-allowed'
                : 'hover:brightness-110 active:scale-98'
            }`}
          >
            {/* Choice Content */}
            <div className="text-center">
              <div className="text-6xl md:text-8xl font-bold text-white mb-4">
                {isTrue ? '○' : '×'}
              </div>
              <div className="text-xl md:text-2xl font-medium text-white/95">{choice.text}</div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const TwoOptionLayout = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl mx-auto">
      {question.choices.map((choice, index) => {
        // Colorful backgrounds for each option
        const colorClasses = [
          'bg-gradient-to-r from-purple-500 to-purple-600 border-purple-400',
          'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400',
        ];

        const isSelected = selectedAnswerId === choice.id;
        const isOtherSelected = selectedAnswerId && selectedAnswerId !== choice.id;

        return (
          <button
            key={choice.id}
            onClick={() => handleAnswerSelect(choice.id)}
            disabled={isSubmitted || isProcessing}
            className={`relative w-full p-7 md:p-10 rounded-3xl border-4 transition-all duration-200 ${colorClasses[index]} shadow-xl backdrop-blur-sm ${
              isSubmitted || isProcessing
                ? isSelected
                  ? 'brightness-110 ring-4 ring-white/50 cursor-not-allowed'
                  : isOtherSelected
                    ? 'opacity-40 cursor-not-allowed'
                    : 'opacity-70 cursor-not-allowed'
                : 'hover:brightness-110 active:scale-98'
            }`}
          >
            {/* Choice Content */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl md:text-4xl font-bold text-white">{choice.letter}</span>
              </div>
              <div className="text-xl md:text-2xl font-bold text-white text-center leading-tight">
                {choice.text}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const ThreeOptionLayout = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 w-full max-w-5xl mx-auto">
      {question.choices.map((choice, index) => {
        // Colorful backgrounds for each option
        const colorClasses = [
          'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400',
          'bg-gradient-to-r from-pink-500 to-pink-600 border-pink-400',
          'bg-gradient-to-r from-cyan-500 to-cyan-600 border-cyan-400',
        ];

        const isSelected = selectedAnswerId === choice.id;
        const isOtherSelected = selectedAnswerId && selectedAnswerId !== choice.id;

        return (
          <button
            key={choice.id}
            onClick={() => handleAnswerSelect(choice.id)}
            disabled={isSubmitted || isProcessing}
            className={`relative w-full p-6 md:p-8 rounded-3xl border-4 transition-all duration-200 ${colorClasses[index]} shadow-xl backdrop-blur-sm ${
              isSubmitted || isProcessing
                ? isSelected
                  ? 'brightness-110 ring-4 ring-white/50 cursor-not-allowed'
                  : isOtherSelected
                    ? 'opacity-40 cursor-not-allowed'
                    : 'opacity-70 cursor-not-allowed'
                : 'hover:brightness-110 active:scale-98'
            }`}
          >
            {/* Choice Content */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl md:text-3xl font-bold text-white">{choice.letter}</span>
              </div>
              <div className="text-lg md:text-xl font-bold text-white text-center leading-tight">
                {choice.text}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const FourOptionLayout = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-6xl mx-auto">
      {question.choices.map((choice, index) => {
        // Colorful backgrounds for each option
        const colorClasses = [
          'bg-gradient-to-br from-red-500 to-red-600 border-red-400', // A
          'bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-400', // B
          'bg-gradient-to-br from-green-500 to-green-600 border-green-400', // C
          'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400', // D
        ];

        const isSelected = selectedAnswerId === choice.id;
        const isOtherSelected = selectedAnswerId && selectedAnswerId !== choice.id;

        return (
          <button
            key={choice.id}
            onClick={() => handleAnswerSelect(choice.id)}
            disabled={isSubmitted || isProcessing}
            className={`relative p-6 md:p-8 rounded-3xl border-4 transition-all duration-200 ${colorClasses[index]} shadow-xl backdrop-blur-sm ${
              isSubmitted || isProcessing
                ? isSelected
                  ? 'brightness-110 ring-4 ring-white/50 cursor-not-allowed'
                  : isOtherSelected
                    ? 'opacity-40 cursor-not-allowed'
                    : 'opacity-70 cursor-not-allowed'
                : 'hover:brightness-110 active:scale-98'
            }`}
          >
            {/* Choice Content */}
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl md:text-3xl font-bold text-white">{choice.letter}</span>
              </div>
              <div className="text-lg md:text-xl font-bold text-white leading-tight">
                {choice.text}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  // Memoize the answer layout to prevent unnecessary re-renders
  // Only re-render when question, selection state, or submission state changes
  // Must be defined after all layout components
  const renderAnswerLayout = useMemo(() => {
    switch (question.type) {
      case 'true_false':
        return <TrueFalseLayout />;
      case 'multiple_choice_2':
        return <TwoOptionLayout />;
      case 'multiple_choice_3':
        return <ThreeOptionLayout />;
      case 'multiple_choice_4':
      default:
        return <FourOptionLayout />;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    question.id,
    question.type,
    question.choices.length,
    selectedAnswerId,
    isSubmitted,
    isProcessing,
  ]);

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        {/* Timer Bar */}
        <TimeBar
          currentTime={currentTime}
          timeLimit={question.timeLimit}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          isWarning={currentTime <= 5 && currentTime > 0}
          isExpired={currentTime <= 0}
        />

        {/* Same background as question screen */}
        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Spacer to push content down */}
          <div className="flex-shrink-0 h-24 md:h-32"></div>

          {/* Question Text and Image */}
          <div className="px-4 py-1">
            <div className="text-center max-w-4xl mx-auto">
              {/* Question Image (if available) */}
              {question.image && (
                <div className="mb-4 flex justify-center">
                  <div
                    className={`relative w-full ${isMobile ? 'max-w-md h-40 md:h-48' : 'max-w-lg h-48 md:h-56'} rounded-lg overflow-hidden shadow-xl`}
                  >
                    <Image
                      src={question.image}
                      alt="Question"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                  </div>
                </div>
              )}

              {/* Question Text */}
              <h2
                className={`${isMobile ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'} font-bold text-white drop-shadow-lg leading-tight mb-5`}
              >
                {question.text}
              </h2>

              {/* Status Indicator */}
              {(isSubmitted || hasAnswered) && (
                <div className="mt-2 mb-4 animate-pulse flex items-center justify-center space-x-2">
                  <div
                    className={`px-6 py-2 rounded-full font-bold text-lg shadow-lg ${
                      error
                        ? 'bg-red-500/80 text-white'
                        : isProcessing
                          ? 'bg-blue-500/80 text-white'
                          : 'bg-green-500/80 text-white border-2 border-white/30'
                    }`}
                  >
                    <div className="flex items-center">
                      {error ? (
                        <>
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>送信エラー: 再試行してください</span>
                        </>
                      ) : isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          <span>送信中...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>回答済み</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Answer Options */}
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="w-full">{renderAnswerLayout}</div>
          </div>
        </div>
      </Main>
    </PageContainer>
  );
};
