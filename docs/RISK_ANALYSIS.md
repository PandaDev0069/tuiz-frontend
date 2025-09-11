# TUIZ Integration Risk Analysis & Mitigation Strategy

## 🚨 High-Risk Issues

### 1. Authentication Token Expiration (CRITICAL)

**Risk Level: HIGH**
**Impact:** Users lose work when tokens expire during long form sessions

**Current Issue:**

- JWT tokens from Supabase have limited lifespan
- Quiz creation can take 10-30 minutes
- No token refresh mechanism in place

**Mitigation Strategy:**

```typescript
// Implement token refresh in API client
class ApiClient {
  private async refreshTokenIfNeeded(): Promise<void> {
    const { session } = useAuthStore.getState();
    if (session && this.isTokenExpiringSoon(session.expires_at)) {
      await supabase.auth.refreshSession();
      // Update auth store with new session
    }
  }

  private isTokenExpiringSoon(expiresAt: number): boolean {
    const buffer = 5 * 60 * 1000; // 5 minutes buffer
    return Date.now() + buffer > expiresAt * 1000;
  }
}
```

**Implementation Priority:** IMMEDIATE (before any API integration)

### 2. Form Data Loss on Page Refresh (CRITICAL)

**Risk Level: HIGH**
**Impact:** Complete loss of user work without warning

**Current Issue:**

- All form data stored only in React state
- Page refresh = complete data loss
- No draft saving mechanism

**Mitigation Strategy:**

```typescript
// Implement localStorage backup + auto-save
const useFormPersistence = (formData: unknown, key: string) => {
  // Save to localStorage every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem(key, JSON.stringify(formData));
    }, 30000);
    return () => clearInterval(timer);
  }, [formData, key]);

  // Restore on page load
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      // Show restore option to user
      showRestoreDialog(JSON.parse(saved));
    }
  }, []);
};
```

**Implementation Priority:** IMMEDIATE (before user testing)

### 3. API Error Handling Gaps (HIGH)

**Risk Level: MEDIUM-HIGH**
**Impact:** Poor user experience, unclear error messages

**Current Issue:**

- Backend returns structured errors but frontend doesn't handle them
- No user-friendly error messages
- No retry mechanisms for failed requests

**Mitigation Strategy:**

```typescript
// Comprehensive error handling
const handleApiError = (error: ApiError): string => {
  const errorMessages: Record<string, string> = {
    invalid_payload: 'フォームの内容に問題があります。入力を確認してください。',
    invalid_credentials: '認証に失敗しました。再度ログインしてください。',
    not_found: '要求されたリソースが見つかりません。',
    validation_failed: 'クイズの検証に失敗しました。必要な項目を確認してください。',
    server_error: 'サーバーエラーが発生しました。しばらく待ってから再試行してください。',
  };

  return errorMessages[error.error] || error.message || '不明なエラーが発生しました。';
};
```

**Implementation Priority:** HIGH (Phase 1)

## ⚠️ Medium-Risk Issues

### 4. Image Upload Integration (MEDIUM)

**Risk Level: MEDIUM**
**Impact:** Broken image functionality, poor user experience

**Current Issue:**

- Frontend has image upload UI but no backend integration
- No Supabase storage configuration
- No image optimization or validation

**Mitigation Strategy:**

```typescript
// Implement Supabase storage integration
const imageUploadService = {
  async uploadImage(file: File, bucket: string): Promise<string> {
    // Validate file size and type
    if (file.size > 5 * 1024 * 1024) throw new Error('ファイルサイズが大きすぎます');
    if (!file.type.startsWith('image/')) throw new Error('画像ファイルを選択してください');

    // Upload to Supabase storage
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);

    if (error) throw error;
    return data.path;
  },
};
```

**Implementation Priority:** MEDIUM (Phase 2)

### 5. Real-time Question Validation (MEDIUM)

**Risk Level: MEDIUM**
**Impact:** Users create invalid questions, publishing fails

**Current Issue:**

- No real-time validation of question content
- Users only discover errors at publishing stage
- Backend validation not connected to frontend

**Mitigation Strategy:**

```typescript
// Implement real-time validation hooks
const useQuestionValidation = (question: CreateQuestionForm) => {
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const validateQuestion = async () => {
      const validationErrors: string[] = [];

      // Client-side validation
      if (!question.question_text?.trim()) {
        validationErrors.push('問題文は必須です');
      }

      if (question.answers.length < 2) {
        validationErrors.push('回答選択肢は2つ以上必要です');
      }

      const correctAnswers = question.answers.filter((a) => a.is_correct);
      if (correctAnswers.length !== 1) {
        validationErrors.push('正解は1つである必要があります');
      }

      setErrors(validationErrors);
    };

    const debounceTimer = setTimeout(validateQuestion, 500);
    return () => clearTimeout(debounceTimer);
  }, [question]);

  return { errors, isValid: errors.length === 0 };
};
```

**Implementation Priority:** MEDIUM (Phase 2)

## 🔍 Low-Risk Issues

### 6. Performance Optimization (LOW)

**Risk Level: LOW**
**Impact:** Slower user experience, higher server costs

**Current Issue:**

- No request caching
- No optimistic updates
- Excessive API calls for auto-save

**Mitigation Strategy:**

```typescript
// Implement request caching and optimistic updates
const useOptimisticQuestionUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateQuestion,
    onMutate: async (newQuestion) => {
      // Optimistically update UI
      const previousQuestions = queryClient.getQueryData(['questions', quizId]);
      queryClient.setQueryData(['questions', quizId], (old) =>
        updateQuestionInList(old, newQuestion),
      );
      return { previousQuestions };
    },
    onError: (err, newQuestion, context) => {
      // Revert on error
      queryClient.setQueryData(['questions', quizId], context.previousQuestions);
    },
  });
};
```

**Implementation Priority:** LOW (Phase 3)

### 7. Offline Support (LOW)

**Risk Level: LOW**
**Impact:** Poor experience in unstable network conditions

**Current Issue:**

- No offline functionality
- No network status awareness
- No queued requests for when back online

**Mitigation Strategy:**

```typescript
// Basic offline support
const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
```

**Implementation Priority:** LOW (Future enhancement)

## 📋 Risk Mitigation Timeline

### Immediate Actions (Before Implementation)

1. **Set up token refresh mechanism**
2. **Implement localStorage backup system**
3. **Create comprehensive error handling**
4. **Add loading states to all components**

### Phase 1 Implementation (1-2 hours)

1. **API client with authentication**
2. **Error handling and toast notifications**
3. **Basic auto-save functionality**
4. **Quiz service layer**

### Phase 2 Implementation (2-3 hours)

1. **Form component integration**
2. **Real-time validation**
3. **Image upload service**
4. **Progress indicators**

### Phase 3 Implementation (1-2 hours)

1. **Performance optimizations**
2. **Advanced error recovery**
3. **Analytics and monitoring**
4. **User experience enhancements**

## 🎯 Success Criteria

### Technical Metrics

- [ ] Zero data loss incidents
- [ ] API response time < 2 seconds
- [ ] Form auto-save success rate > 99%
- [ ] Error handling coverage 100%
- [ ] Token refresh success rate > 95%

### User Experience Metrics

- [ ] Quiz creation completion rate > 80%
- [ ] User satisfaction score > 4.5/5
- [ ] Average time to create quiz < 10 minutes
- [ ] Error recovery success rate > 90%

### Business Metrics

- [ ] Reduced support tickets related to data loss
- [ ] Increased user retention for quiz creation
- [ ] Higher published quiz success rate
- [ ] Improved user onboarding completion

## 🚀 Deployment Strategy

### Pre-deployment Checklist

- [ ] All critical risks mitigated
- [ ] Comprehensive testing completed
- [ ] Error monitoring configured
- [ ] Rollback plan prepared
- [ ] User documentation updated

### Rollout Plan

1. **Internal testing** (1 day)
2. **Beta user testing** (2-3 days)
3. **Gradual rollout** (25% → 50% → 100%)
4. **Monitoring and feedback collection**
5. **Issue resolution and optimization**

### Monitoring and Alerts

- API error rate > 5%
- Auto-save failure rate > 1%
- Form completion drop > 10%
- User complaints about data loss
- Performance degradation > 20%

---

**Risk Assessment Summary:**

- **Critical Risks:** 2 (Token expiration, Data loss)
- **High Risks:** 1 (Error handling)
- **Medium Risks:** 2 (Image upload, Validation)
- **Low Risks:** 2 (Performance, Offline)

**Recommendation:** Address critical and high risks in Phase 1 before proceeding with medium/low risks.
