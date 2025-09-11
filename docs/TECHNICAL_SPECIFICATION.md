# TUIZ Frontend-Backend Integration: Technical Specification

## 📋 Executive Summary

**Project:** Frontend quiz creation integration with backend APIs  
**Timeline:** 4-6 hours  
**Status:** Backend 100% complete, Frontend 0% integrated  
**Risk Level:** MEDIUM (manageable with proper implementation)

## 🎯 Integration Requirements

### Backend API Status (✅ COMPLETE)

- **Quiz CRUD:** All endpoints implemented and tested (171 tests passing)
- **Question Management:** Full CRUD with validation
- **Answer Management:** Complete with constraint validation
- **Publishing System:** Validation, publish/unpublish workflows
- **Code Management:** Generation, validation, availability checking
- **Authentication:** JWT verification with Supabase integration
- **Error Handling:** Unified error contracts across all endpoints

### Frontend Integration Gap (❌ MISSING)

- **API Service Layer:** No quiz service exists
- **Data Persistence:** Forms only use React state (data loss risk)
- **Backend Communication:** No API client implementation
- **Error Handling:** No backend error integration
- **Auto-save:** No draft saving functionality

## 🔧 Technical Architecture

### Current Frontend Structure

```
src/components/quiz-creation/
├── BasicInfoStep.tsx          # ✅ UI complete, ❌ No backend
├── QuestionCreationStep.tsx   # ✅ UI complete, ❌ No backend
├── SettingsStep.tsx           # ✅ UI complete, ❌ No backend
├── FinalStep.tsx              # ✅ UI complete, ❌ No backend
└── (various sub-components)   # ✅ All UI functional
```

### Required New Files

```
src/lib/
├── apiClient.ts               # ❌ CREATE - HTTP client with auth
├── quizService.ts             # ❌ CREATE - Quiz API operations
└── imageUploadService.ts      # ❌ CREATE - Image handling

src/types/
├── api.ts                     # ❌ CREATE - API request/response types
└── errors.ts                  # ❌ CREATE - Error handling types

src/hooks/
├── useQuizMutation.ts         # ❌ CREATE - Quiz CRUD hooks
├── useQuestionMutation.ts     # ❌ CREATE - Question management
└── useAutoSave.ts            # ❌ CREATE - Auto-save functionality
```

## 🚀 Implementation Plan

### Phase 1: Foundation (1-2 hours)

**Priority: CRITICAL**

1. **Create API Client** (`src/lib/apiClient.ts`)
   - HTTP methods with authentication headers
   - Token refresh mechanism
   - Error handling with toast notifications
   - Request/response interceptors

2. **Create Quiz Service** (`src/lib/quizService.ts`)
   - Quiz CRUD operations
   - Question/answer management
   - Publishing workflows
   - Code generation integration

3. **Add React Query/TanStack Query**
   - Install and configure
   - Set up query client
   - Error boundary integration

### Phase 2: Form Integration (2-3 hours)

**Priority: HIGH**

1. **BasicInfoStep Integration**
   - Create/update quiz on form submission
   - Auto-save functionality every 30 seconds
   - Error display from backend validation
   - Loading states for save operations

2. **QuestionCreationStep Integration**
   - Real-time question saving to backend
   - Question/answer CRUD operations
   - Image upload integration
   - Validation feedback from backend

3. **SettingsStep Integration**
   - Play settings persistence
   - Quiz code generation
   - Settings validation

4. **FinalStep Integration**
   - Quiz validation before publishing
   - Publishing workflow
   - Success/error feedback

### Phase 3: Enhancement (1-2 hours)

**Priority: MEDIUM**

1. **Draft Management**
   - Load existing drafts from backend
   - Auto-save with visual indicators
   - Draft restoration on page load

2. **Error Recovery**
   - Retry mechanisms for failed requests
   - Offline state handling
   - Data loss prevention

## ⚠️ Critical Risk Mitigation

### 1. Token Expiration

**Solution:** Implement token refresh in API client

```typescript
// Check token expiration before each request
private async ensureValidToken(): Promise<void> {
  const session = this.authStore.getSession();
  if (this.isTokenExpiringSoon(session)) {
    await this.refreshToken();
  }
}
```

### 2. Data Loss Prevention

**Solution:** localStorage backup + auto-save

```typescript
// Save form data to localStorage every 30 seconds
const useFormBackup = (formData: unknown, key: string) => {
  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem(key, JSON.stringify(formData));
    }, 30000);
    return () => clearInterval(timer);
  }, [formData]);
};
```

### 3. Error Handling

**Solution:** Comprehensive error mapping

```typescript
const getErrorMessage = (error: ApiError): string => {
  const messages = {
    invalid_payload: 'フォームの内容を確認してください',
    unauthorized: '再度ログインしてください',
    validation_failed: '入力内容に問題があります',
  };
  return messages[error.error] || 'エラーが発生しました';
};
```

## 📊 Success Metrics

### Technical KPIs

- [ ] Quiz creation success rate > 95%
- [ ] API response time < 2 seconds
- [ ] Auto-save success rate > 99%
- [ ] Zero data loss incidents
- [ ] Error handling coverage 100%

### User Experience KPIs

- [ ] Form completion rate > 80%
- [ ] User satisfaction > 4.5/5
- [ ] Average creation time < 10 minutes
- [ ] Support tickets decrease by 50%

## 🧪 Testing Strategy

### Unit Tests

- [ ] API service methods
- [ ] Error handling functions
- [ ] Form validation logic
- [ ] Auto-save functionality

### Integration Tests

- [ ] Quiz creation workflow
- [ ] Question/answer management
- [ ] Publishing process
- [ ] Error recovery scenarios

### E2E Tests

- [ ] Complete quiz creation flow
- [ ] Form data persistence
- [ ] Error handling UX
- [ ] Auto-save functionality

## 📦 Dependencies

### New Packages Required

```json
{
  "@tanstack/react-query": "^5.0.0",
  "react-hot-toast": "^2.4.1"
}
```

### Existing Dependencies (Already Available)

- Supabase client (authentication)
- React Hook Form (form state)
- Zod (validation)
- Tailwind CSS (styling)

## 🚀 Deployment Checklist

### Pre-deployment

- [ ] All tests passing
- [ ] Error monitoring configured
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Rollback plan prepared

### Post-deployment

- [ ] Monitor error rates
- [ ] Track success metrics
- [ ] Collect user feedback
- [ ] Performance monitoring
- [ ] Feature usage analytics

## 📞 Support & Maintenance

### Error Monitoring

- API error rate alerts
- Form completion tracking
- Auto-save failure detection
- User feedback collection

### Performance Monitoring

- API response times
- Form submission rates
- Auto-save performance
- Resource usage tracking

### User Support

- Clear error messages
- Help documentation
- Contact support integration
- FAQ for common issues

---

**Estimated Implementation Time: 4-6 hours**  
**Risk Level: MEDIUM** (all risks have identified mitigation strategies)  
**Resource Requirements: 1 frontend developer**  
**Success Probability: HIGH** (backend fully tested and working)

**Ready to proceed with implementation.**
