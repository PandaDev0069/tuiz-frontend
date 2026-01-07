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

interface QuestionCreationStepProps {
  questions: CreateQuestionForm[];
  onQuestionsChange: (questions: CreateQuestionForm[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  errors?: FormErrors<CreateQuestionForm>[];
  quizId?: string;
}

// Validation functions
const validateQuestion = (question: CreateQuestionForm): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // 1. Check if question text is provided
  if (!question.question_text || question.question_text.trim() === '') {
    errors.push('問題文を入力してください');
  }

  // 2. For multiple choice questions, validate answers
  if (question.question_type === QuestionType.MULTIPLE_CHOICE) {
    // Check if all answers have text
    const emptyAnswers = question.answers.filter(
      (answer) => !answer.answer_text || answer.answer_text.trim() === '',
    );
    if (emptyAnswers.length > 0) {
      errors.push('すべての選択肢にテキストを入力してください');
    }

    // Check if at least one answer is marked as correct
    const hasCorrectAnswer = question.answers.some((answer) => answer.is_correct);
    if (!hasCorrectAnswer) {
      errors.push('正解の選択肢を選択してください');
    }
  }

  // 3. For true/false questions, check if at least one answer is correct
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

export const QuestionCreationStep: React.FC<QuestionCreationStepProps> = ({
  questions,
  onQuestionsChange,
  onNext,
  onPrevious,
  quizId,
}) => {
  // Initialize with one blank question if none exist
  const [localQuestions, setLocalQuestions] = useState<CreateQuestionForm[]>(
    questions.length > 0 ? questions : [createBlankQuestion(1)],
  );
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Hooks for question management
  const batchSaveMutation = useBatchSaveQuestions();
  const { uploadQuestionImage, uploadAnswerImage } = useFileUpload();

  // Update local state when questions prop changes
  React.useEffect(() => {
    if (questions.length > 0) {
      setLocalQuestions(questions);
    }
  }, [questions]);

  // Validate questions whenever localQuestions changes
  React.useEffect(() => {
    const validation = validateAllQuestions(localQuestions);
    setValidationErrors(validation.errors);
  }, [localQuestions]);

  // Handle screen size detection
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  function createBlankQuestion(
    orderIndex: number,
    questionType: QuestionType = QuestionType.MULTIPLE_CHOICE,
  ): CreateQuestionForm {
    const baseQuestion = {
      question_text: '',
      question_type: questionType,
      image_url: null,
      show_question_time: 10,
      answering_time: 10,
      show_explanation_time: 30,
      points: 100,
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
          { answer_text: 'True', image_url: null, is_correct: false, order_index: 1 },
          { answer_text: 'False', image_url: null, is_correct: false, order_index: 2 },
        ],
      };
    }

    return {
      ...baseQuestion,
      answers: [
        { answer_text: '', image_url: null, is_correct: true, order_index: 1 },
        { answer_text: '', image_url: null, is_correct: false, order_index: 2 },
      ],
    };
  }

  const handleAddQuestion = () => {
    const currentQuestionType =
      localQuestions[selectedQuestionIndex]?.question_type || QuestionType.MULTIPLE_CHOICE;
    const newQuestion = createBlankQuestion(localQuestions.length + 1, currentQuestionType);
    const updatedQuestions = [...localQuestions, newQuestion];
    setLocalQuestions(updatedQuestions);
    setSelectedQuestionIndex(updatedQuestions.length - 1); // Select the new question
    onQuestionsChange(updatedQuestions);
  };

  const handleMoveQuestion = (direction: 'up' | 'down') => {
    const index = selectedQuestionIndex;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= localQuestions.length) return;

    const updatedQuestions = [...localQuestions];
    [updatedQuestions[index], updatedQuestions[newIndex]] = [
      updatedQuestions[newIndex],
      updatedQuestions[index],
    ];

    // Update order_index for all questions
    updatedQuestions.forEach((q, i) => {
      q.order_index = i + 1;
    });

    setLocalQuestions(updatedQuestions);
    setSelectedQuestionIndex(newIndex); // Update selected index to follow the moved question
    onQuestionsChange(updatedQuestions);
  };

  const handleCopyQuestion = () => {
    const index = selectedQuestionIndex;
    const questionToCopy = { ...localQuestions[index] };
    const newQuestion = {
      ...questionToCopy,
      question_text: `${questionToCopy.question_text} (コピー)`,
      order_index: localQuestions.length + 1,
      answers: questionToCopy.answers.map((answer: CreateAnswerForm, i: number) => ({
        ...answer,
        order_index: i + 1,
      })),
    };

    const updatedQuestions = [...localQuestions, newQuestion];
    setLocalQuestions(updatedQuestions);
    setSelectedQuestionIndex(updatedQuestions.length - 1); // Select the copied question
    onQuestionsChange(updatedQuestions);
  };

  const handleDeleteQuestion = () => {
    const index = selectedQuestionIndex;
    if (localQuestions.length <= 1) return; // Keep at least 1 question

    const updatedQuestions = localQuestions.filter(
      (_: CreateQuestionForm, i: number) => i !== index,
    );

    // Update order_index for remaining questions
    updatedQuestions.forEach((q: CreateQuestionForm, i: number) => {
      q.order_index = i + 1;
    });

    // Adjust selected index if needed
    const newSelectedIndex = index >= updatedQuestions.length ? updatedQuestions.length - 1 : index;
    setSelectedQuestionIndex(newSelectedIndex);

    setLocalQuestions(updatedQuestions);
    onQuestionsChange(updatedQuestions);
  };

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
      // Convert CreateQuestionForm to CreateQuestionRequest format
      const questionsToSave = localQuestions.map((question) => {
        // Remove any temporary fields and ensure proper format
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

      // Use batch save to save all questions at once
      await batchSaveMutation.mutateAsync({
        quizId,
        questions: questionsToSave,
      });

      onQuestionsChange(localQuestions);

      onNext();
    } catch (error) {
      console.error('Failed to save questions:', error);
      // Don't proceed to next step if saving failed
    } finally {
      setIsSaving(false);
    }
  };

  const isProcessing = isSaving || batchSaveMutation.isPending;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <QuestionHeader />

      {/* Auto-save indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600 mr-2" />
          <span className="text-sm text-blue-700">
            {isSaving ? '問題を保存中...' : '処理中...'}
          </span>
        </div>
      )}

      {/* Question Adding Panel */}
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

      {/* Question Form */}
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

      {/* Quiz Overview Panel */}
      <QuizOverviewPanel questions={localQuestions} isMobile={isMobile} />

      {/* Validation Errors */}
      {showValidationErrors && validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              !
            </div>
            <div>
              <h3 className="font-semibold text-red-800 mb-2">以下の問題を修正してください：</h3>
              <ul className="space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-red-700 text-sm">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <QuestionNavigation
        onPrevious={onPrevious}
        onNext={handleNext}
        canProceed={validationErrors.length === 0 && !isProcessing}
        validationErrors={validationErrors}
        isLoading={isProcessing}
      />

      {/* Explanation Modal */}
      <ExplanationModal
        isOpen={isExplanationModalOpen}
        onOpenChange={setIsExplanationModalOpen}
        explanationTitle={localQuestions[selectedQuestionIndex]?.explanation_title}
        explanationText={localQuestions[selectedQuestionIndex]?.explanation_text}
        explanationImageUrl={localQuestions[selectedQuestionIndex]?.explanation_image_url}
        onSave={handleExplanationSave}
        questionNumber={localQuestions[selectedQuestionIndex]?.order_index || 1}
        quizId={quizId}
      />
    </div>
  );
};
