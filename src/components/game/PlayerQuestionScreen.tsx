'use client';

import React from 'react';
import Image from 'next/image';
import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';

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
        {/* Timer Bar with Question Counter and Timer Display */}
        <TimeBar
          currentTime={currentTime}
          timeLimit={question.timeLimit}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />

        {/* Default Background */}
        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        {/* Question Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Question Text with Image */}
          <div className="flex-1 flex items-center justify-center px-2">
            <div className="text-center max-w-4xl w-full">
              {/* Question Image (if available) */}
              {question.image && (
                <div className="mb-6 flex justify-center">
                  <div
                    className={`relative w-full ${isMobile ? 'max-w-lg h-48' : 'max-w-xl h-56'} rounded-lg overflow-hidden shadow-xl mx-auto`}
                  >
                    <Image src={question.image} alt="Question" fill className="object-cover" />
                    {/* Subtle overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/10" />
                  </div>
                </div>
              )}

              {/* Question Text */}
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
