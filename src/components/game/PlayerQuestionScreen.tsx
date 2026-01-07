// ====================================================
// File Name   : PlayerQuestionScreen.tsx
// Project     : TUIZ
// Author      : TUIZ Team
// Created     : 2025-09-21
// Last Update : 2025-12-28
//
// Description:
// - Displays the question screen for players during the game
// - Shows question text, optional image, timer bar, and question counter
// - Implements responsive design for mobile and desktop layouts
// - Displays time warnings when time is running low
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses Next.js Image component for optimized image loading
// - Supports optional question images with overlay for readability
// ====================================================

'use client';

import React from 'react';
import Image from 'next/image';

import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';

const TIME_WARNING_THRESHOLD = 3;
const IMAGE_OVERLAY_OPACITY = 'bg-black/10';

const MOBILE_IMAGE_MAX_WIDTH = 'max-w-lg';
const MOBILE_IMAGE_HEIGHT = 'h-48';
const DESKTOP_IMAGE_MAX_WIDTH = 'max-w-xl';
const DESKTOP_IMAGE_HEIGHT = 'h-56';

interface QuestionChoice {
  id: string;
  text: string;
  letter: string;
}

interface Question {
  id: string;
  text: string;
  image?: string;
  timeLimit: number;
  choices: QuestionChoice[];
}

interface PlayerQuestionScreenProps {
  question: Question;
  currentTime: number;
  questionNumber: number;
  totalQuestions: number;
  isMobile?: boolean;
}

/**
 * Component: PlayerQuestionScreen
 * Description:
 * - Renders the question screen for players during the game
 * - Displays question text, optional image, timer bar, and question counter
 * - Implements responsive design for mobile and desktop layouts
 * - Shows time warnings when time is running low
 *
 * @param {Question} question - Question data including text, image, time limit, and choices
 * @param {number} currentTime - Current remaining time in seconds
 * @param {number} questionNumber - Current question number for display
 * @param {number} totalQuestions - Total number of questions for display
 * @param {boolean} [isMobile] - Whether the device is mobile (default: true)
 * @returns {React.ReactElement} The question screen component
 *
 * @example
 * ```tsx
 * <PlayerQuestionScreen
 *   question={{
 *     id: 'q1',
 *     text: 'What is the capital of France?',
 *     image: '/path/to/image.jpg',
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
  isMobile = true,
}) => {
  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        <TimeBar
          currentTime={currentTime}
          timeLimit={question.timeLimit}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          isWarning={currentTime <= TIME_WARNING_THRESHOLD && currentTime > 0}
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
                    className={`relative w-full ${
                      isMobile
                        ? `${MOBILE_IMAGE_MAX_WIDTH} ${MOBILE_IMAGE_HEIGHT}`
                        : `${DESKTOP_IMAGE_MAX_WIDTH} ${DESKTOP_IMAGE_HEIGHT}`
                    } rounded-lg overflow-hidden shadow-xl mx-auto`}
                  >
                    <Image
                      src={question.image}
                      alt="Question"
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                    />
                    <div className={`absolute inset-0 ${IMAGE_OVERLAY_OPACITY}`} />
                  </div>
                </div>
              )}

              <h1
                className={`${
                  isMobile ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-3xl md:text-4xl lg:text-5xl'
                } font-bold text-white drop-shadow-2xl leading-tight mx-auto`}
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
