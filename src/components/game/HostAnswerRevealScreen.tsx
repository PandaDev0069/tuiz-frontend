'use client';

import React from 'react';
import Image from 'next/image';
import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { CheckCircle, Trophy } from 'lucide-react';
import { AnswerResult } from '@/types/game';

interface HostAnswerRevealScreenProps {
  answerResult: AnswerResult;
}

export const HostAnswerRevealScreen: React.FC<HostAnswerRevealScreenProps> = ({ answerResult }) => {
  const { question, correctAnswer, statistics } = answerResult;

  const renderAnswerLayout = () => {
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
  };

  const TrueFalseLayout = () => (
    <div className="grid grid-cols-2 gap-8 md:gap-12 w-full max-w-5xl mx-auto">
      {question.choices.map((choice) => {
        const stat = statistics.find((s) => s.choiceId === choice.id);
        const isCorrectChoice = correctAnswer.id === choice.id;

        return (
          <div
            key={choice.id}
            className={`relative p-8 md:p-12 rounded-3xl border-4 transition-all duration-1000 ${
              isCorrectChoice
                ? 'bg-green-500/20 border-green-400 shadow-green-500/50 shadow-2xl'
                : 'bg-gray-700/40 border-gray-500'
            } backdrop-blur-sm`}
          >
            {/* Correct Answer Icon */}
            {isCorrectChoice && (
              <div className="absolute -top-4 -right-4 w-12 h-12 md:w-16 md:h-16">
                <CheckCircle className="w-full h-full text-green-400 drop-shadow-2xl" />
              </div>
            )}

            {/* Choice Content */}
            <div className="text-center">
              <div className="text-8xl md:text-9xl font-bold text-white mb-6 drop-shadow-2xl">
                {choice.text === 'True' || choice.text === '正しい' || choice.text === 'はい'
                  ? '○'
                  : '×'}
              </div>
              <div className="text-3xl md:text-4xl font-medium text-white/90 mb-6">
                {choice.text}
              </div>

              {/* Statistics */}
              <div className="text-2xl md:text-3xl text-white/80 mb-4">{stat?.count || 0}人</div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-6">
                {stat?.percentage.toFixed(1) || 0}%
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-4 md:h-6">
                <div
                  className={`h-full rounded-full transition-all duration-2000 ease-out ${
                    isCorrectChoice
                      ? 'bg-gradient-to-r from-green-400 to-green-500'
                      : 'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}
                  style={{ width: `${stat?.percentage || 0}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const TwoOptionLayout = () => (
    <div className="space-y-8 md:space-y-12 w-full max-w-6xl mx-auto">
      {question.choices.map((choice) => {
        const stat = statistics.find((s) => s.choiceId === choice.id);
        const isCorrectChoice = correctAnswer.id === choice.id;

        return (
          <div
            key={choice.id}
            className={`relative p-8 md:p-12 rounded-3xl border-4 transition-all duration-1000 ${
              isCorrectChoice
                ? 'bg-green-500/20 border-green-400 shadow-green-500/50 shadow-2xl'
                : 'bg-gray-700/40 border-gray-500'
            } backdrop-blur-sm`}
          >
            {/* Correct Answer Icon */}
            {isCorrectChoice && (
              <div className="absolute -top-4 -right-4 w-12 h-12 md:w-16 md:h-16">
                <CheckCircle className="w-full h-full text-green-400 drop-shadow-2xl" />
              </div>
            )}

            {/* Choice Content */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8 md:space-x-12 flex-1">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                    {choice.letter}
                  </span>
                </div>
                <div className="text-3xl md:text-4xl font-medium text-white flex-1 leading-tight">
                  {choice.text}
                </div>
              </div>

              <div className="text-right ml-8">
                <div className="text-xl md:text-2xl text-white/80 mb-2">{stat?.count || 0}人</div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {stat?.percentage.toFixed(1) || 0}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-4 md:h-6 mt-6">
              <div
                className={`h-full rounded-full transition-all duration-2000 ease-out ${
                  isCorrectChoice
                    ? 'bg-gradient-to-r from-green-400 to-green-500'
                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                }`}
                style={{ width: `${stat?.percentage || 0}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  const ThreeOptionLayout = () => (
    <div className="space-y-6 md:space-y-8 w-full max-w-6xl mx-auto">
      {question.choices.map((choice) => {
        const stat = statistics.find((s) => s.choiceId === choice.id);
        const isCorrectChoice = correctAnswer.id === choice.id;

        return (
          <div
            key={choice.id}
            className={`relative p-6 md:p-8 rounded-3xl border-4 transition-all duration-1000 ${
              isCorrectChoice
                ? 'bg-green-500/20 border-green-400 shadow-green-500/50 shadow-2xl'
                : 'bg-gray-700/40 border-gray-500'
            } backdrop-blur-sm`}
          >
            {/* Correct Answer Icon */}
            {isCorrectChoice && (
              <div className="absolute -top-3 -right-3 w-10 h-10 md:w-12 md:h-12">
                <CheckCircle className="w-full h-full text-green-400 drop-shadow-2xl" />
              </div>
            )}

            {/* Choice Content */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 md:space-x-8 flex-1">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                    {choice.letter}
                  </span>
                </div>
                <div className="text-2xl md:text-3xl font-medium text-white flex-1 leading-tight">
                  {choice.text}
                </div>
              </div>

              <div className="text-right ml-6">
                <div className="text-lg md:text-xl text-white/80 mb-1">{stat?.count || 0}人</div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-3">
                  {stat?.percentage.toFixed(1) || 0}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-3 md:h-4 mt-4">
              <div
                className={`h-full rounded-full transition-all duration-2000 ease-out ${
                  isCorrectChoice
                    ? 'bg-gradient-to-r from-green-400 to-green-500'
                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                }`}
                style={{ width: `${stat?.percentage || 0}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  const FourOptionLayout = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-7xl mx-auto">
      {question.choices.map((choice) => {
        const stat = statistics.find((s) => s.choiceId === choice.id);
        const isCorrectChoice = correctAnswer.id === choice.id;

        return (
          <div
            key={choice.id}
            className={`relative p-6 md:p-8 rounded-3xl border-4 transition-all duration-1000 ${
              isCorrectChoice
                ? 'bg-green-500/20 border-green-400 shadow-green-500/50 shadow-2xl'
                : 'bg-gray-700/40 border-gray-500'
            } backdrop-blur-sm`}
          >
            {/* Correct Answer Icon */}
            {isCorrectChoice && (
              <div className="absolute -top-3 -right-3 w-10 h-10 md:w-12 md:h-12">
                <CheckCircle className="w-full h-full text-green-400 drop-shadow-2xl" />
              </div>
            )}

            {/* Choice Content */}
            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {choice.letter}
                </span>
              </div>
              <div className="text-lg md:text-xl font-medium text-white mb-4 leading-tight">
                {choice.text}
              </div>

              {/* Statistics */}
              <div className="text-lg md:text-xl text-white/80 mb-2">{stat?.count || 0}人</div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-4">
                {stat?.percentage.toFixed(1) || 0}%
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-3 md:h-4">
                <div
                  className={`h-full rounded-full transition-all duration-2000 ease-out ${
                    isCorrectChoice
                      ? 'bg-gradient-to-r from-green-400 to-green-500'
                      : 'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}
                  style={{ width: `${stat?.percentage || 0}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        {/* Same background as question screen */}
        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Header with Correct Answer Indicator */}
          <div className="px-6 py-8 text-center">
            <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-full bg-green-500/80 text-green-100 backdrop-blur-sm">
              <Trophy className="w-6 h-6 md:w-8 md:h-8" />
              <span className="font-bold text-2xl md:text-3xl">正解発表</span>
            </div>
          </div>

          {/* Question Text and Image */}
          <div className="px-6 mb-8">
            <div className="text-center max-w-6xl mx-auto">
              {/* Question Image (if available) */}
              {question.image && (
                <div className="mb-6 flex justify-center">
                  <div className="relative w-full max-w-2xl h-40 md:h-48 lg:h-56 rounded-lg overflow-hidden shadow-xl">
                    <Image src={question.image} alt="Question" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/10" />
                  </div>
                </div>
              )}

              {/* Question Text */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg leading-tight mb-8">
                {question.text}
              </h2>
            </div>
          </div>

          {/* Answer Results */}
          <div className="flex-1 flex items-center justify-center px-6 pb-8">
            <div className="w-full">{renderAnswerLayout()}</div>
          </div>
        </div>
      </Main>
    </PageContainer>
  );
};
