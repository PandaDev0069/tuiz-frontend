// ====================================================
// File Name   : PlayerQuestionScreen.tsx
// Project     : TUIZ
// Author      : TUIZ Team
// Created     : 2025-09-21
// Last Update : 2025-12-28
//
// Description:
// - Displays the question screen for players during a quiz game
// - Shows question text with optional image
// - Displays timer bar with question counter
// - Implements responsive design for mobile and desktop
//
// Notes:
// - Client-only component (requires 'use client')
// - Supports optional question images
// - Timer warning state activates when time is low
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
const TIMER_WARNING_THRESHOLD_SECONDS = 3;
const DEFAULT_IS_MOBILE = true;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
interface PlayerQuestionScreenProps {
  question: {
    id: string;
    text: string;
    image?: string;
    timeLimit: number;
    choices: Array<{
      id: string;
      text: string;
      letter: string;
    }>;
  };
  currentTime: number;
  questionNumber: number;
  totalQuestions: number;
  isMobile?: boolean;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Component: PlayerQuestionScreen
 * Description:
 * - Renders the question screen for players during a quiz game
 * - Displays question text with optional image
 * - Shows timer bar with question counter and time remaining
 * - Implements responsive design with separate mobile and desktop layouts
 *
 * Parameters:
 * - question (object): Question data including id, text, optional image, timeLimit, and choices
 * - currentTime (number): Current time remaining in seconds
 * - questionNumber (number): Current question number (1-indexed)
 * - totalQuestions (number): Total number of questions in the quiz
 * - isMobile (boolean, optional): Whether to use mobile layout (default: true)
 *
 * Returns:
 * - React.ReactElement: The question screen component
 *
 * Example:
 * ```tsx
 * <PlayerQuestionScreen
 *   question={{
 *     id: '1',
 *     text: 'What is the capital of France?',
 *     image: '/images/france.jpg',
 *     timeLimit: 30,
 *     choices: [...]
 *   }}
 *   currentTime={25}
 *   questionNumber={1}
 *   totalQuestions={10}
 *   isMobile={false}
 * />
 * ```
 */
export const PlayerQuestionScreen: React.FC<PlayerQuestionScreenProps> = ({
  question,
  currentTime,
  questionNumber,
  totalQuestions,
  isMobile = DEFAULT_IS_MOBILE,
}) => {
  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        <TimeBar
          currentTime={currentTime}
          timeLimit={question.timeLimit}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          isWarning={currentTime <= TIMER_WARNING_THRESHOLD_SECONDS && currentTime > 0}
          isExpired={false}
        />

        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        <div className="relative z-10 h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center px-2">
            <div className="text-center max-w-4xl w-full">
              {question.image && (
                <div className="mb-6 flex justify-center">
                  <div
                    className={`relative w-full ${isMobile ? 'max-w-lg h-48' : 'max-w-xl h-56'} rounded-lg overflow-hidden shadow-xl mx-auto`}
                  >
                    <Image
                      src={question.image}
                      alt="Question"
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                    />
                    <div className="absolute inset-0 bg-black/10" />
                  </div>
                </div>
              )}

              <h1
                className={`${isMobile ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-3xl md:text-4xl lg:text-5xl'} font-bold text-white drop-shadow-2xl leading-tight mx-auto`}
              >
                {question.text}
              </h1>
            </div>
          </div>
        </div>
      </Main>
    </PageContainer>
  );
};
