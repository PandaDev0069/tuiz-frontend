// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2026-09-14
// Last Update : 2026-01-03
//
// Description:
// - Edit quiz page for modifying existing quiz sets
// - Multi-step form for editing quiz basic info, questions, settings, and final review
// - Handles loading quiz data, saving drafts, and step navigation
//
// Notes:
// - Requires quiz ID from route parameters
// - Automatically sets quiz to draft status when editing
// - Supports saving draft at each step
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

//----------------------------------------------------
// 2. External Library Imports
//----------------------------------------------------
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'react-hot-toast';
import { Loader2, AlertCircle } from 'lucide-react';

//----------------------------------------------------
// 3. Internal Component Imports
//----------------------------------------------------
import {
  Container,
  PageContainer,
  QuizCreationHeader,
  StepIndicator,
  AuthGuard,
} from '@/components/ui';
import { StructuredData } from '@/components/SEO';
import {
  BasicInfoStep,
  QuestionCreationStep,
  SettingsStep,
  FinalStep,
} from '@/components/quiz-creation';

//----------------------------------------------------
// 4. Service & Hook Imports
//----------------------------------------------------
import { quizService } from '@/lib/quizService';
import { useEditSave } from '@/hooks/useEditSave';

//----------------------------------------------------
// 5. Type Imports
//----------------------------------------------------
import type { CreateQuizSetForm, CreateQuestionForm, FormErrors } from '@/types/quiz';
import { DifficultyLevel } from '@/types/quiz';

//----------------------------------------------------
// 6. Constants / Configuration
//----------------------------------------------------
const QUERY_CLIENT_CONFIG = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
} as const;

const TOAST_DURATION = {
  SUCCESS: 2000,
  ERROR: 3000,
} as const;

const SCROLL_DELAY_MS = 100;
const MOBILE_BREAKPOINT_PX = 768;

const INITIAL_FORM_DATA: Partial<CreateQuizSetForm> = {
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
    max_players: 200,
  },
};

//----------------------------------------------------
// 7. Query Client Instance
//----------------------------------------------------
const queryClient = new QueryClient(QUERY_CLIENT_CONFIG);

//----------------------------------------------------
// 8. Types / Interfaces
//----------------------------------------------------
// (Types imported from @/types/quiz)

//----------------------------------------------------
// 9. Helper Components
//----------------------------------------------------
// (No helper components needed)

//----------------------------------------------------
// 10. Custom Hooks
//----------------------------------------------------
// (Custom hooks imported from @/hooks)

//----------------------------------------------------
// 11. Main Page Content Component
//----------------------------------------------------
/**
 * Component: EditQuizPageContent
 * Description:
 * - Main content component for editing existing quizzes
 * - Handles multi-step form navigation and data persistence
 * - Manages quiz data loading, form state, and draft saving
 *
 * Features:
 * - Step-based quiz editing workflow (Basic Info → Questions → Settings → Review)
 * - Automatic draft saving on step navigation
 * - Manual draft save functionality
 * - Responsive design with mobile detection
 * - Error handling and loading states
 *
 * Incomplete Features:
 * - Profile Click Handler: `handleProfileClick` currently has no implementation, needs navigation or modal functionality
 */
function EditQuizPageContent() {
  //----------------------------------------------------
  // 11.1. Hooks & Router Setup
  //----------------------------------------------------
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  //----------------------------------------------------
  // 11.2. State Management
  //----------------------------------------------------
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CreateQuizSetForm>>(INITIAL_FORM_DATA);
  const [questions, setQuestions] = useState<CreateQuestionForm[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors<CreateQuizSetForm>>({});
  const [questionErrors, setQuestionErrors] = useState<FormErrors<CreateQuestionForm>[]>([]);

  //----------------------------------------------------
  // 11.3. Custom Hooks
  //----------------------------------------------------
  const { saveQuizData, saveQuestionsData } = useEditSave(quizId);

  //----------------------------------------------------
  // 11.4. Effects
  //----------------------------------------------------
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT_PX);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const loadQuizForEdit = async () => {
      if (!quizId) return;

      try {
        setIsLoading(true);
        setLoadError(null);

        await quizService.setQuizToDraft(quizId);

        const quizData = await quizService.getQuizForEdit(quizId);

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

        const questionsData = (quizData.questions || []).map((q) => ({
          id: q.id,
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
            id: a.id,
            answer_text: a.answer_text,
            image_url: a.image_url || null,
            is_correct: a.is_correct,
            order_index: a.order_index,
          })),
        }));

        setQuestions(questionsData);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'クイズの読み込みに失敗しました';
        setLoadError(errorMessage);
        toast.error(errorMessage, { duration: TOAST_DURATION.ERROR });
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizForEdit();
  }, [quizId]);

  //----------------------------------------------------
  // 11.5. Event Handlers
  //----------------------------------------------------
  const handleSaveDraft = useCallback(async () => {
    if (!quizId) {
      toast.error('クイズIDが見つかりません', {
        duration: TOAST_DURATION.ERROR,
      });
      return;
    }

    setIsSaving(true);
    try {
      if (currentStep === 1) {
        await saveQuizData(formData);
        toast.success('基本情報が保存されました', {
          duration: TOAST_DURATION.SUCCESS,
        });
      } else if (currentStep === 2) {
        await saveQuestionsData(questions);
        toast.success('問題が保存されました', {
          duration: TOAST_DURATION.SUCCESS,
        });
      } else if (currentStep === 3) {
        await saveQuizData(formData);
        toast.success('設定が保存されました', {
          duration: TOAST_DURATION.SUCCESS,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '下書きの保存に失敗しました';
      toast.error(errorMessage, { duration: TOAST_DURATION.ERROR });
    } finally {
      setIsSaving(false);
    }
  }, [quizId, currentStep, formData, questions, saveQuizData, saveQuestionsData]);

  const handleProfileClick = useCallback(() => {
    // TODO: Implement profile navigation or modal
    router.push('/dashboard');
  }, [router]);

  const handleFormDataChange = useCallback((data: Partial<CreateQuizSetForm>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setFormErrors({});
  }, []);

  const handleQuestionsChange = useCallback((newQuestions: CreateQuestionForm[]) => {
    setQuestions(newQuestions);
    setQuestionErrors([]);
  }, []);

  const handleBasicInfoNext = useCallback(async () => {
    await saveQuizData(formData);
    setCurrentStep(2);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, SCROLL_DELAY_MS);
  }, [formData, saveQuizData]);

  const handleNext = useCallback(async () => {
    if (currentStep === 2) {
      await saveQuestionsData(questions);
    } else if (currentStep === 3) {
      await saveQuizData(formData);
    }

    setCurrentStep((prev) => Math.min(4, prev + 1));

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, SCROLL_DELAY_MS);
  }, [currentStep, questions, formData, saveQuestionsData, saveQuizData]);

  const handlePrevious = useCallback(async () => {
    if (currentStep === 2) {
      await saveQuestionsData(questions);
    } else if (currentStep === 3) {
      await saveQuizData(formData);
    }

    setCurrentStep((prev) => Math.max(1, prev - 1));

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, SCROLL_DELAY_MS);
  }, [currentStep, questions, formData, saveQuestionsData, saveQuizData]);

  //----------------------------------------------------
  // 11.6. Loading State
  //----------------------------------------------------
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

  //----------------------------------------------------
  // 11.7. Error State
  //----------------------------------------------------
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

  //----------------------------------------------------
  // 11.8. Main Render
  //----------------------------------------------------
  return (
    <>
      {/* SEO Structured Data */}
      <StructuredData type="quiz" />
      <StructuredData type="software" />

      {/* Toast Notifications */}
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
              style={{
                background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
              }}
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
    </>
  );
}

//----------------------------------------------------
// 12. Main Page Component (with Providers)
//----------------------------------------------------
/**
 * Component: EditQuizPage
 * Description:
 * - Wraps EditQuizPageContent with necessary providers
 * - Provides QueryClient and authentication guard
 *
 * Returns:
 * - JSX: Page with all required providers
 */
export default function EditQuizPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <EditQuizPageContent />
      </AuthGuard>
    </QueryClientProvider>
  );
}
