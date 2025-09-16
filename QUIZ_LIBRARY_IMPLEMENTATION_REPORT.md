# TUIZ Quiz Library Implementation Report

## Executive Summary

Based on comprehensive analysis of the old TUIZ codebase, this report documents the quiz library feature implementation and provides detailed recommendations for integrating it into the new TUIZ v2 system. The quiz library serves as a centralized hub for quiz discovery, management, and organization.

## 📋 Table of Contents

1. [Current Implementation Analysis](#current-implementation-analysis)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend API Structure](#backend-api-structure)
4. [Database Schema](#database-schema)
5. [Key Features Analysis](#key-features-analysis)
6. [Migration Plan for New TUIZ](#migration-plan-for-new-tuiz)
7. [Implementation Recommendations](#implementation-recommendations)
8. [Code Examples](#code-examples)

---

## Current Implementation Analysis

### Core Functionality Overview

The quiz library in the old TUIZ system provides:

- **Dual Interface**: Two main tabs - "My Library" (user's quizzes) and "Public Browse" (discover community quizzes)
- **Quiz Management**: Full CRUD operations for user-owned quizzes
- **Public Discovery**: Browse, search, and clone public quizzes
- **Rich Filtering**: Category, difficulty, status, and search-based filtering
- **Multiple View Modes**: Grid and list view options
- **Real-time Operations**: Live clone/delete operations with loading states

### Technology Stack Used

- **Frontend**: React 18+ with hooks, React Router v6
- **Styling**: Custom CSS with BEM methodology + CSS variables
- **State Management**: React hooks + context patterns
- **Icons**: React Icons (Fa icons)
- **Backend**: Express.js + Supabase
- **Database**: PostgreSQL via Supabase with RLS policies

---

## Frontend Architecture

### Component Structure

```
QuizLibrary/
├── QuizLibrary.jsx (Main component - 2000+ lines)
├── QuizLibrary.css (Comprehensive styling - 1500+ lines)
└── Dependencies:
    ├── CustomDropdown.jsx (Reusable dropdown component)
    ├── LoadingSkeleton.jsx (Loading states)
    ├── ConfirmationModal.jsx (Delete confirmations)
    └── Various utility components
```

### Key Sub-Components

#### 1. **Badge Components**

```jsx
function Badge({ variant = "default", children, className = "" })
function DifficultyBadge({ difficulty })
function StatusBadge({ status })
```

#### 2. **QuizCard Component**

- **Props**: `quiz`, `tab`, `onPreview`, `onClone`, `onStart`, `onEdit`, `onDelete`, loading states
- **Features**: Thumbnail display, metadata, action buttons, loading states
- **Responsive**: Adapts to grid/list view modes

#### 3. **PreviewModal Component**

- **Purpose**: Detailed quiz information display
- **Features**: Full metadata, description, author info, action buttons
- **Accessibility**: Proper modal patterns with escape/click-outside handling

#### 4. **EmptyState Component**

- **Adaptive**: Different messages based on context (no results, no library items, etc.)
- **Actionable**: Includes relevant CTAs for empty states

### State Management Pattern

```jsx
// Main state structure
const [tab, setTab] = useState('library'); // library | public
const [filterMode, setFilterMode] = useState('all'); // all | drafts | published
const [view, setView] = useState('grid'); // grid | list
const [loading, setLoading] = useState(false);
const [quizzes, setQuizzes] = useState([]);
const [preview, setPreview] = useState({ open: false, quiz: null });
const [filters, setFilters] = useState({
  category: '',
  difficulty: '',
  status: '',
});
const [sort, setSort] = useState('updated_desc');
const [query, setQuery] = useState('');

// Loading states for async operations
const [cloning, setCloning] = useState(false);
const [cloningQuizId, setCloningQuizId] = useState(null);
const [deleting, setDeleting] = useState(false);
const [deletingQuizId, setDeletingQuizId] = useState(null);
```

### UI/UX Patterns

#### **Japanese-First Design**

- All UI text in Japanese
- Proper localization for error messages
- Japanese-appropriate typography and spacing

#### **Glass Morphism Theme**

- Consistent glass effect backgrounds
- Gradient overlays and borders
- Backdrop blur effects

#### **Advanced Animations**

- Entrance animations for cards (staggered)
- Hover effects with transforms
- Loading states with spinners and shimmers

#### **Responsive Design**

- Mobile-first approach
- Adaptive layouts for different screen sizes
- Touch-friendly interactions

---

## Backend API Structure

### API Endpoints

#### **Core Quiz Management**

1. **GET /api/quiz/my-quizzes**
   - **Purpose**: Fetch user's own quizzes
   - **Auth**: Required (JWT token)
   - **Response**: Array of quiz objects with metadata

2. **GET /api/quiz/public/browse**
   - **Purpose**: Browse public quizzes with filtering/search
   - **Auth**: None required
   - **Query Params**:
     - `category`: Filter by quiz category
     - `difficulty`: Filter by difficulty level
     - `search`: Text search across title/description
     - `sort`: Sorting option (updated_desc, created_desc, plays_desc, etc.)
     - `limit`: Pagination limit (default: 20)
     - `offset`: Pagination offset (default: 0)

3. **POST /api/quiz/public/clone/:id**
   - **Purpose**: Clone public quiz to user's library
   - **Auth**: Required
   - **Features**:
     - Complete question/answer cloning
     - Image duplication to user's storage
     - Metadata copying with ownership transfer

#### **Quiz CRUD Operations**

4. **POST /api/quiz/create**
   - **Purpose**: Create new quiz with metadata
   - **Body**: `{ title, description, category, difficulty_level, thumbnail_url, tags, is_public, status }`

5. **GET /api/quiz/:id**
   - **Purpose**: Get quiz with full question data
   - **Includes**: Questions, answers, all metadata

6. **PUT /api/quiz/:id**
   - **Purpose**: Update quiz metadata
   - **Validation**: Field length limits, enum values

7. **DELETE /api/quiz/:id**
   - **Purpose**: Delete quiz and all associated data
   - **Cleanup**: Questions, answers, images, thumbnails

#### **Image Management**

8. **POST /api/quiz/upload-thumbnail**
   - **Purpose**: Upload standalone thumbnail
   - **Storage**: Supabase Storage with user-scoped paths

9. **POST /api/quiz/:id/upload-thumbnail**
   - **Purpose**: Upload thumbnail for existing quiz
   - **Features**: Automatic database URL update

10. **DELETE /api/quiz/:id/thumbnail**
    - **Purpose**: Remove quiz thumbnail
    - **Cleanup**: Both storage file and database reference

#### **Status Management**

11. **PATCH /api/quiz/:id/status**
    - **Purpose**: Update quiz status (draft/published)
    - **Body**: `{ status, was_published }`

12. **PATCH /api/quiz/:id/publish**
    - **Purpose**: Comprehensive publish with validation
    - **Validation**: Ensures quiz has questions, answers, metadata

### Authentication & Authorization

- **JWT Tokens**: Supabase-issued tokens for user identification
- **RLS Policies**: Row-level security for data isolation
- **User-Scoped Clients**: Separate Supabase clients for user vs admin operations
- **Rate Limiting**: Applied to sensitive operations (uploads, deletions)

### Error Handling

```javascript
// Standardized error response format
{
  success: false,
  message: "User-friendly error message in Japanese",
  error: "Technical error details",
  requestId: "optional-trace-id"
}
```

---

## Database Schema

### Core Tables

#### **question_sets**

```sql
CREATE TABLE question_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  difficulty_level VARCHAR(20) DEFAULT 'medium',
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
  total_questions INTEGER DEFAULT 0,
  times_played INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.0,
  play_settings JSONB DEFAULT '{}',
  last_played_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cloned_from UUID REFERENCES question_sets(id) -- Track cloning relationships
);
```

#### **questions**

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_set_id UUID REFERENCES question_sets(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'multiple_choice',
  image_url TEXT,
  time_limit INTEGER DEFAULT 30,
  points INTEGER DEFAULT 100,
  difficulty VARCHAR(20) DEFAULT 'medium',
  order_index INTEGER NOT NULL,
  explanation_title VARCHAR(255),
  explanation_text TEXT,
  explanation_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **answers**

```sql
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL,
  image_url TEXT,
  answer_explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Relationships

1. **Users → Question Sets**: One-to-many (ownership)
2. **Question Sets → Questions**: One-to-many (composition)
3. **Questions → Answers**: One-to-many (composition)
4. **Question Sets → Question Sets**: Self-referential (cloning via `cloned_from`)

### Indexes & Performance

```sql
-- Performance indexes
CREATE INDEX idx_question_sets_user_id ON question_sets(user_id);
CREATE INDEX idx_question_sets_public ON question_sets(is_public, status);
CREATE INDEX idx_question_sets_category ON question_sets(category);
CREATE INDEX idx_question_sets_difficulty ON question_sets(difficulty_level);
CREATE INDEX idx_questions_set_id ON questions(question_set_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);
```

---

## Key Features Analysis

### 1. **Dual-Tab Interface**

#### My Library Tab

- **Purpose**: Manage user's own quizzes
- **Features**:
  - Status filtering (All/Published/Drafts)
  - Edit functionality
  - Delete with confirmation
  - Start game for published quizzes
  - Preview details

#### Public Browse Tab

- **Purpose**: Discover community content
- **Features**:
  - Search across title/description/category
  - Filter by category/difficulty
  - Sort options (updated, plays, questions, title)
  - Clone to personal library
  - Preview without ownership

### 2. **Advanced Search & Filtering**

```jsx
// Filter configuration
const DIFFICULTY_OPTIONS = [
  { value: '', label: 'すべて' },
  { value: 'easy', label: '簡単' },
  { value: 'medium', label: '普通' },
  { value: 'hard', label: '難しい' },
  { value: 'expert', label: '上級' },
];

const SORT_OPTIONS = [
  { value: 'updated_desc', label: '更新が新しい' },
  { value: 'created_desc', label: '作成が新しい' },
  { value: 'plays_desc', label: 'プレイ回数(多い順)' },
  { value: 'questions_desc', label: '問題数(多い順)' },
  { value: 'title_asc', label: 'タイトル(A→Z)' },
];
```

### 3. **Quiz Cloning System**

#### Frontend Implementation

```jsx
const handleCloneQuiz = async (quiz) => {
  try {
    const confirmed = await showConfirmation({
      title: 'クイズをライブラリに追加',
      message: `"${quiz.title}" をマイライブラリに追加しますか？`,
      confirmText: '追加する',
      type: 'info',
    });

    if (!confirmed) return;

    setCloning(true);
    setCloningQuizId(quiz.id);

    const response = await apiCall(`/quiz/public/clone/${quiz.id}`, {
      method: 'POST',
    });

    showSuccess('クイズがライブラリに追加されました！');
    navigate('/dashboard');
  } catch (error) {
    showError('クイズの追加に失敗しました: ' + error.message);
  } finally {
    setCloning(false);
    setCloningQuizId(null);
  }
};
```

#### Backend Implementation

- **Complete Data Copying**: Questions, answers, metadata
- **Image Duplication**: Copies images to user's storage space
- **Ownership Transfer**: Updates user_id and resets cloning-specific fields
- **Status Reset**: Cloned quizzes start as drafts

### 4. **Responsive Card System**

```css
.quiz-library__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: var(--tuiz-space-6);
}

@media (min-width: 1200px) {
  .quiz-library__grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--tuiz-space-8);
  }
}
```

### 5. **Real-time User Feedback**

- **Loading States**: Granular loading indicators for specific operations
- **Toast Notifications**: Success/error feedback in Japanese
- **Optimistic Updates**: UI updates before API confirmation
- **Progress Indicators**: Visual feedback for long operations

---

## Migration Plan for New TUIZ

### Phase 1: Core Infrastructure

1. **Database Schema**: Migrate question_sets/questions/answers schema to new Supabase instance
2. **Authentication**: Integrate with existing Supabase auth system
3. **File Storage**: Set up quiz-thumbnails bucket with proper RLS policies

### Phase 2: Backend API Development

1. **Quiz Routes**: Implement all quiz CRUD endpoints following new TUIZ patterns
2. **Image Handling**: Migrate thumbnail upload/management system
3. **Clone System**: Implement public quiz cloning with image duplication

### Phase 3: Frontend Component Migration

1. **Base Components**: Convert to new TUIZ component architecture (shadcn/ui + CVA)
2. **State Management**: Integrate with Zustand stores
3. **Styling**: Adapt to new design system tokens

### Phase 4: Advanced Features

1. **Search & Filtering**: Implement advanced filtering with new UI components
2. **Pagination**: Add infinite scroll or pagination for large datasets
3. **Real-time Updates**: Socket.io integration for live updates

### Phase 5: Polish & Optimization

1. **Performance**: Optimize queries and add caching
2. **Accessibility**: Ensure WCAG compliance
3. **Mobile**: Perfect mobile experience
4. **Testing**: Comprehensive test coverage

---

## Implementation Recommendations

### 1. **Component Architecture (New TUIZ Style)**

```tsx
// Modern shadcn/ui + CVA approach
interface QuizCardProps {
  quiz: Quiz;
  variant?: 'library' | 'public';
  onAction?: (action: QuizAction, quiz: Quiz) => void;
  isLoading?: boolean;
  loadingAction?: string;
}

export function QuizCard({
  quiz,
  variant = 'library',
  onAction,
  isLoading,
  loadingAction,
}: QuizCardProps) {
  return (
    <Card variant="glass" className="tuiz-hover-lift tuiz-animate-entrance">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Badge variant={getDifficultyVariant(quiz.difficulty_level)}>
            {getDifficultyLabel(quiz.difficulty_level)}
          </Badge>
          <VisibilityIcon isPublic={quiz.is_public} />
        </div>
        <CardTitle className="line-clamp-2">{quiz.title}</CardTitle>
        {quiz.description && (
          <CardDescription className="line-clamp-3">{quiz.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <QuizMetadata quiz={quiz} />
      </CardContent>

      <CardFooter>
        <QuizActions
          quiz={quiz}
          variant={variant}
          onAction={onAction}
          isLoading={isLoading}
          loadingAction={loadingAction}
        />
      </CardFooter>
    </Card>
  );
}
```

### 2. **State Management (Zustand)**

```tsx
interface QuizLibraryState {
  // Data
  libraryQuizzes: Quiz[];
  publicQuizzes: Quiz[];

  // UI State
  activeTab: 'library' | 'public';
  filterMode: 'all' | 'drafts' | 'published';
  viewMode: 'grid' | 'list';
  searchQuery: string;
  filters: QuizFilters;
  sortBy: SortOption;

  // Loading States
  isLoading: boolean;
  operationStates: Map<string, OperationState>;

  // Actions
  fetchLibraryQuizzes: () => Promise<void>;
  fetchPublicQuizzes: (params: SearchParams) => Promise<void>;
  cloneQuiz: (quizId: string) => Promise<void>;
  deleteQuiz: (quizId: string) => Promise<void>;
  updateFilters: (filters: Partial<QuizFilters>) => void;
  setActiveTab: (tab: 'library' | 'public') => void;
}

export const useQuizLibraryStore = create<QuizLibraryState>()((set, get) => ({
  // ... implementation
}));
```

### 3. **API Service Layer**

```tsx
class QuizLibraryService {
  async getMyQuizzes(): Promise<Quiz[]> {
    const response = await this.apiClient.get('/quiz/my-quizzes');
    return response.quizzes;
  }

  async getPublicQuizzes(params: SearchParams): Promise<PaginatedQuizzes> {
    const searchParams = new URLSearchParams(params);
    const response = await this.apiClient.get(`/quiz/public/browse?${searchParams}`);
    return response;
  }

  async cloneQuiz(quizId: string): Promise<Quiz> {
    const response = await this.apiClient.post(`/quiz/public/clone/${quizId}`);
    return response.clonedQuiz;
  }

  async deleteQuiz(quizId: string): Promise<void> {
    await this.apiClient.delete(`/quiz/${quizId}`);
  }
}
```

### 4. **Enhanced UI Patterns**

#### **Smart Loading States**

```tsx
function QuizActions({ quiz, onAction, operationState }) {
  const isCloning = operationState?.type === 'cloning' && operationState?.targetId === quiz.id;

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={() => onAction('preview', quiz)}>
        <Eye className="h-4 w-4" />
        詳細
      </Button>

      <Button
        variant="primary"
        size="sm"
        onClick={() => onAction('clone', quiz)}
        disabled={isCloning}
      >
        {isCloning ? (
          <>
            <Spinner className="h-4 w-4" />
            追加中...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            追加
          </>
        )}
      </Button>
    </div>
  );
}
```

#### **Advanced Search Interface**

```tsx
function QuizSearch({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-4"
      />
      <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        /
      </kbd>
    </div>
  );
}
```

### 5. **Performance Optimizations**

#### **Virtual Scrolling for Large Lists**

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedQuizGrid({ quizzes, renderQuiz }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: quizzes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 350, // Estimated card height
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderQuiz(quizzes[virtualItem.index])}
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### **Smart Caching Strategy**

```tsx
// React Query integration for caching
function useQuizLibrary() {
  const { data: libraryQuizzes, isLoading: isLoadingLibrary } = useQuery({
    queryKey: ['quiz-library', 'my-quizzes'],
    queryFn: () => quizService.getMyQuizzes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: publicQuizzes, isLoading: isLoadingPublic } = useInfiniteQuery({
    queryKey: ['quiz-library', 'public-quizzes', filters],
    queryFn: ({ pageParam = 0 }) => quizService.getPublicQuizzes({ offset: pageParam, ...filters }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextOffset : undefined),
    staleTime: 2 * 60 * 1000, // 2 minutes for public content
  });

  return {
    libraryQuizzes,
    publicQuizzes,
    isLoading: isLoadingLibrary || isLoadingPublic,
  };
}
```

---

## Code Examples

### Complete Page Implementation (New TUIZ Style)

```tsx
// src/app/(pages)/quiz-library/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuizLibraryStore } from '@/store/quiz-library';
import { PageContainer } from '@/components/ui/core/page-container';
import { Button } from '@/components/ui/core/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/core/tabs';
import { ArrowLeft, FolderOpen, Globe } from 'lucide-react';
import { QuizGrid } from './components/quiz-grid';
import { QuizSearch } from './components/quiz-search';
import { QuizFilters } from './components/quiz-filters';
import { QuizPreviewModal } from './components/quiz-preview-modal';

export default function QuizLibraryPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const {
    activeTab,
    libraryQuizzes,
    publicQuizzes,
    isLoading,
    setActiveTab,
    fetchLibraryQuizzes,
    fetchPublicQuizzes,
    cloneQuiz,
    deleteQuiz,
  } = useQuizLibraryStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (activeTab === 'library') {
      fetchLibraryQuizzes();
    } else {
      fetchPublicQuizzes();
    }
  }, [activeTab, isAuthenticated]);

  return (
    <PageContainer entrance="fadeIn" className="min-h-screen">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        ダッシュボードに戻る
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FolderOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">クイズライブラリ</h1>
        </div>
        <p className="text-muted-foreground">公開クイズを探索してライブラリに追加</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="library" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            マイライブラリ
          </TabsTrigger>
          <TabsTrigger value="public" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            公開クイズを探す
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* Search & Filters */}
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center">
            <QuizSearch />
            <QuizFilters activeTab={activeTab} />
          </div>

          {/* Content */}
          <TabsContent value="library" className="mt-0">
            <QuizGrid
              quizzes={libraryQuizzes}
              variant="library"
              isLoading={isLoading}
              onClone={cloneQuiz}
              onDelete={deleteQuiz}
            />
          </TabsContent>

          <TabsContent value="public" className="mt-0">
            <QuizGrid
              quizzes={publicQuizzes}
              variant="public"
              isLoading={isLoading}
              onClone={cloneQuiz}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Preview Modal */}
      <QuizPreviewModal />
    </PageContainer>
  );
}
```

### Comprehensive Service Integration

```tsx
// src/services/quiz-library.service.ts
import { ApiClient } from '@/lib/api-client';
import type { Quiz, QuizFilters, SearchParams } from '@/types/quiz';

export class QuizLibraryService {
  constructor(private apiClient: ApiClient) {}

  async getMyQuizzes(): Promise<Quiz[]> {
    const response = await this.apiClient.get('/quiz/my-quizzes');
    return this.transformQuizzes(response.quizzes);
  }

  async getPublicQuizzes(params: SearchParams): Promise<{
    quizzes: Quiz[];
    hasMore: boolean;
    total: number;
  }> {
    const searchParams = new URLSearchParams({
      search: params.search || '',
      category: params.category || '',
      difficulty: params.difficulty || '',
      sort: params.sort || 'updated_desc',
      limit: (params.limit || 20).toString(),
      offset: (params.offset || 0).toString(),
    });

    const response = await this.apiClient.get(`/quiz/public/browse?${searchParams}`);

    return {
      quizzes: this.transformQuizzes(response.quizzes),
      hasMore: response.pagination?.hasMore || false,
      total: response.pagination?.total || 0,
    };
  }

  async cloneQuiz(quizId: string): Promise<Quiz> {
    const response = await this.apiClient.post(`/quiz/public/clone/${quizId}`);
    return this.transformQuiz(response.clonedQuiz);
  }

  async deleteQuiz(quizId: string): Promise<void> {
    await this.apiClient.delete(`/quiz/${quizId}`);
  }

  private transformQuizzes(quizzes: any[]): Quiz[] {
    return quizzes.map((quiz) => this.transformQuiz(quiz));
  }

  private transformQuiz(quiz: any): Quiz {
    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      difficultyLevel: quiz.difficulty_level,
      thumbnailUrl: quiz.thumbnail_url,
      tags: quiz.tags || [],
      isPublic: quiz.is_public,
      status: quiz.status,
      totalQuestions: quiz.total_questions || 0,
      timesPlayed: quiz.times_played || 0,
      completionRate: quiz.completion_rate || 0,
      createdAt: new Date(quiz.created_at),
      updatedAt: new Date(quiz.updated_at),
      author: quiz.users
        ? {
            id: quiz.users.id,
            name: quiz.users.name,
          }
        : undefined,
    };
  }
}
```

---

## Conclusion

The quiz library feature in the old TUIZ system represents a comprehensive solution for quiz discovery and management. The implementation demonstrates:

- **Robust Architecture**: Clear separation of concerns between frontend components and backend services
- **User-Centric Design**: Intuitive interfaces with proper loading states and error handling
- **Scalable Database Design**: Well-structured schema supporting complex relationships
- **Performance Considerations**: Efficient queries, caching strategies, and responsive design

For the new TUIZ v2 implementation, the key recommendations are:

1. **Adopt Modern Stack**: Leverage Next.js 15, shadcn/ui, and Zustand for improved DX and performance
2. **Enhance Accessibility**: Ensure WCAG compliance throughout the component hierarchy
3. **Implement Caching**: Use React Query or SWR for intelligent data fetching and caching
4. **Add Real-time Features**: Integrate Socket.io for live updates and collaborative features
5. **Optimize Mobile Experience**: Prioritize mobile-first responsive design

The existing codebase provides an excellent foundation that can be modernized and enhanced to meet current web development standards while preserving the core functionality that users expect.

<function_calls>
<invoke name="manage_todo_list">
<parameter name="operation">write
