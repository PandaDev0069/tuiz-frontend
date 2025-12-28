# Complete Quiz Set Flow Documentation

## Overview

This document describes the complete quiz set creation, management, and publishing workflow in the TUIZ quiz application. A quiz set is a collection of questions and answers that can be used to create and host quiz games.

## Quiz Set Structure

### Core Components

A quiz set consists of:

1. **Quiz Set Metadata** - Title, description, settings, etc.
2. **Questions** - Individual quiz questions with timing and scoring
3. **Answers** - Answer choices for each question (2-4 options)
4. **Explanations** - Optional explanations for questions

## Database Schema

### Core Tables

#### 1. `quiz_sets` Table

Stores the main quiz set information.

```sql
create table public.quiz_sets (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  title character varying(255) not null,
  description text,
  thumbnail_url text,
  is_public boolean not null default false,
  difficulty_level character varying(20) not null default 'easy',
  category character varying(100),
  total_questions integer not null default 0,
  times_played integer not null default 0,
  status character varying(20) not null default 'draft',
  tags text[] default '{}',
  last_played_at timestamp with time zone,
  play_settings jsonb not null default '{}'::jsonb,
  cloned_from uuid,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  deleted_at timestamp with time zone,
  constraint quiz_sets_pkey primary key (id),
  constraint quiz_sets_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade
);
```

**Status Values:**

- `draft` - Quiz is being created/edited, not ready for use
- `published` - Quiz is published and can be used in games
- `archived` - Quiz is archived (soft deleted)

**Difficulty Levels:**

- `easy` - Beginner level
- `medium` - Intermediate level
- `hard` - Advanced level
- `expert` - Expert level

**play_settings Structure:**

```json
{
  "code": 123456,
  "show_question_only": true,
  "show_explanation": true,
  "time_bonus": true,
  "streak_bonus": true,
  "show_correct_answer": false,
  "max_players": 400
}
```

#### 2. `questions` Table

Stores individual questions within a quiz set.

```sql
create table public.questions (
  id uuid not null default gen_random_uuid(),
  question_set_id uuid not null,
  question_text text not null,
  question_type character varying(50) not null default 'multiple_choice',
  image_url text,
  show_question_time integer not null default 30,
  answering_time integer not null default 30,
  points integer not null default 100,
  difficulty character varying(20) not null default 'easy',
  order_index integer not null default 0,
  explanation_title text,
  explanation_text text,
  explanation_image_url text,
  show_explanation_time integer not null default 5,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  deleted_at timestamp with time zone,
  constraint questions_pkey primary key (id),
  constraint questions_question_set_id_fkey foreign key (question_set_id) references quiz_sets (id) on delete cascade
);
```

**Question Types:**

- `multiple_choice` - Multiple choice with 2-4 options
- `true_false` - True/False question (2 options)

**Timing Fields:**

- `show_question_time` - Time to display question before answering (seconds)
- `answering_time` - Time limit for answering (seconds)
- `show_explanation_time` - Time to show explanation (seconds)

#### 3. `answers` Table

Stores answer choices for questions.

```sql
create table public.answers (
  id uuid not null default gen_random_uuid(),
  question_id uuid not null,
  answer_text text not null,
  image_url text,
  is_correct boolean not null default false,
  order_index integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  deleted_at timestamp with time zone,
  constraint answers_pkey primary key (id),
  constraint answers_question_id_fkey foreign key (question_id) references questions (id) on delete cascade
);
```

**Constraints:**

- Each question must have at least 2 answers
- Each question must have exactly 1 correct answer
- Maximum 4 answers per question (for multiple_choice)
- Exactly 2 answers for true_false questions

## Complete Quiz Set Workflow

### Phase 1: Quiz Creation (Step 1 - Basic Info)

1. **User Navigates to Create Page**
   - URL: `/create`
   - Page: `src/app/(pages)/create/page.tsx`
   - Requirements:
     - User must be logged in (AuthGuard)
     - User must have a valid session

2. **Step 1: Basic Information**
   - Component: `BasicInfoStep`
   - Fields:
     - **Title** (required, string)
     - **Description** (optional, text)
     - **Thumbnail** (optional, image file)
     - **Visibility** (is_public: boolean)
     - **Difficulty Level** (easy/medium/hard/expert)
     - **Category** (string)
     - **Tags** (array of strings)
   - Actions:
     - User fills in basic information
     - Click "次へ" (Next) button
     - API Call: `POST /quiz`
       - Request Body:
         ```json
         {
           "title": "Quiz Title",
           "description": "Quiz Description",
           "is_public": false,
           "difficulty_level": "easy",
           "category": "General",
           "tags": ["tag1", "tag2"],
           "play_settings": {
             "show_question_only": true,
             "show_explanation": true,
             "time_bonus": true,
             "streak_bonus": true,
             "show_correct_answer": false,
             "max_players": 400
           }
         }
         ```
       - Backend Actions:
         - Creates `quiz_sets` record with:
           - `status` = 'draft'
           - `total_questions` = 0
           - `times_played` = 0
           - `play_settings` = provided settings
         - If thumbnail provided, uploads to storage bucket
       - Response: `QuizSet` object with `id`
     - Quiz ID stored in component state
     - Auto-save: Draft saved automatically
     - Redirect to Step 2

### Phase 2: Question Creation (Step 2 - Questions)

1. **Step 2: Questions**
   - Component: `QuestionCreationStep`
   - URL: `/create` (same page, step 2)
   - Actions:
     - User creates questions one by one
     - For each question:
       - **Question Text** (required)
       - **Question Type** (multiple_choice or true_false)
       - **Question Image** (optional)
       - **Show Question Time** (seconds, default: 30)
       - **Answering Time** (seconds, default: 30)
       - **Points** (integer, default: 100)
       - **Difficulty** (easy/medium/hard/expert)
       - **Order Index** (auto-incremented)
       - **Explanation Title** (optional)
       - **Explanation Text** (optional)
       - **Explanation Image** (optional)
       - **Show Explanation Time** (seconds, default: 5)
       - **Answers** (2-4 answers):
         - **Answer Text** (required)
         - **Answer Image** (optional)
         - **Is Correct** (boolean, exactly one must be true)
         - **Order Index** (0, 1, 2, 3)

2. **Question Creation API**
   - API Call: `POST /quiz/{quizId}/questions`
   - Request Body:
     ```json
     {
       "question_text": "What is 2+2?",
       "question_type": "multiple_choice",
       "image_url": null,
       "show_question_time": 30,
       "answering_time": 30,
       "points": 100,
       "difficulty": "easy",
       "order_index": 0,
       "explanation_title": null,
       "explanation_text": null,
       "explanation_image_url": null,
       "show_explanation_time": 5,
       "answers": [
         {
           "answer_text": "3",
           "image_url": null,
           "is_correct": false,
           "order_index": 0
         },
         {
           "answer_text": "4",
           "image_url": null,
           "is_correct": true,
           "order_index": 1
         },
         {
           "answer_text": "5",
           "image_url": null,
           "is_correct": false,
           "order_index": 2
         },
         {
           "answer_text": "6",
           "image_url": null,
           "is_correct": false,
           "order_index": 3
         }
       ]
     }
     ```
   - Backend Actions:
     - Creates `questions` record
     - Creates `answers` records (2-4 answers)
     - Validates:
       - At least 2 answers
       - Exactly 1 correct answer
       - Max 4 answers for multiple_choice
       - Exactly 2 answers for true_false
     - Updates `quiz_sets.total_questions` (via trigger)
   - Response: `QuestionWithAnswers` object

3. **Question Management**
   - **Add Question**: Click "問題を追加" button
   - **Edit Question**: Click edit icon on question card
   - **Delete Question**: Click delete icon (with confirmation)
   - **Reorder Questions**: Drag and drop or use up/down arrows
     - API Call: `PUT /quiz/{quizId}/questions/reorder`
     - Request Body:
       ```json
       {
         "questions": [
           { "id": "uuid1", "order_index": 0 },
           { "id": "uuid2", "order_index": 1 }
         ]
       }
       ```
   - **Auto-save**: Questions saved automatically on change
   - **Batch Save**: Multiple questions saved together
     - API Call: `POST /quiz/{quizId}/questions/batch`

4. **Answer Management**
   - **Add Answer**: Click "選択肢を追加" button (max 4)
   - **Edit Answer**: Click edit icon on answer
   - **Delete Answer**: Click delete icon (min 2 required)
   - **Mark Correct**: Toggle "正解" checkbox (exactly one must be checked)
   - **Reorder Answers**: Drag and drop or use up/down arrows

5. **Validation**
   - Client-side validation:
     - Question text required
     - At least 2 answers required
     - Exactly 1 correct answer required
     - Answer text required for each answer
   - Server-side validation:
     - Same as client-side
     - Additional: Image URL validation, timing constraints

6. **Navigation**
   - Click "次へ" (Next) → Go to Step 3
   - Click "前へ" (Previous) → Go to Step 1
   - Auto-save before navigation

### Phase 3: Settings Configuration (Step 3 - Settings)

1. **Step 3: Settings**
   - Component: `SettingsStep`
   - URL: `/create` (same page, step 3)
   - Fields:
     - **Quiz Code** (6-digit number, optional)
       - Can be manually set or auto-generated
       - Must be unique
       - Check availability: `GET /quiz/codes/check/{code}`
       - Generate code: `POST /quiz/{quizId}/codes/generate`
     - **Show Question Only** (boolean)
       - If true, show question before answering phase
     - **Show Explanation** (boolean)
       - If true, show explanation after answer reveal
     - **Time Bonus** (boolean)
       - If true, faster answers get more points
     - **Streak Bonus** (boolean)
       - If true, consecutive correct answers get bonus
     - **Show Correct Answer** (boolean)
       - If true, show correct answer during answering
     - **Max Players** (integer, default: 400, max: 400)

2. **Settings Update API**
   - API Call: `PUT /quiz/{quizId}`
   - Request Body:
     ```json
     {
       "play_settings": {
         "code": 123456,
         "show_question_only": true,
         "show_explanation": true,
         "time_bonus": true,
         "streak_bonus": true,
         "show_correct_answer": false,
         "max_players": 400
       }
     }
     ```
   - Backend Actions:
     - Updates `quiz_sets.play_settings` JSONB field
     - Validates code uniqueness (if provided)
     - Updates `quiz_sets.updated_at`

3. **Code Management**
   - **Generate Code**: Auto-generate unique 6-digit code
     - API: `POST /quiz/{quizId}/codes/generate`
     - Response: `{ code: 123456, message: "..." }`
   - **Check Availability**: Verify code is available
     - API: `GET /quiz/codes/check/{code}`
     - Response: `{ isAvailable: true/false, message: "..." }`
   - **Get Current Code**: Get quiz's current code
     - API: `GET /quiz/{quizId}/codes`
     - Response: `{ code: 123456 }`
   - **Remove Code**: Remove quiz code
     - API: `DELETE /quiz/{quizId}/codes`
     - Response: `{ message: "..." }`

4. **Navigation**
   - Click "次へ" (Next) → Go to Step 4
   - Click "前へ" (Previous) → Go to Step 2
   - Auto-save before navigation

### Phase 4: Preview & Publish (Step 4 - Final)

1. **Step 4: Final Step**
   - Component: `FinalStep`
   - URL: `/create` (same page, step 4)
   - Actions:
     - Display quiz summary
     - Validate quiz before publishing
     - Publish quiz

2. **Quiz Validation**
   - API Call: `GET /quiz/{quizId}/validate`
   - Backend Validation:
     - Quiz has title
     - Quiz has at least 1 question
     - Each question has at least 2 answers
     - Each question has exactly 1 correct answer
     - All required fields are filled
   - Response:
     ```json
     {
       "quiz": {
         "id": "uuid",
         "title": "Quiz Title",
         "status": "draft",
         "total_questions": 5
       },
       "validation": {
         "isValid": true,
         "errors": [],
         "warnings": []
       }
     }
     ```
   - Display:
     - ✅ Valid: Green checkmark, "クイズ完成！"
     - ❌ Invalid: Red X, list of errors/warnings

3. **Quiz Summary Display**
   - Shows:
     - Title
     - Description
     - Difficulty Level
     - Category
     - Total Questions
     - Play Settings (code, max players, visibility)

4. **Publishing**
   - API Call: `POST /quiz/{quizId}/publish`
   - Backend Actions:
     - Validates quiz (same as validation endpoint)
     - If valid:
       - Updates `quiz_sets.status` = 'published'
       - Updates `quiz_sets.updated_at`
       - Generates code if not set
     - If invalid:
       - Returns validation errors
       - Does not publish
   - Response:
     ```json
     {
       "message": "Quiz published successfully",
       "quiz": { ... },
       "validation": { ... }
     }
     ```
   - After Publishing:
     - Success toast notification
     - Redirect to `/dashboard` after 1.5 seconds

5. **Navigation**
   - Click "前へ" (Previous) → Go to Step 3
   - Click "クイズを公開" (Publish Quiz) → Publish and redirect

### Phase 5: Quiz Management

#### Editing Published Quiz

1. **Start Editing**
   - Location: `/dashboard` or `/dashboard/library`
   - Action: Click "編集" (Edit) button on quiz card
   - API Call: `PUT /quiz/{quizId}/start-edit`
   - Backend Actions:
     - Sets `quiz_sets.status` = 'draft'
     - Updates `quiz_sets.updated_at`
   - Redirect: `/create/edit/{quizId}`

2. **Edit Page**
   - URL: `/create/edit/{quizId}`
   - Page: `src/app/(pages)/create/edit/[quizId]/page.tsx`
   - Loads existing quiz data:
     - API Call: `GET /quiz/{quizId}/edit`
     - Response: `QuizSetComplete` (with questions and answers)
   - Same 4-step workflow as creation
   - Auto-save enabled
   - Can modify all fields

3. **Publish Edited Quiz**
   - Same validation and publishing process
   - API Call: `PATCH /quiz/{quizId}/publish`
   - Backend Actions:
     - Validates quiz
     - Sets `status` = 'published'
     - Updates `updated_at`

#### Deleting Quiz

1. **Delete Action**
   - Location: `/dashboard` or `/dashboard/library`
   - Action: Click "削除" (Delete) button
   - Confirmation modal appears
   - API Call: `DELETE /quiz/{quizId}`
   - Backend Actions:
     - Soft delete: Sets `deleted_at` = current timestamp
     - Cascades to questions and answers (soft delete)
   - Quiz removed from active list

#### Unpublishing Quiz

1. **Unpublish Action**
   - Location: `/dashboard` or `/dashboard/library`
   - Action: Click "非公開" (Unpublish) button
   - API Call: `POST /quiz/{quizId}/unpublish`
   - Backend Actions:
     - Sets `status` = 'draft'
     - Updates `updated_at`
   - Quiz no longer available for game creation

### Phase 6: Quiz Library

#### My Library

1. **Access**
   - URL: `/dashboard/library`
   - Tab: "マイライブラリ" (My Library)
   - Shows user's own quizzes

2. **Filtering & Search**
   - **Status Filter**: All / Drafts / Published
   - **Category Filter**: Filter by category
   - **Search**: Search by title/description
   - **Sort**: Updated (desc/asc), Created (desc/asc), Title (A-Z/Z-A)

3. **Actions**
   - **Preview**: Click quiz card → Preview modal
   - **Edit**: Click "編集" → Edit page
   - **Start Game**: Click "ゲームを開始" → Create game
   - **Delete**: Click "削除" → Delete quiz
   - **Clone**: Click "複製" → Clone quiz (creates copy)

#### Public Browse

1. **Access**
   - URL: `/dashboard/library`
   - Tab: "公開ブラウズ" (Public Browse)
   - Shows public quizzes from all users

2. **Filtering & Search**
   - **Category Filter**: Filter by category
   - **Difficulty Filter**: Easy / Medium / Hard / Expert
   - **Search**: Search by title/description
   - **Sort**: Plays (desc/asc), Updated (desc/asc), Title (A-Z/Z-A)

3. **Actions**
   - **Preview**: Click quiz card → Preview modal
   - **Clone**: Click "複製" → Clone quiz to own library
   - **Start Game**: Click "ゲームを開始" → Create game (if owner)

#### Quiz Preview

1. **Preview Modal**
   - Component: `PreviewQuizModal`
   - Tabs:
     - **概要** (Overview): Basic info, stats
     - **問題** (Questions): List of questions (read-only)
     - **設定** (Settings): Play settings
   - Actions:
     - **閉じる** (Close): Close modal
     - **複製** (Clone): Clone quiz
     - **ゲームを開始** (Start Game): Create game from quiz

#### Cloning Quiz

1. **Clone Action**
   - API Call: `POST /quiz/library/{quizId}/clone`
   - Backend Actions:
     - Creates new `quiz_sets` record:
       - Copies all fields
       - Sets `user_id` = current user
       - Sets `status` = 'draft'
       - Sets `cloned_from` = original quiz ID
       - Resets `times_played` = 0
     - Creates new `questions` records (copies)
     - Creates new `answers` records (copies)
   - Response: `{ message: "Quiz cloned successfully", quiz: {...} }`
   - Toast notification: "クイズを複製しました"
   - Quiz appears in "My Library"

## API Endpoints

### Quiz Management

- `POST /quiz` - Create new quiz
- `GET /quiz/{quizId}` - Get quiz details
- `GET /quiz/{quizId}/edit` - Get quiz for editing (with questions/answers)
- `GET /quiz/{quizId}?include=questions,answers` - Get complete quiz
- `PUT /quiz/{quizId}` - Update quiz
- `DELETE /quiz/{quizId}` - Delete quiz (soft delete)
- `GET /quiz` - List quizzes (with filters/pagination)

### Question Management

- `POST /quiz/{quizId}/questions` - Add question
- `POST /quiz/{quizId}/questions/batch` - Batch save questions
- `GET /quiz/{quizId}/questions` - Get all questions
- `PUT /quiz/{quizId}/questions/{questionId}` - Update question
- `DELETE /quiz/{quizId}/questions/{questionId}` - Delete question
- `PUT /quiz/{quizId}/questions/reorder` - Reorder questions

### Answer Management

- `POST /quiz/{quizId}/questions/{questionId}/answers` - Add answer
- `GET /quiz/{quizId}/questions/{questionId}/answers` - Get all answers
- `PUT /quiz/{quizId}/questions/{questionId}/answers/{answerId}` - Update answer
- `DELETE /quiz/{quizId}/questions/{questionId}/answers/{answerId}` - Delete answer

### Code Management

- `POST /quiz/{quizId}/codes/generate` - Generate unique code
- `GET /quiz/codes/check/{code}` - Check code availability
- `GET /quiz/{quizId}/codes` - Get quiz code
- `DELETE /quiz/{quizId}/codes` - Remove quiz code

### Publishing

- `GET /quiz/{quizId}/validate` - Validate quiz before publishing
- `POST /quiz/{quizId}/publish` - Publish quiz
- `POST /quiz/{quizId}/unpublish` - Unpublish quiz
- `PUT /quiz/{quizId}/start-edit` - Set quiz to draft for editing
- `PATCH /quiz/{quizId}/publish` - Publish edited quiz

### Quiz Library

- `GET /quiz/library/my` - Get user's quizzes
- `GET /quiz/library/public` - Get public quizzes
- `POST /quiz/library/{quizId}/clone` - Clone quiz

## Validation Rules

### Quiz Set Validation

1. **Required Fields:**
   - `title` - Must not be empty
   - `user_id` - Must be valid user ID
   - `difficulty_level` - Must be one of: easy, medium, hard, expert
   - `status` - Must be one of: draft, published, archived

2. **Optional Fields:**
   - `description` - Can be null/empty
   - `thumbnail_url` - Can be null
   - `category` - Can be null
   - `tags` - Can be empty array

3. **Play Settings Validation:**
   - `code` - Must be 6 digits (if provided)
   - `max_players` - Must be between 1 and 400
   - All boolean fields must be boolean

### Question Validation

1. **Required Fields:**
   - `question_text` - Must not be empty
   - `question_type` - Must be 'multiple_choice' or 'true_false'
   - `show_question_time` - Must be positive integer
   - `answering_time` - Must be positive integer
   - `points` - Must be positive integer
   - `difficulty` - Must be valid difficulty level
   - `order_index` - Must be non-negative integer

2. **Answer Requirements:**
   - Must have at least 2 answers
   - Must have exactly 1 correct answer
   - `multiple_choice` - Maximum 4 answers
   - `true_false` - Exactly 2 answers

3. **Timing Constraints:**
   - `show_question_time` - Recommended: 5-60 seconds
   - `answering_time` - Recommended: 5-120 seconds
   - `show_explanation_time` - Recommended: 3-30 seconds

### Answer Validation

1. **Required Fields:**
   - `answer_text` - Must not be empty
   - `is_correct` - Must be boolean
   - `order_index` - Must be non-negative integer

2. **Constraints:**
   - At least 2 answers per question
   - Exactly 1 correct answer per question
   - Maximum 4 answers per question (multiple_choice)
   - Exactly 2 answers per question (true_false)

## Image Management

### Thumbnail Upload

1. **Upload Process:**
   - User selects image file
   - Client validates:
     - File type: jpg, jpeg, png, webp
     - File size: Max 5MB
   - API Call: `POST /upload/quiz-thumbnail`
   - Backend Actions:
     - Uploads to Supabase Storage: `quiz-images/{user_id}/{quiz_id}/thumbnail.{ext}`
     - Generates public URL
     - Returns URL
   - URL stored in `quiz_sets.thumbnail_url`

### Question Image Upload

1. **Upload Process:**
   - Similar to thumbnail upload
   - Storage path: `quiz-images/{user_id}/{quiz_id}/questions/{question_id}/image.{ext}`
   - URL stored in `questions.image_url`

### Answer Image Upload

1. **Upload Process:**
   - Similar to thumbnail upload
   - Storage path: `quiz-images/{user_id}/{quiz_id}/questions/{question_id}/answers/{answer_id}/image.{ext}`
   - URL stored in `answers.image_url`

### Explanation Image Upload

1. **Upload Process:**
   - Similar to thumbnail upload
   - Storage path: `quiz-images/{user_id}/{quiz_id}/questions/{question_id}/explanations/image.{ext}`
   - URL stored in `questions.explanation_image_url`

## Auto-Save Functionality

### Draft Saving

1. **Auto-Save Triggers:**
   - User stops typing (debounced, 2 seconds)
   - User navigates between steps
   - User clicks "下書きを保存" (Save Draft) button

2. **Save Process:**
   - API Call: `PUT /quiz/{quizId}` (for quiz data)
   - API Call: `POST /quiz/{quizId}/questions/batch` (for questions)
   - Backend updates `updated_at` timestamp
   - Save status indicator shows "保存済み" (Saved)

3. **Save Status:**
   - `idle` - No changes
   - `saving` - Currently saving
   - `saved` - Successfully saved
   - `error` - Save failed

## Publishing Workflow

### Pre-Publishing Validation

1. **Validation Checks:**
   - Quiz has title
   - Quiz has at least 1 question
   - Each question has at least 2 answers
   - Each question has exactly 1 correct answer
   - All required fields are filled
   - No validation errors

2. **Validation Response:**
   ```json
   {
     "quiz": { ... },
     "validation": {
       "isValid": true,
       "errors": [
         {
           "field": "questions[0].answers",
           "message": "Question must have at least 2 answers",
           "code": "MIN_ANSWERS"
         }
       ],
       "warnings": [
         {
           "field": "description",
           "message": "Description is empty",
           "code": "MISSING_DESCRIPTION"
         }
       ]
     }
   }
   ```

### Publishing Process

1. **Publish Action:**
   - User clicks "クイズを公開" (Publish Quiz) button
   - Validation runs automatically
   - If valid:
     - API Call: `POST /quiz/{quizId}/publish`
     - Backend Actions:
       - Validates quiz (server-side)
       - Sets `status` = 'published'
       - Generates code if not set
       - Updates `updated_at`
     - Success notification
     - Redirect to dashboard
   - If invalid:
     - Error notification
     - Display validation errors
     - User must fix errors before publishing

2. **Post-Publishing:**
   - Quiz appears in "Published" filter
   - Quiz can be used to create games
   - Quiz appears in public browse (if `is_public` = true)
   - Quiz can be cloned by other users (if public)

## Quiz Statistics

### Play Statistics

1. **Times Played:**
   - Incremented when game is created from quiz
   - Stored in `quiz_sets.times_played`
   - Updated via trigger or API

2. **Last Played:**
   - Updated when game is created
   - Stored in `quiz_sets.last_played_at`
   - Used for sorting/filtering

### Question Statistics

1. **Total Questions:**
   - Auto-calculated via database trigger
   - Stored in `quiz_sets.total_questions`
   - Updated when questions added/removed

## Error Handling

### Common Errors

1. **Validation Errors:**
   - Error: `validation_failed`
   - Action: Display errors, prevent save/publish
   - User must fix errors

2. **Duplicate Code:**
   - Error: `code_already_exists`
   - Action: Show error, suggest different code
   - User can generate new code

3. **Image Upload Failed:**
   - Error: `upload_failed`
   - Action: Show error, allow retry
   - User can select different image

4. **Quiz Not Found:**
   - Error: `quiz_not_found`
   - Action: Redirect to dashboard
   - Show error message

5. **Permission Denied:**
   - Error: `permission_denied`
   - Action: Redirect to dashboard
   - Show error message (user doesn't own quiz)

## Best Practices

### Quiz Creation

1. **Title & Description:**
   - Use clear, descriptive titles
   - Provide helpful descriptions
   - Use appropriate categories and tags

2. **Questions:**
   - Keep questions concise
   - Use clear, unambiguous language
   - Provide appropriate difficulty levels
   - Set reasonable time limits

3. **Answers:**
   - Make incorrect answers plausible
   - Avoid trick questions
   - Ensure exactly one correct answer
   - Use images when helpful

4. **Explanations:**
   - Provide explanations for learning
   - Keep explanations concise
   - Use images/diagrams when helpful

5. **Settings:**
   - Choose appropriate code (or auto-generate)
   - Set max players based on expected audience
   - Enable time/streak bonuses for engagement
   - Consider showing explanations for education

### Performance Optimization

1. **Image Optimization:**
   - Compress images before upload
   - Use appropriate formats (WebP preferred)
   - Keep file sizes reasonable (< 1MB per image)

2. **Question Count:**
   - Recommended: 5-20 questions per quiz
   - Too few: Not engaging
   - Too many: Player fatigue

3. **Timing:**
   - Balance question display and answering time
   - Consider question difficulty
   - Test timing with sample players

## Future Enhancements

1. **Quiz Templates**: Pre-built quiz templates
2. **Question Bank**: Shared question library
3. **Collaborative Editing**: Multiple users edit same quiz
4. **Version History**: Track quiz changes over time
5. **Analytics**: Detailed quiz performance analytics
6. **Import/Export**: Import from CSV, export to JSON
7. **Question Types**: More question types (fill-in-blank, matching, etc.)
8. **Media Support**: Video questions, audio answers
9. **Localization**: Multi-language support
10. **Accessibility**: Screen reader support, keyboard navigation
