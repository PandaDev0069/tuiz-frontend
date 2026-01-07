// ====================================================
// File Name   : HostQuestionScreen.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-21
// Last Update : 2025-12-12
//
// Description:
// - Host screen component for displaying questions
// - Shows question text and optional image
// - Provides controls to start question or reveal answer
// - Displays timer and question counter
//
// Notes:
// - Supports loading and error states
// - Shows different buttons based on question state (not live vs live)
// ====================================================

'use client';

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import React from 'react';
import Image from 'next/image';

import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const IMAGE_ALT_TEXT = 'Question';
const OVERLAY_OPACITY = 'bg-black/10';

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
export interface QuestionData {
  id: string;
  text: string;
  image?: string;
  timeLimit: number;
}

export interface HostQuestionScreenProps {
  question: QuestionData;
  currentTime: number;
  questionNumber: number;
  totalQuestions: number;
  onStartQuestion?: () => void;
  onRevealAnswer?: () => void;
  isLive?: boolean;
  isLoading?: boolean;
  errorMessage?: string;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Component: HostQuestionScreen
 * Description:
 * - Displays question screen for host with question text and image
 * - Shows timer and question counter
 * - Provides controls to start question or reveal answer
 * - Handles loading and error states
 *
 * Parameters:
 * - question (QuestionData): Question data with text, image, and time limit
 * - currentTime (number): Current time remaining in seconds
 * - questionNumber (number): Current question number
 * - totalQuestions (number): Total number of questions
 * - onStartQuestion (function, optional): Callback when starting question
 * - onRevealAnswer (function, optional): Callback when revealing answer
 * - isLive (boolean, optional): Whether question is currently live (default: false)
 * - isLoading (boolean, optional): Whether an action is in progress (default: false)
 * - errorMessage (string, optional): Error message to display
 *
 * Returns:
 * - JSX.Element: Host question screen component
 */
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
        <TimeBar
          currentTime={currentTime}
          timeLimit={question.timeLimit}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />

        <div className="absolute inset-0">
          <QuizBackground variant="question" />
        </div>

        <div className="relative z-10 h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center max-w-6xl w-full">
              {question.image && (
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-2xl h-64 md:h-80 rounded-xl overflow-hidden shadow-2xl mx-auto">
                    <Image
                      src={question.image}
                      alt={IMAGE_ALT_TEXT}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                    />
                    <div className={`absolute inset-0 ${OVERLAY_OPACITY}`} />
                  </div>
                </div>
              )}

              <h1 className="text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white drop-shadow-2xl leading-tight mx-auto">
                {question.text}
              </h1>
            </div>
          </div>

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

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
