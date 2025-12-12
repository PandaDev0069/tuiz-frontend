'use client';

import React from 'react';
import Image from 'next/image';
import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';

interface HostQuestionScreenProps {
  question: {
    id: string;
    text: string;
    image?: string;
    timeLimit: number;
  };
  currentTime: number;
  questionNumber: number;
  totalQuestions: number;
  onStartQuestion?: () => void;
  onRevealAnswer?: () => void;
  isLive?: boolean;
  isLoading?: boolean;
  errorMessage?: string;
}

export const HostQuestionScreen: React.FC<HostQuestionScreenProps> = ({
  question,
  currentTime,
  questionNumber,
  totalQuestions,
  onStartQuestion,
  onRevealAnswer,
  isLive = false,
  isLoading = false,
  errorMessage,
}) => {
  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        {/* Timer Bar with Question Counter and Timer Display */}
        <TimeBar
          currentTime={currentTime}
          timeLimit={question.timeLimit}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />

        {/* Default Background */}
        <div className="absolute inset-0">
          <QuizBackground variant="question" />
        </div>

        {/* Question Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Question Text with Image */}
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center max-w-6xl w-full">
              {/* Question Image (if available) */}
              {question.image && (
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-2xl h-64 md:h-80 rounded-xl overflow-hidden shadow-2xl mx-auto">
                    <Image
                      src={question.image}
                      alt="Question"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                    />
                    {/* Subtle overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/10" />
                  </div>
                </div>
              )}

              {/* Question Text */}
              <h1 className="text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white drop-shadow-2xl leading-tight mx-auto">
                {question.text}
              </h1>
            </div>
          </div>

          {/* Host Controls */}
          {(onStartQuestion || onRevealAnswer) && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-4">
              {!isLive && onStartQuestion && (
                <button
                  onClick={onStartQuestion}
                  disabled={isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '開始中...' : '質問を開始'}
                </button>
              )}
              {isLive && onRevealAnswer && (
                <button
                  onClick={onRevealAnswer}
                  disabled={isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '処理中...' : '答えを表示'}
                </button>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
              {errorMessage}
            </div>
          )}
        </div>
      </Main>
    </PageContainer>
  );
};
