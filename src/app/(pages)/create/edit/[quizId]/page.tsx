'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import {
  Container,
  PageContainer,
  QuizCreationHeader,
  StepIndicator,
  AuthGuard,
} from '@/components/ui';
import { StructuredData } from '@/components/SEO';
import { QuizCreationDebug } from '@/components/debug';
import {
  BasicInfoStep,
  QuestionCreationStep,
  SettingsStep,
  FinalStep,
} from '@/components/quiz-creation';
import { CreateQuizSetForm, CreateQuestionForm, DifficultyLevel, FormErrors } from '@/types/quiz';
import { quizService } from '@/lib/quizService';
import { useEditSave } from '@/hooks/useEditSave';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function EditQuizPageContent() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CreateQuizSetForm>>({
    title: '',
    description: '',
    is_public: false,
    difficulty_level: DifficultyLevel.EASY,
    category: '',
    tags: [],
    play_settings: {
      show_question_only: true,
      show_explanation: true,
      time_bonus: true,
      streak_bonus: true,
      show_correct_answer: false,
      max_players: 400,
    },
  });
  const [questions, setQuestions] = useState<CreateQuestionForm[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors<CreateQuizSetForm>>({});
  const [questionErrors, setQuestionErrors] = useState<FormErrors<CreateQuestionForm>[]>([]);

  // Save functionality
  const { saveQuizData, saveQuestionsData } = useEditSave(quizId);

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

  // Load quiz data for editing
  useEffect(() => {
    const loadQuizForEdit = async () => {
      if (!quizId) return;

      try {
        setIsLoading(true);
        setLoadError(null);
        console.log('Loading quiz for editing:', quizId);

        // First, set quiz to draft status
        await quizService.setQuizToDraft(quizId);
        console.log('Quiz set to draft status');

        // Get complete quiz data with questions and answers
        const quizData = await quizService.getQuizForEdit(quizId);
        console.log('Loaded quiz data for editing:', quizData);
        console.log('Quiz thumbnail URL:', quizData.thumbnail_url);

        // Populate form data
        setFormData({
          title: quizData.title,
          description: quizData.description,
          thumbnail_url: quizData.thumbnail_url || undefined,
          is_public: quizData.is_public,
          difficulty_level: quizData.difficulty_level,
          category: quizData.category,
          tags: quizData.tags,
          play_settings: quizData.play_settings,
        });

        // Populate questions
        const questionsData = (quizData.questions || []).map((q) => {
          console.log('Processing question:', {
            id: q.id,
            question_text: q.question_text,
            image_url: q.image_url,
            answers: q.answers.map((a) => ({
              id: a.id,
              answer_text: a.answer_text,
              image_url: a.image_url,
            })),
          });

          return {
            id: q.id, // Include the ID for existing questions
            question_text: q.question_text,
            question_type: q.question_type,
            image_url: q.image_url || null,
            show_question_time: q.show_question_time,
            answering_time: q.answering_time,
            points: q.points,
            difficulty: q.difficulty,
            order_index: q.order_index,
            explanation_title: q.explanation_title || null,
            explanation_text: q.explanation_text || null,
            explanation_image_url: q.explanation_image_url || null,
            show_explanation_time: q.show_explanation_time,
            answers: q.answers.map((a) => ({
              id: a.id, // Include the ID for existing answers
              answer_text: a.answer_text,
              image_url: a.image_url || null,
              is_correct: a.is_correct,
              order_index: a.order_index,
            })),
          };
        });
        setQuestions(questionsData);
        console.log('Loaded questions data for editing:', questionsData);
      } catch (error) {
        console.error('Failed to load quiz for editing:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to load quiz');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizForEdit();
  }, [quizId]);

  const handleSaveDraft = async () => {
    if (!quizId) {
      console.log('No quiz ID available for draft save');
      return;
    }

    setIsSaving(true);
    try {
      // Save current step's data based on which step we're on
      if (currentStep === 1) {
        // Save basic info (quiz data)
        await saveQuizData(formData);
        toast.success('基本情報が保存されました', { duration: 2000 });
      } else if (currentStep === 2) {
        // Save questions
        await saveQuestionsData(questions);
        toast.success('問題が保存されました', { duration: 2000 });
      } else if (currentStep === 3) {
        // Save quiz data (settings)
        await saveQuizData(formData);
        toast.success('設定が保存されました', { duration: 2000 });
      }
      // Step 4 (Final) doesn't need draft save as it's for publishing

      console.log('Draft saved successfully!');
    } catch (error) {
      toast.error('下書きの保存に失敗しました', { duration: 3000 });
      console.error('Failed to save draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
  };

  const handleFormDataChange = (data: Partial<CreateQuizSetForm>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    // Clear errors when user makes changes
    setFormErrors({});
  };

  const handleQuestionsChange = (newQuestions: CreateQuestionForm[]) => {
    setQuestions(newQuestions);
    // Clear errors when user makes changes
    setQuestionErrors([]);
  };

  // Handle BasicInfoStep completion
  const handleBasicInfoNext = async () => {
    // Save quiz data before moving to next step
    await saveQuizData(formData);

    setCurrentStep(2);
    // Scroll to top when moving to next step
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleNext = async () => {
    // Save current step data before moving to next step
    if (currentStep === 2) {
      // Save questions data
      await saveQuestionsData(questions);
    } else if (currentStep === 3) {
      // Save quiz data (settings)
      await saveQuizData(formData);
    }

    setCurrentStep((prev) => Math.min(4, prev + 1));

    // Scroll to top when moving to next step
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handlePrevious = async () => {
    // Save current step data before moving to previous step
    if (currentStep === 2) {
      // Save questions data
      await saveQuestionsData(questions);
    } else if (currentStep === 3) {
      // Save quiz data (settings)
      await saveQuizData(formData);
    }

    setCurrentStep((prev) => Math.max(1, prev - 1));

    // Scroll to top when moving to previous step
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>クイズを読み込み中...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">読み込みエラー</h2>
          <p className="text-gray-600 mb-4">{loadError}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData type="quiz" />
      <StructuredData type="software" />

      {/* Toast notifications */}
      <Toaster position="top-right" />

      {/* Quiz Creation Header */}
      <div className="relative">
        <QuizCreationHeader
          currentStep={currentStep}
          totalSteps={4}
          onSaveDraft={currentStep < 4 ? handleSaveDraft : undefined}
          isSaving={isSaving}
          onProfileClick={handleProfileClick}
        />
      </div>

      {/* Step Indicator */}
      <StepIndicator
        currentStep={currentStep}
        totalSteps={4}
        className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary-light/10 border-b border-primary/30 shadow-sm"
      />

      <PageContainer className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <main role="main">
          <Container size="lg" className="max-w-7xl mx-auto">
            {/* Quiz Creation Form */}
            <div
              className="rounded-lg shadow-lg p-8 border"
              style={{ background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' }}
            >
              {currentStep === 1 && (
                <BasicInfoStep
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                  onNext={handleBasicInfoNext}
                  errors={formErrors}
                  quizId={quizId}
                />
              )}

              {currentStep === 2 && (
                <QuestionCreationStep
                  questions={questions}
                  onQuestionsChange={handleQuestionsChange}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  errors={questionErrors}
                  quizId={quizId}
                />
              )}

              {currentStep === 3 && (
                <SettingsStep
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  errors={formErrors}
                  quizId={quizId}
                />
              )}

              {currentStep === 4 && (
                <FinalStep
                  formData={formData}
                  questions={questions}
                  onPrevious={handlePrevious}
                  isMobile={isMobile}
                  quizId={quizId}
                  isEditMode={true}
                />
              )}
            </div>
          </Container>
        </main>
      </PageContainer>

      {/* Debug Panel for Quiz Creation */}
      <QuizCreationDebug currentStep={currentStep} quizId={quizId} formData={formData} />
    </>
  );
}

// Main component wrapped with QueryClientProvider and AuthGuard
export default function EditQuizPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <EditQuizPageContent />
      </AuthGuard>
    </QueryClientProvider>
  );
}
