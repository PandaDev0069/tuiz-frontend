// ====================================================
// File Name   : PlayerAnswerRevealScreen.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-23
// Last Update : 2025-12-30
//
// Description:
// - Player screen component for displaying answer reveal results
// - Shows animated bar chart with answer statistics
// - Displays correct answer with visual indicators
// - Supports mobile and desktop layouts
//
// Notes:
// - Uses requestAnimationFrame for smooth animations
// - Implements staggered animation delays for visual effect
// - Supports multiple question types (true/false, multiple choice)
// ====================================================

'use client';

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';
import type { AnswerResult, Choice, AnswerStatistic } from '@/types/game';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const DEFAULT_TIME_LIMIT = 5;
const DEFAULT_QUESTION_NUMBER = 1;
const DEFAULT_TOTAL_QUESTIONS = 10;

const ANIMATION_START_DELAY_MS = 200;
const ANIMATION_BASE_DELAY_MS = 300;
const ANIMATION_STAGGER_DELAY_MS = 150;
const ANIMATION_DURATION_MS = 2000;
const EASING_POWER = 4;

const TIMER_INTERVAL_MS = 1000;
const NAVIGATION_DELAY_MS = 0;
const MIN_TIME_LIMIT = 0;
const TIME_EXPIRED_THRESHOLD = 1;

const CHART_HEIGHT_MOBILE_PX = 200;
const CHART_HEIGHT_DESKTOP_PX = 280;
const MIN_BAR_HEIGHT_PERCENT = 8;
const MAX_BAR_HEIGHT_PERCENT = 100;
const CHECKMARK_THRESHOLD_PERCENT = 20;
const MIN_PERCENTAGE = 0;
const DEFAULT_MAX_PERCENTAGE = 1;

const MOBILE_BREAKPOINT_PX = 768;

const QUESTION_TYPE_TRUE_FALSE = 'true_false';
const QUESTION_TYPE_MULTIPLE_CHOICE_2 = 'multiple_choice_2';
const QUESTION_TYPE_MULTIPLE_CHOICE_3 = 'multiple_choice_3';
const QUESTION_TYPE_MULTIPLE_CHOICE_4 = 'multiple_choice_4';

const TRUE_TEXT_VARIANTS = ['True', '正しい', 'はい'];
const TRUE_SYMBOL = '○';
const FALSE_SYMBOL = '×';

const DEFAULT_LEADERBOARD_ROUTE = '/player-leaderboard-screen';

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
interface AnimatedBarProps {
  choice: Choice;
  index: number;
  stat: AnswerStatistic | undefined;
  maxPercentage: number;
  colorClass: string;
  shouldAnimate: boolean;
  correctAnswer: Choice;
  questionId: string;
  questionType: string;
}

export interface PlayerAnswerRevealScreenProps {
  answerResult: AnswerResult;
  timeLimit?: number;
  questionNumber?: number;
  totalQuestions?: number;
  onTimeExpired?: () => void;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Component: PlayerAnswerRevealScreen
 * Description:
 * - Displays answer reveal screen for players with animated statistics
 * - Shows bar chart with answer distribution
 * - Highlights correct answer with visual indicators
 * - Supports responsive mobile and desktop layouts
 * - Manages timer countdown and automatic navigation
 *
 * Parameters:
 * - answerResult (AnswerResult): Answer result data with question, correct answer, and statistics
 * - timeLimit (number, optional): Time limit in seconds (default: 5)
 * - questionNumber (number, optional): Current question number (default: 1)
 * - totalQuestions (number, optional): Total number of questions (default: 10)
 * - onTimeExpired (function, optional): Callback when timer expires
 *
 * Returns:
 * - JSX.Element: Player answer reveal screen component
 */
export const PlayerAnswerRevealScreen: React.FC<PlayerAnswerRevealScreenProps> = ({
  answerResult,
  timeLimit = DEFAULT_TIME_LIMIT,
  questionNumber = DEFAULT_QUESTION_NUMBER,
  totalQuestions = DEFAULT_TOTAL_QUESTIONS,
  onTimeExpired,
}) => {
  const { question, correctAnswer, statistics } = answerResult;
  const router = useRouter();

  const [isAnimationStarted, setIsAnimationStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(timeLimit);
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutTriggered = useRef(false);
  const questionIdRef = useRef(question.id);

  useEffect(() => {
    if (questionIdRef.current !== question.id) {
      questionIdRef.current = question.id;
      setIsAnimationStarted(false);
      timeoutTriggered.current = false;
      setCurrentTime(timeLimit);
      setIsTimeExpired(false);
    }
  }, [question.id, timeLimit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimationStarted(true);
    }, ANIMATION_START_DELAY_MS);

    return () => clearTimeout(timer);
  }, [question.id]);

  useEffect(() => {
    setCurrentTime(timeLimit);
    setIsTimeExpired(false);
    timeoutTriggered.current = false;
  }, [timeLimit]);

  useEffect(() => {
    if (!timeLimit || timeLimit <= MIN_TIME_LIMIT) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= TIME_EXPIRED_THRESHOLD) {
          if (!timeoutTriggered.current) {
            timeoutTriggered.current = true;
            setIsTimeExpired(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, TIMER_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [timeLimit]);

  useEffect(() => {
    if (isTimeExpired) {
      const timeoutId = setTimeout(() => {
        if (onTimeExpired) {
          onTimeExpired();
        } else {
          router.push(DEFAULT_LEADERBOARD_ROUTE);
        }
      }, NAVIGATION_DELAY_MS);

      return () => clearTimeout(timeoutId);
    }
  }, [isTimeExpired, onTimeExpired, router]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT_PX);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const colorClasses = getChoiceColors(question.type);
  const maxPercentage =
    Math.max(MIN_PERCENTAGE, ...statistics.map((stat) => stat.percentage)) ||
    DEFAULT_MAX_PERCENTAGE;
  const totalAnswers = statistics.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        <TimeBar
          currentTime={currentTime}
          timeLimit={timeLimit}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />

        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        {isMobile ? (
          <div className="relative z-10 h-full flex flex-col pt-40">
            <div className="px-4 py-2 text-center">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg leading-tight">
                {question.text}
              </h2>
            </div>

            <div className="flex-1 flex items-center justify-center px-3 py-2">
              <div className="w-full max-w-5xl">
                <div className="text-center mb-2">
                  <h3 className="text-2xl font-bold text-white/90 mb-0">回答結果</h3>
                </div>

                <div className="relative bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 shadow-xl">
                  <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-white/20 rounded-tl-lg"></div>
                  <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-white/20 rounded-tr-lg"></div>
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-white/20 rounded-bl-lg"></div>
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-white/20 rounded-br-lg"></div>

                  <div
                    className="flex items-end justify-center space-x-2"
                    style={{ height: `${CHART_HEIGHT_MOBILE_PX}px` }}
                  >
                    {question.choices.map((choice, index) => {
                      const stat = statistics.find((s) => s.choiceId === choice.id);

                      return (
                        <AnimatedBar
                          key={choice.id}
                          choice={choice}
                          index={index}
                          stat={stat}
                          maxPercentage={maxPercentage}
                          colorClass={colorClasses[index]}
                          shouldAnimate={isAnimationStarted}
                          correctAnswer={correctAnswer}
                          questionId={question.id}
                          questionType={question.type}
                        />
                      );
                    })}
                  </div>

                  <div className="mt-2 flex justify-center items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                  </div>

                  <div className="mt-2 text-center">
                    <p className="text-xs text-white/70">総回答数: {totalAnswers}人</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-2 pb-6">
              <div className="grid grid-cols-2 gap-2 max-w-3xl mx-auto">
                {question.choices.map((choice, index) => {
                  const isCorrect = correctAnswer.id === choice.id;
                  const colorClass = colorClasses[index];
                  const borderClass = isCorrect ? 'border-white/60' : 'border-2';

                  return (
                    <div
                      key={choice.id}
                      className={`relative p-3 rounded-2xl ${borderClass} ${colorClass} backdrop-blur-sm transition-all duration-300 ${
                        isCorrect
                          ? 'ring-1 ring-white/50 shadow-xl brightness-110'
                          : 'opacity-40 shadow-md'
                      }`}
                    >
                      {isCorrect && (
                        <div className="absolute -top-1 -right-1 w-6 h-6">
                          <CheckCircle className="w-full h-full text-white drop-shadow-2xl" />
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-white/20 flex items-center justify-center rounded-full">
                          <span className="text-sm font-bold text-white drop-shadow-lg">
                            {getChoiceSymbol(question.type, choice)}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-white/95 flex-1 leading-tight">
                          {choice.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 h-full flex flex-col pt-16">
            <div className="px-6 py-3 text-center">
              <h2 className="text-2xl lg:text-3xl font-bold text-white drop-shadow-lg leading-tight">
                {question.text}
              </h2>
            </div>

            <div className="flex-1 flex items-center justify-center px-6 py-4">
              <div className="w-full max-w-4xl">
                <div className="text-center mb-4">
                  <h3 className="text-3xl lg:text-4xl font-bold text-white/90 mb-1">回答結果</h3>
                  <div className="w-20 h-0.5 bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] mx-auto rounded-full"></div>
                </div>

                <div className="relative bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 lg:p-6 shadow-xl">
                  <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-white/20 rounded-tl-lg"></div>
                  <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-white/20 rounded-tr-lg"></div>
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-white/20 rounded-bl-lg"></div>
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-white/20 rounded-br-lg"></div>

                  <div
                    className="flex items-end justify-center space-x-6"
                    style={{ height: `${CHART_HEIGHT_DESKTOP_PX}px` }}
                  >
                    {question.choices.map((choice, index) => {
                      const stat = statistics.find((s) => s.choiceId === choice.id);

                      return (
                        <AnimatedBar
                          key={choice.id}
                          choice={choice}
                          index={index}
                          stat={stat}
                          maxPercentage={maxPercentage}
                          colorClass={colorClasses[index]}
                          shouldAnimate={isAnimationStarted}
                          correctAnswer={correctAnswer}
                          questionId={question.id}
                          questionType={question.type}
                        />
                      );
                    })}
                  </div>

                  <div className="mt-4 flex justify-center items-center space-x-2">
                    <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] rounded-full"></div>
                    <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                  </div>

                  <div className="mt-3 text-center">
                    <p className="text-sm text-white/70">総回答数: {totalAnswers}人</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className="grid grid-cols-2 gap-3 lg:gap-4 max-w-3xl mx-auto">
                {question.choices.map((choice, index) => {
                  const isCorrect = correctAnswer.id === choice.id;
                  const colorClass = colorClasses[index];
                  const borderClass = isCorrect ? 'border-white/60' : 'border-2';

                  return (
                    <div
                      key={choice.id}
                      className={`relative p-3 lg:p-4 rounded-2xl ${borderClass} ${colorClass} backdrop-blur-sm transition-all duration-300 ${
                        isCorrect
                          ? 'ring-2 ring-white/50 shadow-xl brightness-110'
                          : 'opacity-40 shadow-lg'
                      }`}
                    >
                      {isCorrect && (
                        <div className="absolute -top-1 -right-1 w-7 h-7 lg:w-8 lg:h-8">
                          <CheckCircle className="w-full h-full text-white drop-shadow-2xl" />
                        </div>
                      )}

                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 lg:w-11 lg:h-11 bg-white/20 flex items-center justify-center rounded-full">
                          <span className="text-base lg:text-lg font-bold text-white drop-shadow-lg">
                            {getChoiceSymbol(question.type, choice)}
                          </span>
                        </div>
                        <div className="text-sm lg:text-base font-medium text-white/95 flex-1 leading-tight">
                          {choice.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Main>
    </PageContainer>
  );
};

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------
/**
 * Function: getChoiceColors
 * Description:
 * - Returns color classes for choices based on question type
 * - Provides consistent color scheme across different question types
 *
 * Parameters:
 * - questionType (string): Type of question (true_false, multiple_choice_2, etc.)
 *
 * Returns:
 * - string[]: Array of Tailwind CSS color classes for each choice
 */
function getChoiceColors(questionType: string): string[] {
  switch (questionType) {
    case QUESTION_TYPE_TRUE_FALSE:
      return [
        'bg-gradient-to-br from-green-500 to-green-600 border-green-400',
        'bg-gradient-to-br from-red-500 to-red-600 border-red-400',
      ];
    case QUESTION_TYPE_MULTIPLE_CHOICE_2:
      return [
        'bg-gradient-to-r from-purple-500 to-purple-600 border-purple-400',
        'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400',
      ];
    case QUESTION_TYPE_MULTIPLE_CHOICE_3:
      return [
        'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400',
        'bg-gradient-to-r from-pink-500 to-pink-600 border-pink-400',
        'bg-gradient-to-r from-cyan-500 to-cyan-600 border-cyan-400',
      ];
    case QUESTION_TYPE_MULTIPLE_CHOICE_4:
    default:
      return [
        'bg-gradient-to-br from-red-500 to-red-600 border-red-400',
        'bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-400',
        'bg-gradient-to-br from-green-500 to-green-600 border-green-400',
        'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400',
      ];
  }
}

/**
 * Function: getChoiceSymbol
 * Description:
 * - Returns the display symbol for a choice based on question type
 * - Returns ○ or × for true/false questions, letter for multiple choice
 *
 * Parameters:
 * - questionType (string): Type of question
 * - choice (Choice): Choice object with text and letter properties
 *
 * Returns:
 * - string: Symbol to display (○, ×, or letter)
 */
function getChoiceSymbol(questionType: string, choice: Choice): string {
  if (questionType === QUESTION_TYPE_TRUE_FALSE) {
    return TRUE_TEXT_VARIANTS.includes(choice.text) ? TRUE_SYMBOL : FALSE_SYMBOL;
  }
  return choice.letter;
}

/**
 * Component: AnimatedBar
 * Description:
 * - Animated bar component for displaying answer statistics
 * - Animates count and height with staggered delays
 * - Shows checkmark for correct answer when bar height exceeds threshold
 *
 * Parameters:
 * - choice (Choice): Choice data for this bar
 * - index (number): Index of choice for staggered animation
 * - stat (AnswerStatistic | undefined): Statistics for this choice
 * - maxPercentage (number): Maximum percentage for scaling
 * - colorClass (string): Tailwind CSS color classes
 * - shouldAnimate (boolean): Whether animation should start
 * - correctAnswer (Choice): Correct answer choice
 * - questionId (string): Question ID for tracking changes
 * - questionType (string): Type of question
 *
 * Returns:
 * - JSX.Element: Animated bar component
 */
const AnimatedBar: React.FC<AnimatedBarProps> = ({
  choice,
  index,
  stat,
  maxPercentage,
  colorClass,
  shouldAnimate,
  correctAnswer,
  questionId,
  questionType,
}) => {
  const percentage = stat?.percentage || MIN_PERCENTAGE;
  const count = stat?.count || 0;

  const [animatedCount, setAnimatedCount] = useState(0);
  const [animatedHeight, setAnimatedHeight] = useState(0);
  const hasAnimatedRef = useRef(false);
  const lastCountRef = useRef(count);
  const lastPercentageRef = useRef(percentage);
  const lastQuestionIdRef = useRef(questionId);
  const animationFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (lastQuestionIdRef.current !== questionId) {
      hasAnimatedRef.current = false;
      setAnimatedCount(0);
      setAnimatedHeight(0);
      lastQuestionIdRef.current = questionId;
      lastCountRef.current = count;
      lastPercentageRef.current = percentage;
    }

    if (!shouldAnimate) {
      if (!hasAnimatedRef.current) {
        setAnimatedCount(0);
        setAnimatedHeight(0);
      }
      return;
    }

    if (
      hasAnimatedRef.current &&
      lastCountRef.current === count &&
      lastPercentageRef.current === percentage &&
      lastQuestionIdRef.current === questionId
    ) {
      return;
    }

    lastCountRef.current = count;
    lastPercentageRef.current = percentage;

    const delay = ANIMATION_BASE_DELAY_MS + index * ANIMATION_STAGGER_DELAY_MS;

    timeoutRef.current = setTimeout(() => {
      let startTime: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);

        const easeOut = 1 - Math.pow(1 - progress, EASING_POWER);

        setAnimatedCount(Math.round(count * easeOut));
        setAnimatedHeight(percentage * easeOut);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          hasAnimatedRef.current = true;
          animationFrameRef.current = null;
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [shouldAnimate, count, percentage, index, questionId]);

  const barHeightPercent = React.useMemo(() => {
    if (animatedHeight <= MIN_PERCENTAGE) return MIN_PERCENTAGE;
    const scaledPercent =
      maxPercentage > MIN_PERCENTAGE ? (animatedHeight / maxPercentage) * 100 : MIN_PERCENTAGE;
    return Math.min(Math.max(scaledPercent, MIN_BAR_HEIGHT_PERCENT), MAX_BAR_HEIGHT_PERCENT);
  }, [animatedHeight, maxPercentage]);

  return (
    <div className="flex flex-col items-center flex-1 h-full">
      <div className="text-sm md:text-lg lg:text-xl font-bold text-white mb-1 md:mb-2 h-6 md:h-8 flex items-center">
        <span className="tabular-nums">{animatedCount}</span>
      </div>

      <div className="w-full max-w-12 md:max-w-14 lg:max-w-12 xl:max-w-14 flex-1 flex flex-col justify-end relative">
        <div
          className={`w-full ${colorClass} rounded-t-lg shadow-lg will-change-transform relative`}
          style={{
            height: `${barHeightPercent}%`,
            minHeight: animatedHeight > MIN_PERCENTAGE ? '6px' : '0px',
            transform: 'translateZ(0)',
          }}
        >
          {choice.id === correctAnswer.id && barHeightPercent > CHECKMARK_THRESHOLD_PERCENT && (
            <div className="absolute top-1 right-1 md:top-2 md:right-2 w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6">
              <CheckCircle className="w-full h-full text-white drop-shadow-lg opacity-90" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 md:mt-4 h-6 md:h-8 flex items-center justify-center">
        <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white/20 flex items-center justify-center rounded-full">
          <span className="text-sm md:text-lg lg:text-xl font-bold text-white drop-shadow-lg">
            {getChoiceSymbol(questionType, choice)}
          </span>
        </div>
      </div>
    </div>
  );
};

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
