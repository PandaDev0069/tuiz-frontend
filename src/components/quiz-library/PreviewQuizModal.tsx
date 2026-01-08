// ====================================================
// File Name   : PreviewQuizModal.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-17
// Last Update : 2025-09-17
//
// Description:
// - Modal component for previewing quiz details
// - Displays quiz overview, questions, and settings in tabs
// - Provides clone functionality for public quizzes
// - Handles loading, error, and empty states
// - Shows quiz information in a scrollable modal
//
// Notes:
// - Client-only component (requires 'use client')
// - Modal overlay with gradient header and footer
// - Tab-based navigation for different quiz views
// ====================================================

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/core/card';
import { Button } from '@/components/ui/core/button';
import { Text } from '@/components/ui/core/typography';
import { X, Eye, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuizSet, QuestionWithAnswers } from '@/types/quiz';
import { PreviewQuizOverview } from './PreviewQuizOverview';
import { PreviewQuizQuestions } from './PreviewQuizQuestions';
import { PreviewQuizSettings } from './PreviewQuizSettings';

const TAB_OVERVIEW = 'overview';
const TAB_QUESTIONS = 'questions';
const TAB_SETTINGS = 'settings';
const DEFAULT_TAB = TAB_OVERVIEW;

const TABS = [TAB_OVERVIEW, TAB_QUESTIONS, TAB_SETTINGS] as const;

const ICON_SIZE_SMALL = 'w-4 h-4';
const ICON_SIZE_MEDIUM = 'w-6 h-6';

const MODAL_OVERLAY_CLASSES =
  'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4';
const CARD_BASE_CLASSES = 'w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl';
const HEADER_BASE_CLASSES =
  'bg-gradient-to-br from-blue-700 via-blue-800 to-teal-800 text-white border-0 rounded-t-3xl';
const HEADER_CONTAINER_CLASSES = 'flex items-center justify-between';
const HEADER_LEFT_CLASSES = 'flex items-center gap-3';
const ICON_CONTAINER_CLASSES = 'p-3 m-2 bg-white/20 rounded-lg';
const ICON_WHITE_CLASSES = 'text-white';
const TITLE_CLASSES = 'text-xl font-bold text-white';
const BUTTON_VARIANT_GHOST = 'ghost';
const BUTTON_SIZE_ICON = 'icon';
const CLOSE_BUTTON_CLASSES =
  'h-8 w-8 m-3 bg-gradient-to-br from-red-200 to-pink-300 hover:from-red-300 hover:to-pink-400 text-red-700 hover:text-red-800 rounded-full';

const TABS_CONTAINER_CLASSES = 'flex gap-2 mt-4';
const BUTTON_SIZE_SM = 'sm';
const BUTTON_VARIANT_DEFAULT = 'default';
const TAB_BUTTON_BASE_CLASSES = 'flex-1 transition-all duration-200 rounded-xl border-2';
const TAB_BUTTON_ACTIVE_CLASSES = 'bg-white text-blue-700 shadow-lg font-semibold border-white';
const TAB_BUTTON_INACTIVE_CLASSES =
  'text-white hover:bg-white/20 rounded-xl border-white/30 hover:border-white/50';

const CONTENT_BASE_CLASSES =
  'overflow-y-auto max-h-[60vh] p-6 bg-gradient-to-br from-purple-50 via-pink-25 to-orange-50';
const LOADING_CONTAINER_CLASSES = 'flex items-center justify-center py-12';
const SPINNER_CLASSES = 'animate-spin rounded-full h-8 w-8 border-b-2 border-primary';
const LOADING_TEXT_CLASSES = 'ml-3 text-gray-600';
const ERROR_CONTAINER_CLASSES = 'flex flex-col items-center justify-center py-12';
const ERROR_CARD_CLASSES = 'p-4 bg-red-50 border border-red-200 rounded-lg mb-4';
const ERROR_TEXT_CLASSES = 'text-red-700 font-medium';
const BUTTON_VARIANT_DESTRUCTIVE = 'destructive';
const EMPTY_STATE_CONTAINER_CLASSES = 'flex items-center justify-center py-12';
const EMPTY_STATE_INNER_CLASSES = 'text-center';
const EMPTY_STATE_ICON_CLASSES = 'text-6xl mb-4';
const EMPTY_STATE_TEXT_CLASSES = 'text-gray-500';

const FOOTER_BASE_CLASSES =
  'border-t border-gray-200 p-6 bg-gradient-to-br from-blue-700 via-blue-800 to-teal-800 rounded-b-3xl';
const FOOTER_ACTIONS_CONTAINER_CLASSES = 'flex flex-col sm:flex-row gap-3 justify-end';
const BUTTON_VARIANT_OUTLINE = 'outline';
const FOOTER_CLOSE_BUTTON_CLASSES = 'bg-white/10 text-white border-white/20 hover:bg-white/20';
const CLONE_BUTTON_CLASSES = 'bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50';
const CLONE_SPINNER_CLASSES = 'animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2';

interface PreviewQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizSet | null;
  questions: QuestionWithAnswers[];
  isLoading?: boolean;
  error?: string;
  onCloneQuiz?: (quizId: string) => void;
  onStartQuiz?: (quizId: string) => void;
  isCloning?: boolean;
}

/**
 * Component: PreviewQuizModal
 * Description:
 * - Modal component for previewing quiz details before cloning or starting
 * - Displays quiz information in tabbed interface (overview, questions, settings)
 * - Handles loading, error, and empty states
 * - Provides clone functionality for public quizzes
 * - Shows gradient header and footer with action buttons
 *
 * Parameters:
 * - isOpen (boolean): Whether modal is open
 * - onClose (function): Callback to close the modal
 * - quiz (QuizSet | null): Quiz data to preview
 * - questions (QuestionWithAnswers[]): Array of quiz questions
 * - isLoading (boolean, optional): Whether quiz data is loading
 * - error (string, optional): Error message if loading failed
 * - onCloneQuiz (function, optional): Callback to clone the quiz
 * - onStartQuiz (function, optional): Callback to start the quiz
 * - isCloning (boolean, optional): Whether clone operation is in progress
 *
 * Returns:
 * - React.ReactElement | null: The preview quiz modal component or null if not open
 *
 * Example:
 * ```tsx
 * <PreviewQuizModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   quiz={quiz}
 *   questions={questions}
 *   isLoading={false}
 *   onCloneQuiz={(id) => handleClone(id)}
 *   isCloning={false}
 * />
 * ```
 */
export const PreviewQuizModal: React.FC<PreviewQuizModalProps> = ({
  isOpen,
  onClose,
  quiz,
  questions,
  isLoading = false,
  error,
  onCloneQuiz,
  isCloning = false,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'settings'>(DEFAULT_TAB);

  if (!isOpen) return null;

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case TAB_OVERVIEW:
        return '概要';
      case TAB_QUESTIONS:
        return '問題';
      case TAB_SETTINGS:
        return '設定';
      default:
        return '';
    }
  };

  return (
    <div className={MODAL_OVERLAY_CLASSES}>
      <Card className={CARD_BASE_CLASSES}>
        <CardHeader className={HEADER_BASE_CLASSES}>
          <div className={HEADER_CONTAINER_CLASSES}>
            <div className={HEADER_LEFT_CLASSES}>
              <div className={ICON_CONTAINER_CLASSES}>
                <Eye className={cn(ICON_SIZE_MEDIUM, ICON_WHITE_CLASSES)} />
              </div>
              <CardTitle className={TITLE_CLASSES}>クイズプレビュー</CardTitle>
            </div>
            <Button
              variant={BUTTON_VARIANT_GHOST}
              size={BUTTON_SIZE_ICON}
              onClick={onClose}
              className={CLOSE_BUTTON_CLASSES}
            >
              <X className={ICON_SIZE_SMALL} />
            </Button>
          </div>

          <div className={TABS_CONTAINER_CLASSES}>
            {TABS.map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? BUTTON_VARIANT_DEFAULT : BUTTON_VARIANT_GHOST}
                size={BUTTON_SIZE_SM}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  TAB_BUTTON_BASE_CLASSES,
                  activeTab === tab ? TAB_BUTTON_ACTIVE_CLASSES : TAB_BUTTON_INACTIVE_CLASSES,
                )}
              >
                {getTabLabel(tab)}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className={CONTENT_BASE_CLASSES}>
          {isLoading ? (
            <div className={LOADING_CONTAINER_CLASSES}>
              <div className={SPINNER_CLASSES}></div>
              <Text className={LOADING_TEXT_CLASSES}>読み込み中...</Text>
            </div>
          ) : error ? (
            <div className={ERROR_CONTAINER_CLASSES}>
              <div className={ERROR_CARD_CLASSES}>
                <Text className={ERROR_TEXT_CLASSES}>{error}</Text>
              </div>
              <Button variant={BUTTON_VARIANT_DESTRUCTIVE} onClick={onClose}>
                閉じる
              </Button>
            </div>
          ) : !quiz ? (
            <div className={EMPTY_STATE_CONTAINER_CLASSES}>
              <div className={EMPTY_STATE_INNER_CLASSES}>
                <div className={EMPTY_STATE_ICON_CLASSES}>🔍</div>
                <Text className={EMPTY_STATE_TEXT_CLASSES}>クイズが見つかりません</Text>
              </div>
            </div>
          ) : (
            <>
              {activeTab === TAB_OVERVIEW && <PreviewQuizOverview quiz={quiz} />}
              {activeTab === TAB_QUESTIONS && <PreviewQuizQuestions questions={questions} />}
              {activeTab === TAB_SETTINGS && <PreviewQuizSettings quiz={quiz} />}
            </>
          )}
        </CardContent>

        {quiz && !isLoading && !error && (
          <div className={FOOTER_BASE_CLASSES}>
            <div className={FOOTER_ACTIONS_CONTAINER_CLASSES}>
              <Button
                variant={BUTTON_VARIANT_OUTLINE}
                onClick={onClose}
                size={BUTTON_SIZE_SM}
                className={FOOTER_CLOSE_BUTTON_CLASSES}
              >
                閉じる
              </Button>
              {onCloneQuiz && (
                <Button
                  variant={BUTTON_VARIANT_DEFAULT}
                  onClick={() => onCloneQuiz(quiz.id)}
                  disabled={isCloning}
                  size={BUTTON_SIZE_SM}
                  className={CLONE_BUTTON_CLASSES}
                >
                  {isCloning ? (
                    <>
                      <div className={CLONE_SPINNER_CLASSES}></div>
                      クローン中...
                    </>
                  ) : (
                    <>
                      <Copy className={cn(ICON_SIZE_SMALL, 'mr-2')} />
                      クローン
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
