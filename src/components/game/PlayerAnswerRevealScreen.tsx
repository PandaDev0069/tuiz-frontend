'use client';

import React from 'react';
import Image from 'next/image';
import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { CheckCircle, XCircle, Trophy, TrendingUp } from 'lucide-react';
import { AnswerResult } from '@/types/game';

interface PlayerAnswerRevealScreenProps {
  answerResult: AnswerResult;
  isMobile?: boolean;
}

export const PlayerAnswerRevealScreen: React.FC<PlayerAnswerRevealScreenProps> = ({
  answerResult,
  isMobile = true,
}) => {
  const { question, correctAnswer, playerAnswer, isCorrect, statistics, totalAnswered } =
    answerResult;

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
    <div className="grid grid-cols-2 gap-3 md:gap-4 w-full max-w-2xl mx-auto">
      {question.choices.map((choice) => {
        const stat = statistics.find((s) => s.choiceId === choice.id);
        const isPlayerChoice = playerAnswer?.id === choice.id;
        const isCorrectChoice = correctAnswer.id === choice.id;

        return (
          <div
            key={choice.id}
            className={`relative p-4 md:p-6 rounded-2xl border-4 transition-all duration-500 ${
              isCorrectChoice
                ? 'bg-green-500 border-green-400 shadow-green-500/50 shadow-xl'
                : isPlayerChoice && !isCorrectChoice
                  ? 'bg-red-500 border-red-400 shadow-red-500/50 shadow-xl'
                  : 'bg-gray-700/80 border-gray-600'
            } backdrop-blur-sm`}
          >
            {/* Result Icon */}
            <div className="absolute -top-3 -right-3 w-8 h-8 md:w-10 md:h-10">
              {isCorrectChoice ? (
                <CheckCircle className="w-full h-full text-green-300 drop-shadow-lg" />
              ) : isPlayerChoice && !isCorrectChoice ? (
                <XCircle className="w-full h-full text-red-300 drop-shadow-lg" />
              ) : null}
            </div>

            {/* Choice Content */}
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {choice.text === 'True' || choice.text === '正しい' || choice.text === 'はい'
                  ? '○'
                  : '×'}
              </div>
              <div className="text-lg md:text-xl font-medium text-white/90 mb-3">{choice.text}</div>

              {/* Statistics */}
              <div className="text-sm md:text-base text-white/80">
                {stat?.count || 0}人 ({stat?.percentage.toFixed(1) || 0}%)
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/20  h-2 md:h-3 mt-2">
                <div
                  className="bg-white/60 h-full rounded-full transition-all duration-1000 ease-out"
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
    <div className="grid grid-cols-1 gap-3 md:gap-4 w-full max-w-xl mx-auto">
      {question.choices.map((choice) => {
        const stat = statistics.find((s) => s.choiceId === choice.id);
        const isPlayerChoice = playerAnswer?.id === choice.id;
        const isCorrectChoice = correctAnswer.id === choice.id;

        return (
          <div
            key={choice.id}
            className={`relative p-4 md:p-6 rounded-2xl border-4 transition-all duration-500 ${
              isCorrectChoice
                ? 'bg-green-500 border-green-400 shadow-green-500/50 shadow-xl'
                : isPlayerChoice && !isCorrectChoice
                  ? 'bg-red-500 border-red-400 shadow-red-500/50 shadow-xl'
                  : 'bg-gray-700/80 border-gray-600'
            } backdrop-blur-sm`}
          >
            {/* Result Icon */}
            <div className="absolute -top-3 -right-3 w-8 h-8 md:w-10 md:h-10">
              {isCorrectChoice ? (
                <CheckCircle className="w-full h-full text-green-300 drop-shadow-lg" />
              ) : isPlayerChoice && !isCorrectChoice ? (
                <XCircle className="w-full h-full text-red-300 drop-shadow-lg" />
              ) : null}
            </div>

            {/* Choice Content */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-lg md:text-xl font-bold text-white">{choice.letter}</span>
                </div>
                <div className="text-lg md:text-xl font-medium text-white flex-1">
                  {choice.text}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm md:text-base text-white/80 mb-1">{stat?.count || 0}人</div>
                <div className="text-lg md:text-xl font-bold text-white">
                  {stat?.percentage.toFixed(1) || 0}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-2 md:h-3 mt-3">
              <div
                className="bg-white/60 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${stat?.percentage || 0}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  const ThreeOptionLayout = () => (
    <div className="space-y-3 md:space-y-4 w-full max-w-2xl mx-auto">
      {question.choices.map((choice) => {
        const stat = statistics.find((s) => s.choiceId === choice.id);
        const isPlayerChoice = playerAnswer?.id === choice.id;
        const isCorrectChoice = correctAnswer.id === choice.id;

        return (
          <div
            key={choice.id}
            className={`relative p-4 md:p-5 rounded-2xl border-4 transition-all duration-500 ${
              isCorrectChoice
                ? 'bg-green-500 border-green-400 shadow-green-500/50 shadow-xl'
                : isPlayerChoice && !isCorrectChoice
                  ? 'bg-red-500 border-red-400 shadow-red-500/50 shadow-xl'
                  : 'bg-gray-700/80 border-gray-600'
            } backdrop-blur-sm`}
          >
            {/* Result Icon */}
            <div className="absolute -top-3 -right-3 w-8 h-8 md:w-10 md:h-10">
              {isCorrectChoice ? (
                <CheckCircle className="w-full h-full text-green-300 drop-shadow-lg" />
              ) : isPlayerChoice && !isCorrectChoice ? (
                <XCircle className="w-full h-full text-red-300 drop-shadow-lg" />
              ) : null}
            </div>

            {/* Choice Content */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 md:space-x-4 flex-1">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xl md:text-2xl font-bold text-white">{choice.letter}</span>
                </div>
                <div className="text-base md:text-lg font-medium text-white flex-1 leading-tight">
                  {choice.text}
                </div>
              </div>

              <div className="text-right ml-4">
                <div className="text-sm text-white/80 mb-1">{stat?.count || 0}人</div>
                <div className="text-lg md:text-xl font-bold text-white">
                  {stat?.percentage.toFixed(1) || 0}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-2 md:h-3 mt-3">
              <div
                className="bg-white/60 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${stat?.percentage || 0}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  const FourOptionLayout = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full max-w-4xl mx-auto">
      {question.choices.map((choice) => {
        const stat = statistics.find((s) => s.choiceId === choice.id);
        const isPlayerChoice = playerAnswer?.id === choice.id;
        const isCorrectChoice = correctAnswer.id === choice.id;

        return (
          <div
            key={choice.id}
            className={`relative p-4 md:p-6 rounded-2xl border-4 transition-all duration-500 ${
              isCorrectChoice
                ? 'bg-green-500 border-green-400 shadow-green-500/50 shadow-xl'
                : isPlayerChoice && !isCorrectChoice
                  ? 'bg-red-500 border-red-400 shadow-red-500/50 shadow-xl'
                  : 'bg-gray-700/80 border-gray-600'
            } backdrop-blur-sm`}
          >
            {/* Result Icon */}
            <div className="absolute -top-3 -right-3 w-8 h-8 md:w-10 md:h-10">
              {isCorrectChoice ? (
                <CheckCircle className="w-full h-full text-green-300 drop-shadow-lg" />
              ) : isPlayerChoice && !isCorrectChoice ? (
                <XCircle className="w-full h-full text-red-300 drop-shadow-lg" />
              ) : null}
            </div>

            {/* Choice Content */}
            <div className="text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl md:text-2xl font-bold text-white">{choice.letter}</span>
              </div>
              <div className="text-sm md:text-base font-medium text-white mb-3 leading-tight">
                {choice.text}
              </div>

              {/* Statistics */}
              <div className="text-sm text-white/80 mb-2">{stat?.count || 0}人</div>
              <div className="text-lg md:text-xl font-bold text-white mb-3">
                {stat?.percentage.toFixed(1) || 0}%
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-2 md:h-3">
                <div
                  className="bg-white/60 h-full rounded-full transition-all duration-1000 ease-out"
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
          {/* Header with Result Status */}
          <div className="px-4 py-6 text-center">
            <div
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                isCorrect ? 'bg-green-500/80 text-green-100' : 'bg-red-500/80 text-red-100'
              } backdrop-blur-sm`}
            >
              {isCorrect ? <Trophy className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <span className="font-bold text-lg">{isCorrect ? '正解！' : '不正解'}</span>
            </div>
          </div>

          {/* Question Text and Image */}
          <div className="px-4 mb-6">
            <div className="text-center max-w-4xl mx-auto">
              {/* Question Image (if available) */}
              {question.image && (
                <div className="mb-4 flex justify-center">
                  <div className="relative w-full max-w-md h-32 md:h-40 rounded-lg overflow-hidden shadow-xl">
                    <Image src={question.image} alt="Question" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/10" />
                  </div>
                </div>
              )}

              {/* Question Text */}
              <h2
                className={`${isMobile ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'} font-bold text-white drop-shadow-lg leading-tight mb-4`}
              >
                {question.text}
              </h2>
            </div>
          </div>

          {/* Answer Results */}
          <div className="flex-1 flex items-center justify-center px-4 pb-8">
            <div className="w-full">{renderAnswerLayout()}</div>
          </div>

          {/* Bottom Stats */}
          <div className="px-4 pb-6 text-center">
            <div className="bg-black/20 backdrop-blur-sm rounded-full px-6 py-3 inline-flex items-center space-x-4 text-white/80">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">{totalAnswered}人が回答</span>
              </div>
            </div>
          </div>
        </div>
      </Main>
    </PageContainer>
  );
};
