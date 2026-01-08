// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-30
// Last Update : 2026-01-03
//
// Description:
// - Create quiz page for creating new quiz sets
// - Multi-step form for quiz basic info, questions, settings, and final review
// - Handles quiz creation, draft saving, and step navigation
//
// Notes:
// - Creates new quiz on first step completion
// - Supports saving draft at each step
// - Auto-saves data when navigating between steps
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import React, { useState, useEffect, useCallback } from 'react';

//----------------------------------------------------
// 2. External Library Imports
//----------------------------------------------------
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'react-hot-toast';

//----------------------------------------------------
// 3. Internal Component Imports
//----------------------------------------------------
import {
  Container,
  PageContainer,
  QuizCreationHeader,
  StepIndicator,
  AuthGuard,
  SaveStatusIndicator,
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

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

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
// (No custom hooks needed)

//----------------------------------------------------
// 11. Main Page Content Component
//----------------------------------------------------
/**
 * Component: CreateQuizPageContent
 * Description:
 * - Main content component for creating new quizzes
 * - Handles multi-step form navigation and data persistence
 * - Manages quiz creation, form state, and draft saving
 *
 * Features:
 * - Step-based quiz creation workflow (Basic Info → Questions → Settings → Review)
 * - Automatic draft saving on step navigation
 * - Manual draft save functionality
 * - Save status indicator with last saved timestamp
 * - Responsive design with mobile detection
 *
 * Incomplete Features:
 * - Profile Click Handler: `handleProfileClick` currently has no implementation, needs navigation or modal functionality
 * - Step 2 Auto-save: Comment indicates questions are auto-saved by QuestionCreationStep component, but no explicit save confirmation
 */
function CreateQuizPageContent() {
  //----------------------------------------------------
  // 11.1. Hooks & Router Setup
  //----------------------------------------------------
  // (No router needed for create page)

  //----------------------------------------------------
  // 11.2. State Management
  //----------------------------------------------------
  const [currentStep, setCurrentStep] = useState(1);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [formData, setFormData] = useState<Partial<CreateQuizSetForm>>(INITIAL_FORM_DATA);
  const [questions, setQuestions] = useState<CreateQuestionForm[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors<CreateQuizSetForm>>({});
  const [questionErrors, setQuestionErrors] = useState<FormErrors<CreateQuestionForm>[]>([]);

  //----------------------------------------------------
  // 11.3. Custom Hooks
  //----------------------------------------------------
  // (No custom hooks used)

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

  //----------------------------------------------------
  // 11.5. Event Handlers
  //----------------------------------------------------
  const saveQuizData = useCallback(
    async (data: Partial<CreateQuizSetForm>) => {
      if (!quizId) return;

      setSaveStatus('saving');
      try {
        await quizService.updateQuiz(quizId, {
          title: data.title,
          description: data.description,
          is_public: data.is_public,
          difficulty_level: data.difficulty_level,
          category: data.category,
          tags: data.tags,
          play_settings: data.play_settings,
        });
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch {
        setSaveStatus('error');
        toast.error('データの保存に失敗しました', {
          duration: TOAST_DURATION.ERROR,
        });
      }
    },
    [quizId],
  );

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
        toast.success('問題の保存は自動的に行われます', {
          duration: TOAST_DURATION.SUCCESS,
        });
      } else if (currentStep === 3) {
        await saveQuizData(formData);
        toast.success('設定が保存されました', {
          duration: TOAST_DURATION.SUCCESS,
        });
      }
    } catch {
      toast.error('下書きの保存に失敗しました', {
        duration: TOAST_DURATION.ERROR,
      });
    } finally {
      setIsSaving(false);
    }
  }, [quizId, currentStep, formData, saveQuizData]);

  const handleFormDataChange = useCallback((data: Partial<CreateQuizSetForm>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setFormErrors({});
  }, []);

  const handleQuestionsChange = useCallback((newQuestions: CreateQuestionForm[]) => {
    setQuestions(newQuestions);
    setQuestionErrors([]);
  }, []);

  const handleBasicInfoNext = useCallback((createdQuizId: string) => {
    setQuizId(createdQuizId);
    setCurrentStep(2);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, SCROLL_DELAY_MS);
  }, []);

  const handleNext = useCallback(async () => {
    if (currentStep === 3) {
      await saveQuizData(formData);
    }

    setCurrentStep((prev) => Math.min(4, prev + 1));

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, SCROLL_DELAY_MS);
  }, [currentStep, formData, saveQuizData]);

  const handlePrevious = useCallback(async () => {
    if (currentStep === 3) {
      await saveQuizData(formData);
    }

    setCurrentStep((prev) => Math.max(1, prev - 1));

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, SCROLL_DELAY_MS);
  }, [currentStep, formData, saveQuizData]);

  //----------------------------------------------------
  // 11.6. Loading State
  //----------------------------------------------------
  // (No loading state needed - data is created locally)

  //----------------------------------------------------
  // 11.7. Error State
  //----------------------------------------------------
  // (Errors handled via toast notifications)

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
      <QuizCreationHeader
        currentStep={currentStep}
        totalSteps={4}
        onSaveDraft={currentStep < 4 ? handleSaveDraft : undefined}
        isSaving={isSaving}
      />

      {/* Save Status Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <SaveStatusIndicator
          status={saveStatus}
          lastSaved={lastSaved}
          className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border"
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
                  quizId={quizId || undefined}
                />
              )}

              {currentStep === 2 && (
                <QuestionCreationStep
                  questions={questions}
                  onQuestionsChange={handleQuestionsChange}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  errors={questionErrors}
                  quizId={quizId || undefined}
                />
              )}

              {currentStep === 3 && (
                <SettingsStep
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  errors={formErrors}
                  quizId={quizId || undefined}
                />
              )}

              {currentStep === 4 && (
                <FinalStep
                  formData={formData}
                  questions={questions}
                  onPrevious={handlePrevious}
                  isMobile={isMobile}
                  quizId={quizId || undefined}
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
 * Component: CreateQuizPage
 * Description:
 * - Wraps CreateQuizPageContent with necessary providers
 * - Provides QueryClient and authentication guard
 *
 * Returns:
 * - JSX: Page with all required providers
 */
export default function CreateQuizPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <CreateQuizPageContent />
      </AuthGuard>
    </QueryClientProvider>
  );
}
