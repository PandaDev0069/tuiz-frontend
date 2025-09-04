'use client';

import React, { useState } from 'react';
import { Container, PageContainer, QuizCreationHeader, StepIndicator } from '@/components/ui';
import { StructuredData } from '@/components/SEO';
import { BasicInfoStep, QuestionCreationStep } from '@/components/quiz-creation';
import { CreateQuizSetForm, CreateQuestionForm, DifficultyLevel, FormErrors } from '@/types/quiz';

export default function CreateQuizPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateQuizSetForm>>({
    title: '',
    description: '',
    is_public: false,
    difficulty_level: DifficultyLevel.EASY,
    category: '',
    tags: [],
    play_settings: {
      show_score_immediately: false,
    },
  });
  const [questions, setQuestions] = useState<CreateQuestionForm[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors<CreateQuizSetForm>>({});
  const [questionErrors, setQuestionErrors] = useState<FormErrors<CreateQuestionForm>[]>([]);

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

              {currentStep > 2 && (
                <div className="text-center py-12">
                  <div className="text-6xl text-gray-300 mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    ステップ {currentStep}: {getStepTitle(currentStep)}
                  </h3>
                  <p className="text-gray-500">ここにクイズ作成の詳細フォームが表示されます</p>
                  <div className="mt-4 text-sm text-gray-400">
                    現在のステップ: {currentStep} / 4
                  </div>

                  {/* Test Navigation Buttons */}
                  <div className="mt-6 flex justify-center space-x-4">
                    <button
                      onClick={handlePrevious}
                      disabled={currentStep === 1}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                    >
                      前へ
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentStep === 4}
                      className="px-4 py-2 bg-primary text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                    >
                      次へ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Container>
        </main>
      </PageContainer>
    </>
  );
}

function getStepTitle(step: number): string {
  switch (step) {
    case 1:
      return '基本情報';
    case 2:
      return '問題作成';
    case 3:
      return '設定';
    case 4:
      return '確認・公開';
    default:
      return '不明';
  }
}
