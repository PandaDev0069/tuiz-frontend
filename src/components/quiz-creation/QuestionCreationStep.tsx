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

interface QuestionCreationStepProps {
  questions: CreateQuestionForm[];
  onQuestionsChange: (questions: CreateQuestionForm[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  errors?: FormErrors<CreateQuestionForm>[];
}

export const QuestionCreationStep: React.FC<QuestionCreationStepProps> = ({
  questions,
  onQuestionsChange,
  onNext,
  onPrevious,
}) => {
  // Initialize with one blank question if none exist
  const [localQuestions, setLocalQuestions] = useState<CreateQuestionForm[]>(
    questions.length > 0 ? questions : [createBlankQuestion(1)],
  );
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false);

  // Update local state when questions prop changes
  React.useEffect(() => {
    if (questions.length > 0) {
      setLocalQuestions(questions);
    }
  }, [questions]);

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
      show_question_time: 10,
      answering_time: 10,
      show_explanation_time: 30,
      points: 100,
      difficulty: DifficultyLevel.EASY,
      order_index: orderIndex,
    };

    if (questionType === QuestionType.TRUE_FALSE) {
      return {
        ...baseQuestion,
        answers: [
          { answer_text: 'True', is_correct: false, order_index: 1 },
          { answer_text: 'False', is_correct: false, order_index: 2 },
        ],
      };
    }

    return {
      ...baseQuestion,
      answers: [
        { answer_text: '', is_correct: true, order_index: 1 },
        { answer_text: '', is_correct: false, order_index: 2 },
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
    if (!file) return;

    setIsUploading(true);
    try {
      // TODO: Implement actual file upload logic
      // For now, we'll simulate the upload
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockUrl = URL.createObjectURL(file);
      handleQuestionFieldChange('image_url', mockUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnswerImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // TODO: Implement actual file upload logic
      // For now, we'll simulate the upload
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockUrl = URL.createObjectURL(file);

      const updatedQuestions = [...localQuestions];
      const currentQuestion = updatedQuestions[selectedQuestionIndex];
      const updatedAnswers = [...currentQuestion.answers];
      updatedAnswers[index] = {
        ...updatedAnswers[index],
        image_url: mockUrl,
      };

      updatedQuestions[selectedQuestionIndex] = {
        ...currentQuestion,
        answers: updatedAnswers,
      };

      setLocalQuestions(updatedQuestions);
      onQuestionsChange(updatedQuestions);
    } catch (error) {
      console.error('Answer image upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleExplanationSave = (explanationData: {
    explanation_title?: string;
    explanation_text?: string;
    explanation_image_url?: string;
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

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <QuestionHeader />

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

      {/* Navigation */}
      <QuestionNavigation onPrevious={onPrevious} onNext={onNext} />

      {/* Explanation Modal */}
      <ExplanationModal
        isOpen={isExplanationModalOpen}
        onOpenChange={setIsExplanationModalOpen}
        explanationTitle={localQuestions[selectedQuestionIndex]?.explanation_title}
        explanationText={localQuestions[selectedQuestionIndex]?.explanation_text}
        explanationImageUrl={localQuestions[selectedQuestionIndex]?.explanation_image_url}
        onSave={handleExplanationSave}
        questionNumber={localQuestions[selectedQuestionIndex]?.order_index || 1}
      />
    </div>
  );
};
