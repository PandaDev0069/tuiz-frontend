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
  SaveStatusIndicator,
} from '@/components/ui';
import { StructuredData } from '@/components/SEO';
import {
  BasicInfoStep,
  QuestionCreationStep,
  SettingsStep,
  FinalStep,
} from '@/components/quiz-creation';
import { CreateQuizSetForm, CreateQuestionForm, DifficultyLevel, FormErrors } from '@/types/quiz';
import { quizService } from '@/lib/quizService';
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

function CreateQuizPageContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
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
      max_players: 200,
    },
  });
  const [questions, setQuestions] = useState<CreateQuestionForm[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors<CreateQuizSetForm>>({});
  const [questionErrors, setQuestionErrors] = useState<FormErrors<CreateQuestionForm>[]>([]);

  // Save functionality

  const saveQuizData = async (data: Partial<CreateQuizSetForm>) => {
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
    } catch (error) {
      setSaveStatus('error');
      console.error('Failed to save quiz data:', error);
    }
  };

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
        // Save questions - this will be handled by QuestionCreationStep component
        // We just need to trigger the save through the component's internal mechanism
        toast.success('問題の保存は自動的に行われます', { duration: 2000 });
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

  // Handle BasicInfoStep completion with quiz ID
  const handleBasicInfoNext = (createdQuizId: string) => {
    setQuizId(createdQuizId);
    setCurrentStep(2);
    // Scroll to top when moving to next step
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleNext = async () => {
    // Save data before moving to next step
    if (currentStep === 3) {
      // Save quiz data when leaving settings step
      await saveQuizData(formData);
    }
    // Note: Step 2 (questions) is handled by QuestionCreationStep component itself

    setCurrentStep((prev) => Math.min(4, prev + 1));

    // Scroll to top when moving to next step
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handlePrevious = async () => {
    // Save data before moving to previous step
    if (currentStep === 3) {
      // Save quiz data when leaving settings step
      await saveQuizData(formData);
    }
    // Note: Step 2 (questions) is handled by QuestionCreationStep component itself

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
        onSaveDraft={currentStep < 4 ? handleSaveDraft : undefined}
        isSaving={isSaving}
        onProfileClick={handleProfileClick}
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
