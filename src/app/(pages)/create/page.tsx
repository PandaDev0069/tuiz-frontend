'use client';

import React, { useState } from 'react';
import { Container, PageContainer, QuizCreationHeader, StepIndicator } from '@/components/ui';
import { StructuredData } from '@/components/SEO';
import {
  BasicInfoStep,
  QuestionCreationStep,
  SettingsStep,
  FinalStep,
} from '@/components/quiz-creation';
import { CreateQuizSetForm, CreateQuestionForm, DifficultyLevel, FormErrors } from '@/types/quiz';

export default function CreateQuizPage() {
  const [currentStep, setCurrentStep] = useState(1);
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
      code: 0,
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
    // Simulate saving
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    console.log('Draft saved!');
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
  };

  const handlePublish = () => {
    console.log('Quiz published!', { formData, questions });
    // NOTE: Backend API integration required for actual publishing
    // For now, just show success message
    alert('クイズが公開されました！');
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

  const handleNext = () => {
    // Validate current step
    const errors: FormErrors<CreateQuizSetForm> = {};

    if (!formData.title?.trim()) {
      errors.title = 'タイトルは必須です';
    }
    if (!formData.description?.trim()) {
      errors.description = '説明は必須です';
    }
    if (!formData.difficulty_level) {
      errors.difficulty_level = '難易度を選択してください';
    }
    if (!formData.category?.trim()) {
      errors.category = 'カテゴリを選択してください';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setCurrentStep((prev) => Math.min(4, prev + 1));

    // Scroll to top when moving to next step (works on both mobile and PC)
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));

    // Scroll to top when moving to previous step (works on both mobile and PC)
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData type="quiz" />
      <StructuredData type="software" />

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
                  onNext={handleNext}
                  errors={formErrors}
                />
              )}

              {currentStep === 2 && (
                <QuestionCreationStep
                  questions={questions}
                  onQuestionsChange={handleQuestionsChange}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  errors={questionErrors}
                />
              )}

              {currentStep === 3 && (
                <SettingsStep
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  errors={formErrors}
                />
              )}

              {currentStep === 4 && (
                <FinalStep
                  formData={formData}
                  questions={questions}
                  onPrevious={handlePrevious}
                  onPublish={handlePublish}
                  isMobile={isMobile}
                />
              )}
            </div>
          </Container>
        </main>
      </PageContainer>
    </>
  );
}
