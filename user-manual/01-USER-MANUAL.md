# TUIZ情報王 - User Manual

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Host Guide](#host-guide)
4. [Player Guide](#player-guide)
5. [Game Flow & Phases](#game-flow--phases)
6. [Features Overview](#features-overview)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Introduction

**TUIZ情報王** is a real-time interactive quiz platform designed for education, training, and entertainment. This manual provides comprehensive guidance for using the platform as both a host (quiz creator) and a player (participant).

### Key Concepts

- **Host**: The person who creates quizzes and manages game sessions
- **Player**: Participants who join games using room codes
- **Quiz**: A collection of questions with answers and explanations
- **Game**: An active session where a quiz is being played
- **Room Code**: A unique 6-digit identifier that players use to join a game
- **Game Phase**: The current stage of the game (waiting, countdown, question, answering, etc.)

### Platform Features

- **Real-time Synchronization**: All players see the same screen simultaneously
- **Interactive Learning**: Multiple choice and true/false questions with explanations
- **Live Leaderboards**: Real-time rankings updated after each question
- **Host Control**: Full control over game flow and timing
- **Mobile Support**: Works on smartphones, tablets, and desktops
- **No Installation**: Works directly in your web browser

---

## Getting Started

### System Requirements

- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge (latest version)
- **Internet Connection**: Stable connection for real-time features
- **No Installation Required**: Works directly in your browser

### Creating an Account

1. Navigate to the TUIZ homepage
2. Click **"ログイン"** (Login) in the top navigation
3. Click **"新規登録"** (Register) if you don't have an account
4. Fill in the registration form:
   - **Email Address**: Your email (required)
   - **Username**: 3-20 characters, alphanumeric and underscores only (required)
   - **Display Name**: 1-50 characters, shown to other users (required)
   - **Password**: Minimum 6 characters (required)
   - **Confirm Password**: Must match password (required)
5. Optionally check **"ユーザー名を表示名として使用"** (Use username as display name)
6. Click **"アカウント作成"** (Create Account)
7. You'll be automatically redirected to the dashboard

### Logging In

1. Go to the TUIZ homepage
2. Click **"ログイン"** (Login)
3. Enter your email and password
4. Click **"ログイン"** (Login)
5. You'll be taken to your dashboard

### Account Recovery

If you forget your password:
Resetting password feature is not implemented yet but will be implemented in future.

---

## Host Guide

### Accessing the Dashboard

After logging in, you'll automatically be taken to your dashboard where you can:

- **View Your Quiz Library**: See all quizzes you've created
- **Create New Quizzes**: Start building a new quiz
- **Browse Public Quizzes**: Discover quizzes created by others
- **Start Game Sessions**: Launch games from your quizzes
- **Manage Account**: Update your profile and settings

### Creating a Quiz

#### Step 1: Basic Information

1. From the dashboard, click **"新しいクイズを作成"** (Create New Quiz)
2. Fill in quiz details:
   - **Title** (required): Name of your quiz (1-200 characters)
   - **Description** (required): Brief description of the quiz content
   - **Thumbnail** (optional): Upload an image to represent your quiz
   - **Category** (required): Select or enter a category (default: "General")
   - **Tags** (optional): Add relevant tags for categorization (e.g., "science", "history", "math")
   - **Difficulty Level**: Select from:
     - Easy
     - Medium
     - Hard
     - Expert
   - **Visibility**: Choose:
     - **Private**: Only you can see and use this quiz
     - **Public**: Other users can discover and clone this quiz
3. Click **"次へ"** (Next) to proceed

#### Step 2: Create Questions

1. Click **"問題を追加"** (Add Question) to create your first question
2. For each question, fill in:
   - **Question Text** (required): The question itself
   - **Question Image** (optional): Upload an image to accompany the question
   - **Question Type** (required): Select from:
     - **Multiple Choice**: 2, 3, or 4 answer options
     - **True/False**: Exactly 2 options (True and False)
   - **Time Settings**:
     - **Show Question Time**: How long to display the question before answering (seconds)
     - **Answering Time**: Time limit for players to answer (seconds)
     - **Show Explanation Time**: How long to display the explanation (seconds)
   - **Points**: Points awarded for correct answer (default: 1)
   - **Difficulty**: Question difficulty level
   - **Answer Choices**: Enter all possible answers
     - For Multiple Choice: 2-4 options
     - For True/False: Exactly 2 options
   - **Correct Answer**: Select which answer is correct (must have exactly one)
   - **Explanation** (optional):
     - **Explanation Title**: Brief title for the explanation
     - **Explanation Text**: Detailed explanation of the answer
     - **Explanation Image**: Image to accompany the explanation
3. Click **"保存"** (Save) to add the question
4. Repeat steps 1-3 to add more questions
5. Use the question navigation to review and edit questions
6. Questions can be reordered by editing their order index
7. Click **"次へ"** (Next) when finished adding questions

**Question Creation Tips:**

- Write clear, concise questions
- Use images to make questions more engaging
- Set appropriate time limits (10-30 seconds for answering is typical)
- Always provide helpful explanations
- Test your questions before publishing

#### Step 3: Configure Game Settings

1. Set game play settings:
   - **Quiz Code** (optional): 6-digit code for quick access (100000-999999)
   - **Max Players**: Maximum number of players (1-200, default: 200)
   - **Show Question Only**: Display question before showing answer choices
   - **Show Explanation**: Display explanation after answer reveal
   - **Time Bonus**: Award bonus points for faster answers
   - **Streak Bonus**: Award bonus points for consecutive correct answers
   - **Show Correct Answer**: Display correct answer during reveal phase
2. Review all settings
3. Click **"次へ"** (Next) to proceed

#### Step 4: Review and Publish

1. Review your quiz:
   - Check all questions and answers
   - Verify settings
   - Ensure explanations are complete
2. Click **"公開"** (Publish) to save and make it available
3. Your quiz will be saved to your library

**Note**: You can edit published quizzes, but changes won't affect active games.

### Starting a Game

#### From Your Dashboard

1. Navigate to your dashboard
2. Find the quiz you want to use in your library
3. Click **"ゲームを開始"** (Start Game) button
4. You'll be taken to the **Host Waiting Room**

#### From Quiz Library

1. Browse to your quiz library
2. Select a quiz
3. Click **"ゲームを開始"** (Start Game)
4. You'll be taken to the **Host Waiting Room**

### Host Waiting Room

The Host Waiting Room is where you prepare your game session:

#### Features

- **Room Code Display**: A large, easy-to-read 6-digit code
- **QR Code**: Scan to quickly share the game
- **Player List**: See all players who have joined
- **Player Count**: Real-time count of connected players
- **Game Information**: Quiz title, total questions, and settings
- **Start Game Button**: Begin the game when ready

#### Sharing the Room Code

**Methods to Share:**

1. **Display on Screen**: Show the room code on a projector or large screen
2. **QR Code**: Players can scan the QR code with their phones
3. **Verbal Announcement**: Read the code aloud
4. **Written**: Write the code on a whiteboard or share via messaging

#### Starting the Game

1. Wait for players to join (you'll see them appear in the player list)
2. When ready, click **"ゲームを開始"** (Start Game)
3. The game will begin with a 3-second countdown
4. You'll be taken to the Host Control Panel

**Tips:**

- Wait until you have enough players
- Announce the room code clearly
- Give players time to join (30-60 seconds is typical)
- You can lock the room to prevent late joiners

### Host Control Panel

The Host Control Panel is your command center during the game. You have full control over the game flow.

#### Control Panel Features

- **Current Phase Display**: Shows what phase the game is in
- **Question Information**: Current question number and total questions
- **Timer Display**: Shows remaining time for current phase
- **Control Buttons**: Manage game progression
- **Player Statistics**: See answer statistics in real-time

#### Game Controls

**Start Question**

- **When**: At the beginning of each question or after explanation
- **Action**: Click **"問題を開始"** (Start Question)
- **Result**: Question is displayed to all players
- **Timer**: Shows "Show Question Time" countdown

**Reveal Answer**

- **When**: After players have answered (or timer expires)
- **Action**: Click **"答えを表示"** (Reveal Answer)
- **Result**: Correct answer is shown with statistics
- **Statistics**: Shows how many players chose each answer

**Next Question**

- **When**: After answer reveal and explanation (if shown)
- **Action**: Click **"次の問題へ"** (Next Question)
- **Result**: Advances to the next question
- **Auto-advance**: Can be configured to auto-advance after time limit

#### Player Management

**View Players**

- See all connected players in real-time
- View player names and connection status
- Monitor player count

**Kick Player**

- Remove a player from the game
- **When**: Misbehavior, technical issues, or other reasons
- **Action**: Click player name → **"削除"** (Remove)
- **Note**: Use sparingly and fairly

**Lock Room**

- Prevent new players from joining
- **When**: Game has started or you have enough players
- **Action**: Toggle room lock in settings
- **Result**: New players cannot join with the room code

### Game Screens (Host View)

As the host, you see the same screens as players, but with additional controls:

#### 1. Countdown Screen

- **Duration**: 3 seconds
- **Display**: Large countdown numbers (3, 2, 1)
- **Purpose**: Prepare players for the question
- **Control**: Automatic transition to question

#### 2. Question Screen

- **Display**: Question text and image (if provided)
- **Duration**: "Show Question Time" setting
- **Purpose**: Let players read the question
- **Control**: Automatic transition to answering phase

#### 3. Answering Screen

- **Display**: Question with all answer choices
- **Duration**: "Answering Time" setting
- **Purpose**: Players select and submit answers
- **Statistics**: Real-time answer submission count
- **Control**: Can manually reveal answer or wait for timer

#### 4. Answer Reveal Screen

- **Display**:
  - Correct answer highlighted
  - Statistics showing answer distribution
  - Percentage of players who chose each answer
- **Duration**: Configurable (typically 10 seconds)
- **Purpose**: Show results and correct answer
- **Control**: Click "Next Question" to proceed

#### 5. Leaderboard Screen

- **Display**:
  - Current rankings
  - Player names and scores
  - Rank changes (up/down arrows)
  - Accuracy percentages
- **Duration**: Configurable (typically 10 seconds)
- **Purpose**: Show current standings
- **Control**: Click "Next Question" to proceed

#### 6. Explanation Screen

- **Display**:
  - Explanation title and text
  - Explanation image (if provided)
- **Duration**: "Show Explanation Time" setting
- **Purpose**: Educational value, explain why answer is correct
- **Control**: Click "Next Question" to proceed

#### 7. Podium Screen (Game End)

- **Display**:
  - Top 3 players (podium positions)
  - Final rankings for all players
  - Final scores
  - Game statistics
- **Duration**: Indefinite (game has ended)
- **Purpose**: Celebrate winners and show final results
- **Control**: Return to dashboard or start new game

### Quiz Library Management

#### Viewing Your Quizzes

**My Library Tab**

- View all quizzes you've created
- Filter by status (Draft, Published, Archived)
- Search by title, description, or tags
- Sort by date, title, or play count

**Public Browse Tab**

- Discover quizzes created by other users
- Filter by difficulty, category, or tags
- Search for specific topics
- See play counts and ratings

#### Editing Quizzes

1. Find the quiz in your library
2. Click **"編集"** (Edit) button
3. Make changes to:
   - Basic information (title, description, etc.)
   - Questions (add, edit, delete, reorder)
   - Answers (modify answer choices)
   - Settings (game configuration)
4. Click **"保存"** (Save) to update
5. **Note**: Changes won't affect active games

#### Deleting Quizzes

1. Find the quiz in your library
2. Click **"削除"** (Delete) button
3. Confirm deletion in the popup
4. **Warning**: This action cannot be undone
5. **Note**: Quizzes are soft-deleted and can be restored by admins

#### Cloning Quizzes

1. Find a quiz (yours or from public browse)
2. Click **"複製"** (Clone) button
3. The quiz will be copied to your library with "(コピー)" suffix
4. Edit the cloned quiz as needed
5. **Use Case**: Use others' quizzes as templates, create variations

#### Publishing Quizzes

1. Create or edit a quiz
2. Ensure all questions have correct answers
3. Click **"公開"** (Publish) button
4. Quiz status changes to "Published"
5. Published quizzes can be:
   - Used to start games
   - Discovered by other users (if public)
   - Cloned by other users (if public)

---

## Player Guide

### Joining a Game

#### Step 1: Get the Room Code

- **From Host**: The host will share a 6-digit room code
- **Methods**:
  - Displayed on screen/projector
  - QR code to scan
  - Verbal announcement
  - Written or messaged

#### Step 2: Navigate to Join Page

1. Go to the TUIZ homepage
2. Click **"TUIZ参加"** (Join TUIZ) button
3. You'll be taken to the join page

#### Step 3: Enter Room Code and Name

1. Enter the **Room Code** (6 digits) in the input field
2. Enter your **Player Name** (this is how others will see you)
3. Click **"参加"** (Join) button
4. You'll be taken to the **Waiting Room**

**Tips:**

- Use a recognizable name
- Double-check the room code
- If code doesn't work, verify with the host

### Player Waiting Room

The Waiting Room is where you wait for the game to start:

#### Features

- **Game Information**: Quiz title and description
- **Player List**: See other players who have joined
- **Player Count**: Total number of players
- **Status**: "Waiting for host to start game"
- **Room Code Display**: Confirmation of the room you joined

#### What to Expect

- Wait for the host to start the game
- See other players joining in real-time
- Game will automatically begin when host clicks "Start Game"
- You'll be automatically taken to the game when it starts

**Tips:**

- Don't refresh the page (you'll need to rejoin)
- Wait patiently for the host
- Make sure your internet connection is stable

### Playing the Game

The game automatically progresses through different phases. You don't need to navigate manually - the game will guide you through each screen.

#### Phase 1: Countdown (3 seconds)

- **What You See**: Large countdown numbers (3, 2, 1)
- **Duration**: 3 seconds
- **Purpose**: Prepare for the question
- **Action Required**: None, just wait

#### Phase 2: Question Display

- **What You See**:
  - Question text
  - Question image (if provided)
  - Question number (e.g., "Question 1 of 10")
- **Duration**: Set by host (typically 10 seconds)
- **Purpose**: Read and understand the question
- **Action Required**: Read the question carefully
- **Timer**: Countdown showing remaining time

#### Phase 3: Answering Phase

- **What You See**:
  - Question text and image
  - All answer choices (A, B, C, D or True/False)
  - Answer buttons you can click
  - Timer showing remaining time
- **Duration**: Set by host (typically 30 seconds)
- **Purpose**: Select and submit your answer
- **Action Required**:
  1. Read all answer choices
  2. Click on your selected answer
  3. Your answer is automatically submitted
  4. You can change your answer before time expires
- **Timer**: Countdown showing remaining time
- **Submission**: Answer is automatically submitted when:
  - You click an answer choice
  - Time expires (your last selected answer is submitted)

**Answering Tips:**

- Read all options before selecting
- You can change your answer before time expires
- Answer quickly but accurately
- Don't wait until the last second

#### Phase 4: Answer Reveal

- **What You See**:
  - Question and all answer choices
  - **Correct answer highlighted** (usually in green)
  - **Your answer marked** (correct = green check, incorrect = red X)
  - **Statistics**: Bar chart showing how many players chose each answer
  - **Percentages**: Percentage of players for each choice
- **Duration**: Set by host (typically 10 seconds)
- **Purpose**: See the correct answer and how others answered
- **Action Required**: None, just observe
- **Feedback**:
  - See if you were correct
  - See how your answer compares to others
  - Learn from the statistics

#### Phase 5: Leaderboard

- **What You See**:
  - **Rankings**: List of all players ranked by score
  - **Your Position**: Highlighted with your rank
  - **Player Names**: All player names
  - **Scores**: Current total scores
  - **Rank Changes**: Arrows showing if you moved up or down
  - **Accuracy**: Percentage of correct answers
  - **Total Answers**: Number of questions answered
- **Duration**: Set by host (typically 10 seconds)
- **Purpose**: See current standings and your position
- **Action Required**: None, just observe
- **Motivation**:
  - See how you're doing
  - Track your progress
  - Compete with other players

#### Phase 6: Explanation

- **What You See**:
  - **Explanation Title**: Brief title (if provided)
  - **Explanation Text**: Detailed explanation of why the answer is correct
  - **Explanation Image**: Image to illustrate the explanation (if provided)
- **Duration**: Set by host (typically 10 seconds)
- **Purpose**: Learn why the answer is correct
- **Action Required**: None, just read and learn
- **Educational Value**:
  - Understand the concept
  - Learn from mistakes
  - Reinforce correct knowledge

#### Phase 7: Next Question

After the explanation, the game automatically moves to the next question:

- Countdown (3 seconds)
- Question Display
- Answering Phase
- Answer Reveal
- Leaderboard
- Explanation
- (Repeat until all questions are answered)

#### Phase 8: Final Podium (Game End)

After all questions are answered:

- **What You See**:
  - **Top 3 Players**: Displayed on podium (1st, 2nd, 3rd place)
  - **Final Rankings**: Complete list of all players
  - **Final Scores**: Total points earned
  - **Game Statistics**:
    - Total questions
    - Your correct answers
    - Your accuracy percentage
    - Your final rank
    - Time taken
- **Duration**: Indefinite (game has ended)
- **Purpose**: Celebrate winners and see final results
- **Action Required**: None
- **Options**:
  - View detailed statistics
  - Return to homepage
  - Join another game

### Game Flow Summary

The complete game flow for players:

```
1. Join Game (Enter Room Code)
   ↓
2. Waiting Room (Wait for host)
   ↓
3. Countdown (3 seconds)
   ↓
4. Question Display (Read question)
   ↓
5. Answering Phase (Select answer)
   ↓
6. Answer Reveal (See results)
   ↓
7. Leaderboard (See rankings)
   ↓
8. Explanation (Learn why)
   ↓
9. Next Question (Repeat 3-8)
   ↓
10. Final Podium (Game End)
```

### Player Features

#### Real-time Updates

- **Synchronized Screens**: All players see the same screen at the same time
- **Live Statistics**: Answer statistics update in real-time
- **Instant Leaderboard**: Rankings update after each question
- **Automatic Progression**: Game automatically moves through phases

#### Answer Submission

- **Click to Answer**: Simply click on your chosen answer
- **Change Answer**: You can change your answer before time expires
- **Auto-submit**: Answer is automatically submitted when time expires
- **Confirmation**: Visual feedback when your answer is submitted

#### Score Tracking

- **Points**: Earn points for correct answers
- **Time Bonus**: Faster answers may earn bonus points (if enabled)
- **Streak Bonus**: Consecutive correct answers may earn bonus points (if enabled)
- **Real-time Updates**: Your score updates immediately after each question

#### Connection Handling

- **Automatic Reconnection**: If you lose connection, the game will try to reconnect
- **State Sync**: Your game state is synchronized when you reconnect
- **No Data Loss**: Your answers and progress are preserved

---

## Game Flow & Phases

### Complete Game Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    GAME FLOW OVERVIEW                        │
└─────────────────────────────────────────────────────────────┘

HOST SIDE                          PLAYER SIDE
─────────────────                  ─────────────────

1. Create Quiz
   ↓
2. Start Game
   ↓
3. Host Waiting Room               Player Waiting Room
   (Share Room Code)               (Enter Room Code)
   ↓                               ↓
4. Click "Start Game"              Wait for game start
   ↓                               ↓
5. COUNTDOWN PHASE (3 seconds)
   ↓                               ↓
6. QUESTION DISPLAY PHASE
   (Show Question Time)
   ↓                               ↓
7. ANSWERING PHASE
   (Answering Time)
   Host sees statistics            Players select answers
   ↓                               ↓
8. ANSWER REVEAL PHASE
   (Reveal Time)
   Host clicks "Reveal"            See correct answer
   Shows statistics                See your result
   ↓                               ↓
9. LEADERBOARD PHASE
   (Leaderboard Time)
   Host sees rankings              See your rank
   ↓                               ↓
10. EXPLANATION PHASE
    (Explanation Time)
    Host sees explanation          Read explanation
    ↓                               ↓
11. NEXT QUESTION
    Host clicks "Next Question"    Auto-advance
    (Repeat from step 5)
    ↓                               ↓
12. FINAL PODIUM
    (Game End)
    Final rankings                 Final results
```

### Detailed Phase Descriptions

#### Phase 1: Waiting Room

**Host View:**

- Room code display
- QR code for sharing
- Player list with names
- Player count
- "Start Game" button
- Game information

**Player View:**

- Game information
- Player list
- Player count
- "Waiting for host" message
- Room code confirmation

**Duration**: Until host starts game
**Transition**: Host clicks "Start Game" → Countdown phase

---

#### Phase 2: Countdown

**Display**: Large countdown numbers (3, 2, 1)
**Duration**: 3 seconds (fixed)
**Purpose**: Prepare players for the question
**Transition**: Automatic → Question Display phase

**Host Actions**: None (automatic)
**Player Actions**: None (automatic)

---

#### Phase 3: Question Display

**Display**:

- Question text
- Question image (if provided)
- Question number (e.g., "Question 1 of 10")
- Timer countdown

**Duration**: "Show Question Time" setting (typically 10 seconds)
**Purpose**: Let players read and understand the question
**Transition**: Automatic → Answering phase

**Host Actions**: None (automatic)
**Player Actions**: Read the question

---

#### Phase 4: Answering

**Display**:

- Question text and image
- All answer choices (A, B, C, D or True/False)
- Clickable answer buttons
- Timer countdown
- "Answer Submitted" confirmation (after clicking)

**Duration**: "Answering Time" setting (typically 30 seconds)
**Purpose**: Players select and submit answers
**Transition**:

- Automatic when timer expires → Answer Reveal phase
- Manual when host clicks "Reveal Answer" → Answer Reveal phase

**Host Actions**:

- View real-time answer statistics
- Click "Reveal Answer" to proceed early
- See how many players have answered

**Player Actions**:

- Read all answer choices
- Click on selected answer
- Can change answer before time expires
- Answer is auto-submitted when time expires

**Answer Statistics** (Host only):

- Real-time count of submitted answers
- Distribution of answers (if available)
- Percentage of players who have answered

---

#### Phase 5: Answer Reveal

**Display**:

- Question and all answer choices
- **Correct answer highlighted** (green background/checkmark)
- **Your answer marked**:
  - Correct: Green checkmark ✓
  - Incorrect: Red X ✗
- **Statistics bar chart**: Shows how many players chose each answer
- **Percentages**: Percentage of players for each choice
- **Visual feedback**: Color-coded answer choices

**Duration**: Configurable (typically 10 seconds)
**Purpose**: Show correct answer and answer distribution
**Transition**:

- Automatic when timer expires → Leaderboard phase
- Manual when host clicks "Next Question" → Leaderboard phase

**Host Actions**:

- View complete statistics
- See answer distribution
- Click "Next Question" to proceed

**Player Actions**:

- See if your answer was correct
- See how others answered
- Learn from the statistics

**Statistics Display**:

- Total players who answered
- Count for each answer choice
- Percentage for each answer choice
- Visual bar chart representation

---

#### Phase 6: Leaderboard

**Display**:

- **Rankings table**: All players ranked by score
- **Your position**: Highlighted row showing your rank
- **Player information**:
  - Player name
  - Current score
  - Rank number
  - Rank change indicator (↑ up, ↓ down, → same)
  - Accuracy percentage
  - Total answers
- **Top players**: Highlighted at the top

**Duration**: Configurable (typically 10 seconds)
**Purpose**: Show current standings and rankings
**Transition**:

- Automatic when timer expires → Explanation phase
- Manual when host clicks "Next Question" → Explanation phase

**Host Actions**:

- View all player rankings
- See score changes
- Click "Next Question" to proceed

**Player Actions**:

- See your current rank
- See how you compare to others
- Track your progress

**Ranking Information**:

- Rank number (1st, 2nd, 3rd, etc.)
- Player name
- Total score
- Rank change from previous question
- Accuracy percentage
- Total questions answered

---

#### Phase 7: Explanation

**Display**:

- **Explanation title** (if provided)
- **Explanation text**: Detailed explanation of why the answer is correct
- **Explanation image** (if provided)
- Question context (question text and correct answer)

**Duration**: "Show Explanation Time" setting (typically 10 seconds)
**Purpose**: Educational value - explain why the answer is correct
**Transition**:

- Automatic when timer expires → Next Question (or Podium if last question)
- Manual when host clicks "Next Question" → Next Question

**Host Actions**:

- View explanation
- Click "Next Question" to proceed to next question

**Player Actions**:

- Read the explanation
- Learn why the answer is correct
- Understand the concept

**Educational Value**:

- Reinforces correct knowledge
- Explains mistakes
- Provides context
- Enhances learning experience

---

#### Phase 8: Next Question Transition

After explanation, the game moves to the next question:

1. **If more questions remain**:
   - Countdown phase (3 seconds)
   - Question Display phase
   - Answering phase
   - (Repeat cycle)

2. **If last question completed**:
   - Final Podium phase

**Host Actions**:

- Click "Next Question" button
- Or wait for auto-advance (if enabled)

**Player Actions**:

- Automatic transition
- No action required

---

#### Phase 9: Final Podium (Game End)

**Display**:

- **Top 3 Podium**:
  - 1st place (center, highest)
  - 2nd place (left)
  - 3rd place (right)
- **Final Rankings**: Complete list of all players
- **Final Scores**: Total points for each player
- **Game Statistics**:
  - Total questions
  - Your correct answers
  - Your accuracy percentage
  - Your final rank
  - Average response time
  - Best streak

**Duration**: Indefinite (game has ended)
**Purpose**: Celebrate winners and show final results
**Transition**: None (game has ended)

**Host Actions**:

- View final results
- Return to dashboard
- Start a new game

**Player Actions**:

- View your final results
- See final rankings
- Return to homepage
- Join another game

**Final Statistics**:

- Final rank
- Total score
- Correct answers
- Incorrect answers
- Accuracy percentage
- Average response time
- Fastest response
- Slowest response
- Best streak
- Current streak

---

### Game Flow Control

#### Host Controls

The host has full control over game progression:

1. **Start Question**: Begin each question
2. **Reveal Answer**: Show correct answer and statistics
3. **Next Question**: Advance to next question
4. **Pause/Resume**: Pause or resume the game
5. **End Game**: End the game early

#### Automatic Transitions

Some phases transition automatically:

- Countdown → Question Display (after 3 seconds)
- Question Display → Answering (after show question time)
- Answering → Answer Reveal (after answering time expires)
- Answer Reveal → Leaderboard (after reveal time expires)
- Leaderboard → Explanation (after leaderboard time expires)
- Explanation → Next Question (after explanation time expires)

#### Manual Override

The host can manually advance phases:

- Click "Reveal Answer" during answering phase
- Click "Next Question" after any phase
- Pause the game at any time
- End the game at any time

---

## Features Overview

### Real-time Synchronization

- **Synchronized Screens**: All players see the same screen simultaneously
- **Instant Updates**: Changes appear immediately for all participants
- **Live Statistics**: Answer statistics update in real-time
- **Connection Management**: Automatic reconnection if connection is lost

### Interactive Learning

- **Multiple Question Types**: Multiple choice (2-4 options) and True/False
- **Visual Support**: Images for questions and explanations
- **Time-limited Challenges**: Encourages quick thinking
- **Answer Explanations**: Educational value after each question
- **Competitive Leaderboards**: Motivates engagement

### Flexible Quiz Creation

- **Unlimited Questions**: Add as many questions as you want
- **Custom Timing**: Set time limits for each phase
- **Image Support**: Add images to questions and explanations
- **Tag-based Organization**: Organize quizzes with tags
- **Difficulty Levels**: Categorize by difficulty
- **Public/Private**: Control quiz visibility

### User-Friendly Interface

- **Clean Design**: Modern, intuitive interface
- **Mobile Responsive**: Works on all devices
- **Accessible**: Keyboard navigation and screen reader support
- **Multilingual**: Japanese interface (English support coming)

### Game Management

- **Host Control Panel**: Full control over game flow
- **Player Management**: View, monitor, and manage players
- **Real-time Statistics**: Live answer distribution
- **Question-by-Question Progression**: Controlled pacing
- **Pause/Resume**: Flexible game control

### Analytics & Insights

- **Answer Statistics**: See how players answered
- **Leaderboard Tracking**: Monitor player progress
- **Game History**: Review past games
- **Performance Metrics**: Track quiz performance

---

## Troubleshooting

### Common Issues

#### Cannot Join Game

**Problem**: Room code not working or game not found

**Solutions**:

1. **Verify Room Code**: Double-check all 6 digits
2. **Check Game Status**: Ensure game hasn't ended
3. **Room Locked**: Ask host if room is locked
4. **Refresh Page**: Try refreshing the join page
5. **Clear Cache**: Clear browser cache and try again
6. **Contact Host**: Verify code with the host

#### Connection Issues

**Problem**: Game not updating in real-time, lag, or disconnection

**Solutions**:

1. **Check Internet**: Ensure stable internet connection
2. **Refresh Page**: Refresh the browser page
3. **Reconnect**: Leave and rejoin the game
4. **Browser**: Try a different browser
5. **Network**: Check if firewall is blocking WebSocket connections
6. **Mobile Data**: Switch from Wi-Fi to mobile data (or vice versa)

#### Answer Not Submitting

**Problem**: Answer not being recorded or submitted

**Solutions**:

1. **Select Answer**: Ensure you clicked an answer choice
2. **Time Expired**: Check if answering time has expired
3. **Connection**: Check your internet connection
4. **Try Again**: Click the answer again
5. **Refresh**: Refresh the page if persistent
6. **Contact Host**: Inform the host if issue continues

#### Game Screen Not Loading

**Problem**: Blank screen, loading forever, or error messages

**Solutions**:

1. **Internet Connection**: Check your internet connection
2. **Refresh Page**: Hard refresh (Ctrl+F5 or Cmd+Shift+R)
3. **Clear Cache**: Clear browser cache and cookies
4. **Browser Update**: Update your browser to latest version
5. **JavaScript**: Ensure JavaScript is enabled
6. **Contact Support**: If issue persists, contact support

#### Timer Not Working

**Problem**: Timer not counting down or showing incorrect time

**Solutions**:

1. **Refresh**: Refresh the page
2. **Connection**: Check internet connection
3. **Browser**: Try a different browser
4. **Sync**: Timer should sync automatically
5. **Contact Host**: Inform the host

#### Leaderboard Not Updating

**Problem**: Leaderboard shows incorrect rankings or not updating

**Solutions**:

1. **Wait**: Leaderboard updates after each question
2. **Refresh**: Refresh the page
3. **Connection**: Check internet connection
4. **Sync**: Rankings sync automatically
5. **Contact Host**: If issue persists

### Browser Compatibility

**Recommended Browsers** (Latest Versions):

- ✅ Google Chrome
- ✅ Mozilla Firefox
- ✅ Safari (macOS/iOS)
- ✅ Microsoft Edge
- ✅ Opera

**Not Supported**:

- ❌ Internet Explorer (any version)
- ❌ Older browsers (pre-2020)

### Mobile Usage

**Supported Devices**:

- ✅ iOS (iPhone/iPad) - Safari
- ✅ Android - Chrome
- ✅ Tablets - All modern browsers

**Mobile Tips**:

- Use stable Wi-Fi or mobile data
- Keep device charged
- Close other apps for better performance
- Use landscape mode for better viewing
- Enable JavaScript in browser settings

### Performance Tips

**For Best Experience**:

1. **Stable Connection**: Use reliable internet (Wi-Fi recommended)
2. **Close Tabs**: Close unnecessary browser tabs
3. **Update Browser**: Keep browser updated
4. **Clear Cache**: Regularly clear browser cache
5. **Disable Extensions**: Disable browser extensions that might interfere
6. **Full Screen**: Use full screen mode for better focus

### Getting Help

If you encounter issues not covered here:

1. **Check This Manual**: Review relevant sections
2. **Browser Console**: Check for error messages (F12)
3. **Contact Host**: Ask the game host for assistance
4. **Support**: Contact TUIZ support with:
   - Description of the issue
   - Browser and version
   - Device type (desktop/mobile)
   - Steps to reproduce
   - Screenshots if possible
   - Error messages (if any)

---

## Best Practices

### For Hosts

#### Before Starting a Game

1. **Test Your Quiz**: Run through all questions to check for errors
2. **Review Settings**: Verify time limits and game settings
3. **Prepare Materials**: Have room code ready to share
4. **Check Connection**: Ensure stable internet connection
5. **Test Run**: Do a test game with a friend if possible

#### During the Game

1. **Clear Instructions**: Explain rules to players before starting
2. **Monitor Players**: Watch for connection issues or confusion
3. **Manage Time**: Keep game pace appropriate (not too fast or slow)
4. **Engage Players**: Comment on interesting statistics
5. **Be Flexible**: Adjust timing if needed (pause if necessary)

#### After the Game

1. **Review Results**: Check final rankings and statistics
2. **Gather Feedback**: Ask players for feedback
3. **Improve Quiz**: Update quiz based on player performance
4. **Save Statistics**: Note which questions were difficult

#### Quiz Creation Tips

1. **Clear Questions**: Write clear, unambiguous questions
2. **Balanced Difficulty**: Mix easy, medium, and hard questions
3. **Good Explanations**: Always provide helpful explanations
4. **Appropriate Timing**: Set realistic time limits
5. **Test First**: Test your quiz before using it in a game

### For Players

#### Before Joining

1. **Stable Connection**: Ensure reliable internet connection
2. **Quiet Environment**: Find a quiet place to focus
3. **Device Ready**: Ensure device is charged and ready
4. **Room Code Ready**: Have the room code written down

#### During the Game

1. **Pay Attention**: Read questions carefully
2. **Answer Promptly**: Don't wait until the last second
3. **Stay Focused**: Avoid distractions
4. **Read Explanations**: Learn from explanations
5. **Have Fun**: Enjoy the learning experience!

#### Answering Tips

1. **Read All Options**: Read all answer choices before selecting
2. **Think First**: Consider the question before answering
3. **Trust Instincts**: Go with your first instinct if unsure
4. **Learn from Mistakes**: Pay attention to explanations
5. **Don't Panic**: Stay calm and focused

### General Tips

#### For Best Experience

1. **Use Modern Browser**: Latest version of Chrome, Firefox, or Safari
2. **Stable Internet**: Wi-Fi recommended over mobile data
3. **Full Screen**: Use full screen mode for better focus
4. **Close Distractions**: Close other apps and tabs
5. **Be Patient**: Wait for automatic transitions

#### Technical

1. **Enable JavaScript**: Required for the platform to work
2. **Allow WebSocket**: Ensure WebSocket connections are allowed
3. **Update Browser**: Keep browser updated
4. **Clear Cache**: Clear cache if experiencing issues
5. **Check Firewall**: Ensure firewall isn't blocking connections

---

## Quick Reference

### Host Quick Actions

| Action          | Location                            | When to Use                      |
| --------------- | ----------------------------------- | -------------------------------- |
| Create Quiz     | Dashboard → "新しいクイズを作成"    | When you want to make a new quiz |
| Start Game      | Quiz Library → "ゲームを開始"       | When ready to host a game        |
| Share Room Code | Host Waiting Room                   | When players need to join        |
| Start Question  | Host Control Panel → "問題を開始"   | At the start of each question    |
| Reveal Answer   | Host Control Panel → "答えを表示"   | After players have answered      |
| Next Question   | Host Control Panel → "次の問題へ"   | After explanation phase          |
| Pause Game      | Host Control Panel → "一時停止"     | When you need a break            |
| End Game        | Host Control Panel → "ゲームを終了" | To end the game early            |

### Player Quick Actions

| Action           | Location              | When to Use                    |
| ---------------- | --------------------- | ------------------------------ |
| Join Game        | Homepage → "TUIZ参加" | When you have a room code      |
| Enter Room Code  | Join Page             | To join a specific game        |
| Select Answer    | Answering Phase       | When answering a question      |
| View Leaderboard | Leaderboard Phase     | To see current rankings        |
| Read Explanation | Explanation Phase     | To learn why answer is correct |

### Game Phases Summary

| Phase            | Duration      | Host Action         | Player Action     |
| ---------------- | ------------- | ------------------- | ----------------- |
| Waiting Room     | Until start   | Click "Start Game"  | Wait              |
| Countdown        | 3 seconds     | None (auto)         | None (auto)       |
| Question Display | 10s (typical) | None (auto)         | Read question     |
| Answering        | 30s (typical) | View stats, Reveal  | Select answer     |
| Answer Reveal    | 10s (typical) | View stats, Next    | Observe results   |
| Leaderboard      | 10s (typical) | View rankings, Next | See your rank     |
| Explanation      | 10s (typical) | View, Next          | Read explanation  |
| Podium           | Indefinite    | View results        | See final results |

---

**Last Updated**: January 2026
**Version**: 2.0

---

## Additional Resources

- **Technical Documentation**: See [Technical Documentation](./02-TECHNICAL-DOCUMENTATION.md)
- **API Reference**: See [API Documentation](./05-API-DOCUMENTATION.md)
- **Component Guide**: See [Component Documentation](./06-COMPONENT-DOCUMENTATION.md)
- **Database Schema**: See [Database Schema](./04-DATABASE-SCHEMA.md)

---

**Happy Learning with TUIZ情報王!** 🎮📚
