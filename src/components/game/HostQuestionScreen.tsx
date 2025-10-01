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
}

export const HostQuestionScreen: React.FC<HostQuestionScreenProps> = ({
  question,
  currentTime,
  questionNumber,
  totalQuestions,
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
        </div>
      </Main>
    </PageContainer>
  );
};
