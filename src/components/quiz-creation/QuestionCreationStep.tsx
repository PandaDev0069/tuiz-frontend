// ====================================================
// File Name   : QuestionCreationStep.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-02
// Last Update : 2025-09-13
//
// Description:
// - Second step component in quiz creation/editing flow
// - Manages question creation, editing, and validation
// - Handles question CRUD operations (add, move, copy, delete)
// - Validates all questions before allowing progression
// - Supports multiple choice and true/false question types
// - Manages image uploads for questions and answers
// - Displays quiz overview and validation errors
//
// Notes:
// - Client-only component (requires 'use client')
// - Maintains local state for questions to enable real-time validation
// - Requires quizId to save questions to backend
// ====================================================

'use client';

import React, { useState } from 'react';
import {
  CreateQuestionForm,
  CreateAnswerForm,
  FormErrors,
  QuestionType,
  DifficultyLevel,
} from '@/types/quiz';
import { ExplanationModal } from './QuestionCreationStep/ExplanationModal';
import { QuestionHeader } from './QuestionCreationStep/QuestionHeader';
import { QuestionList } from './QuestionCreationStep/QuestionList';
import { QuestionForm } from './QuestionCreationStep/QuestionForm';
import { QuestionNavigation } from './QuestionCreationStep/QuestionNavigation';
import { QuizOverviewPanel } from './QuestionCreationStep/QuizOverviewPanel';
import { useBatchSaveQuestions } from '@/hooks/useQuestionMutation';
import { useFileUpload } from '@/lib/uploadService';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const MOBILE_BREAKPOINT = 768;
const MIN_QUESTIONS = 1;
const FIRST_INDEX = 0;
const DEFAULT_ORDER_INDEX = 1;

const DEFAULT_SHOW_QUESTION_TIME = 10;
const DEFAULT_ANSWERING_TIME = 10;
const DEFAULT_SHOW_EXPLANATION_TIME = 30;
const DEFAULT_POINTS = 100;

const ANSWER_TEXT_TRUE = 'True';
const ANSWER_TEXT_FALSE = 'False';
const ANSWER_ORDER_INDEX_TRUE = 1;
const ANSWER_ORDER_INDEX_FALSE = 2;

const COPY_SUFFIX = ' (コピー)';

const CONTAINER_SPACING_CLASSES = 'space-y-4 md:space-y-6';
const PROCESSING_INDICATOR_CLASSES =
  'flex items-center justify-center p-2 bg-blue-50 border border-blue-200 rounded-lg';
const ICON_SIZE_SMALL = 'w-4 h-4';
const ICON_ANIMATION = 'animate-spin';
const ICON_COLOR_BLUE = 'text-blue-600';
const ICON_MARGIN = 'mr-2';
const PROCESSING_TEXT_CLASSES = 'text-sm text-blue-700';

const VALIDATION_ERROR_CARD_CLASSES = 'bg-red-50 border border-red-200 rounded-lg p-4';
const VALIDATION_ERROR_ICON_CONTAINER_CLASSES =
  'w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5';
const VALIDATION_ERROR_TITLE_CLASSES = 'font-semibold text-red-800 mb-2';
const VALIDATION_ERROR_TEXT_CLASSES = 'text-red-700 text-sm';

interface QuestionCreationStepProps {
  questions: CreateQuestionForm[];
  onQuestionsChange: (questions: CreateQuestionForm[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  errors?: FormErrors<CreateQuestionForm>[];
  quizId?: string;
}

/**
 * Function: validateQuestion
 * Description:
 * - Validates a single question for required fields and correctness
 * - Checks question text is provided
 * - For multiple choice: validates all answers have text and at least one is correct
 * - For true/false: validates at least one answer is correct
 *
 * Parameters:
 * - question (CreateQuestionForm): Question to validate
 *
 * Returns:
 * - Object with isValid boolean and array of error messages
 *
 * Example:
 * ```ts
 * const result = validateQuestion(question);
 * // { isValid: true, errors: [] }
 * ```
 */
const validateQuestion = (question: CreateQuestionForm): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!question.question_text || question.question_text.trim() === '') {
    errors.push('問題文を入力してください');
  }

  if (question.question_type === QuestionType.MULTIPLE_CHOICE) {
    const emptyAnswers = question.answers.filter(
      (answer) => !answer.answer_text || answer.answer_text.trim() === '',
    );
    if (emptyAnswers.length > 0) {
      errors.push('すべての選択肢にテキストを入力してください');
    }

    const hasCorrectAnswer = question.answers.some((answer) => answer.is_correct);
    if (!hasCorrectAnswer) {
      errors.push('正解の選択肢を選択してください');
    }
  }

  if (question.question_type === QuestionType.TRUE_FALSE) {
    const hasCorrectAnswer = question.answers.some((answer) => answer.is_correct);
    if (!hasCorrectAnswer) {
      errors.push('正解の選択肢を選択してください');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Function: validateAllQuestions
 * Description:
 * - Validates all questions in the array
 * - Returns aggregated errors with question numbers
 *
 * Parameters:
 * - questions (CreateQuestionForm[]): Array of questions to validate
 *
 * Returns:
 * - Object with isValid boolean and array of all error messages
 *
 * Example:
 * ```ts
 * const result = validateAllQuestions(questions);
 * // { isValid: false, errors: ['問題 1: 問題文を入力してください'] }
 * ```
 */
const validateAllQuestions = (
  questions: CreateQuestionForm[],
): { isValid: boolean; errors: string[] } => {
  const allErrors: string[] = [];

  questions.forEach((question, index) => {
    const validation = validateQuestion(question);
    if (!validation.isValid) {
      allErrors.push(`問題 ${index + 1}: ${validation.errors.join(', ')}`);
    }
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

/**
 * Function: createBlankQuestion
 * Description:
 * - Creates a blank question with default values
 * - Supports both multiple choice and true/false question types
 * - Sets up default answers based on question type
 *
 * Parameters:
 * - orderIndex (number): Order index for the question
 * - questionType (QuestionType, optional): Type of question, defaults to MULTIPLE_CHOICE
 *
 * Returns:
 * - CreateQuestionForm: Blank question object with default values
 *
 * Example:
 * ```ts
 * const question = createBlankQuestion(1, QuestionType.MULTIPLE_CHOICE);
 * ```
 */
function createBlankQuestion(
  orderIndex: number,
  questionType: QuestionType = QuestionType.MULTIPLE_CHOICE,
): CreateQuestionForm {
  const baseQuestion = {
    question_text: '',
    question_type: questionType,
    image_url: null,
    show_question_time: DEFAULT_SHOW_QUESTION_TIME,
    answering_time: DEFAULT_ANSWERING_TIME,
    show_explanation_time: DEFAULT_SHOW_EXPLANATION_TIME,
    points: DEFAULT_POINTS,
    difficulty: DifficultyLevel.EASY,
    order_index: orderIndex,
    explanation_title: null,
    explanation_text: null,
    explanation_image_url: null,
  };

  if (questionType === QuestionType.TRUE_FALSE) {
    return {
      ...baseQuestion,
      answers: [
        {
          answer_text: ANSWER_TEXT_TRUE,
          image_url: null,
          is_correct: false,
          order_index: ANSWER_ORDER_INDEX_TRUE,
        },
        {
          answer_text: ANSWER_TEXT_FALSE,
          image_url: null,
          is_correct: false,
          order_index: ANSWER_ORDER_INDEX_FALSE,
        },
      ],
    };
  }

  return {
    ...baseQuestion,
    answers: [
      { answer_text: '', image_url: null, is_correct: true, order_index: ANSWER_ORDER_INDEX_TRUE },
      {
        answer_text: '',
        image_url: null,
        is_correct: false,
        order_index: ANSWER_ORDER_INDEX_FALSE,
      },
    ],
  };
}

/**
 * Component: QuestionCreationStep
 * Description:
 * - Main component for question creation and editing step
 * - Manages local state for questions with real-time validation
 * - Provides handlers for CRUD operations on questions
 * - Handles image uploads for questions and answers
 * - Validates all questions before allowing progression
 * - Displays processing indicators and validation errors
 * - Responsive design adapting to mobile and desktop
 *
 * Parameters:
 * - questions (CreateQuestionForm[]): Array of questions
 * - onQuestionsChange (function): Callback when questions change
 * - onNext (function): Callback to proceed to next step
 * - onPrevious (function): Callback to go back to previous step
 * - errors (FormErrors<CreateQuestionForm>[], optional): Form validation errors
 * - quizId (string, optional): ID of quiz being edited
 *
 * Returns:
 * - React.ReactElement: The question creation step component
 *
 * Example:
 * ```tsx
 * <QuestionCreationStep
 *   questions={questions}
 *   onQuestionsChange={(questions) => setQuestions(questions)}
 *   onNext={() => goToNextStep()}
 *   onPrevious={() => goToPreviousStep()}
 *   quizId={quizId}
 * />
 * ```
 */
export const QuestionCreationStep: React.FC<QuestionCreationStepProps> = ({
  questions,
  onQuestionsChange,
  onNext,
  onPrevious,
  quizId,
}) => {
  const [localQuestions, setLocalQuestions] = useState<CreateQuestionForm[]>(
    questions.length > 0 ? questions : [createBlankQuestion(DEFAULT_ORDER_INDEX)],
  );
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(FIRST_INDEX);
  const [isUploading, setIsUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const batchSaveMutation = useBatchSaveQuestions();
  const { uploadQuestionImage, uploadAnswerImage } = useFileUpload();

  React.useEffect(() => {
    if (questions.length > 0) {
      setLocalQuestions(questions);
    }
  }, [questions]);

  React.useEffect(() => {
    const validation = validateAllQuestions(localQuestions);
    setValidationErrors(validation.errors);
  }, [localQuestions]);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  /**
   * Function: handleAddQuestion
   * Description:
   * - Adds a new blank question to the list
   * - Uses the same question type as currently selected question
   * - Selects the newly added question
   */
  const handleAddQuestion = () => {
    const currentQuestionType =
      localQuestions[selectedQuestionIndex]?.question_type || QuestionType.MULTIPLE_CHOICE;
    const newQuestion = createBlankQuestion(localQuestions.length + 1, currentQuestionType);
    const updatedQuestions = [...localQuestions, newQuestion];
    setLocalQuestions(updatedQuestions);
    setSelectedQuestionIndex(updatedQuestions.length - 1);
    onQuestionsChange(updatedQuestions);
  };

  /**
   * Function: handleMoveQuestion
   * Description:
   * - Moves a question up or down in the list
   * - Updates order_index for all questions
   * - Updates selected index to follow the moved question
   *
   * Parameters:
   * - direction ('up' | 'down'): Direction to move the question
   */
  const handleMoveQuestion = (direction: 'up' | 'down') => {
    const index = selectedQuestionIndex;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < FIRST_INDEX || newIndex >= localQuestions.length) return;

    const updatedQuestions = [...localQuestions];
    [updatedQuestions[index], updatedQuestions[newIndex]] = [
      updatedQuestions[newIndex],
      updatedQuestions[index],
    ];

    updatedQuestions.forEach((q, i) => {
      q.order_index = i + 1;
    });

    setLocalQuestions(updatedQuestions);
    setSelectedQuestionIndex(newIndex);
    onQuestionsChange(updatedQuestions);
  };

  /**
   * Function: handleCopyQuestion
   * Description:
   * - Creates a copy of the currently selected question
   * - Appends "(コピー)" to the question text
   * - Resets answer order indices
   * - Selects the newly copied question
   */
  const handleCopyQuestion = () => {
    const index = selectedQuestionIndex;
    const questionToCopy = { ...localQuestions[index] };
    const newQuestion = {
      ...questionToCopy,
      question_text: `${questionToCopy.question_text}${COPY_SUFFIX}`,
      order_index: localQuestions.length + 1,
      answers: questionToCopy.answers.map((answer: CreateAnswerForm, i: number) => ({
        ...answer,
        order_index: i + 1,
      })),
    };

    const updatedQuestions = [...localQuestions, newQuestion];
    setLocalQuestions(updatedQuestions);
    setSelectedQuestionIndex(updatedQuestions.length - 1);
    onQuestionsChange(updatedQuestions);
  };

  /**
   * Function: handleDeleteQuestion
   * Description:
   * - Deletes the currently selected question
   * - Ensures at least one question remains
   * - Updates order_index for remaining questions
   * - Adjusts selected index if needed
   */
  const handleDeleteQuestion = () => {
    const index = selectedQuestionIndex;
    if (localQuestions.length <= MIN_QUESTIONS) return;

    const updatedQuestions = localQuestions.filter(
      (_: CreateQuestionForm, i: number) => i !== index,
    );

    updatedQuestions.forEach((q: CreateQuestionForm, i: number) => {
      q.order_index = i + 1;
    });

    const newSelectedIndex = index >= updatedQuestions.length ? updatedQuestions.length - 1 : index;
    setSelectedQuestionIndex(newSelectedIndex);

    setLocalQuestions(updatedQuestions);
    onQuestionsChange(updatedQuestions);
  };

  /**
   * Function: handleQuestionFieldChange
   * Description:
   * - Updates a specific field of the currently selected question
   *
   * Parameters:
   * - field (keyof CreateQuestionForm): Field name to update
   * - value (string | number | boolean | CreateAnswerForm[] | undefined): New value
   */
  const handleQuestionFieldChange = (
    field: keyof CreateQuestionForm,
    value: string | number | boolean | CreateAnswerForm[] | undefined,
  ) => {
    const updatedQuestions = [...localQuestions];
    updatedQuestions[selectedQuestionIndex] = {
      ...updatedQuestions[selectedQuestionIndex],
      [field]: value,
    };
    setLocalQuestions(updatedQuestions);
    onQuestionsChange(updatedQuestions);
  };

  /**
   * Function: handleImageUpload
   * Description:
   * - Handles upload of question image
   * - Updates question with uploaded image URL
   *
   * Parameters:
   * - e (React.ChangeEvent<HTMLInputElement>): File input change event
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quizId) return;

    setIsUploading(true);

    try {
      const imageUrl = await uploadQuestionImage(file, quizId);
      if (imageUrl) {
        handleQuestionFieldChange('image_url', imageUrl);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Function: handleAnswerImageUpload
   * Description:
   * - Handles upload of answer image
   * - Updates specific answer with uploaded image URL
   *
   * Parameters:
   * - index (number): Index of the answer to update
   * - e (React.ChangeEvent<HTMLInputElement>): File input change event
   */
  const handleAnswerImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quizId) return;

    setIsUploading(true);

    try {
      const imageUrl = await uploadAnswerImage(file, quizId);
      if (imageUrl) {
        const updatedQuestions = [...localQuestions];
        const currentQuestion = updatedQuestions[selectedQuestionIndex];
        const updatedAnswers = [...currentQuestion.answers];
        updatedAnswers[index] = {
          ...updatedAnswers[index],
          image_url: imageUrl,
        };

        updatedQuestions[selectedQuestionIndex] = {
          ...currentQuestion,
          answers: updatedAnswers,
        };

        setLocalQuestions(updatedQuestions);
        onQuestionsChange(updatedQuestions);
      }
    } catch (error) {
      console.error('Answer image upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Function: handleExplanationSave
   * Description:
   * - Saves explanation data to the currently selected question
   *
   * Parameters:
   * - explanationData (object): Explanation data containing title, text, and image URL
   */
  const handleExplanationSave = (explanationData: {
    explanation_title?: string | null;
    explanation_text?: string | null;
    explanation_image_url?: string | null;
  }) => {
    const updatedQuestions = [...localQuestions];
    const currentQuestion = updatedQuestions[selectedQuestionIndex];

    updatedQuestions[selectedQuestionIndex] = {
      ...currentQuestion,
      ...explanationData,
    };

    setLocalQuestions(updatedQuestions);
    onQuestionsChange(updatedQuestions);
  };

  /**
   * Function: handleNext
   * Description:
   * - Validates all questions before proceeding
   * - Saves all questions to backend using batch save
   * - Proceeds to next step only if validation passes and save succeeds
   */
  const handleNext = async () => {
    const validation = validateAllQuestions(localQuestions);

    if (!validation.isValid) {
      setShowValidationErrors(true);
      return;
    }

    if (!quizId) {
      return;
    }

    setShowValidationErrors(false);
    setIsSaving(true);

    try {
      const questionsToSave = localQuestions.map((question) => {
        const { ...questionData } = question;
        return {
          question_text: questionData.question_text,
          question_type: questionData.question_type,
          image_url: questionData.image_url,
          show_question_time: questionData.show_question_time,
          answering_time: questionData.answering_time,
          points: questionData.points,
          difficulty: questionData.difficulty,
          order_index: questionData.order_index,
          explanation_title: questionData.explanation_title,
          explanation_text: questionData.explanation_text,
          explanation_image_url: questionData.explanation_image_url,
          show_explanation_time: questionData.show_explanation_time,
          answers: questionData.answers.map((answer) => ({
            answer_text: answer.answer_text,
            image_url: answer.image_url,
            is_correct: answer.is_correct,
            order_index: answer.order_index,
          })),
        };
      });

      await batchSaveMutation.mutateAsync({
        quizId,
        questions: questionsToSave,
      });

      onQuestionsChange(localQuestions);

      onNext();
    } catch (error) {
      console.error('Failed to save questions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isProcessing = isSaving || batchSaveMutation.isPending;

  return (
    <div className={CONTAINER_SPACING_CLASSES}>
      <QuestionHeader />

      {isProcessing && (
        <div className={PROCESSING_INDICATOR_CLASSES}>
          <Loader2 className={cn(ICON_SIZE_SMALL, ICON_ANIMATION, ICON_COLOR_BLUE, ICON_MARGIN)} />
          <span className={PROCESSING_TEXT_CLASSES}>
            {isSaving ? '問題を保存中...' : '処理中...'}
          </span>
        </div>
      )}

      <div className="space-y-4">
        <QuestionList
          questions={localQuestions}
          selectedQuestionIndex={selectedQuestionIndex}
          onQuestionSelect={setSelectedQuestionIndex}
          onAddQuestion={handleAddQuestion}
          onMoveQuestion={handleMoveQuestion}
          onCopyQuestion={handleCopyQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          isMobile={isMobile}
        />
      </div>

      {localQuestions.length > 0 && (
        <QuestionForm
          question={localQuestions[selectedQuestionIndex]}
          selectedQuestionIndex={selectedQuestionIndex}
          isUploading={isUploading}
          isMobile={isMobile}
          onQuestionFieldChange={handleQuestionFieldChange}
          onImageUpload={handleImageUpload}
          onExplanationModalOpen={() => setIsExplanationModalOpen(true)}
          onAnswerImageUpload={handleAnswerImageUpload}
        />
      )}

      <QuizOverviewPanel questions={localQuestions} isMobile={isMobile} />

      {showValidationErrors && validationErrors.length > 0 && (
        <div className={VALIDATION_ERROR_CARD_CLASSES}>
          <div className="flex items-start gap-2">
            <div className={VALIDATION_ERROR_ICON_CONTAINER_CLASSES}>!</div>
            <div>
              <h3 className={VALIDATION_ERROR_TITLE_CLASSES}>以下の問題を修正してください：</h3>
              <ul className="space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className={VALIDATION_ERROR_TEXT_CLASSES}>
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <QuestionNavigation
        onPrevious={onPrevious}
        onNext={handleNext}
        canProceed={validationErrors.length === 0 && !isProcessing}
        validationErrors={validationErrors}
        isLoading={isProcessing}
      />

      <ExplanationModal
        isOpen={isExplanationModalOpen}
        onOpenChange={setIsExplanationModalOpen}
        explanationTitle={localQuestions[selectedQuestionIndex]?.explanation_title}
        explanationText={localQuestions[selectedQuestionIndex]?.explanation_text}
        explanationImageUrl={localQuestions[selectedQuestionIndex]?.explanation_image_url}
        onSave={handleExplanationSave}
        questionNumber={localQuestions[selectedQuestionIndex]?.order_index || DEFAULT_ORDER_INDEX}
        quizId={quizId}
      />
    </div>
  );
};
