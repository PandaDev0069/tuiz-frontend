# Quiz Frontend Integration Plan

> **Status**: Planning Phase  
> **Created**: 2025-01-09  
> **Version**: 1.0  
> **Dependencies**: Backend Quiz APIs (See [QUIZ_API_IMPLEMENTATION_PLAN.md](../tuiz-backend/docs/QUIZ_API_IMPLEMENTATION_PLAN.md))

## Overview

This document outlines the frontend integration plan for connecting the existing quiz creation UI with the new backend APIs. The goal is to transform the current local-state-only quiz creation into a fully functional system with data persistence, draft saving, and real-time validation.

## Current State Analysis

### ✅ What's Already Implemented

- **Complete UI Workflow**: 4-step quiz creation process
- **Form Components**: All form components are built and functional
- **Type Definitions**: Complete TypeScript interfaces in `quiz.ts`
- **State Management**: React hooks for local state management
- **Validation**: Client-side form validation
- **Authentication**: Existing auth service and user management

### ❌ What's Missing

- **API Integration**: No backend communication for quiz operations
- **Data Persistence**: Form data only stored in local React state
- **Draft Saving**: No ability to save work in progress
- **Error Handling**: No API error handling or loading states
- **Real-time Validation**: No server-side validation integration

## Implementation Phases

### Phase 1: API Service Layer 🔧

**Priority**: High | **Estimated Time**: 1-2 days

#### 1.1 Quiz Service Creation

```typescript
// File: src/lib/quizService.ts
class QuizService {
  private apiUrl: string;

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
  async reorderQuestions(quizId: string, questionIds: string[]): Promise<void>;

  // Answer management
  async addAnswer(quizId: string, questionId: string, data: CreateAnswerForm): Promise<Answer>;
  async updateAnswer(
    quizId: string,
    questionId: string,
    answerId: string,
    data: Partial<CreateAnswerForm>,
  ): Promise<Answer>;
  async deleteAnswer(quizId: string, questionId: string, answerId: string): Promise<void>;

  // Publishing
  async publishQuiz(id: string): Promise<QuizSet>;
  async unpublishQuiz(id: string): Promise<QuizSet>;
  async validateQuiz(id: string): Promise<ValidationResponse>;

  // Game Code Management
  async generateQuizCode(quizId: string): Promise<{ code: number }>;
  async setQuizCode(quizId: string, code: number): Promise<{ code: number; success: boolean }>;
  async checkCodeAvailability(code: number): Promise<{ available: boolean }>;
  async validateCodeFormat(code: number): Promise<{ valid: boolean; message?: string }>;
}
```

#### 1.2 Error Handling & Loading States

```typescript
// File: src/types/api.ts
interface APIError {
  error: string;
  message: string;
  requestId?: string;
}

interface LoadingState {
  isLoading: boolean;
  error: APIError | null;
}

// Custom hook for API calls
const useApiCall = <T>(apiCall: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  // Implementation...
};
```

### Phase 2: State Management Updates 📊

**Priority**: High | **Estimated Time**: 2-3 days

#### 2.1 Quiz Creation State Management

```typescript
// File: src/state/useQuizCreationStore.ts
interface QuizCreationState {
  // Current quiz data
  currentQuiz: Partial<CreateQuizSetForm> | null;
  questions: CreateQuestionForm[];

  // UI state
  currentStep: number;
  isSaving: boolean;
  isPublishing: boolean;

  // Error handling
  formErrors: FormErrors<CreateQuizSetForm>;
  questionErrors: FormErrors<CreateQuestionForm>[];
  apiError: APIError | null;

  // Actions
  setCurrentQuiz: (quiz: Partial<CreateQuizSetForm>) => void;
  setQuestions: (questions: CreateQuestionForm[]) => void;
  setCurrentStep: (step: number) => void;
  saveDraft: () => Promise<void>;
  publishQuiz: () => Promise<void>;
  clearErrors: () => void;
}
```

#### 2.2 Integration with Existing Components

- Update `CreateQuizPage` to use new state management
- Add loading states to all form components
- Implement error display components
- Add success notifications

### Phase 3: Form Component Updates 🎨

**Priority**: High | **Estimated Time**: 2-3 days

#### 3.1 BasicInfoStep Integration

```typescript
// File: src/components/quiz-creation/BasicInfoStep.tsx
interface BasicInfoStepProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
  onNext: () => void;
  errors?: FormErrors<CreateQuizSetForm>;
  isLoading?: boolean; // New prop for loading state
  onSaveDraft?: () => void; // New prop for draft saving
}

// Add auto-save functionality
const useAutoSave = (formData: Partial<CreateQuizSetForm>, delay: number = 2000) => {
  // Implementation for auto-saving form data
};
```

#### 3.2 QuestionCreationStep Integration

```typescript
// File: src/components/quiz-creation/QuestionCreationStep.tsx
interface QuestionCreationStepProps {
  questions: CreateQuestionForm[];
  onQuestionsChange: (questions: CreateQuestionForm[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  errors?: FormErrors<CreateQuestionForm>[];
  isLoading?: boolean;
  onSaveDraft?: () => void;
}

// Add real-time validation
const useQuestionValidation = (questions: CreateQuestionForm[]) => {
  // Implementation for real-time question validation
};
```

#### 3.3 SettingsStep Integration

```typescript
// File: src/components/quiz-creation/SettingsStep.tsx
interface SettingsStepProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
  onNext: () => void;
  onPrevious: () => void;
  errors?: FormErrors<CreateQuizSetForm>;
  isLoading?: boolean;
  onSaveDraft?: () => void;
}
```

#### 3.4 FinalStep Integration

```typescript
// File: src/components/quiz-creation/FinalStep.tsx
interface FinalStepProps {
  formData: Partial<CreateQuizSetForm>;
  questions: CreateQuestionForm[];
  onPrevious: () => void;
  onPublish: () => void;
  isMobile: boolean;
  isLoading?: boolean;
  validationResult?: ValidationResponse;
}

// Add quiz validation before publishing
const useQuizValidation = (quizId: string) => {
  // Implementation for quiz validation
};
```

#### 3.5 Game Code Management Integration

```typescript
// File: src/components/quiz-creation/GameCodeManager.tsx
interface GameCodeManagerProps {
  quizId: string;
  currentCode?: number;
  onCodeChange: (code: number) => void;
  isLoading?: boolean;
  error?: string;
}

// Game code management component
const GameCodeManager: React.FC<GameCodeManagerProps> = ({
  quizId,
  currentCode,
  onCodeChange,
  isLoading,
  error,
}) => {
  // Implementation for game code management
  // - Generate random code button
  // - Manual code input with validation
  // - Real-time availability checking
  // - Code format validation
};
```

### Phase 4: Advanced Features 🚀

**Priority**: Medium | **Estimated Time**: 2-3 days

#### 4.1 Draft Management

```typescript
// File: src/hooks/useDraftManagement.ts
const useDraftManagement = () => {
  const saveDraft = async (
    quizData: Partial<CreateQuizSetForm>,
    questions: CreateQuestionForm[],
  ) => {
    // Save draft to backend
  };

  const loadDraft = async (quizId: string) => {
    // Load draft from backend
  };

  const autoSave = useCallback((data: QuizCreationData) => {
    // Auto-save every 30 seconds
  }, []);

  return { saveDraft, loadDraft, autoSave };
};
```

#### 4.2 Real-time Validation

```typescript
// File: src/hooks/useRealTimeValidation.ts
const useRealTimeValidation = (quizId: string) => {
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);

  const validateQuiz = useCallback(async () => {
    // Call validation API
  }, [quizId]);

  // Validate on question changes
  useEffect(() => {
    const timeoutId = setTimeout(validateQuiz, 1000);
    return () => clearTimeout(timeoutId);
  }, [validateQuiz]);

  return { validationResult, validateQuiz };
};
```

#### 4.3 Progress Tracking

```typescript
// File: src/components/quiz-creation/ProgressTracker.tsx
interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  isSaving: boolean;
  lastSaved?: Date;
  validationStatus?: 'valid' | 'invalid' | 'pending';
}

// Show progress, save status, and validation status
```

## Technical Implementation Details

### API Integration Pattern

```typescript
// Follow existing AuthService pattern
class QuizService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = cfg.apiBase;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const authData = this.getStoredAuthData();
    const token = authData?.session?.access_token;

    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: APIError = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }
}
```

### Error Handling Strategy

```typescript
// File: src/components/ui/ErrorBoundary.tsx
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

// File: src/components/ui/ErrorMessage.tsx
interface ErrorMessageProps {
  error: APIError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

// File: src/components/ui/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}
```

### State Management Architecture

```typescript
// File: src/state/useQuizCreationStore.ts
export const useQuizCreationStore = create<QuizCreationState>((set, get) => ({
  // Initial state
  currentQuiz: null,
  questions: [],
  currentStep: 1,
  isSaving: false,
  isPublishing: false,
  formErrors: {},
  questionErrors: [],
  apiError: null,

  // Actions
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
  setQuestions: (questions) => set({ questions }),
  setCurrentStep: (step) => set({ currentStep: step }),

  saveDraft: async () => {
    set({ isSaving: true, apiError: null });
    try {
      const { currentQuiz, questions } = get();
      if (currentQuiz) {
        await quizService.createQuiz(currentQuiz);
        // Handle questions...
      }
    } catch (error) {
      set({ apiError: error as APIError });
    } finally {
      set({ isSaving: false });
    }
  },

  publishQuiz: async () => {
    set({ isPublishing: true, apiError: null });
    try {
      const { currentQuiz } = get();
      if (currentQuiz?.id) {
        await quizService.publishQuiz(currentQuiz.id);
      }
    } catch (error) {
      set({ apiError: error as APIError });
    } finally {
      set({ isPublishing: false });
    }
  },

  clearErrors: () =>
    set({
      formErrors: {},
      questionErrors: [],
      apiError: null,
    }),
}));
```

## File Structure Updates

```
tuiz-frontend/src/
├── lib/
│   ├── quizService.ts           # Quiz API service
│   └── apiTypes.ts              # API-specific types
├── state/
│   ├── useQuizCreationStore.ts  # Quiz creation state
│   └── useQuizListStore.ts      # Quiz list state
├── hooks/
│   ├── useDraftManagement.ts    # Draft saving/loading
│   ├── useRealTimeValidation.ts # Real-time validation
│   └── useAutoSave.ts           # Auto-save functionality
├── components/
│   ├── ui/
│   │   ├── ErrorBoundary.tsx    # Error boundary component
│   │   ├── ErrorMessage.tsx     # Error display component
│   │   └── LoadingSpinner.tsx   # Loading indicator
│   └── quiz-creation/
│       ├── BasicInfoStep.tsx    # Updated with API integration
│       ├── QuestionCreationStep.tsx # Updated with API integration
│       ├── SettingsStep.tsx     # Updated with API integration
│       ├── FinalStep.tsx        # Updated with API integration
│       └── ProgressTracker.tsx  # New progress tracking component
└── types/
    └── api.ts                   # API-specific types
```

## User Experience Improvements

### Loading States

- Show loading spinners during API calls
- Disable form inputs while saving
- Display progress indicators for multi-step operations

### Error Handling

- Display user-friendly error messages
- Provide retry options for failed operations
- Show validation errors in context

### Success Feedback

- Show success notifications for completed actions
- Display confirmation dialogs for destructive actions
- Provide clear feedback for state changes

### Auto-save

- Save draft every 30 seconds
- Show "saved" indicator when auto-save completes
- Handle offline scenarios gracefully

## Testing Strategy

### Unit Tests

- Test all API service methods
- Test state management actions
- Test custom hooks
- Test error handling scenarios

### Integration Tests

- Test complete quiz creation workflow
- Test draft saving and loading
- Test validation and publishing
- Test error recovery

### E2E Tests

- Test full user journey from creation to publishing
- Test error scenarios and recovery
- Test different user roles and permissions

## Performance Considerations

### Optimization Strategies

- Implement debouncing for auto-save
- Use React.memo for expensive components
- Implement virtual scrolling for large question lists
- Cache API responses where appropriate

### Bundle Size

- Code-split quiz creation components
- Lazy load heavy dependencies
- Optimize image uploads

## Security Considerations

### Data Protection

- Sanitize all user inputs
- Validate data on both client and server
- Implement proper error handling to avoid information leakage

### Authentication

- Ensure all API calls include proper authentication
- Handle token expiration gracefully
- Implement proper logout functionality

## Migration Strategy

### Phase 1: Backend Dependencies

1. Wait for backend APIs to be implemented
2. Set up development environment with new APIs
3. Create API service layer

### Phase 2: State Management

1. Implement new state management
2. Update existing components gradually
3. Add error handling and loading states

### Phase 3: Advanced Features

1. Implement draft management
2. Add real-time validation
3. Implement auto-save functionality

### Phase 4: Testing & Polish

1. Add comprehensive testing
2. Optimize performance
3. Polish user experience

## Success Metrics

### Functional Requirements

- ✅ Users can create, edit, and delete quizzes
- ✅ Users can save drafts and resume later
- ✅ Users can publish quizzes with validation
- ✅ All operations provide proper feedback
- ✅ Error handling works correctly

### Performance Requirements

- ✅ Form interactions feel responsive (< 100ms)
- ✅ API calls complete within reasonable time
- ✅ Auto-save doesn't interfere with user input
- ✅ Page loads quickly (< 2 seconds)

### User Experience Requirements

- ✅ Clear progress indicators
- ✅ Helpful error messages
- ✅ Intuitive workflow
- ✅ Consistent design patterns

## Timeline

| Phase     | Duration      | Dependencies | Deliverables             |
| --------- | ------------- | ------------ | ------------------------ |
| Phase 1   | 1-2 days      | Backend APIs | API service layer        |
| Phase 2   | 2-3 days      | Phase 1      | State management updates |
| Phase 3   | 2-3 days      | Phase 2      | Form component updates   |
| Phase 4   | 2-3 days      | Phase 3      | Advanced features        |
| **Total** | **7-11 days** |              | **Complete integration** |

## Risk Mitigation

### Technical Risks

- **API Dependencies**: Ensure backend APIs are ready before frontend work
- **State Complexity**: Use proven state management patterns
- **Performance**: Implement proper optimization strategies

### User Experience Risks

- **Data Loss**: Implement robust draft saving
- **Confusing Errors**: Provide clear, actionable error messages
- **Slow Performance**: Optimize API calls and rendering

## Next Steps

1. **Wait for Backend APIs**: Ensure backend implementation is complete
2. **Set Up Development Environment**: Prepare for frontend integration
3. **Start with API Service Layer**: Begin with core API integration
4. **Gradual Component Updates**: Update components one by one
5. **Testing and Validation**: Ensure everything works correctly

---

**Document Owner**: Frontend Development Team  
**Last Updated**: 2025-01-09  
**Next Review**: 2025-01-16
