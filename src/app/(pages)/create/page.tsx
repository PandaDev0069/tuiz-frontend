'use client';

import React, { useState } from 'react';
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

function CreateQuizPageContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

  const handleSaveDraft = async () => {
    setIsSaving(true);
    // This will be handled by individual step components
    // For now, just simulate saving
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    console.log('Draft saved!');
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

  // Handle BasicInfoStep completion with quiz ID
  const handleBasicInfoNext = (createdQuizId: string) => {
    setQuizId(createdQuizId);
    setCurrentStep(2);
    // Scroll to top when moving to next step
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(4, prev + 1));

    // Scroll to top when moving to next step
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));

    // Scroll to top when moving to previous step
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData type="quiz" />
      <StructuredData type="software" />

      {/* Toast notifications */}
      <Toaster position="top-right" />

      {/* Quiz Creation Header */}
      <QuizCreationHeader
        currentStep={currentStep}
        totalSteps={4}
        onSaveDraft={handleSaveDraft}
        isSaving={isSaving}
        onProfileClick={handleProfileClick}
      />

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

      {/* Debug Panel for Quiz Creation */}
      <QuizCreationDebug currentStep={currentStep} quizId={quizId} formData={formData} />
    </>
  );
}

// Main component wrapped with QueryClientProvider and AuthGuard
export default function CreateQuizPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <CreateQuizPageContent />
      </AuthGuard>
    </QueryClientProvider>
  );
}
