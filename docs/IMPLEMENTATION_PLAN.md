# TUIZ Frontend-Backend Integration Implementation Plan

## 🎯 Phase 1: API Service Layer Implementation

### 1.1 Create API Client Foundation

**File: `src/lib/apiClient.ts`**

```typescript
class ApiClient {
  private baseUrl: string;
  private getAuthToken: () => string | null;

  // HTTP methods with authentication
  async get<T>(endpoint: string): Promise<T>;
  async post<T>(endpoint: string, data: unknown): Promise<T>;
  async put<T>(endpoint: string, data: unknown): Promise<T>;
  async delete<T>(endpoint: string): Promise<T>;

  // Error handling with unified error contracts
  private handleResponse<T>(response: Response): Promise<T>;
  private handleError(error: unknown): never;
}
```

**File: `src/lib/quizService.ts`**

```typescript
class QuizService {
  // Quiz CRUD operations
  async createQuiz(data: CreateQuizSetForm): Promise<QuizSet>;
  async getQuiz(id: string): Promise<QuizSetComplete>;
  async updateQuiz(id: string, data: UpdateQuizSetForm): Promise<QuizSet>;
  async deleteQuiz(id: string): Promise<void>;
  async listQuizzes(filters?: QuizFilters): Promise<QuizListResponse>;

  // Question management
  async addQuestion(quizId: string, data: CreateQuestionForm): Promise<Question>;
  async updateQuestion(
    quizId: string,
    questionId: string,
    data: UpdateQuestionForm,
  ): Promise<Question>;
  async deleteQuestion(quizId: string, questionId: string): Promise<void>;
  async reorderQuestions(
    quizId: string,
    questions: { id: string; order_index: number }[],
  ): Promise<void>;

  // Answer management
  async addAnswer(quizId: string, questionId: string, data: CreateAnswerForm): Promise<Answer>;
  async updateAnswer(
    quizId: string,
    questionId: string,
    answerId: string,
    data: UpdateAnswerForm,
  ): Promise<Answer>;
  async deleteAnswer(quizId: string, questionId: string, answerId: string): Promise<void>;

  // Publishing
  async validateQuiz(quizId: string): Promise<ValidationResponse>;
  async publishQuiz(quizId: string): Promise<QuizSet>;
  async unpublishQuiz(quizId: string): Promise<QuizSet>;

  // Code management
  async generateQuizCode(quizId: string): Promise<{ code: number }>;
  async checkCodeAvailability(code: number): Promise<{ isAvailable: boolean }>;
  async getQuizCode(quizId: string): Promise<{ code: number | null }>;
  async removeQuizCode(quizId: string): Promise<void>;
}
```

### 1.2 Create API Types

**File: `src/types/api.ts`**

```typescript
// API Response types
export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationInfo;
}

export interface ApiError {
  error: string;
  message?: string;
  requestId?: string;
  details?: Record<string, unknown>;
}

// Quiz API types
export interface CreateQuizRequest extends CreateQuizSetForm {}
export interface UpdateQuizRequest extends Partial<CreateQuizSetForm> {}
export interface QuizListResponse extends PaginatedResponse<QuizSet> {}

// Question API types
export interface CreateQuestionRequest extends CreateQuestionForm {}
export interface UpdateQuestionRequest extends Partial<CreateQuestionForm> {}

// Answer API types
export interface CreateAnswerRequest extends CreateAnswerForm {}
export interface UpdateAnswerRequest extends Partial<CreateAnswerForm> {}

// Publishing API types
export interface ValidationResponse {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PublishResponse {
  message: string;
  quiz: QuizSet;
  validation: ValidationResponse;
}
```

### 1.3 Create React Hooks for API Integration

**File: `src/hooks/useQuizMutation.ts`**

```typescript
export const useCreateQuiz = () => {
  return useMutation({
    mutationFn: (data: CreateQuizSetForm) => quizService.createQuiz(data),
    onSuccess: (quiz) => {
      toast.success('クイズが作成されました');
      // Redirect to question creation with quiz ID
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'クイズの作成に失敗しました');
    },
  });
};

export const useUpdateQuiz = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuizSetForm }) =>
      quizService.updateQuiz(id, data),
    onSuccess: () => {
      toast.success('クイズが更新されました');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'クイズの更新に失敗しました');
    },
  });
};

export const useValidateQuiz = () => {
  return useMutation({
    mutationFn: (quizId: string) => quizService.validateQuiz(quizId),
    onError: (error: ApiError) => {
      toast.error(error.message || 'クイズの検証に失敗しました');
    },
  });
};

export const usePublishQuiz = () => {
  return useMutation({
    mutationFn: (quizId: string) => quizService.publishQuiz(quizId),
    onSuccess: () => {
      toast.success('クイズが公開されました！');
      // Redirect to dashboard or quiz view
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'クイズの公開に失敗しました');
    },
  });
};
```

**File: `src/hooks/useQuestionMutation.ts`**

```typescript
export const useAddQuestion = () => {
  return useMutation({
    mutationFn: ({ quizId, data }: { quizId: string; data: CreateQuestionForm }) =>
      quizService.addQuestion(quizId, data),
    onSuccess: () => {
      toast.success('問題が追加されました');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || '問題の追加に失敗しました');
    },
  });
};

export const useUpdateQuestion = () => {
  return useMutation({
    mutationFn: ({
      quizId,
      questionId,
      data,
    }: {
      quizId: string;
      questionId: string;
      data: UpdateQuestionForm;
    }) => quizService.updateQuestion(quizId, questionId, data),
    onSuccess: () => {
      toast.success('問題が更新されました');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || '問題の更新に失敗しました');
    },
  });
};

export const useDeleteQuestion = () => {
  return useMutation({
    mutationFn: ({ quizId, questionId }: { quizId: string; questionId: string }) =>
      quizService.deleteQuestion(quizId, questionId),
    onSuccess: () => {
      toast.success('問題が削除されました');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || '問題の削除に失敗しました');
    },
  });
};
```

**File: `src/hooks/useAutoSave.ts`**

```typescript
export const useAutoSave = (
  data: unknown,
  saveFunction: (data: unknown) => Promise<void>,
  delay: number = 30000, // 30 seconds
) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (data) {
        setIsSaving(true);
        try {
          await saveFunction(data);
          setLastSaved(new Date());
          toast.success('自動保存されました', { duration: 2000 });
        } catch (error) {
          console.error('Auto-save failed:', error);
          toast.error('自動保存に失敗しました');
        } finally {
          setIsSaving(false);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [data, saveFunction, delay]);

  return { isSaving, lastSaved };
};
```

## 🎯 Phase 2: Form Component Integration

### 2.1 BasicInfoStep Integration

**Update: `src/components/quiz-creation/BasicInfoStep.tsx`**

```typescript
interface BasicInfoStepProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
  onNext: (quizId: string) => void; // Now passes quiz ID
  errors?: FormErrors<CreateQuizSetForm>;
  isLoading?: boolean; // New prop
  onSaveDraft?: () => void; // New prop
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  onFormDataChange,
  onNext,
  errors = {},
  isLoading = false,
  onSaveDraft,
}) => {
  const createQuizMutation = useCreateQuiz();
  const updateQuizMutation = useUpdateQuiz();

  // Auto-save functionality
  const { isSaving } = useAutoSave(
    formData,
    async (data) => {
      if (formData.id) {
        await updateQuizMutation.mutateAsync({
          id: formData.id,
          data: data as UpdateQuizSetForm
        });
      }
    },
    30000 // 30 seconds
  );

  const handleNext = async () => {
    // Validate form
    const validationErrors = validateBasicInfo(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      let quizId: string;

      if (formData.id) {
        // Update existing quiz
        await updateQuizMutation.mutateAsync({
          id: formData.id,
          data: formData as UpdateQuizSetForm
        });
        quizId = formData.id;
      } else {
        // Create new quiz
        const quiz = await createQuizMutation.mutateAsync(formData as CreateQuizSetForm);
        quizId = quiz.id;
      }

      onNext(quizId);
    } catch (error) {
      // Error is handled by mutation hooks
      console.error('Failed to save quiz:', error);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Auto-save indicator */}
      {isSaving && (
        <div className="flex items-center text-sm text-gray-600">
          <Loader className="w-4 h-4 mr-2 animate-spin" />
          自動保存中...
        </div>
      )}

      {/* Existing form components */}
      <FormHeader title="基本情報を入力" description="クイズの基本情報を設定してください" />

      {/* Form content */}

      <div className="flex justify-between pt-4 md:pt-6">
        {onSaveDraft && (
          <Button
            variant="outline"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="px-6 md:px-8"
          >
            下書き保存
          </Button>
        )}

        <Button
          variant="gradient2"
          onClick={handleNext}
          disabled={!isFormValid() || createQuizMutation.isPending || updateQuizMutation.isPending}
          className="px-6 md:px-8 text-sm md:text-base"
        >
          {createQuizMutation.isPending || updateQuizMutation.isPending ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            '次へ進む'
          )}
        </Button>
      </div>
    </div>
  );
};
```

### 2.2 QuestionCreationStep Integration

**Update: `src/components/quiz-creation/QuestionCreationStep.tsx`**

```typescript
interface QuestionCreationStepProps {
  quizId: string; // New required prop
  questions: CreateQuestionForm[];
  onQuestionsChange: (questions: CreateQuestionForm[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  errors?: FormErrors<CreateQuestionForm>[];
  isLoading?: boolean;
}

export const QuestionCreationStep: React.FC<QuestionCreationStepProps> = ({
  quizId,
  questions,
  onQuestionsChange,
  onNext,
  onPrevious,
  errors = [],
  isLoading = false,
}) => {
  const addQuestionMutation = useAddQuestion();
  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();

  // Auto-save questions
  const { isSaving } = useAutoSave(
    questions,
    async (questionsData) => {
      const questionsArray = questionsData as CreateQuestionForm[];
      for (const question of questionsArray) {
        if (question.id) {
          // Update existing question
          await updateQuestionMutation.mutateAsync({
            quizId,
            questionId: question.id,
            data: question,
          });
        } else {
          // Create new question
          const newQuestion = await addQuestionMutation.mutateAsync({
            quizId,
            data: question,
          });
          // Update local state with new question ID
          question.id = newQuestion.id;
        }
      }
    },
    30000,
  );

  const handleAddQuestion = async () => {
    const newQuestion: CreateQuestionForm = {
      // Default question data
    };

    try {
      const createdQuestion = await addQuestionMutation.mutateAsync({
        quizId,
        data: newQuestion,
      });

      onQuestionsChange([...questions, { ...newQuestion, id: createdQuestion.id }]);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleDeleteQuestion = async (index: number) => {
    const question = questions[index];
    if (question.id) {
      try {
        await deleteQuestionMutation.mutateAsync({
          quizId,
          questionId: question.id,
        });
      } catch (error) {
        return; // Don't remove from UI if backend delete fails
      }
    }

    const updatedQuestions = questions.filter((_, i) => i !== index);
    onQuestionsChange(updatedQuestions);
  };

  // Rest of component logic...
};
```

### 2.3 FinalStep Integration

**Update: `src/components/quiz-creation/FinalStep/FinalStep.tsx`**

```typescript
interface FinalStepProps {
  quizId: string; // New required prop
  formData: Partial<CreateQuizSetForm>;
  questions: CreateQuestionForm[];
  onPrevious: () => void;
  onPublish: () => void;
  isMobile: boolean;
  isLoading?: boolean;
}

export const FinalStep: React.FC<FinalStepProps> = ({
  quizId,
  formData,
  questions,
  onPrevious,
  onPublish,
  isMobile,
  isLoading = false,
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);

  const validateQuizMutation = useValidateQuiz();
  const publishQuizMutation = usePublishQuiz();

  // Validate quiz on component mount
  useEffect(() => {
    const validateQuiz = async () => {
      try {
        const result = await validateQuizMutation.mutateAsync(quizId);
        setValidationResult(result);
      } catch (error) {
        console.error('Validation failed:', error);
      }
    };

    validateQuiz();
  }, [quizId]);

  const handlePublish = async () => {
    if (!validationResult?.isValid) {
      toast.error('クイズを公開する前に問題を修正してください');
      return;
    }

    setIsPublishing(true);
    try {
      await publishQuizMutation.mutateAsync(quizId);
      onPublish();
    } catch (error) {
      // Error handled by mutation hook
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      {validationResult && (
        <Card className={validationResult.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${validationResult.isValid ? 'text-green-700' : 'text-red-700'}`}>
              {validationResult.isValid ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  クイズの検証が完了しました
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  クイズに問題があります
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validationResult.errors.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-red-700 mb-2">修正が必要な問題:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {validationResult.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-600">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {validationResult.warnings.length > 0 && (
              <div>
                <h4 className="font-medium text-amber-700 mb-2">推奨事項:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {validationResult.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-amber-600">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quiz Summary */}
      {/* Existing quiz summary components */}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isPublishing}
          className="px-6 md:px-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>

        <Button
          variant="gradient"
          onClick={handlePublish}
          disabled={!validationResult?.isValid || isPublishing || publishQuizMutation.isPending}
          className="px-6 md:px-8"
        >
          {isPublishing || publishQuizMutation.isPending ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              公開中...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              クイズを公開
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
```

## 🎯 Phase 3: Main Page Integration

### 3.1 Update Create Quiz Page

**Update: `src/app/(pages)/create/page.tsx`**

```typescript
export default function CreateQuizPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // State management remains the same but now connected to backend

  const handleBasicInfoNext = (newQuizId: string) => {
    setQuizId(newQuizId);
    setCurrentStep(2);
  };

  const handlePublish = () => {
    // Redirect to dashboard or quiz view
    router.push('/dashboard');
    toast.success('クイズが正常に公開されました！');
  };

  return (
    <>
      {/* Existing structure */}

      <div className="rounded-lg shadow-lg p-8 border">
        {currentStep === 1 && (
          <BasicInfoStep
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onNext={handleBasicInfoNext} // Now receives quiz ID
            errors={formErrors}
            isLoading={isSaving}
            onSaveDraft={handleSaveDraft}
          />
        )}

        {currentStep === 2 && quizId && (
          <QuestionCreationStep
            quizId={quizId} // Pass quiz ID
            questions={questions}
            onQuestionsChange={handleQuestionsChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            errors={questionErrors}
          />
        )}

        {currentStep === 3 && quizId && (
          <SettingsStep
            quizId={quizId} // Pass quiz ID
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            errors={formErrors}
          />
        )}

        {currentStep === 4 && quizId && (
          <FinalStep
            quizId={quizId} // Pass quiz ID
            formData={formData}
            questions={questions}
            onPrevious={handlePrevious}
            onPublish={handlePublish}
            isMobile={isMobile}
          />
        )}
      </div>
    </>
  );
}
```

## 📋 Implementation Checklist

### Phase 1: API Service Layer

- [ ] Create `src/lib/apiClient.ts`
- [ ] Create `src/lib/quizService.ts`
- [ ] Create `src/types/api.ts`
- [ ] Create `src/hooks/useQuizMutation.ts`
- [ ] Create `src/hooks/useQuestionMutation.ts`
- [ ] Create `src/hooks/useAutoSave.ts`
- [ ] Install React Query/TanStack Query
- [ ] Add toast notification library

### Phase 2: Form Integration

- [ ] Update `BasicInfoStep.tsx`
- [ ] Update `QuestionCreationStep.tsx`
- [ ] Update `SettingsStep.tsx`
- [ ] Update `FinalStep.tsx`
- [ ] Add loading states to all components
- [ ] Add error handling to all components

### Phase 3: Main Page Integration

- [ ] Update `create/page.tsx`
- [ ] Add quiz ID state management
- [ ] Add navigation with quiz ID
- [ ] Add success/error feedback
- [ ] Test complete workflow

### Testing

- [ ] Unit tests for API service
- [ ] Integration tests for form components
- [ ] E2E tests for complete workflow
- [ ] Error handling tests
- [ ] Auto-save functionality tests

---

**Estimated Total Implementation Time: 4-6 hours**
**Priority Order: Phase 1 → Phase 2 → Phase 3**
